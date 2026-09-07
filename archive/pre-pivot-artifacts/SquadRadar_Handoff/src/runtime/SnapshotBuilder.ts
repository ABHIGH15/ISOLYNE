import { Squad, Event, Signal, AwarenessSnapshot } from './types';
import { Clock } from './Clock';
import { TemporalComputer } from './computers/TemporalComputer';
import { CompositionComputer } from './computers/CompositionComputer';
import { ActivityComputer } from './computers/ActivityComputer';

/**
 * Pipeline that orchestrates domain computers to build the AwarenessSnapshot.
 */
export class SnapshotBuilder {
  public static build(squad: Squad, event: Event, signals: Signal[], clock: Clock): AwarenessSnapshot {
    return {
      timestamp: clock.now(),
      squad,
      event,
      temporal: TemporalComputer.compute(event, clock),
      composition: CompositionComputer.compute(squad),
      activity: ActivityComputer.compute(signals)
    };
  }
}
