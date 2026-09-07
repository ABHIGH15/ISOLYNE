import { AwarenessGap } from '../domain/AwarenessGap';

export class GapPriorityPolicy {
  private readonly priorityOrder = [
    'ownership_gap',
    'interpretation_gap',
    'consensus_gap',
    'integration_gap'
  ];

  select(gaps: AwarenessGap[]): AwarenessGap | null {
    if (gaps.length === 0) return null;

    return gaps.reduce((highest, current) => {
      const highestIdx = this.priorityOrder.indexOf(highest.type);
      const currentIdx = this.priorityOrder.indexOf(current.type);
      
      const hRank = highestIdx === -1 ? Infinity : highestIdx;
      const cRank = currentIdx === -1 ? Infinity : currentIdx;

      return cRank < hRank ? current : highest;
    });
  }
}
