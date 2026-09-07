import { AwarenessGap } from '../domain/AwarenessGap';
import { Commitment } from '../domain/Commitment';
import { CollaborationMemory } from '../domain/CollaborationMemory';

export class MemoryExtractor {
  extract(gap: AwarenessGap, commitment: Commitment, squadId: string): CollaborationMemory {
    const lessons: Record<string, string> = {
      'ownership_gap': 'Temporary teams require explicit ownership signals.',
      'consensus_gap': 'Implicit decisions lead to silent divergence. Force explicit alignment.',
      'integration_gap': 'System interfaces require explicit contracts. Implicit assumptions cause integration failure.',
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
