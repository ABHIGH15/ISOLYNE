import { AwarenessGap } from '../domain/AwarenessGap';
import { Commitment } from '../domain/Commitment';
import { CollaborationMemory } from '../domain/CollaborationMemory';

export class MemoryExtractor {
  extract(gap: AwarenessGap, commitment: Commitment, squadId: string): CollaborationMemory {
    const lessons: Record<string, string> = {
      'ownership_gap': 'Temporary teams require explicit ownership signals.',
      'consensus_gap': 'Implicit decisions lead to silent divergence. Force explicit alignment.',
      'integration_gap': 'System interfaces require explicit contracts. Implicit assumptions cause integration failure.',
      'interpretation_gap': 'Same words, different meanings. Define scope explicitly before building.',
      'timeline_gap': 'Misaligned deadlines cause silent waste. Confirm dates out loud.',
      'timeline_unresolved': 'Ambiguous timelines breed false confidence. Pin down specifics.',
      'execution_gap': 'Silence after a deadline is its own signal. Check in before assuming.'
    };

    return {
      id: `mem_${Date.now()}`,
      squadId: squadId,
      gapType: gap.type,
      context: "48 hour hackathon",
      realityDiscovered: gap.hiddenReality,
      lesson: lessons[gap.type] || 'Unknown reality gap resolved.',
      createdAt: new Date().toISOString()
    };
  }
}
