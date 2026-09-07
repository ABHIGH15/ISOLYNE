import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'mobile', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_two_people_no_lead', eventId: 'evt_sim', name: 'two_people_no_lead', idea: 'Idea',
  members, commitments: []
};

runScenario('two_people_no_lead', squad, 'u1');
