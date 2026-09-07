import { Event } from '../types';
import { Clock } from '../Clock';

export class TemporalComputer {
  public static compute(event: Event, clock: Clock) {
    const nowMs = clock.nowMs();
    const startMs = new Date(event.startTime).getTime();
    const endMs = new Date(event.endTime).getTime();
    
    const timeRemainingMs = Math.max(0, endMs - nowMs);
    const elapsedMs = Math.max(0, nowMs - startMs);
    const duration = endMs - startMs;
    const progressPercent = duration > 0 ? (elapsedMs / duration) * 100 : 0;

    return { timeRemainingMs, elapsedMs, progressPercent };
  }
}
