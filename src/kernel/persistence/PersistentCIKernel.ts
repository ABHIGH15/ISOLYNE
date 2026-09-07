import { Signal } from '../domain/Signal';
import { RealityProjection } from '../projection/RealityProjection';
import { OwnershipGapDetector } from '../detection/OwnershipGapDetector';
import { InterpretationGapDetector } from '../detection/InterpretationGapDetector';
import { ConsensusGapDetector } from '../detection/ConsensusGapDetector';
import { EvaluatorPipeline } from '../detection/EvaluatorPipeline';
import { ProposalGenerator } from '../reasoning/ProposalGenerator';
import { GapPriorityPolicy } from '../reasoning/GapPriorityPolicy';
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
  private pipeline = new EvaluatorPipeline([
    new OwnershipGapDetector(),
    new InterpretationGapDetector(),
    new ConsensusGapDetector(),
  ]);
  private priorityPolicy = new GapPriorityPolicy();
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

  async evaluateSquad(squadId: string) {
    const signals = await this.signalRepo.getBySquad(squadId);
    const state = RealityProjection.replay(signals);
    await this.realityRepo.save(squadId, state);

    const gaps = this.pipeline.evaluate(state);
    const activeBefore = await this.gapRepo.getActive(squadId);

    // Auto-resolve evaporated gaps
    for (const oldGap of activeBefore) {
      if (!gaps.some(newGap => newGap.id === oldGap.id)) {
        await this.gapRepo.resolve(oldGap.id);
      }
    }
    
    if (gaps.length === 0) {
      return { state, gaps: [], selectedGap: null, proposal: null };
    }

    const selectedGap = this.priorityPolicy.select(gaps);
    if (!selectedGap) return { state, gaps, selectedGap: null, proposal: null };

    selectedGap.squadId = squadId;
    await this.gapRepo.save(selectedGap);
    
    // Check canonical history to prevent duplicates across browser reloads
    const hasEmitted = signals.some(s => s.type === 'divergence_detected' && s.payload?.gapId === selectedGap.id);
    if (!hasEmitted) {
      await this.signalRepo.save({
        id: `sys_div_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        squadId,
        actorId: 'Radar',
        type: 'divergence_detected',
        timestamp: new Date().toISOString(),
        payload: { gapId: selectedGap.id, gapType: selectedGap.type, topic: selectedGap.topic }
      });
    }

    const proposal = this.proposalGenerator.generate(selectedGap);
    await this.proposalRepo.save(proposal);

    return { state, gaps, selectedGap, proposal };
  }

  async processSignal(signal: Signal) {
    await this.signalRepo.save(signal);
    return await this.evaluateSquad(signal.squadId);
  }

  async processAlignment(signal: Signal, proposalId: string, gapId: string) {
    await this.signalRepo.save(signal);
    
    const proposal = await this.proposalRepo.get(proposalId);
    if (!proposal) return null;

    const alignmentResult = this.alignment.process(signal, proposal);
    
    if (alignmentResult.status === 'aligned') {
      const commitment = this.commitmentResolver.resolve(signal, proposal);
      await this.commitmentRepo.save(commitment);
      
      const activeGaps = await this.gapRepo.getActive(signal.squadId);
      const targetGap = activeGaps.find(g => g.id === gapId);
      await this.gapRepo.resolve(gapId);

      let memory = null;
      if (targetGap) {
        memory = this.memoryExtractor.extract(targetGap, commitment, signal.squadId);
        await this.memoryRepo.save(memory);
      }

      const evaluation = await this.evaluateSquad(signal.squadId);
      return { status: 'aligned', commitment, memory, nextEvaluation: evaluation };
    } else if (alignmentResult.status === 'divergent') {
      const evaluation = await this.evaluateSquad(signal.squadId);
      return { status: 'divergent', commitment: null, memory: null, nextEvaluation: evaluation };
    }
    
    return null;
  }
}
