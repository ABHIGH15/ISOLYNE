import { AwarenessGap } from '../domain/AwarenessGap';
import { Commitment } from '../domain/Commitment';
import { CollaborationMemory } from '../domain/CollaborationMemory';

export class MemoryExtractor {
  extract(gap: AwarenessGap, commitment: Commitment, squadId: string): CollaborationMemory {
    return {
      id: `mem_${Date.now()}`,
      squadId: squadId,
      gapType: gap.type,
      context: "48 hour hackathon",
      realityDiscovered: 'No owner existed initially',
      lesson: 'Temporary teams require explicit ownership signals.',
      createdAt: new Date().toISOString()
    };
  }
}
