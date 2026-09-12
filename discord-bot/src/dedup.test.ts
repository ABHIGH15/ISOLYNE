import assert from 'node:assert';
import { interpretStatement } from '../../src/services/llmParser';
function getChoiceString(choice: string | { raw_text: string } | any): string {
  if (typeof choice === 'string') return choice;
  if (choice && typeof choice === 'object' && 'raw_text' in choice) return choice.raw_text;
  return String(choice);
}

import { ConsensusGapDetector } from '../../src/kernel/detection/ConsensusGapDetector';
import type { RealityState } from '../../src/kernel/domain/RealityState';

function formatChoiceDisplay(choice: string, topic: string): string {
  const lower = choice.toLowerCase();
  if (topic.toLowerCase() === 'database') {
    if (lower.includes('postgres')) return 'Postgres';
    if (lower.includes('mongo')) return 'Mongo';
    if (lower.includes('supabase')) return 'Supabase';
    if (lower.includes('firebase')) return 'Firebase';
  }
  return choice;
}

interface InMemDecision {
  actorId: string;
  topic: string;
  choice: any;
  verbatim: string;
  timestamp: number;
}

async function testDeduplicationEngine() {
  console.log('--- RUNNING DEDUPLICATION ENGINE TEST ---');

  const channelId = 'channel-test-101';
  const channelDecisions = new Map<string, InMemDecision[]>();
  const alertedConflicts = new Set<string>();
  const dispatchedReplies: string[] = [];

  const consensusDetector = new ConsensusGapDetector();

  async function processMessage(rawText: string) {
    let actorId = 'defaultUser';
    let textToParse = rawText;

    const prefixMatch = rawText.match(/^\[?([A-Za-z0-9_.\s-]+)\]?:\s*(.+)$/i);
    if (prefixMatch) {
      actorId = prefixMatch[1].trim();
      textToParse = prefixMatch[2].trim();
    }

    if (!channelDecisions.has(channelId)) {
      channelDecisions.set(channelId, []);
    }
    const decisions = channelDecisions.get(channelId)!;
    const existingTopics = Array.from(new Set(decisions.map((d) => d.topic)));

    const parsed = await interpretStatement(textToParse, existingTopics);
    if (!parsed) return;

    const existingIndex = decisions.findIndex(
      (d) => d.actorId.toLowerCase() === actorId.toLowerCase() && d.topic.toLowerCase() === parsed.topic.toLowerCase()
    );

    const newDecision: InMemDecision = {
      actorId,
      topic: parsed.topic,
      choice: getChoiceString(parsed.choice),
      verbatim: textToParse,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      decisions[existingIndex] = newDecision;
    } else {
      decisions.push(newDecision);
    }

    const realityState: RealityState = {
      members: Array.from(new Set(decisions.map((d) => d.actorId))),
      ownership: {},
      decisions: decisions.map((d) => ({
        actorId: d.actorId,
        topic: d.topic,
        choice: d.choice,
        verbatim: d.verbatim,
      })),
    };

    const gap = consensusDetector.detect(realityState);
    if (gap && gap.type === 'consensus_gap') {
      const topicDecisions = decisions.filter(
        (d) => d.topic.toLowerCase() === parsed.topic.toLowerCase()
      );
      const prevDecision = topicDecisions.find(
        (d) =>
          d.actorId.toLowerCase() !== actorId.toLowerCase() &&
          getChoiceString(d.choice).toLowerCase() !== getChoiceString(parsed.choice).toLowerCase()
      );

      if (prevDecision) {
        const conflictKey = `${channelId}:${parsed.topic.toLowerCase()}:${[prevDecision.actorId, actorId].sort().join('-')}:${[getChoiceString(prevDecision.choice), getChoiceString(parsed.choice)].sort().join('-')}`;
        if (!alertedConflicts.has(conflictKey)) {
          alertedConflicts.add(conflictKey);
          const choiceA = formatChoiceDisplay(getChoiceString(prevDecision.choice), parsed.topic);
          const choiceB = formatChoiceDisplay(getChoiceString(parsed.choice), parsed.topic);
          const reply = `Isolyne detected a gap: @${prevDecision.actorId} said ${choiceA}, @${actorId} said ${choiceB} — same topic (${parsed.topic.toLowerCase()}), different choices.\n> *Your team is running with different assumptions about ${parsed.topic.toLowerCase()}. Aligning now will save hours of rework.*`;
          dispatchedReplies.push(reply);
          console.log(`[ACTION: DISPATCHED] Key: ${conflictKey} -> "${reply}"`);
        } else {
          console.log(`[ACTION: SUPPRESSED] Duplicate conflict key already alerted: ${conflictKey}`);
        }
      }
    }
  }

  // Step 1: Alice states Postgres
  await processMessage('Alice: Postgres for the database');
  assert.strictEqual(dispatchedReplies.length, 0, 'No gap alert expected with only one participant');

  // Step 2: Bob states Mongo -> Conflict detected and dispatched
  await processMessage('Bob: Mongo for the database');
  assert.strictEqual(dispatchedReplies.length, 1, 'Gap alert must be dispatched on first conflict');
  assert.strictEqual(
    dispatchedReplies[0],
    'Isolyne detected a gap: @Alice said Postgres, @Bob said Mongo — same topic (database), different choices.\n> *Your team is running with different assumptions about database. Aligning now will save hours of rework.*'
  );

  // Step 3: Bob re-sends the exact same statement -> Must be SUPPRESSED by dedup signature
  await processMessage('Bob: Mongo for the database');
  assert.strictEqual(dispatchedReplies.length, 1, 'Duplicate statement must NOT dispatch a second alert');

  // Step 4: Alice re-sends the exact same statement -> Must be SUPPRESSED by dedup signature
  await processMessage('Alice: Postgres for the database');
  assert.strictEqual(dispatchedReplies.length, 1, 'Duplicate statement from Alice must NOT dispatch a second alert');

  // Step 5: Bob changes mind to Supabase -> New choice -> New conflict key -> Must DISPATCH
  await processMessage('Bob: Supabase for the database');
  assert.strictEqual(dispatchedReplies.length, 2, 'New choice on same topic must dispatch a new alert');
  assert.strictEqual(
    dispatchedReplies[1],
    'Isolyne detected a gap: @Alice said Postgres, @Bob said Supabase — same topic (database), different choices.\n> *Your team is running with different assumptions about database. Aligning now will save hours of rework.*'
  );

  console.log('--- ALL DEDUPLICATION ASSERTIONS PASSED (5/5) ---');
}

testDeduplicationEngine().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
