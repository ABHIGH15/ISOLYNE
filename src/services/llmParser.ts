export type ParsedStatement = {
  topic: string;
  choice: string;
};

// Fallback mock logic for graceful degradation
export function fallbackParser(input: string): ParsedStatement | null {
  const lowerInput = input.toLowerCase();
  let topic = '';
  let choice = input.trim();
  
  if (lowerInput.includes('postgres') || lowerInput.includes('mongo') || lowerInput.includes('db') || lowerInput.includes('database') || lowerInput.includes('supabase') || lowerInput.includes('firebase')) {
    topic = 'Database';
  } else if (lowerInput.includes('scope') || lowerInput.includes('mvp') || lowerInput.includes('mock') || lowerInput.includes('prototype') || lowerInput.includes('full crud') || lowerInput.includes('landing page')) {
    topic = 'Scope';
    if (lowerInput.includes('mock') || lowerInput.includes('prototype') || lowerInput.includes('landing page')) choice = 'Mock / Prototype Only';
    else if (lowerInput.includes('full') || lowerInput.includes('crud') || lowerInput.includes('auth')) choice = 'Full Feature Build';
  } else if (lowerInput.includes('react') || lowerInput.includes('vue') || lowerInput.includes('frontend') || lowerInput.includes('next.js') || lowerInput.includes('react native')) {
    topic = 'Frontend Framework';
  } else if (lowerInput.includes('monolith') || lowerInput.includes('microservices') || lowerInput.includes('architecture')) {
    topic = 'Architecture';
    if (lowerInput.includes('microservices')) choice = 'Microservices';
    else choice = 'Monolith';
  } else if (lowerInput.includes('razorpay') || lowerInput.includes('stripe') || lowerInput.includes('payments')) {
    topic = 'Payments';
  } else {
    return null; // Return null for casual conversation
  }
  return { topic, choice };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url: string, options: any, maxRetries = 2): Promise<Response> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) return res;
      if (res.status === 429 || res.status === 503) {
        const retryAfter = res.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(1000 * (2 ** attempt) + Math.random() * 500, 3000);
        if (attempt < maxRetries) {
          await sleep(delay);
          attempt++;
          continue;
        }
      }
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return res; // Client errors shouldn't be retried
      }
      if (attempt >= maxRetries) throw new Error(`HTTP ${res.status}`);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (attempt >= maxRetries) throw error;
      const delay = Math.min(1000 * (2 ** attempt) + Math.random() * 500, 3000);
      await sleep(delay);
    }
    attempt++;
  }
  throw new Error("Unreachable");
}

function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '');
  if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\n?```$/, '');
  return cleaned.trim();
}

export async function interpretStatement(input: string, existingTopics: string[]): Promise<ParsedStatement | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  // Prevent absurdly long inputs for basic security & cost
  const sanitizedInput = input.slice(0, 500).replace(/[\n\r]/g, ' ');
  
  if (!apiKey) {
    console.warn("No EXPO_PUBLIC_GEMINI_API_KEY found. Falling back to keyword parser.");
    return fallbackParser(sanitizedInput);
  }

  const recentTopics = existingTopics.slice(-10); // Bound the array

  const systemInstruction = {
    parts: [{ 
      text: "You are a precise data extraction engine for a team decision tracker. Extract the core architectural, product scope, technical, or organizational decision from the statement. For statements defining project scope, MVP boundary, or prototype definition (e.g., 'let\'s just do a mock login for demo', 'we need full auth and database for MVP'), use topic 'Scope'. If the statement is casual chat, unparseable, or not a decision, you MUST return 'UNKNOWN' for both topic and choice."
    }]
  };

  const prompt = `Extract the decision. 
Existing topics to reuse if applicable: [${recentTopics.join(', ')}]

Statement: "${sanitizedInput}"`;

  try {
    const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.7-flash';
    const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              topic: {
                type: "STRING",
                description: "The category or domain of the decision (e.g. Architecture, Database, CI/CD). Reuse an existing topic if it closely matches."
              },
              choice: {
                type: "STRING",
                description: "The specific option chosen by the user (e.g. Monolith, PostgreSQL, GitHub Actions)."
              }
            },
            required: ["topic", "choice"]
          }
        }
      })
    });

    if (!res.ok) {
      throw new Error(`LLM Network Error: ${res.status}`);
    }

    const data: any = await res.json();
    
    // Check for safety blocks
    if (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason === 'SAFETY' || data.candidates?.[0]?.finishReason === 'RECITATION' || data.candidates?.[0]?.finishReason === 'BLOCKLIST') {
      console.warn("LLM prompt blocked for safety");
      return null;
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from LLM");
    
    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonText(text));
    } catch (e) {
      throw new Error("Invalid JSON syntax from model");
    }
    
    if (!parsed || typeof parsed !== 'object') throw new Error("Parsed result is not an object");
    if (!parsed.topic || !parsed.choice) throw new Error("Missing required fields");
    if (typeof parsed.topic !== 'string' || typeof parsed.choice !== 'string') throw new Error("Invalid field types");
    
    if (parsed.topic.toUpperCase() === 'UNKNOWN' || parsed.choice.toUpperCase() === 'UNKNOWN') {
      return null;
    }
    
    return { topic: parsed.topic, choice: parsed.choice };
  } catch (err) {
    console.warn("LLM Parsing failed, falling back.", err);
    return fallbackParser(sanitizedInput);
  }
}
