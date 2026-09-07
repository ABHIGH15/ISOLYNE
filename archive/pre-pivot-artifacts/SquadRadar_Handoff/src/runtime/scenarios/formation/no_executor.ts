import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'mobile', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'design', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'design', preferredTeamSize: 4 },
  { id: 'u3', name: '3', role: 'product', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'product', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_no_executor', eventId: 'evt_sim', name: 'no_executor', idea: 'Idea',
  members, commitments: []
};

runScenario('no_executor', squad, 'u1');
