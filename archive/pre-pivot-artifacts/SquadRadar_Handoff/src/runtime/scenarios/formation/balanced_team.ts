import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'mobile', builderStyle: 'architect', goal: 'prize', intensity: 'all_nighter', hour1Ownership: 'mobile', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'all_nighter', hour1Ownership: 'backend', preferredTeamSize: 4 },
  { id: 'u3', name: '3', role: 'design', builderStyle: 'executor', goal: 'prize', intensity: 'all_nighter', hour1Ownership: 'design', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_balanced_team', eventId: 'evt_sim', name: 'balanced_team', idea: 'Idea',
  members, commitments: []
};

runScenario('balanced_team', squad, 'u1');
