import { describe, it, expect } from 'vitest';
import { PersistentCIKernel } from '../persistence/PersistentCIKernel';
import { KernelUIAdapter } from '../UIAdapter';
import { 
  InMemorySignalRepository, InMemoryRealityRepository, InMemoryGapRepository, 
  InMemoryProposalRepository, InMemoryCommitmentRepository, InMemoryMemoryRepository 
} from '../repositories/in-memory/InMemoryRepositories';

describe('Deterministic Kernel Invariant Suite', () => {
  const setupKernel = () => {
    const signalRepo = new InMemorySignalRepository();
    const kernel = new PersistentCIKernel(
      signalRepo,
      new InMemoryRealityRepository(),
      new InMemoryGapRepository(),
      new InMemoryProposalRepository(),
      new InMemoryCommitmentRepository(),
      new InMemoryMemoryRepository()
    );
    const adapter = new KernelUIAdapter(kernel);
    return { kernel, adapter, signalRepo };
  };

  it('Invariant: Alice -> Postgres, Bob -> Mongo => consensus gap', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "inv1", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "inv1", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });
    const ev = await adapter.loadActiveProposal("inv1");
    expect(ev.selectedGap?.type).toBe('consensus_gap');
  });

  it('Invariant: Alice -> Redux, Alice -> Zustand => no gap (supersession)', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "inv2", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "State", choice: "Redux" } });
    await kernel.processSignal({ id: "s2", squadId: "inv2", actorId: "Alice", type: "decision_stated", timestamp: "T2", payload: { topic: "State", choice: "Zustand" } });
    const ev = await adapter.loadActiveProposal("inv2");
    expect(ev.selectedGap).toBeNull();
    expect(ev.state.decisions).toHaveLength(1);
    expect(ev.state.decisions[0].choice).toBe("Zustand");
  });

  it('Invariant: team commitment -> Postgres, Alice -> Mongo => commitment drift is detected', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "inv3", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "inv3", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });
    let ev = await adapter.loadActiveProposal("inv3");
    await adapter.respondToProposal("inv3", "Alice", "agree", ev.proposal!.id, ev.selectedGap!.id, { type: 'consensus', topic: 'DB', choice: 'Postgres' });
    await kernel.processSignal({ id: "s3", squadId: "inv3", actorId: "Alice", type: "decision_stated", timestamp: "T3", payload: { topic: "DB", choice: "Mongo" } });
    ev = await adapter.loadActiveProposal("inv3");
    expect(ev.selectedGap?.type).toBe('consensus_gap');
  });

  it('Invariant: Alice -> Postgres, Bob -> Postgres => no false contradiction', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "inv4", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "inv4", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Postgres" } });
    const ev = await adapter.loadActiveProposal("inv4");
    expect(ev.selectedGap).toBeNull();
  });

  it('C2.5: Consensus gap exposes structured evidence and unique options', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "c25a", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "Architecture", choice: "Monolith" } });
    await kernel.processSignal({ id: "s2", squadId: "c25a", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "Architecture", choice: "Microservices" } });
    
    const ev = await adapter.loadActiveProposal("c25a");
    expect(ev.selectedGap?.type).toBe('consensus_gap');
    expect(ev.selectedGap?.evidence).toHaveLength(2);
    expect(ev.selectedGap?.evidence[0].actorId).toBe("Alice");
    expect(ev.selectedGap?.evidence[0].choice).toBe("Monolith");
    expect(ev.selectedGap?.evidence[1].actorId).toBe("Bob");
    expect(ev.proposal?.options).toContain("Monolith");
    expect(ev.proposal?.options).toContain("Microservices");
    expect(ev.proposal?.options).toHaveLength(2);
  });

  it('C2.5: Challenge leaves gap open', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "c25b", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "Architecture", choice: "Monolith" } });
    await kernel.processSignal({ id: "s2", squadId: "c25b", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "Architecture", choice: "Microservices" } });
    
    const ev = await adapter.loadActiveProposal("c25b");
    const res = await adapter.respondToProposal("c25b", "Alice", "challenge", ev.proposal!.id, ev.selectedGap!.id);
    expect(res?.nextEvaluation.selectedGap?.type).toBe('consensus_gap');
  });

  it('C5: EvaluateSquad is idempotent (no duplicate divergence markers)', async () => {
    const { kernel, signalRepo } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "c5_idem", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "c5_idem", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });
    
    await kernel.evaluateSquad("c5_idem");
    await kernel.evaluateSquad("c5_idem");
    
    const signals = await signalRepo.getBySquad("c5_idem");
    const divergences = signals.filter((s: any) => s.type === 'divergence_detected');
    expect(divergences).toHaveLength(1);
  });

  it('C5: State-machine edge case: Bob changes mind to align, gap evaporates', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "s1", squadId: "c5_evap", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "c5_evap", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });
    
    let ev = await adapter.loadActiveProposal("c5_evap");
    expect(ev.selectedGap?.type).toBe('consensus_gap');

    await kernel.processSignal({ id: "s3", squadId: "c5_evap", actorId: "Bob", type: "decision_stated", timestamp: "T3", payload: { topic: "DB", choice: "Postgres" } });
    
    ev = await adapter.loadActiveProposal("c5_evap");
    expect(ev.selectedGap).toBeNull();
  });

  it('Pipeline: Ownership + Consensus coexist & resolve in order', async () => {
    const { kernel, adapter } = setupKernel();
    // Squad of 2 without an owner -> Ownership Gap
    await kernel.processSignal({ id: "j1", squadId: "pipe1", actorId: "Alice", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "j2", squadId: "pipe1", actorId: "Bob", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "s1", squadId: "pipe1", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s2", squadId: "pipe1", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });
    
    let ev = await adapter.loadActiveProposal("pipe1");
    // Ownership gap takes priority over Consensus gap
    expect(ev.selectedGap?.type).toBe('ownership_gap');

    // Resolve ownership
    await adapter.respondToProposal("pipe1", "Alice", "agree", ev.proposal!.id, ev.selectedGap!.id, { type: 'ownership', ownerId: 'Alice' });
    
    // Now the Consensus gap should surface
    ev = await adapter.loadActiveProposal("pipe1");
    expect(ev.selectedGap?.type).toBe('consensus_gap');
  });

  it('Determinism: safe deterministic ID (Ownership & Consensus)', async () => {
    const { kernel, adapter } = setupKernel();
    await kernel.processSignal({ id: "j1", squadId: "det1", actorId: "Alice", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "j2", squadId: "det1", actorId: "Bob", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "s1", squadId: "det1", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "Complex API Topic!?", choice: "REST" } });
    await kernel.processSignal({ id: "s2", squadId: "det1", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "Complex API Topic!?", choice: "GraphQL" } });
    
    const ev = await adapter.loadActiveProposal("det1");
    expect(ev.selectedGap?.type).toBe('ownership_gap');
    const expectedOwnershipId = "gap_ownership_Alice_Bob";
    expect(ev.selectedGap?.id).toBe(expectedOwnershipId);
  });

  it('Invariant: Alice -> Scope: Full CRUD, Bob -> Scope: Mock Only => interpretation gap with definition mode', async () => {
    const { kernel, adapter } = setupKernel();
    // Pre-assign ownership so interpretation gap can surface
    await kernel.processSignal({ id: "j1", squadId: "interp1", actorId: "Alice", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "s0", squadId: "interp1", actorId: "Alice", type: "alignment_agree", timestamp: "T0", payload: { type: "ownership", ownerId: "Alice" } });
    
    await kernel.processSignal({ id: "s1", squadId: "interp1", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "Scope", choice: "Full CRUD + Auth", verbatim: "We are building complete auth and data persistence." } });
    await kernel.processSignal({ id: "s2", squadId: "interp1", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "Scope", choice: "Mock API Prototype", verbatim: "We are just mocking the API with local state." } });
    
    const ev = await adapter.loadActiveProposal("interp1");
    expect(ev.selectedGap?.type).toBe('interpretation_gap');
    expect(ev.selectedGap?.id).toBe('gap_interpretation_scope');
    expect(ev.proposal?.mode).toBe('definition');
    expect(ev.proposal?.options).toContain("Full CRUD + Auth");
    expect(ev.proposal?.options).toContain("Mock API Prototype");
  });

  it('Pipeline: Ownership -> Interpretation -> Consensus priority resolution sequence', async () => {
    const { kernel, adapter } = setupKernel();
    // 2 members joined, 0 owner
    await kernel.processSignal({ id: "j1", squadId: "pipe3", actorId: "Alice", type: "member_joined", timestamp: "T0" });
    await kernel.processSignal({ id: "j2", squadId: "pipe3", actorId: "Bob", type: "member_joined", timestamp: "T0" });
    // Interpretation conflict (Scope)
    await kernel.processSignal({ id: "s1", squadId: "pipe3", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "Scope", choice: "Full MVP" } });
    await kernel.processSignal({ id: "s2", squadId: "pipe3", actorId: "Bob", type: "decision_stated", timestamp: "T1", payload: { topic: "Scope", choice: "Light Prototype" } });
    // Consensus conflict (DB)
    await kernel.processSignal({ id: "s3", squadId: "pipe3", actorId: "Alice", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "s4", squadId: "pipe3", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });

    // Step 1: Ownership gap is top priority
    let ev = await adapter.loadActiveProposal("pipe3");
    expect(ev.selectedGap?.type).toBe('ownership_gap');

    // Resolve Ownership
    await adapter.respondToProposal("pipe3", "Alice", "agree", ev.proposal!.id, ev.selectedGap!.id, { type: 'ownership', ownerId: 'Alice' });

    // Step 2: Interpretation gap surfaces next (before tech consensus)
    ev = await adapter.loadActiveProposal("pipe3");
    expect(ev.selectedGap?.type).toBe('interpretation_gap');

    // Resolve Interpretation
    await adapter.respondToProposal("pipe3", "Alice", "agree", ev.proposal!.id, ev.selectedGap!.id, { type: 'definition', topic: 'Scope', choice: 'Full MVP' });

    // Step 3: Consensus gap surfaces last
    ev = await adapter.loadActiveProposal("pipe3");
    expect(ev.selectedGap?.type).toBe('consensus_gap');
  });

  it('Invariant: Multiple squads maintain strict isolation without cross-squad gap leakage or auto-resolution', async () => {
    const { kernel, adapter, signalRepo } = setupKernel();
    // Squad A: DB conflict -> consensus gap
    await kernel.processSignal({ id: "a1", squadId: "squad-A", actorId: "Alice", type: "decision_stated", timestamp: "T1", payload: { topic: "DB", choice: "Postgres" } });
    await kernel.processSignal({ id: "a2", squadId: "squad-A", actorId: "Bob", type: "decision_stated", timestamp: "T2", payload: { topic: "DB", choice: "Mongo" } });

    // Verify Squad A has active gap
    const evA1 = await adapter.loadActiveProposal("squad-A");
    expect(evA1.selectedGap?.type).toBe('consensus_gap');

    // Squad B: all clear (single decision, no conflict)
    await kernel.processSignal({ id: "b1", squadId: "squad-B", actorId: "Charlie", type: "decision_stated", timestamp: "T3", payload: { topic: "Frontend", choice: "React" } });

    // Verify signalRepo isolation
    const signalsA = await signalRepo.getBySquad("squad-A");
    const signalsB = await signalRepo.getBySquad("squad-B");
    expect(signalsA.filter(s => s.type === 'decision_stated')).toHaveLength(2);
    expect(signalsB.filter(s => s.type === 'decision_stated')).toHaveLength(1);

    // Evaluate Squad B (must be all clear)
    const evB = await adapter.loadActiveProposal("squad-B");
    expect(evB.selectedGap).toBeNull();

    // Directly query gapRepo for squad-A and squad-B active gaps
    // Squad A's gap must still be active and not leaked to squad-B
    const gapRepo = (kernel as any).gapRepo;
    const activeGapsA = await gapRepo.getActive("squad-A");
    const activeGapsB = await gapRepo.getActive("squad-B");

    expect(activeGapsB).toHaveLength(0);
    expect(activeGapsA).toHaveLength(1);
    expect(activeGapsA[0].type).toBe('consensus_gap');
  });
});

