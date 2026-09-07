import { Alignment, DecisionProposal, Builder } from '../types';

export class AlignmentTracker {
  private alignments: Map<string, Alignment> = new Map();

  constructor(
    public readonly proposal: DecisionProposal,
    public readonly squadMembers: Builder[]
  ) {}

  public addAlignment(alignment: Alignment): void {
    if (alignment.proposalId !== this.proposal.id) {
      throw new Error('Alignment does not belong to this proposal');
    }
    this.alignments.set(alignment.builderId, alignment);
  }

  public get isFullyAligned(): boolean {
    return this.squadMembers.every(member => 
      this.alignments.get(member.id)?.response === 'agree'
    );
  }

  public get hasChallenges(): boolean {
    return Array.from(this.alignments.values()).some(a => a.response === 'challenge');
  }

  public get missingAlignments(): string[] {
    return this.squadMembers
      .map(m => m.id)
      .filter(id => !this.alignments.has(id));
  }

  public get state(): 'pending' | 'aligned' | 'divergent' | 'expired' {
    if (this.hasChallenges) return 'divergent';
    if (this.missingAlignments.length > 0) return 'pending';
    return 'aligned';
  }
}
