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

// Seed debug data to ensure demo is instantly usable with Abhi and Anu
export async function seedDemoDataIfNeeded(activeId: string = 'shipaton-demo-final'): Promise<void> {
  const current = await signalRepo.getBySquad(activeId);
  // ALWAYS WIPE for video recording to guarantee fresh state
  const needsWipe = true;
  
  if (needsWipe) {
    // FORCE WIPE all local data to eradicate Alice and Bob from cache
    await AsyncStorage.removeItem(SIGNALS_KEY);
    inMemorySignalRepo['signals'] = [];
    realityRepo['states'] = new Map();
    gapRepo['gaps'] = [];
    proposalRepo['proposals'] = [];
    commitmentRepo['commitments'] = [];
    memoryRepo['memories'] = [];

    const now = Date.now();
    const demoSignals: Signal[] = [
      { id: 'sig-1', squadId: activeId, actorId: 'System', timestamp: new Date(now - 12000000).toISOString(), type: 'member_joined' },
      
      // Aligned Decisions (Building up the log)
      { id: 'sig-2', squadId: activeId, actorId: 'abhi', timestamp: new Date(now - 11000000).toISOString(), type: 'decision_stated', payload: { topic: 'framework', choice: 'Expo v57', verbatim: 'Initializing the monorepo with Expo v57 so we can ship to iOS instantly.' } },
      { id: 'sig-3', squadId: activeId, actorId: 'anu', timestamp: new Date(now - 10000000).toISOString(), type: 'decision_stated', payload: { topic: 'styling', choice: 'StyleSheet', verbatim: 'Using standard React Native StyleSheet instead of NativeWind to avoid jitter.' } },
      { id: 'sig-4', squadId: activeId, actorId: 'abhi', timestamp: new Date(now - 9000000).toISOString(), type: 'decision_stated', payload: { topic: 'design system', choice: 'Brutalist Dark Mode', verbatim: 'I will design a custom brutalist dark mode theme with heavy glassmorphism.' } },
      { id: 'sig-5', squadId: activeId, actorId: 'anu', timestamp: new Date(now - 8000000).toISOString(), type: 'decision_stated', payload: { topic: 'state management', choice: 'Zustand', verbatim: 'Setting up Zustand for global state, Redux is too much boilerplate for a 48h hackathon.' } },
      { id: 'sig-6', squadId: activeId, actorId: 'abhi', timestamp: new Date(now - 7000000).toISOString(), type: 'decision_stated', payload: { topic: 'animations', choice: 'Reanimated', verbatim: 'Wiring up React Native Reanimated for the physics-based transitions.' } },
      { id: 'sig-7', squadId: activeId, actorId: 'anu', timestamp: new Date(now - 6000000).toISOString(), type: 'decision_stated', payload: { topic: 'monetization', choice: 'RevenueCat', verbatim: 'RevenueCat Purchases SDK is configured and ready for the Paywall.' } },
      { id: 'sig-8', squadId: activeId, actorId: 'abhi', timestamp: new Date(now - 5000000).toISOString(), type: 'decision_stated', payload: { topic: 'analytics', choice: 'PostHog', verbatim: 'Added PostHog tracking to the dashboard.' } },
      { id: 'sig-9', squadId: activeId, actorId: 'anu', timestamp: new Date(now - 4000000).toISOString(), type: 'decision_stated', payload: { topic: 'hardware feedback', choice: 'Expo Haptics', verbatim: 'Hooked up expo-haptics to the conflict detection triggers.' } },

      // The silent drift begins here: Abhi assumes Firebase, Anu assumes Postgres
      { id: 'sig-10', squadId: activeId, actorId: 'abhi', timestamp: new Date(now - 2000000).toISOString(), type: 'decision_stated', payload: { topic: 'database', choice: 'Firebase', verbatim: 'I will wire up Firebase Auth and Firestore for the backend tonight.' } },
      { id: 'sig-11', squadId: activeId, actorId: 'anu', timestamp: new Date(now - 100000).toISOString(), type: 'decision_stated', payload: { topic: 'database', choice: 'PostgreSQL', verbatim: 'I just defined the user and squad schemas in Postgres.' } },
    ];
    
    for (const sig of demoSignals) {
      await signalRepo.save(sig);
    }
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


