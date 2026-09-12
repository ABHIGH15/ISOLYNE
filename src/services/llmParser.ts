import { TimelineChoice } from '../kernel/domain/Timeline';

export type ParsedStatement = {
  topic: string;
  choice: string | TimelineChoice;
  gap_type?: 'timeline' | 'categorical';
};

// Fallback mock logic for graceful degradation
export function fallbackParser(input: string): ParsedStatement | null {
  const lowerInput = input.toLowerCase();
  let topic = '';
  let choice = input.trim();
  
  const hasSpecificDb = lowerInput.includes('postgres') || lowerInput.includes('mongo') || lowerInput.includes('supabase') || lowerInput.includes('firebase');
  const hasScopeKeyword = lowerInput.includes('scope') || lowerInput.includes('mvp') || lowerInput.includes('mock') || lowerInput.includes('prototype') || lowerInput.includes('full crud') || lowerInput.includes('landing page');

  if (hasScopeKeyword && !hasSpecificDb) {
    topic = 'Scope';
    if (lowerInput.includes('mock') || lowerInput.includes('prototype') || lowerInput.includes('landing page') || lowerInput.includes('demo')) choice = 'Mock / Prototype Only';
    else if (lowerInput.includes('full') || lowerInput.includes('crud') || lowerInput.includes('auth')) choice = 'Full Feature Build';
  } else if (hasSpecificDb || lowerInput.includes('db') || lowerInput.includes('database')) {
    topic = 'Database';
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

export type LLMCallInspection = {
  provider: 'gemini' | 'groq';
  latencyMs: number;
  rawText: string;
  isStrictJson: boolean;
  result: ParsedStatement | null;
  error?: string;
};

export async function executeGeminiBenchmarkCall(
  sanitizedInput: string,
  recentTopics: string[],
  anchorTimestamp: string
): Promise<LLMCallInspection> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No EXPO_PUBLIC_GEMINI_API_KEY found. Falling back to keyword parser.");
    return {
      provider: 'gemini',
      latencyMs: 0,
      rawText: '',
      isStrictJson: false,
      result: fallbackParser(sanitizedInput),
      error: 'Missing API Key'
    };
  }

  const systemInstruction = {
    parts: [{ 
      text: "You are a precise data extraction engine for a team decision tracker. Extract the core architectural, product scope, technical, or organizational decision from the statement. For statements defining project scope, MVP boundary, or prototype definition (e.g., 'let\\'s just do a mock login for demo', 'we need full auth and database for MVP'), use topic 'Scope'. If the statement is casual chat, unparseable, or not a decision, you MUST return 'UNKNOWN' for both topic and choice."
    }]
  };

  const prompt = `Extract the decision. 
Existing topics to reuse if applicable: [${recentTopics.join(', ')}]
Anchor Timestamp: ${anchorTimestamp} (Use this to resolve relative dates!)

Statement: "${sanitizedInput}"`;

  const start = performance.now();
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
              topic: { type: "STRING" },
              gap_type: { type: "STRING" },
              choice: { type: "STRING" },
              timeline_choice: {
                type: "OBJECT",
                properties: {
                  raw_text: { type: "STRING" },
                  resolved_datetime: { type: "STRING" },
                  granularity: { type: "STRING" },
                  anchor_timestamp: { type: "STRING" },
                  confidence: { type: "STRING" }
                }
              }
            },
            required: ["topic", "choice"]
          }
        }
      })
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      throw new Error(`LLM Network Error: ${res.status}`);
    }

    const data: any = await res.json();
    
    // Check for safety blocks
    if (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason === 'SAFETY' || data.candidates?.[0]?.finishReason === 'RECITATION' || data.candidates?.[0]?.finishReason === 'BLOCKLIST') {
      console.warn("LLM prompt blocked for safety");
      return {
        provider: 'gemini',
        latencyMs,
        rawText: '',
        isStrictJson: false,
        result: null,
        error: 'Safety Block'
      };
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from LLM");
    
    let isStrictJson = false;
    try {
      JSON.parse(text);
      isStrictJson = true;
    } catch {}

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonText(text));
    } catch (e) {
      throw new Error("Invalid JSON syntax from model");
    }
    
    if (!parsed || typeof parsed !== 'object') throw new Error("Parsed result is not an object");
    if (!parsed.topic) throw new Error("Missing required field: topic");
    
    let resultChoice: any = parsed.choice;
    if (parsed.gap_type === 'timeline' && parsed.timeline_choice) {
      resultChoice = parsed.timeline_choice;
    } else if (!resultChoice) {
      throw new Error("Missing required field: choice");
    }
    
    if (parsed.topic.toUpperCase() === 'UNKNOWN' || (typeof resultChoice === 'string' && resultChoice.toUpperCase() === 'UNKNOWN')) {
      return {
        provider: 'gemini',
        latencyMs,
        rawText: text,
        isStrictJson,
        result: null
      };
    }
    
    return {
      provider: 'gemini',
      latencyMs,
      rawText: text,
      isStrictJson,
      result: { topic: parsed.topic, gap_type: parsed.gap_type, choice: resultChoice }
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    console.warn("LLM Parsing failed, falling back.", err);
    return {
      provider: 'gemini',
      latencyMs,
      rawText: '',
      isStrictJson: false,
      result: fallbackParser(sanitizedInput),
      error: err.message || String(err)
    };
  }
}

