import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'mobile', builderStyle: 'architect', goal: 'startup', intensity: 'all_nighter', hour1Ownership: 'mobile', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'backend', builderStyle: 'executor', goal: 'portfolio', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 },
  { id: 'u3', name: '3', role: 'design', builderStyle: 'executor', goal: 'learn', intensity: 'chill', hour1Ownership: 'design', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_conflicting_goals', eventId: 'evt_sim', name: 'conflicting_goals', idea: 'Idea',
  members, commitments: []
};

runScenario('conflicting_goals', squad, 'u1');
