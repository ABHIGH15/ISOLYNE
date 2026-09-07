import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';

const viewer: Builder = { id: 'u1', name: '1', role: 'mobile', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 };
const squad: Squad = {
  id: 's3', eventId: 'evt_sim', name: 'Architecture', idea: 'App',
  members: [
    viewer,
    { id: 'u2', name: '2', role: 'backend', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 },
    { id: 'u3', name: '3', role: 'design', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'design', preferredTeamSize: 4 }
  ],
  commitments: []
};

runScenario('three_architects', squad, 'u1');