export async function interpretWithGemini(sanitizedInput: string, recentTopics: string[], anchorTimestamp: string = new Date().toISOString()): Promise<ParsedStatement | null> {
  const inspection = await executeGeminiBenchmarkCall(sanitizedInput, recentTopics, anchorTimestamp);
  return inspection.result;
}

export async function executeGroqBenchmarkCall(
  sanitizedInput: string,
  recentTopics: string[],
  anchorTimestamp: string
): Promise<LLMCallInspection> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.warn("No EXPO_PUBLIC_GROQ_API_KEY found. Falling back to keyword parser.");
    return {
      provider: 'groq',
      latencyMs: 0,
      rawText: '',
      isStrictJson: false,
      result: fallbackParser(sanitizedInput),
      error: 'Missing API Key'
    };
  }

  const systemContent = "You are a precise data extraction engine for a team decision tracker. Extract the core domain or category of the decision (e.g., Database, Architecture, Frontend, Scope, CI/CD) and the specific choice made. For statements defining project scope, MVP boundary, or prototype definition (e.g., 'let\\'s just do a mock login for demo', 'we need full auth and database for MVP'), use topic 'Scope'. If the statement is casual chat, unparseable, or not a decision, you MUST return 'UNKNOWN' for both topic and choice. You must respond strictly with a valid JSON object containing exactly two keys: 'topic' and 'choice'.";

  const userContent = `Extract the decision. 
Existing topics to reuse if applicable: [${recentTopics.join(', ')}]
Anchor Timestamp: ${anchorTimestamp} (Use this to resolve relative dates!)

Statement: "${sanitizedInput}"`;

  const start = performance.now();
  try {
    const model = process.env.EXPO_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b';
    const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      throw new Error(`Groq Network Error: ${res.status}`);
    }

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");

    let isStrictJson = false;
    try {
      JSON.parse(content);
      isStrictJson = true;
    } catch {}

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonText(content));
    } catch (e) {
      throw new Error("Invalid JSON syntax from Groq");
    }

    if (!parsed || typeof parsed !== 'object') throw new Error("Parsed result is not an object");
    if (!parsed.topic) throw new Error("Missing required field: topic");
    
    let resultChoice: any = parsed.choice;
    if (parsed.gap_type === 'timeline' && typeof parsed.choice === 'object') {
      resultChoice = parsed.choice;
    } else if (!resultChoice) {
      throw new Error("Missing required field: choice");
    }

    if (parsed.topic.toUpperCase() === 'UNKNOWN' || (typeof resultChoice === 'string' && resultChoice.toUpperCase() === 'UNKNOWN')) {
      return {
        provider: 'groq',
        latencyMs,
        rawText: content,
        isStrictJson,
        result: null
      };
    }

    return {
      provider: 'groq',
      latencyMs,
      rawText: content,
      isStrictJson,
      result: { topic: parsed.topic, gap_type: parsed.gap_type, choice: resultChoice }
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    console.warn("Groq Parsing failed, falling back.", err);
    return {
      provider: 'groq',
      latencyMs,
      rawText: '',
      isStrictJson: false,
      result: fallbackParser(sanitizedInput),
      error: err.message || String(err)
    };
  }
}

export async function interpretWithGroq(sanitizedInput: string, recentTopics: string[], anchorTimestamp: string = new Date().toISOString()): Promise<ParsedStatement | null> {
  const inspection = await executeGroqBenchmarkCall(sanitizedInput, recentTopics, anchorTimestamp);
  return inspection.result;
}

export async function interpretStatement(input: string, existingTopics: string[], anchorTimestamp: string = new Date().toISOString()): Promise<ParsedStatement | null> {
  // Prevent absurdly long inputs for basic security & cost
  const sanitizedInput = input.slice(0, 500).replace(/[\n\r]/g, ' ');
  const recentTopics = existingTopics.slice(-10); // Bound the array

  const provider = (process.env.EXPO_PUBLIC_LLM_PROVIDER || 'groq').toLowerCase();
  if (provider === 'gemini') {
    return interpretWithGemini(sanitizedInput, recentTopics, anchorTimestamp);
  }
  return interpretWithGroq(sanitizedInput, recentTopics, anchorTimestamp);
}
