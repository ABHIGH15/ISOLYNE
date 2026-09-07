import { Builder, Squad } from '../../../runtime';
import { runScenario } from './runner';

const viewer: Builder = {
  id: 'u1', name: 'Abhi', role: 'mobile', builderStyle: 'architect',
  goal: 'prize', intensity: 'standard', hour1Ownership: 'mobile', preferredTeamSize: 4
};

const squad: Squad = {
  id: 's1', eventId: 'evt_sim', name: 'Solo', idea: 'App',
  members: [viewer], commitments: []
};

runScenario('solo_builder', squad, 'u1');
