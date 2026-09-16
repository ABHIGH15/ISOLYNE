import { describe, it, expect } from 'vitest';
import { getTimelineOptions, TimelineChoice } from '../domain/Timeline';

describe('Timeline Domain Rules', () => {
  it('deduplicates options by granularity tolerance, keeping the most specific phrasing', () => {
    const evidence = [
      {
        actorId: 'Alice',
        choice: {
          raw_text: 'Friday',
          resolved_datetime: '2026-09-25T00:00:00Z',
          granularity: 'day',
          anchor_timestamp: '2026-09-10T00:00:00Z',
          confidence: 'high'
        } as TimelineChoice
      },
      {
        actorId: 'Bob',
        choice: {
          raw_text: '3pm Friday',
          resolved_datetime: '2026-09-25T15:00:00Z', // Same day, different time
          granularity: 'hour',                       // More specific!
          anchor_timestamp: '2026-09-10T00:00:00Z',
          confidence: 'high'
        } as TimelineChoice
      },
      {
        actorId: 'Carol',
        choice: {
          raw_text: 'Saturday',
          resolved_datetime: '2026-09-26T00:00:00Z', // Different day, outside tolerance
          granularity: 'day',
          anchor_timestamp: '2026-09-10T00:00:00Z',
          confidence: 'high'
        } as TimelineChoice
      }
    ];

    const options = getTimelineOptions(evidence);

    // Should collapse 'Friday' and '3pm Friday' into one bucket, 
    // keeping '3pm Friday' as the more specific representative text,
    // and keep 'Saturday' as a separate bucket.
    expect(options).toHaveLength(2);
    expect(options).toContain('3pm Friday');
    expect(options).toContain('Saturday');
    expect(options).not.toContain('Friday'); // Less specific phrasing is dropped
  });
});
