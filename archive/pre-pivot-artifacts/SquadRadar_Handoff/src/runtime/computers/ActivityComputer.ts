import { Signal } from '../types';

export class ActivityComputer {
  public static compute(signals: Signal[]) {
    const lastSignal = signals.length > 0 ? signals[signals.length - 1] : null;
    return {
      lastSignalTimestamp: lastSignal?.timestamp || null,
      stuck: false
    };
  }
}
