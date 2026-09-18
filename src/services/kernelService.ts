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
import { SyncSignalRepository } from '../kernel/repositories/sync/SyncSignalRepository';
import { WebSocketSyncAdapter } from '../kernel/repositories/sync/WebSocketSyncAdapter';

const SIGNALS_KEY = 'isolyne-signals';

// Create repos
const inMemorySignalRepo = new InMemorySignalRepository();
const realityRepo = new InMemoryRealityRepository();
const gapRepo = new InMemoryGapRepository();
const proposalRepo = new InMemoryProposalRepository();
const commitmentRepo = new InMemoryCommitmentRepository();
const memoryRepo = new InMemoryMemoryRepository();

// Inject a save hook into the base signal repo for local persistence
const originalSave = inMemorySignalRepo.save.bind(inMemorySignalRepo);
inMemorySignalRepo.save = async (signal: Signal) => {
  await originalSave(signal);
  // Persist all signals
  const all = inMemorySignalRepo['signals'];
  await AsyncStorage.setItem(SIGNALS_KEY, JSON.stringify(all)).catch(() => {});
};

// Initialize WebSocket Sync
import { Platform } from 'react-native';
const wsHost = Platform.OS === 'web' ? 'localhost' : (process.env.EXPO_PUBLIC_SYNC_HOST || '10.31.24.102');
const wsUrl = `ws://${wsHost}:3000`;
export const syncAdapter = new WebSocketSyncAdapter(wsUrl);

// Wrap base repo with Sync repo
export const signalRepo = new SyncSignalRepository(inMemorySignalRepo, syncAdapter);


// Load existing signals on boot
export async function initializeKernelStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SIGNALS_KEY);
    if (raw) {
      const signals: Signal[] = JSON.parse(raw);
      inMemorySignalRepo['signals'] = signals;
    }
  } catch (e) {
    console.debug("Failed to load signals from AsyncStorage", e);
  }
}

// Removed mock seed data to ensure a completely blank slate for live demos.
export async function seedDemoDataIfNeeded(): Promise<void> {
  // No-op
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


