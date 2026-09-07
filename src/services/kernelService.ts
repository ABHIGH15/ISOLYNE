import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistentCIKernel } from '../kernel/persistence/PersistentCIKernel';
import { KernelUIAdapter } from '../kernel/UIAdapter';
import {
  InMemorySignalRepository,
  InMemoryRealityRepository,
  InMemoryGapRepository,
  InMemoryProposalRepository,
  InMemoryCommitmentRepository,
  InMemoryMemoryRepository,
} from '../kernel/repositories/in-memory/InMemoryRepositories';
import { Signal } from '../kernel/domain/Signal';

const SIGNALS_KEY = 'isolyne-signals';

// Create repos
const signalRepo = new InMemorySignalRepository();
const realityRepo = new InMemoryRealityRepository();
const gapRepo = new InMemoryGapRepository();
const proposalRepo = new InMemoryProposalRepository();
const commitmentRepo = new InMemoryCommitmentRepository();
const memoryRepo = new InMemoryMemoryRepository();

// Inject a save hook into the signal repo for the demo
const originalSave = signalRepo.save.bind(signalRepo);
signalRepo.save = async (signal: Signal) => {
  await originalSave(signal);
  // Persist all signals
  const all = signalRepo['signals'];
  await AsyncStorage.setItem(SIGNALS_KEY, JSON.stringify(all)).catch(() => {});
};

// Load existing signals on boot
export async function initializeKernelStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SIGNALS_KEY);
    if (raw) {
      const signals: Signal[] = JSON.parse(raw);
      signalRepo['signals'] = signals;
    }
  } catch (e) {
    console.warn("Failed to load signals from AsyncStorage", e);
  }
}

// Seed debug data to ensure demo is instantly usable
export async function seedDemoDataIfNeeded(): Promise<void> {
  const current = await signalRepo.getBySquad('shipaton-2026');
  if (current.length === 0) {
    const now = Date.now();
    const demoSignals: Signal[] = [
      { id: 'sig-1', squadId: 'shipaton-2026', actorId: 'System', timestamp: new Date(now - 3600000).toISOString(), type: 'member_joined' },
      { id: 'sig-2', squadId: 'shipaton-2026', actorId: 'Alice', timestamp: new Date(now - 3500000).toISOString(), type: 'decision_stated', payload: { topic: 'frontend', choice: 'React Native', verbatim: 'Going with React Native for mobile.' } },
      { id: 'sig-3', squadId: 'shipaton-2026', actorId: 'Bob', timestamp: new Date(now - 3000000).toISOString(), type: 'decision_stated', payload: { topic: 'backend', choice: 'Supabase', verbatim: 'Setting up Supabase for data.' } },
      // Create a gap by conflicting on architecture
      { id: 'sig-4', squadId: 'shipaton-2026', actorId: 'Alice', timestamp: new Date(now - 2000000).toISOString(), type: 'decision_stated', payload: { topic: 'database', choice: 'PostgreSQL', verbatim: 'Postgres is locked in.' } },
      { id: 'sig-5', squadId: 'shipaton-2026', actorId: 'Bob', timestamp: new Date(now - 1000000).toISOString(), type: 'decision_stated', payload: { topic: 'database', choice: 'Firebase', verbatim: 'Using Firebase for rapid prototyping.' } },
    ];
    for (const sig of demoSignals) {
      await signalRepo.save(sig);
    }
    console.log("Seeded demo data: 1 active gap created on 'database'.");
  }
}

// Singleton kernel + adapter
export const kernel = new PersistentCIKernel(
  signalRepo,
  realityRepo,
  gapRepo,
  proposalRepo,
  commitmentRepo,
  memoryRepo,
);

export const adapter = new KernelUIAdapter(kernel);

// Expose signal repo for replay / profile generation
export { signalRepo };

