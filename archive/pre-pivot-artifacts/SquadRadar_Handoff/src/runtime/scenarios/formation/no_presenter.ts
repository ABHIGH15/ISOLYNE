import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';


const members: Builder[] = [
  { id: 'u1', name: '1', role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 },
  { id: 'u2', name: '2', role: 'frontend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'frontend', preferredTeamSize: 4 },
  { id: 'u3', name: '3', role: 'mobile', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 }
];


const squad: Squad = {
  id: 's_no_presenter', eventId: 'evt_sim', name: 'no_presenter', idea: 'Idea',
  members, commitments: []
};

runScenario('no_presenter', squad, 'u1');
