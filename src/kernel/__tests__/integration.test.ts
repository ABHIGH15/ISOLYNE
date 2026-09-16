import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersistentCIKernel } from '../persistence/PersistentCIKernel';
import { KernelUIAdapter } from '../UIAdapter';
import { 
  InMemorySignalRepository, InMemoryRealityRepository, InMemoryGapRepository, 
  InMemoryProposalRepository, InMemoryCommitmentRepository, InMemoryMemoryRepository 
} from '../repositories/in-memory/InMemoryRepositories';
import { scheduleGapNotification } from '../../services/notificationService';
import type { Signal } from '../domain/Signal';

vi.mock('../../services/notificationService', () => ({
  scheduleGapNotification: vi.fn(),
  clearNotifiedGap: vi.fn(),
  requestNotificationPermissions: vi.fn().mockResolvedValue(true)
}));

describe('End-to-End Integration: Statement -> Detection -> Notification -> Resolution', () => {
  let kernel: PersistentCIKernel;
  let adapter: KernelUIAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    const signalRepo = new InMemorySignalRepository();
    kernel = new PersistentCIKernel(
      signalRepo,
      new InMemoryRealityRepository(),
      new InMemoryGapRepository(),
      new InMemoryProposalRepository(),
      new InMemoryCommitmentRepository(),
      new InMemoryMemoryRepository()
    );
    adapter = new KernelUIAdapter(kernel);
  });

  it('completes the full loop from divergence to resolution', async () => {
    const squadId = 'squad-integration-1';

    // 1. Statement In (Alice)
    const sig1: Signal = {
      id: 'sig_1',
      squadId,
      actorId: 'Alice',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'Database', choice: 'Postgres' }
    };
    
    let ev = await kernel.processSignal(sig1);
    expect(ev.selectedGap).toBeNull(); // Radar is ALL CLEAR

    // 2. Statement In (Bob) -> Gap Detected
    const sig2: Signal = {
      id: 'sig_2',
      squadId,
      actorId: 'Bob',
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: { topic: 'Database', choice: 'Firebase' }
    };
    
    ev = await kernel.processSignal(sig2);
    expect(ev.selectedGap).not.toBeNull();
    expect(ev.selectedGap?.type).toBe('consensus_gap');
    
    // 3. Notification Scheduled (Simulating the hook in KernelContext)
    if (ev.selectedGap) {
      await scheduleGapNotification(
        ev.selectedGap.id,
        ev.selectedGap.topic || 'General',
        ev.selectedGap.hiddenReality,
        sig2.actorId
      );
    }
    
    expect(scheduleGapNotification).toHaveBeenCalledTimes(1);
    expect(scheduleGapNotification).toHaveBeenCalledWith(
      ev.selectedGap?.id,
      'Database',
      expect.any(String),
      'Bob'
    );

    // 4. Resolution (Alice agrees to Postgres)
    const resolveSig = await adapter.respondToProposal(
      squadId,
      'Alice',
      'agree',
      ev.proposal!.id,
      ev.selectedGap!.id,
      { type: 'consensus', topic: 'Database', choice: 'Postgres' }
    );
    
    // 5. Radar State Updated (Back to ALL CLEAR)
    expect(resolveSig?.nextEvaluation.selectedGap).toBeNull();
    expect(resolveSig?.nextEvaluation.state.decisions.find(d => d.topic === 'Database')?.choice).toBe('Postgres');
  });
});
