import { Signal } from '../../../domain/Signal';
import { RealityState } from '../../../domain/RealityState';
import { AwarenessGap } from '../../../domain/AwarenessGap';
import { DecisionProposal } from '../../../domain/DecisionProposal';
import { Commitment } from '../../../domain/Commitment';
import { CollaborationMemory } from '../../../domain/CollaborationMemory';
import { SignalRepository } from '../interfaces/SignalRepository';
import { RealityRepository } from '../interfaces/RealityRepository';
import { GapRepository } from '../interfaces/GapRepository';
import { ProposalRepository } from '../interfaces/ProposalRepository';
import { CommitmentRepository } from '../interfaces/CommitmentRepository';
import { MemoryRepository } from '../interfaces/MemoryRepository';

export class InMemorySignalRepository implements SignalRepository {
  private signals: Signal[] = [];
  async save(signal: Signal) { this.signals.push(signal); }
  async getBySquad(squadId: string) { return this.signals.filter(s => s.squadId === squadId); }
}

export class InMemoryRealityRepository implements RealityRepository {
  private states = new Map<string, RealityState>();
  async save(squadId: string, state: RealityState) { this.states.set(squadId, { ...state }); }
  async get(squadId: string) { return this.states.get(squadId) || null; }
}

export class InMemoryGapRepository implements GapRepository {
  private gaps: AwarenessGap[] = [];
  async save(gap: AwarenessGap) { 
    if (!this.gaps.find(g => g.id === gap.id)) {
      this.gaps.push(gap); 
    }
  }
  async getActive(squadId: string) { return this.gaps.filter(g => (g as any).status !== 'resolved'); } // Mock status check
  async resolve(gapId: string) { 
    const gap = this.gaps.find(g => g.id === gapId);
    if (gap) (gap as any).status = 'resolved';
  }
}

export class InMemoryProposalRepository implements ProposalRepository {
  private proposals: DecisionProposal[] = [];
  async save(proposal: DecisionProposal) { this.proposals.push(proposal); }
  async get(proposalId: string) { return this.proposals.find(p => p.id === proposalId) || null; }
}

export class InMemoryCommitmentRepository implements CommitmentRepository {
  private commitments: Commitment[] = [];
  async save(commitment: Commitment) { this.commitments.push(commitment); }
  async getBySquad(squadId: string) { return this.commitments; /* Basic mock */ }
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private memories: CollaborationMemory[] = [];
  async save(memory: CollaborationMemory) { this.memories.push(memory); }
  async getBySquad(squadId: string) { return this.memories; /* Basic mock */ }
}
