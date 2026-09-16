import { describe, it, expect } from 'vitest';
import { TimelineGapDetector } from '../detection/TimelineGapDetector';
import { RealityState } from '../domain/RealityState';

describe('TimelineGapDetector', () => {
  const detector = new TimelineGapDetector();

  it('detects a genuine conflict with different days', () => {
    const state: RealityState = {
      members: ['Alice', 'Bob'],
      ownership: {},
      decisions: [
        {
          actorId: 'Alice',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'Friday',
            resolved_datetime: '2026-09-25T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        },
        {
          actorId: 'Bob',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'Saturday',
            resolved_datetime: '2026-09-26T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        }
      ]
    };

    const gap = detector.detect(state);
    expect(gap).not.toBeNull();
    expect(gap?.type).toBe('timeline_gap');
  });

  it('ignores same absolute time with different phrasing', () => {
    const state: RealityState = {
      members: ['Alice', 'Bob'],
      ownership: {},
      decisions: [
        {
          actorId: 'Alice',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'Friday',
            resolved_datetime: '2026-09-25T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        },
        {
          actorId: 'Bob',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'the 25th',
            resolved_datetime: '2026-09-25T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        }
      ]
    };

    const gap = detector.detect(state);
    expect(gap).toBeNull(); // No gap
  });

  it('handles mixed granularity without false positive', () => {
    const state: RealityState = {
      members: ['Alice', 'Bob'],
      ownership: {},
      decisions: [
        {
          actorId: 'Alice',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'Friday',
            resolved_datetime: '2026-09-25T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        },
        {
          actorId: 'Bob',
          topic: 'demo_deadline',
          choice: {
            raw_text: '3pm Friday',
            resolved_datetime: '2026-09-25T15:00:00Z',
            granularity: 'hour',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        }
      ]
    };

    const gap = detector.detect(state);
    expect(gap).toBeNull(); // No gap, as 'day' is the coarser granularity
  });

  it('detects unresolvable reference as timeline_unresolved', () => {
    const state: RealityState = {
      members: ['Alice', 'Bob'],
      ownership: {},
      decisions: [
        {
          actorId: 'Alice',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'Friday',
            resolved_datetime: '2026-09-25T00:00:00Z',
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'high'
          }
        },
        {
          actorId: 'Bob',
          topic: 'demo_deadline',
          choice: {
            raw_text: 'next sprint',
            resolved_datetime: null,
            granularity: 'day',
            anchor_timestamp: '2026-09-20T00:00:00Z',
            confidence: 'low'
          }
        }
      ]
    };

    const gap = detector.detect(state);
    expect(gap).not.toBeNull();
    expect(gap?.type).toBe('timeline_unresolved');
  });
});
