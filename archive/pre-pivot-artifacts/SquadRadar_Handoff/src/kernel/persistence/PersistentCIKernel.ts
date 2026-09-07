import { Signal } from '../domain/Signal';
import { RealityProjection } from '../projection/RealityProjection';
import { OwnershipGapDetector } from '../detection/OwnershipGapDetector';
import { ProposalGenerator } from '../reasoning/ProposalGenerator';
import { AlignmentEngine } from '../alignment/AlignmentEngine';
import { CommitmentResolver } from '../alignment/CommitmentResolver';
import { MemoryExtractor } from '../memory/MemoryExtractor';

import { SignalRepository } from '../repositories/interfaces/SignalRepository';
import { RealityRepository } from '../repositories/interfaces/RealityRepository';
import { GapRepository } from '../repositories/interfaces/GapRepository';
import { ProposalRepository } from '../repositories/interfaces/ProposalRepository';
import { CommitmentRepository } from '../repositories/interfaces/CommitmentRepository';
import { MemoryRepository } from '../repositories/interfaces/MemoryRepository';

export class PersistentCIKernel {
  private projection = new RealityProjection();
  private detector = new OwnershipGapDetector();
  private proposalGenerator = new ProposalGenerator();
  private alignment = new AlignmentEngine();
  private commitmentResolver = new CommitmentResolver();
  private memoryExtractor = new MemoryExtractor();

  constructor(
    private signalRepo: SignalRepository,
    private realityRepo: RealityRepository,
    private gapRepo: GapRepository,
    private proposalRepo: ProposalRepository,
    private commitmentRepo: CommitmentRepository,
    private memoryRepo: MemoryRepository
  ) {}

  async processSignal(signal: Signal) {
    // 1. Save signal
    await this.signalRepo.save(signal);

    // 2. Replay reality
    const signals = await this.signalRepo.getBySquad(signal.squadId);
    let state = { members: [], ownership: {} };
    for (const s of signals) {
      state = this.projection.apply(s);
    }
    await this.realityRepo.save(signal.squadId, state);

    // 3. Detect gaps
    const gap = this.detector.detect(state);
    if (!gap) return null;

    // 4. Save gap
    await this.gapRepo.save(gap);

    // 5. Generate proposal
    const proposal = this.proposalGenerator.generate(gap);
    
    // 6. Save proposal
    await this.proposalRepo.save(proposal);

    return { gap, proposal, state };
  }

  async processAlignment(signal: Signal, proposalId: string, gapId: string) {
    await this.signalRepo.save(signal);
    const proposal = await this.proposalRepo.get(proposalId);
    if (!proposal) return null;

    const isAligned = this.alignment.process(signal, proposal);
    
    if (isAligned) {
      const commitment = this.commitmentResolver.resolve(signal.actorId, this.projection);
      await this.commitmentRepo.save(commitment);
      
      await this.gapRepo.resolve(gapId);

      const gapList = await this.gapRepo.getActive(signal.squadId); // Simplified hack for extraction logic
      const memory = this.memoryExtractor.extract({ type: 'ownership_gap' } as any, commitment, signal.squadId);
      
      await this.memoryRepo.save(memory);

      return { commitment, memory };
    }
    return null;
  }
}
