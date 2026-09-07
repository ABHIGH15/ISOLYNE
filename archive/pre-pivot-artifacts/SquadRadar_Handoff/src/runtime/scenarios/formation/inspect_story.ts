import { evaluateDecision } from '../../../decision-engine/evaluate';
import type { DecisionInput, Team, BuilderProfile } from '../../../decision-engine/types';

const viewer: BuilderProfile = {
  id: 'u1', name: 'Abhi', role: 'mobile', builderStyle: 'architect',
  goal: 'prize', intensity: 'all_nighter', hour1Ownership: 'mobile', preferredTeamSize: 4
};

const team: Team = {
  id: 't1', name: 'Alpha', idea: 'App',
  members: [
    { id: 'u2', name: 'Sarah', role: 'design', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'design' },
    { id: 'u3', name: 'Alex', role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend' },
  ],
  needs: []
};

const story = evaluateDecision({ viewer, team });
console.log(JSON.stringify({
  headline: story.headline,
  narrative: story.narrative,
  recommendation: story.recommendation,
  headPattern: story.debug.headPatternId,
  composition: story.debug.composition,
  matchedPatterns: story.debug.matchedPatternIds,
}, null, 2));
