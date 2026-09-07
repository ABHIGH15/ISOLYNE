import { SquadRuntime } from './SquadRuntime';
import { TestClock } from './Clock';
import { EvaluatorRegistry } from './evaluators/EvaluatorRegistry';
import { FormationEvaluator } from './evaluators/FormationEvaluator';
import { Event, Squad, Signal, Builder } from './types';

// 1. Dependency Setup
const evaluatorRegistry = new EvaluatorRegistry();
evaluatorRegistry.register(new FormationEvaluator());

// Start event at t=0
const startTimeMs = Date.now();
const testClock = new TestClock(startTimeMs);

const event: Event = {
  id: 'evt_shipaton_2026',
  name: 'Shipaton 2026',
  startTime: new Date(startTimeMs).toISOString(),
  endTime: new Date(startTimeMs + 36 * 60 * 60 * 1000).toISOString()
};

const viewer: Builder = {
  id: 'usr_1',
  name: 'Abhi',
  role: 'mobile',
  builderStyle: 'architect',
  goal: 'prize',
  intensity: 'all_nighter',
  hour1Ownership: 'mobile',
  preferredTeamSize: 4
};

const squad: Squad = {
  id: 'sqd_alpha',
  eventId: 'evt_shipaton_2026',
  name: 'Alpha Team',
  idea: 'Collaboration Intelligence',
  members: [viewer],
  commitments: []
};

// 2. Initialize Runtime (The Engine Room)
console.log('Initializing SquadRuntime Closed Loop...');
const runtime = new SquadRuntime(event, squad, evaluatorRegistry, testClock);

// 3. OBSERVE (Initial State)
console.log('\n--- T=0: Initial Evaluation ---');
let moment = runtime.evaluate('usr_1');
if (moment) {
  console.log(`[Reveal] Ghost Decision: ${moment.ghostDecision.title}`);
  console.log(`[Reveal] Action Required: ${moment.ghostDecision.options[0].label}`);
} else {
  console.log('No decisions pending.');
}

// 4. ALIGN & COMMITMENT (The Loop Closes)
console.log('\n--- T=10m: User taps "I will step up and lead" ---');
testClock.advance(10 * 60 * 1000); // 10 minutes pass

const commitmentSignal: Signal = {
  id: 'sig_commit_1',
  version: 1,
  actorId: 'usr_1',
  squadId: 'sqd_alpha',
  type: 'commitment_made',
  timestamp: testClock.now(),
  payload: {
    commitment: {
      id: 'cmt_1',
      builderId: 'usr_1',
      type: 'role',
      value: 'lead',
      timestamp: testClock.now()
    }
  }
};
runtime.emit(commitmentSignal);

// 5. OBSERVE AGAIN (Insight Disappears)
console.log('\n--- T=10m: Post-Commitment Evaluation ---');
moment = runtime.evaluate('usr_1');
if (moment) {
  console.log(`[Reveal] Ghost Decision: ${moment.ghostDecision.title}`);
} else {
  console.log('[Clear] Insight disappeared. Shared Awareness established.');
}
