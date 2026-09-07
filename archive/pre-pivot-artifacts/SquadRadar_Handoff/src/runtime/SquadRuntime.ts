import { Event, Squad, Signal, AwarenessSnapshot, DecisionMoment } from './types';
import { SquadState } from './SquadState';
import { Clock, RealClock } from './Clock';
import { SnapshotBuilder } from './SnapshotBuilder';
import { EvaluatorRegistry } from './evaluators/EvaluatorRegistry';
import { DecisionComposer } from './composers/DecisionComposer';
import { MomentSelectionPolicy } from './composers/MomentSelectionPolicy';

export class SquadRuntime {
  private event: Event;
  private state: SquadState;
  private clock: Clock;
  private signals: Signal[] = [];
  private evaluatorRegistry: EvaluatorRegistry;

  constructor(
    event: Event, 
    initialSquad: Squad, 
    evaluatorRegistry: EvaluatorRegistry,
    clock: Clock = new RealClock()
  ) {
    this.event = { ...event };
    this.state = new SquadState(initialSquad);
    this.evaluatorRegistry = evaluatorRegistry;
    this.clock = clock;
  }

  public emit(signal: Signal): void {
    this.signals.push(signal);
    this.state.append(signal);
  }

  public snapshot(): AwarenessSnapshot {
    return SnapshotBuilder.build(this.state.getProjection(), this.event, this.signals, this.clock);
  }

  public evaluate(viewerId: string): DecisionMoment | null {
    const snap = this.snapshot();
    const insights = this.evaluatorRegistry.evaluateAll(snap, viewerId, this.clock);
    if (insights.length === 0) return null;
    const ghostDecisions = DecisionComposer.compose(insights);
    return MomentSelectionPolicy.select(ghostDecisions, this.clock);
  }

  public getSignals(): Signal[] {
    return this.signals;
  }

  public getInsights(viewerId: string) {
    return this.evaluatorRegistry.evaluateAll(this.snapshot(), viewerId, this.clock);
  }

}
