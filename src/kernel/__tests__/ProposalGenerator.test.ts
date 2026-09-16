import { describe, it, expect } from 'vitest';
import { ProposalGenerator } from '../reasoning/ProposalGenerator';
import { AwarenessGap } from '../domain/AwarenessGap';

describe('ProposalGenerator', () => {
  const generator = new ProposalGenerator();

  it('generates a valid proposal for categorical consensus gap', () => {
    const gap: AwarenessGap = {
      id: 'gap_1',
      type: 'consensus_gap',
      hiddenReality: 'Conflict',
      topic: 'Database',
      evidence: [
        { actorId: 'Alice', choice: 'Postgres' },
        { actorId: 'Bob', choice: 'Firebase' }
      ]
    };
    const proposal = generator.generate(gap);
    expect(proposal.options).toEqual(['Postgres', 'Firebase']);
  });

  it('handles timeline_gap safely and returns string options', () => {
    const gap: AwarenessGap = {
      id: 'gap_timeline',
      type: 'timeline_gap',
      hiddenReality: 'Conflict',
      topic: 'demo_deadline',
      evidence: [
        { actorId: 'Alice', choice: { raw_text: 'Friday', resolved_datetime: '2026-09-25T00:00:00Z', granularity: 'day', anchor_timestamp: '2026-09-10T00:00:00Z', confidence: 'high' } },
        { actorId: 'Bob', choice: { raw_text: 'Saturday', resolved_datetime: '2026-09-26T00:00:00Z', granularity: 'day', anchor_timestamp: '2026-09-10T00:00:00Z', confidence: 'high' } }
      ]
    };
    
    // Should not throw
    const proposal = generator.generate(gap);
    expect(proposal).toBeDefined();
    
    // Should be strictly strings
    expect(proposal.options).toEqual(['Friday', 'Saturday']);
    expect(typeof proposal.options![0]).toBe('string');
  });

  it('deduplicates timeline_gap choices by resolved_datetime, not raw_text', () => {
    const gap: AwarenessGap = {
      id: 'gap_timeline_multi',
      type: 'timeline_gap',
      hiddenReality: 'Conflict',
      topic: 'demo_deadline',
      evidence: [
        { actorId: 'Alice', choice: { raw_text: 'Friday', resolved_datetime: '2026-09-25T00:00:00Z', granularity: 'day', anchor_timestamp: '2026-09-10T00:00:00Z', confidence: 'high' } },
        { actorId: 'Bob', choice: { raw_text: 'Saturday', resolved_datetime: '2026-09-26T00:00:00Z', granularity: 'day', anchor_timestamp: '2026-09-10T00:00:00Z', confidence: 'high' } },
        { actorId: 'Carol', choice: { raw_text: 'the 25th', resolved_datetime: '2026-09-25T00:00:00Z', granularity: 'day', anchor_timestamp: '2026-09-10T00:00:00Z', confidence: 'high' } }
      ]
    };
    
    const proposal = generator.generate(gap);
    
    // Friday and the 25th resolve to the same time, so they collapse into a single option.
    // The representative raw_text should be the first one encountered ('Friday').
    expect(proposal.options).toEqual(['Friday', 'Saturday']);
  });
});
