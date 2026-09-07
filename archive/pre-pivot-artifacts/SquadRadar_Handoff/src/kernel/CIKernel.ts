import { Signal } from './domain/Signal';
import { RealityProjection } from './projection/RealityProjection';
import { OwnershipGapDetector } from './detection/OwnershipGapDetector';
import { ProposalGenerator } from './reasoning/ProposalGenerator';
import { AlignmentEngine } from './alignment/AlignmentEngine';
import { CommitmentResolver } from './alignment/CommitmentResolver';
import { MemoryExtractor } from './memory/MemoryExtractor';

export class CIKernel {
  private projection = new RealityProjection();
  private detector = new OwnershipGapDetector();
  private proposalGenerator = new ProposalGenerator();
  private alignment = new AlignmentEngine();
  private commitmentResolver = new CommitmentResolver();
  private memoryExtractor = new MemoryExtractor();

  private activeProposal: any = null;
  private activeGap: any = null;

  processSignal(signal: Signal) {
    // 1. Reality Projection
    const state = this.projection.apply(signal);

    // 2. Gap Detection
    const gap = this.detector.detect(state);
    if (!gap) return null;

    this.activeGap = gap;

    // 3. Proposal Generation
    const proposal = this.proposalGenerator.generate(gap);
    this.activeProposal = proposal;

    return { gap, proposal, state };
  }

  processAlignment(signal: Signal) {
    if (!this.activeProposal || !this.activeGap) return null;

    // 4. Alignment
    const isAligned = this.alignment.process(signal, this.activeProposal);
    
    if (isAligned) {
      // 5. Commitment
      const commitment = this.commitmentResolver.resolve(signal.actorId, this.projection);
      
      // 6. Memory Extraction
      const memory = this.memoryExtractor.extract(this.activeGap, commitment);

      // Clean up state
      this.activeProposal = null;
      this.activeGap = null;

      return { commitment, memory };
    }

    return null;
  }
}
