import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';

const viewer: Builder = { id: 'u1', name: '1', role: 'mobile', builderStyle: 'architect', goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4 };
const members: Builder[] = [viewer];
for(let i=2; i<=7; i++) {
  members.push({ id: `u${i}`, name: `${i}`, role: 'backend', builderStyle: 'executor', goal: 'prize', intensity: 'standard', hour1Ownership: 'backend', preferredTeamSize: 4 });
}

const squad: Squad = {
  id: 's2', eventId: 'evt_sim', name: 'Huge', idea: 'App',
  members, commitments: []
};

runScenario('oversized_team', squad, 'u1');
