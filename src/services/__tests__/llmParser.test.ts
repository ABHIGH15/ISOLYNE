import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interpretStatement, fallbackParser } from '../llmParser';

// Mock fetch globally
global.fetch = vi.fn();

describe('LLM Parser Boundary', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('gracefully degrades to fallback parser when API key is missing', async () => {
    // Ensure no API key
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    delete process.env.EXPO_PUBLIC_LLM_PROVIDER;
    
    const result = await interpretStatement('We are using postgres', []);
    expect(result).toEqual({ topic: 'Database', choice: 'We are using postgres' });
  });

  it('fallback parser maps common keywords to expected topics', () => {
    expect(fallbackParser('react native for UI')).toMatchObject({ topic: 'Frontend Framework' });
    expect(fallbackParser('monolithic architecture')).toMatchObject({ topic: 'Architecture', choice: 'Monolith' });
    expect(fallbackParser('stripe for payments')).toMatchObject({ topic: 'Payments' });
  });

  it('fallback parser extracts Scope topic from natural language scope statements', () => {
    const mockStmt = fallbackParser("let's just do a mock login for the demo");
    expect(mockStmt).toEqual({
      topic: 'Scope',
      choice: 'Mock / Prototype Only'
    });

    const fullStmt = fallbackParser('we need full crud auth for MVP');
    expect(fullStmt).toEqual({
      topic: 'Scope',
      choice: 'Full Feature Build'
    });

    // Regression check: generic 'database' mentioned in MVP scope boundary statement must resolve to Scope
    const authDbScopeStmt = fallbackParser('we need full auth and database for MVP');
    expect(authDbScopeStmt).toEqual({
      topic: 'Scope',
      choice: 'Full Feature Build'
    });

    // Regression check: specific database engine choice (Mongo) retains Database topic even with prototype keyword
    const mongoPrototypeStmt = fallbackParser("let's use Mongo for the prototype");
    expect(mongoPrototypeStmt).toMatchObject({
      topic: 'Database'
    });
  });

  it('interpretStatement gracefully resolves natural scope statements to Scope topic without API key', async () => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    delete process.env.EXPO_PUBLIC_LLM_PROVIDER;
    const res = await interpretStatement("let's just build a prototype landing page", []);
    expect(res).toEqual({
      topic: 'Scope',
      choice: 'Mock / Prototype Only'
    });
  });

  it('returns null on UNKNOWN topic from LLM (unparseable input)', async () => {
    process.env.EXPO_PUBLIC_LLM_PROVIDER = 'gemini';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test_key';
    
    // Mock the LLM returning UNKNOWN
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"topic": "UNKNOWN", "choice": "UNKNOWN"}' }] } }]
      })
    });

    const result = await interpretStatement('sounds good to me', []);
    expect(result).toBeNull();
  });
  
  it('parses correctly from LLM valid response', async () => {
    process.env.EXPO_PUBLIC_LLM_PROVIDER = 'gemini';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test_key';
    
    // Mock the LLM returning valid JSON
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"topic": "Backend", "choice": "Node.js"}' }] } }]
      })
    });

    const result = await interpretStatement('node on the backend', []);
    expect(result).toEqual({ topic: 'Backend', choice: 'Node.js' });
  });

  it('parses Scope topic from LLM structured JSON response', async () => {
    process.env.EXPO_PUBLIC_LLM_PROVIDER = 'gemini';
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test_key';

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"topic": "Scope", "choice": "Mock API Only"}' }] } }]
      })
    });

    const result = await interpretStatement("let's just do a mock login for the demo", []);
    expect(result).toEqual({ topic: 'Scope', choice: 'Mock API Only' });
  });

  it('defaults to groq provider when EXPO_PUBLIC_LLM_PROVIDER is unset', async () => {
    delete process.env.EXPO_PUBLIC_LLM_PROVIDER;
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

    // Graceful fallback to keyword parser via Groq path
    const result = await interpretStatement('We are using postgres', []);
    expect(result).toEqual({ topic: 'Database', choice: 'We are using postgres' });
  });

  describe('Groq Provider', () => {
    it('gracefully degrades to fallback parser when GROQ API key is missing', async () => {
      process.env.EXPO_PUBLIC_LLM_PROVIDER = 'groq';
      delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

      const result = await interpretStatement('We are using postgres', []);
      expect(result).toEqual({ topic: 'Database', choice: 'We are using postgres' });
    });

    it('parses correctly from Groq valid response', async () => {
      process.env.EXPO_PUBLIC_LLM_PROVIDER = 'groq';
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test_groq_key';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ topic: 'Backend', choice: 'Node.js' })
              }
            }
          ]
        })
      });

      const result = await interpretStatement('node on the backend', []);
      expect(result).toEqual({ topic: 'Backend', choice: 'Node.js' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_groq_key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('returns null on UNKNOWN topic from Groq (unparseable input)', async () => {
      process.env.EXPO_PUBLIC_LLM_PROVIDER = 'groq';
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test_groq_key';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ topic: 'UNKNOWN', choice: 'UNKNOWN' })
              }
            }
          ]
        })
      });

      const result = await interpretStatement('sounds good to me', []);
      expect(result).toBeNull();
    });

    it('parses Scope topic from Groq structured JSON response', async () => {
      process.env.EXPO_PUBLIC_LLM_PROVIDER = 'groq';
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test_groq_key';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ topic: 'Scope', choice: 'Mock API Only' })
              }
            }
          ]
        })
      });

      const result = await interpretStatement("let's just do a mock login for the demo", []);
      expect(result).toEqual({ topic: 'Scope', choice: 'Mock API Only' });
    });
  });
});
