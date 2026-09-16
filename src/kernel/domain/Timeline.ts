export type Granularity = 'day' | 'half_day' | 'hour' | 'minute';

export interface TimelineChoice {
  raw_text: string;
  resolved_datetime: string | null;
  granularity: Granularity;
  anchor_timestamp: string;
  confidence: 'high' | 'medium' | 'low';
}

export function formatChoice(choice: string | TimelineChoice): string {
  return typeof choice === 'object' && choice !== null && 'raw_text' in choice ? choice.raw_text : String(choice);
}




export function getGranularityLevel(g: Granularity): number {
  switch (g) {
    case 'day': return 1;
    case 'half_day': return 2;
    case 'hour': return 3;
    case 'minute': return 4;
  }
}

export function coarser(a: Granularity, b: Granularity): Granularity {
  return getGranularityLevel(a) < getGranularityLevel(b) ? a : b;
}

export function truncate(isoString: string, granularity: Granularity): number {
  const d = new Date(isoString);
  switch (granularity) {
    case 'day':
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    case 'half_day':
      d.setUTCHours(d.getUTCHours() < 12 ? 0 : 12, 0, 0, 0);
      return d.getTime();
    case 'hour':
      d.setUTCMinutes(0, 0, 0);
      return d.getTime();
    case 'minute':
      d.setUTCSeconds(0, 0);
      return d.getTime();
  }
}

export const TOLERANCE_MS: Record<Granularity, number> = {
  day: 0,
  half_day: 0,
  hour: 60 * 60 * 1000,
  minute: 15 * 60 * 1000
};


export function getTimelineOptions(evidence: { actorId: string; choice: string | TimelineChoice }[]): string[] {
  const uniqueChoices: TimelineChoice[] = [];
  const stringChoices = new Set<string>();

  for (const e of evidence) {
    const choice = e.choice;
    if (typeof choice === 'object' && choice !== null && choice.resolved_datetime) {
      // Check if it's equivalent to an existing choice
      let isDuplicate = false;
      for (let i = 0; i < uniqueChoices.length; i++) {
        const u = uniqueChoices[i];
        if (!u.resolved_datetime) continue;
        
        const gran = coarser(choice.granularity, u.granularity);
        const bucketA = truncate(choice.resolved_datetime, gran);
        const bucketB = truncate(u.resolved_datetime, gran);
        const tolerance = TOLERANCE_MS[gran];

        if (Math.abs(bucketA - bucketB) <= tolerance) {
          isDuplicate = true;
          // Prefer the more specific phrasing for the UI
          if (getGranularityLevel(choice.granularity) > getGranularityLevel(u.granularity)) {
            uniqueChoices[i] = choice;
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueChoices.push(choice);
      }
    } else if (typeof choice === 'object' && choice !== null && choice.raw_text) {
      stringChoices.add(choice.raw_text);
    } else {
      stringChoices.add(String(choice));
    }
  }

  const results = uniqueChoices.map(c => c.raw_text);
  for (const s of stringChoices) {
    if (!results.includes(s)) results.push(s);
  }
  return results;
}
