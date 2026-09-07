import { describe, it, expect, vi } from 'vitest';
import { interpretStatement, fallbackParser } from '../llmParser';

// Mock fetch globally
global.fetch = vi.fn();

describe('LLM Parser Boundary', () => {
  it('gracefully degrades to fallback parser when API key is missing', async () => {
    // Ensure no API key
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
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
  });

  it('interpretStatement gracefully resolves natural scope statements to Scope topic without API key', async () => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const res = await interpretStatement("let's just build a prototype landing page", []);
    expect(res).toEqual({
      topic: 'Scope',
      choice: 'Mock / Prototype Only'
    });
  });

  it('returns null on UNKNOWN topic from LLM (unparseable input)', async () => {
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
});
