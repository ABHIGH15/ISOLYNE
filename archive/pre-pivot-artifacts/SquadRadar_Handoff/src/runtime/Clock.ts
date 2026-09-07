export interface Clock {
  now(): string;
  nowMs(): number;
}

export class RealClock implements Clock {
  now(): string { return new Date().toISOString(); }
  nowMs(): number { return Date.now(); }
}

export class TestClock implements Clock {
  private timeMs: number;
  constructor(initialMs: number) { this.timeMs = initialMs; }
  
  now(): string { return new Date(this.timeMs).toISOString(); }
  nowMs(): number { return this.timeMs; }
  
  advance(ms: number) { this.timeMs += ms; }
  set(ms: number) { this.timeMs = ms; }
}
