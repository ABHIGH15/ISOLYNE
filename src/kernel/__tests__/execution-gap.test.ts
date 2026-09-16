import { describe, it, expect } from 'vitest';
import { ExecutionGapDetector } from '../detection/ExecutionGapDetector';
import { RealityState } from '../domain/RealityState';
import { TimelineChoice } from '../domain/Timeline';

describe('ExecutionGapDetector', () => {
  const detector = new ExecutionGapDetector();

  const mockChoice = (resolved: string, gran: 'day' | 'hour'): TimelineChoice => ({
    raw_text: resolved,
    resolved_datetime: resolved,
    granularity: gran,
    anchor_timestamp: '2026-09-01T12:00:00Z',
    confidence: 'high'
  });

  it('Scenario 1: Alice commits to auth by Friday, now is Thursday (No gap)', () => {
    const state: RealityState = {
      members: ['alice'],
      ownership: {},
      decisions: [
        { actorId: 'alice', topic: 'auth', choice: mockChoice('2026-09-11T00:00:00Z', 'day') }
      ]
    };
    // Thursday
    const now = '2026-09-10T15:00:00Z';
    expect(detector.detect(state, now)).toBeNull();
  });

  it('Scenario 2: Alice commits to auth by Friday, now is Sunday (Gap)', () => {
    const state: RealityState = {
      members: ['alice'],
      ownership: {},
      decisions: [
        { actorId: 'alice', topic: 'auth', choice: mockChoice('2026-09-11T00:00:00Z', 'day') }
      ]
    };
    // Sunday
    const now = '2026-09-13T12:00:00Z';
    const gap = detector.detect(state, now);
    expect(gap).not.toBeNull();
    expect(gap?.type).toBe('execution_gap');
    expect(gap?.evidence[0].actorId).toBe('alice');
  });

  it('Scenario 4: Alice commits to Friday (day granularity), now is Friday 11:59 PM (No gap)', () => {
    const state: RealityState = {
      members: ['alice'],
      ownership: {},
      decisions: [
        { actorId: 'alice', topic: 'auth', choice: mockChoice('2026-09-11T00:00:00Z', 'day') }
      ]
    };
    // Friday night. Day granularity tolerance is 24 hours. Bucket is Friday 00:00.
    const now = '2026-09-11T23:59:59Z';
    expect(detector.detect(state, now)).toBeNull();
  });

  it('Scenario 5: Two people commit to different deadlines, one stale, one fresh (Gap for stale)', () => {
    const state: RealityState = {
      members: ['alice', 'bob'],
      ownership: {},
      decisions: [
        { actorId: 'alice', topic: 'api', choice: mockChoice('2026-09-11T00:00:00Z', 'day') }, // Friday (Stale)
        { actorId: 'bob', topic: 'ui', choice: mockChoice('2026-09-20T00:00:00Z', 'day') }    // Next week (Fresh)
      ]
    };
    const now = '2026-09-13T12:00:00Z';
    const gap = detector.detect(state, now);
    expect(gap).not.toBeNull();
    expect(gap?.topic).toBe('api');
  });

  it('Scenario 6: Determinism check (Same state, same now -> same result)', () => {
    const state: RealityState = {
      members: ['alice'],
      ownership: {},
      decisions: [
        { actorId: 'alice', topic: 'auth', choice: mockChoice('2026-09-11T00:00:00Z', 'day') }
      ]
    };
    const now = '2026-09-13T12:00:00Z';
    const gap1 = detector.detect(state, now);
    const gap2 = detector.detect(state, now);
    expect(gap1).toEqual(gap2);
  });
});
