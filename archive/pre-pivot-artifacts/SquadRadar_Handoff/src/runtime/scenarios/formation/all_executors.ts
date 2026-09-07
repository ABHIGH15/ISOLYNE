import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'mobile', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 },
  { id: 'u3', name: '3', role: 'frontend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'frontend', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_all_executors', eventId: 'evt_sim', name: 'all_executors', idea: 'Idea',
  members, commitments: []
};

runScenario('all_executors', squad, 'u1');
