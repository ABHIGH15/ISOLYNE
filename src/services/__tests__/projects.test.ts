import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory mock for AsyncStorage in node test runner
const storage = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); }),
    clear: vi.fn(async () => { storage.clear(); })
  }
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadOrCreateProjects, 
  createProjectRecord, 
  deleteProjectRecord, 
  getProjectRoster, 
  setProjectRoster,
  PROJECTS_KEY,
  ACTIVE_PROJECT_KEY,
  ROSTER_PREFIX,
  DEFAULT_PROJECT_ID
} from '../projectService';
import { signalRepo } from '../kernelService';

describe('Project Service (Real Production Code Tests)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    signalRepo['signals'] = [];
  });

  it('loadOrCreateProjects: initializes default project (Shipaton 2026) when storage is empty', async () => {
    // Empty storage initially
    expect(await AsyncStorage.getItem(PROJECTS_KEY)).toBeNull();

    // Call real function
    const { projects, activeId } = await loadOrCreateProjects();

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(DEFAULT_PROJECT_ID);
    expect(projects[0].name).toBe('Shipaton 2026');
    expect(activeId).toBe(DEFAULT_PROJECT_ID);

    // Verify written to AsyncStorage
    const stored = JSON.parse((await AsyncStorage.getItem(PROJECTS_KEY))!);
    expect(stored[0].id).toBe(DEFAULT_PROJECT_ID);
    expect(await AsyncStorage.getItem(ACTIVE_PROJECT_KEY)).toBe(DEFAULT_PROJECT_ID);
  });

  it('createProjectRecord: creates real project record, namespaces roster, and executes kernel signal pipeline', async () => {
    // Start with default project
    await loadOrCreateProjects();

    // Call real creation function
    const newProj = await createProjectRecord('HackMIT 2026', 'Alice', ['Charlie', 'Dave']);

    expect(newProj.id).toMatch(/^proj_/);
    expect(newProj.name).toBe('HackMIT 2026');

    // Verify projects list updated in storage
    const storedProjects = JSON.parse((await AsyncStorage.getItem(PROJECTS_KEY))!);
    expect(storedProjects).toHaveLength(2);
    expect(storedProjects[1].id).toBe(newProj.id);

    // Verify active project set to new project
    expect(await AsyncStorage.getItem(ACTIVE_PROJECT_KEY)).toBe(newProj.id);

    // Verify roster namespaced to new project ID
    const roster = await getProjectRoster(newProj.id, 'Alice');
    expect(roster).toEqual(['Alice', 'Charlie', 'Dave']);

    // Verify member_joined signals emitted to signalRepo for the new project
    const squadSignals = await signalRepo.getBySquad(newProj.id);
    const memberJoinedSignals = squadSignals.filter(s => s.type === 'member_joined');
    expect(memberJoinedSignals).toHaveLength(3);
    expect(memberJoinedSignals.map(s => s.actorId)).toEqual(['Alice', 'Charlie', 'Dave']);

    // Real kernel invariant: multiple members joined without designated owner triggers ownership divergence signal
    const divergenceSignals = squadSignals.filter(s => s.type === 'divergence_detected');
    expect(divergenceSignals.length).toBeGreaterThanOrEqual(1);
    expect(divergenceSignals[0].payload?.gapType).toBe('ownership_gap');
  });

  it('setProjectRoster: updates roster scoped to specific project', async () => {
    const proj = await createProjectRecord('Roster Test', 'Alice', ['Bob']);
    
    // Update roster
    await setProjectRoster(proj.id, ['Alice', 'Bob', 'Eve']);

    const loaded = await getProjectRoster(proj.id, 'Alice');
    expect(loaded).toEqual(['Alice', 'Bob', 'Eve']);
  });

  it('deleteProjectRecord: purges roster, cleans squad signals, and switches active project', async () => {
    // Create Project 1 and Project 2
    const p1 = await createProjectRecord('Alpha Project', 'Alice', ['Bob']);
    const p2 = await createProjectRecord('Beta Project', 'Alice', ['Charlie']);

    // Add decisions to both projects
    await signalRepo.save({ id: 'sig_a1', squadId: p1.id, actorId: 'Alice', type: 'decision_stated', timestamp: 'T1' });
    await signalRepo.save({ id: 'sig_b1', squadId: p2.id, actorId: 'Alice', type: 'decision_stated', timestamp: 'T2' });

    // Both projects have active signals
    expect((await signalRepo.getBySquad(p1.id)).length).toBeGreaterThan(0);
    expect((await signalRepo.getBySquad(p2.id)).length).toBeGreaterThan(0);

    // Delete p2 while it is active
    const { remainingProjects, nextActiveId } = await deleteProjectRecord(p2.id, p2.id);

    // Assert p2 is removed from projects list
    expect(remainingProjects.some(p => p.id === p2.id)).toBe(false);
    expect(nextActiveId).toBe(remainingProjects[0].id);
    expect(remainingProjects.map(p => p.id)).toContain(p1.id);

    // Assert roster was purged
    expect(await AsyncStorage.getItem(`${ROSTER_PREFIX}${p2.id}`)).toBeNull();

    // Assert p2 signals were purged from signalRepo and storage
    const remainingSignalsInRepo = await signalRepo.getBySquad(p2.id);
    expect(remainingSignalsInRepo).toHaveLength(0);

    // Assert p1 signals are intact
    const p1Signals = await signalRepo.getBySquad(p1.id);
    expect(p1Signals.length).toBeGreaterThan(0);
    expect(p1Signals.some(s => s.id === 'sig_a1')).toBe(true);
  });

  it('deleteProjectRecord: auto-recreates default project if last project is deleted', async () => {
    const { projects } = await loadOrCreateProjects();
    expect(projects).toHaveLength(1);

    // Delete the only existing project
    const { remainingProjects, nextActiveId } = await deleteProjectRecord(projects[0].id, projects[0].id);

    // Should recreate default project
    expect(remainingProjects).toHaveLength(1);
    expect(remainingProjects[0].id).toBe(DEFAULT_PROJECT_ID);
    expect(nextActiveId).toBe(DEFAULT_PROJECT_ID);
  });
});

