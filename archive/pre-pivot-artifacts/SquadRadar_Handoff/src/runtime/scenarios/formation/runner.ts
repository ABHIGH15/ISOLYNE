import { SquadRuntime, TestClock, EvaluatorRegistry, FormationEvaluator, Event, Squad, Builder } from '../../../runtime';
import * as fs from 'fs';
import * as path from 'path';

const registry = new EvaluatorRegistry();
registry.register(new FormationEvaluator());

const startTimeMs = Date.now();
const event: Event = {
  id: 'evt_sim',
  name: 'Simulation Event',
  startTime: new Date(startTimeMs).toISOString(),
  endTime: new Date(startTimeMs + 36 * 60 * 60 * 1000).toISOString()
};

export function runScenario(scenarioName: string, squad: Squad, viewerId: string) {
  const clock = new TestClock(startTimeMs);
  const runtime = new SquadRuntime(event, squad, registry, clock);
  
  const moment = runtime.evaluate(viewerId);
  if (moment) {
    const gd = moment.ghostDecision;
    console.log(`[${scenarioName}]`);
    console.log(`  Title:    ${gd.title}`);
    console.log(`  Foresight: ${gd.foresight}`);
    console.log(`  Action:   ${gd.options[0]?.label ?? '—'}`);
    console.log(`  Urgency:  ${gd.urgency}`);
    console.log('');
  } else {
    console.log(`[${scenarioName}] => ✓ Silence (No actionable decision)`);
    console.log('');
  }
}