describe('Runtime Parity Observation Test', () => {
  it('observes and verifies exact single-project initial boot values', async () => {
    const { loadOrCreateProjects, getProjectRoster } = await import('../projectService');
    const { seedDemoDataIfNeeded, kernel, signalRepo } = await import('../kernelService');
    const { KernelPresentationAdapter } = await import('../../presentation/contracts/KernelPresentationAdapter');

    await seedDemoDataIfNeeded();
    const { projects, activeId } = await loadOrCreateProjects();
    const roster = await getProjectRoster(activeId, 'Alice');
    const ev = await kernel.evaluateSquad(activeId);
    const radarState = KernelPresentationAdapter.toRadarState(ev);
    const decisions = KernelPresentationAdapter.toDecisionRecords(ev);
    const signals = await signalRepo.getBySquad(activeId);
    const timelineEvents = KernelPresentationAdapter.toTimelineEvents(signals);




    expect(projects).toEqual([{ id: 'shipaton-2026', name: 'Shipaton 2026', createdAt: expect.any(String) }]);
    expect(activeId).toBe('shipaton-2026');
    expect(roster).toEqual(['Alice', 'Bob']);
    expect(radarState.status).toBe('attention');
    expect(radarState.gap?.topic).toBe('database');
    expect(radarState.gap?.type).toBe('consensus_gap');
    expect(decisions).toHaveLength(4);
    expect(decisions.find(d => d.status === 'disputed')?.topic).toBe('database');
    expect(timelineEvents.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Multi-Project Isolation & Dashboard Workflow Integration', () => {
  it('creates two projects and verifies radar/decisions/timeline states remain 100% independent', async () => {
    const { 
      loadOrCreateProjects, 
      createProjectRecord, 
      deleteProjectRecord,
      getProjectRoster
    } = await import('../projectService');
    const { seedDemoDataIfNeeded, kernel, signalRepo } = await import('../kernelService');
    const { KernelPresentationAdapter } = await import('../../presentation/contracts/KernelPresentationAdapter');

    // 1. Initial State: Project A (Shipaton 2026) with seeded consensus gap on database
    await seedDemoDataIfNeeded();
    const { projects: initialProjects, activeId: projA_Id } = await loadOrCreateProjects();
    expect(projA_Id).toBe('shipaton-2026');

    const evA1 = await kernel.evaluateSquad(projA_Id);
    const radarA1 = KernelPresentationAdapter.toRadarState(evA1);
    const decisionsA1 = KernelPresentationAdapter.toDecisionRecords(evA1);
    const timelineA1 = KernelPresentationAdapter.toTimelineEvents(await signalRepo.getBySquad(projA_Id));

    expect(radarA1.status).toBe('attention');
    expect(radarA1.gap?.topic).toBe('database');
    expect(radarA1.gap?.type).toBe('consensus_gap');
    expect(decisionsA1.some(d => d.topic === 'database' && d.status === 'disputed')).toBe(true);

    // 2. Create Project B (HackMIT 2026) with roster ['Alice', 'Charlie']
    const projB = await createProjectRecord('HackMIT 2026', 'Alice', ['Charlie']);
    const projB_Id = projB.id;

    // Post non-conflicting decisions in Project B
    await kernel.processSignal({
      id: `sig_b_1`,
      squadId: projB_Id,
      actorId: 'Alice',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'client', choice: 'React Native', verbatim: 'Using React Native' }
    });
    await kernel.processSignal({
      id: `sig_b_2`,
      squadId: projB_Id,
      actorId: 'Charlie',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'api', choice: 'FastAPI', verbatim: 'Using FastAPI backend' }
    });

    // 3. Evaluate Project B: MUST NOT have Project A's consensus gap!
    let evB = await kernel.evaluateSquad(projB_Id);
    let radarB = KernelPresentationAdapter.toRadarState(evB);
    const decisionsB = KernelPresentationAdapter.toDecisionRecords(evB);
    const timelineB = KernelPresentationAdapter.toTimelineEvents(await signalRepo.getBySquad(projB_Id));

    // Project B has its own independent ownership gap (2 members, no owner yet), NOT Project A's database consensus gap
    expect(radarB.gap?.type).toBe('ownership_gap');
    expect(radarB.gap?.topic).toBeUndefined();

    // Now resolve Project B's ownership gap
    const { adapter } = await import('../kernelService');
    await adapter.respondToProposal(projB_Id, 'Alice', 'agree', evB.proposal!.id, evB.selectedGap!.id, { type: 'ownership', ownerId: 'Alice' });

    // Project B is now ALL CLEAR
    evB = await kernel.evaluateSquad(projB_Id);
    radarB = KernelPresentationAdapter.toRadarState(evB);
    expect(radarB.status).toBe('clear');
    expect(radarB.gap).toBeUndefined();

    // Assert Project B decisions do NOT contain Project A's database decisions
    expect(decisionsB.map(d => d.topic)).toEqual(['client', 'api']);
    expect(decisionsB.every(d => d.status === 'locked')).toBe(true);

    // Assert Project B timeline contains only Project B signals
    expect(timelineB.every(ev => !ev.description.includes('database'))).toBe(true);

    // 4. Re-evaluate Project A: Project A's consensus gap MUST STILL BE INTACT
    const evA2 = await kernel.evaluateSquad(projA_Id);
    const radarA2 = KernelPresentationAdapter.toRadarState(evA2);
    expect(radarA2.status).toBe('attention');
    expect(radarA2.gap?.topic).toBe('database');
    expect(radarA2.gap?.type).toBe('consensus_gap');

    // 5. Delete Project B: Project A remains active with its divergence intact
    const { remainingProjects, nextActiveId } = await deleteProjectRecord(projB_Id, projB_Id);
    expect(remainingProjects.some(p => p.id === projB_Id)).toBe(false);
    expect(nextActiveId).toBe(projA_Id);

    // Signals for Project B purged from repository
    const remainingSignalsB = await signalRepo.getBySquad(projB_Id);
    expect(remainingSignalsB).toHaveLength(0);

    // Signals for Project A unaffected
    const remainingSignalsA = await signalRepo.getBySquad(projA_Id);
    expect(remainingSignalsA.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Dashboard Status Polling Safety (evaluateSquad as Read)', () => {
  it('repeated evaluateSquad calls across all projects do not mutate persisted signals or emit duplicate divergence markers', async () => {
    const { createProjectRecord } = await import('../projectService');
    const { kernel, signalRepo } = await import('../kernelService');

    const p1 = await createProjectRecord('Squad 1', 'Alice', ['Bob']);
    const p2 = await createProjectRecord('Squad 2', 'Charlie', ['Dave']);

    // Record initial signals snapshot after project initialization
    const snapshotBefore = JSON.stringify(signalRepo['signals']);
    const countBefore = signalRepo['signals'].length;

    // Simulate opening dashboard 5 times in a row (evaluating every squad)
    for (let i = 0; i < 5; i++) {
      const ev1 = await kernel.evaluateSquad(p1.id);
      const ev2 = await kernel.evaluateSquad(p2.id);
      expect(ev1.selectedGap).not.toBeNull();
      expect(ev2.selectedGap).not.toBeNull();
    }

    const snapshotAfter = JSON.stringify(signalRepo['signals']);
    const countAfter = signalRepo['signals'].length;

    // Verify ZERO mutations occurred
    expect(countAfter).toBe(countBefore);
    expect(snapshotAfter).toBe(snapshotBefore);
  });
});

describe('Team Management on Existing Project (addTeammate & removeTeammate)', () => {
  it('adds a teammate, persists the namespaced roster, and emits member_joined signal', async () => {
    const { createProjectRecord, addTeammateToProject, getProjectRoster } = await import('../projectService');
    const { signalRepo } = await import('../kernelService');

    const proj = await createProjectRecord('Team Add Test', 'Alice', ['Bob']);
    expect(await getProjectRoster(proj.id)).toEqual(['Alice', 'Bob']);

    // Add Charlie
    const updated = await addTeammateToProject(proj.id, 'Charlie', 'Alice');
    expect(updated).toEqual(['Alice', 'Bob', 'Charlie']);

    // Verify persisted
    const loaded = await getProjectRoster(proj.id);
    expect(loaded).toEqual(['Alice', 'Bob', 'Charlie']);

    // Verify member_joined signal was emitted to kernel signalRepo
    const signals = await signalRepo.getBySquad(proj.id);
    const charlieJoin = signals.find(s => s.actorId === 'Charlie' && s.type === 'member_joined');
    expect(charlieJoin).toBeDefined();

    // Prevent duplicates in roster and verify NO duplicate member_joined signal was emitted
    const signalsBeforeDup = await signalRepo.getBySquad(proj.id);
    const charlieCountBefore = signalsBeforeDup.filter(s => s.actorId === 'Charlie' && s.type === 'member_joined').length;
    expect(charlieCountBefore).toBe(1);

    const noDup = await addTeammateToProject(proj.id, 'Charlie', 'Alice');
    expect(noDup).toEqual(['Alice', 'Bob', 'Charlie']);

    const signalsAfterDup = await signalRepo.getBySquad(proj.id);
    const charlieCountAfter = signalsAfterDup.filter(s => s.actorId === 'Charlie' && s.type === 'member_joined').length;
    expect(charlieCountAfter).toBe(1);
  });

  it('removes a teammate: persists roster while preserving their past decisions and timeline history in the ledger', async () => {
    const { createProjectRecord, removeTeammateFromProject, getProjectRoster } = await import('../projectService');
    const { signalRepo, kernel } = await import('../kernelService');
    const { KernelPresentationAdapter } = await import('../../presentation/contracts/KernelPresentationAdapter');

    const proj = await createProjectRecord('Team Removal Test', 'Alice', ['Bob']);

    // Bob states a critical architecture decision
    await kernel.processSignal({
      id: 'sig_bob_arch',
      squadId: proj.id,
      actorId: 'Bob',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'Cache', choice: 'Redis', verbatim: 'Using Redis for cluster cache' }
    });

    // Verify Bob's decision is active before removal
    const evBefore = await kernel.evaluateSquad(proj.id);
    const decisionsBefore = KernelPresentationAdapter.toDecisionRecords(evBefore);
    expect(decisionsBefore.some(d => d.actorId === 'Bob' && d.choice === 'Redis')).toBe(true);

    // Remove Bob from the active team
    const updatedRoster = await removeTeammateFromProject(proj.id, 'Bob', 'Alice');
    expect(updatedRoster).toEqual(['Alice']);

    // Verify roster is persisted without Bob
    const loadedRoster = await getProjectRoster(proj.id);
    expect(loadedRoster).toEqual(['Alice']);

    // Service-level protection: attempting to remove the default owner returns roster unmodified
    const attemptOwnerRemoval = await removeTeammateFromProject(proj.id, 'Alice', 'Alice');
    expect(attemptOwnerRemoval).toEqual(['Alice']);

    // Invariant: Bob's past decision signals and timeline history are NOT deleted from the ledger
    const signalsAfter = await signalRepo.getBySquad(proj.id);
    const bobSignals = signalsAfter.filter(s => s.actorId === 'Bob');
    expect(bobSignals.length).toBeGreaterThanOrEqual(2); // member_joined + decision_stated

    const timelineEventsAfter = KernelPresentationAdapter.toTimelineEvents(signalsAfter);
    expect(timelineEventsAfter.some(ev => ev.description.includes('Bob stated'))).toBe(true);

    // Invariant: Kernel projection still reflects Bob's past stated choice in shared reality
    const evAfter = await kernel.evaluateSquad(proj.id);
    const decisionsAfter = KernelPresentationAdapter.toDecisionRecords(evAfter);
    expect(decisionsAfter.some(d => d.actorId === 'Bob' && d.choice === 'Redis')).toBe(true);
  });

  it('kernel membership persistence invariant: state.members remains append-only after UI roster removal', async () => {
    const { createProjectRecord, removeTeammateFromProject, getProjectRoster } = await import('../projectService');
    const { kernel } = await import('../kernelService');

    // 1. Create project with Alice and Bob (no owner assigned yet)
    const proj = await createProjectRecord('Kernel Member Invariant', 'Alice', ['Bob']);

    // 2. Kernel evaluates: 2 members joined, no owner -> OwnershipGapDetector fires
    const evBefore = await kernel.evaluateSquad(proj.id);
    expect(evBefore.state.members).toEqual(['Alice', 'Bob']);
    expect(evBefore.selectedGap?.type).toBe('ownership_gap');

    // 3. Remove Bob via projectService (storage layer shrinks)
    const updatedRoster = await removeTeammateFromProject(proj.id, 'Bob', 'Alice');
    expect(updatedRoster).toEqual(['Alice']);
    expect(await getProjectRoster(proj.id)).toEqual(['Alice']);

    // 4. Kernel re-evaluates squad:
    // Demonstrating the append-only invariant:
    // Because the kernel domain model has no 'member_left' signal,
    // state.members reconstructed from signals still contains both ['Alice', 'Bob']
    const evAfter = await kernel.evaluateSquad(proj.id);
    expect(evAfter.state.members).toEqual(['Alice', 'Bob']);
    // And because state.members.length === 2 and no owner is assigned, OwnershipGapDetector STILL fires:
    expect(evAfter.selectedGap?.type).toBe('ownership_gap');
  });

  it('activeActor degradation: if activeActor is removed, it gracefully falls back without crashing or posting as removed member', () => {
    let activeActor = 'Bob';
    const roster = ['Alice']; // Bob was removed
    const defaultUser = 'Alice';

    // Same fallback expression implemented in StatementChannel.tsx
    const effectiveActor = roster.includes(activeActor) ? activeActor : (roster[0] || defaultUser);

    expect(effectiveActor).toBe('Alice');
    expect(effectiveActor).not.toBe('Bob');
  });
});

describe('Solo Owner Resolution Workflow (Preventing Soft-Brick)', () => {
  it('allows remaining owner to claim ownership solo after teammate removal, returning project to ALL CLEAR', async () => {
    const { createProjectRecord, removeTeammateFromProject, getProjectRoster } = await import('../projectService');
    const { kernel, adapter } = await import('../kernelService');
    const { KernelPresentationAdapter } = await import('../../presentation/contracts/KernelPresentationAdapter');

    // 1. Create project with Alice and Bob (no owner assigned)
    const proj = await createProjectRecord('Solo Resolution Test', 'Alice', ['Bob']);

    // 2. Initial state: ownership_gap is detected
    const ev1 = await kernel.evaluateSquad(proj.id);
    expect(ev1.selectedGap?.type).toBe('ownership_gap');
    expect(ev1.proposal).toBeDefined();

    // 3. Remove Bob (Alice is now solo on the project)
    await removeTeammateFromProject(proj.id, 'Bob', 'Alice');
    const roster = await getProjectRoster(proj.id);
    expect(roster).toEqual(['Alice']);

    // 4. Kernel evaluates: gap is still present due to append-only history
    const ev2 = await kernel.evaluateSquad(proj.id);
    expect(ev2.selectedGap?.type).toBe('ownership_gap');

    // 5. Alice claims ownership solo (via handleAssignOwner('Alice') in radar.tsx)
    const res = await adapter.respondToProposal(
      proj.id,
      'Alice',
      'agree',
      ev2.proposal!.id,
      ev2.selectedGap!.id,
      { type: 'ownership', ownerId: 'Alice' }
    );

    expect(res?.status).toBe('aligned');

    // 6. Project now evaluates to ALL CLEAR!
    const ev3 = await kernel.evaluateSquad(proj.id);
    const radar = KernelPresentationAdapter.toRadarState(ev3);
    expect(radar.status).toBe('clear');
    expect(radar.gap).toBeUndefined();
    expect(ev3.state.ownership.ownerId).toBe('Alice');
  });
});

describe('Multi-Person Ownership Assignment Workflow', () => {
  it('allows Alice to assign Bob as owner on a multi-person team, resolving ownership and unblocking downstream consensus', async () => {
    const { createProjectRecord } = await import('../projectService');
    const { kernel, adapter } = await import('../kernelService');
    const { KernelPresentationAdapter } = await import('../../presentation/contracts/KernelPresentationAdapter');

    // 1. Multi-person project with Alice and Bob (no owner assigned)
    const proj = await createProjectRecord('Multi-Person Ownership Team', 'Alice', ['Bob']);

    // Stated choices with a conflict on database
    await kernel.processSignal({
      id: 'sig_db_alice',
      squadId: proj.id,
      actorId: 'Alice',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'database', choice: 'PostgreSQL', verbatim: 'Postgres for reliability' }
    });
    await kernel.processSignal({
      id: 'sig_db_bob',
      squadId: proj.id,
      actorId: 'Bob',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'database', choice: 'Firebase', verbatim: 'Firebase for speed' }
    });

    // 2. Kernel evaluates: ownership_gap takes strict priority over consensus_gap
    const ev1 = await kernel.evaluateSquad(proj.id);
    const radar1 = KernelPresentationAdapter.toRadarState(ev1);
    expect(radar1.status).toBe('attention');
    expect(radar1.gap?.type).toBe('ownership_gap');

    // 3. In the UI, the options show [Claim (Alice), Assign Bob]. Alice assigns Bob as owner:
    // (exact payload sent by handleAssignOwner('Bob'))
    const res = await adapter.respondToProposal(
      proj.id,
      'Alice',
      'agree',
      ev1.proposal!.id,
      ev1.selectedGap!.id,
      { type: 'ownership', ownerId: 'Bob' }
    );

    expect(res?.status).toBe('aligned');

    // 4. Kernel evaluates: ownership gap is resolved, ownerId is Bob!
    // Now the downstream consensus_gap on database surfaces!
    const ev2 = await kernel.evaluateSquad(proj.id);
    const radar2 = KernelPresentationAdapter.toRadarState(ev2);
    expect(ev2.state.ownership.ownerId).toBe('Bob');
    expect(radar2.gap?.type).toBe('consensus_gap');
    expect(radar2.gap?.topic).toBe('database');

    // 5. Team aligns on PostgreSQL
    const resConsensus = await adapter.respondToProposal(
      proj.id,
      'Bob',
      'agree',
      ev2.proposal!.id,
      ev2.selectedGap!.id,
      { type: 'consensus', topic: 'database', choice: 'PostgreSQL' }
    );
    expect(resConsensus?.status).toBe('aligned');

    // 6. Project is now ALL CLEAR
    const ev3 = await kernel.evaluateSquad(proj.id);
    const radar3 = KernelPresentationAdapter.toRadarState(ev3);
    expect(radar3.status).toBe('clear');
    expect(radar3.gap).toBeUndefined();
  });
});
