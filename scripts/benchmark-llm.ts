import fs from 'fs';
import path from 'path';
import { executeGeminiBenchmarkCall, executeGroqBenchmarkCall, LLMCallInspection } from '../src/services/llmParser';

// 1. Ensure .env is loaded
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

export interface GroundTruthItem {
  id: string;
  statement: string;
  speaker: string;
  expectedTopic: string | null;
  expectedChoice: string | null;
  isConflictTrigger: boolean;
  conflictTarget?: string;
  isCasual: boolean;
  existingTopics: string[];
}

export const GROUND_TRUTH_DATA: GroundTruthItem[] = [
  {
    id: '1',
    statement: "We're using Postgres for the database",
    speaker: 'Alice',
    expectedTopic: 'Database',
    expectedChoice: 'PostgreSQL',
    isConflictTrigger: false,
    isCasual: false,
    existingTopics: []
  },
  {
    id: '2',
    statement: "Let's use Mongo for the prototype",
    speaker: 'Bob',
    expectedTopic: 'Database',
    expectedChoice: 'Mongo',
    isConflictTrigger: true,
    conflictTarget: "Alice's Postgres",
    isCasual: false,
    existingTopics: ['Database']
  },
  {
    id: '3',
    statement: "Mongo for the database",
    speaker: 'Bob',
    expectedTopic: 'Database',
    expectedChoice: 'Mongo',
    isConflictTrigger: true,
    conflictTarget: "Alice's Postgres",
    isCasual: false,
    existingTopics: ['Database']
  },
  {
    id: '4',
    statement: "We agreed on Postgres for the database",
    speaker: 'Squad (Alice & Bob)',
    expectedTopic: 'Database',
    expectedChoice: 'PostgreSQL',
    isConflictTrigger: false,
    conflictTarget: "Resolves Database gap",
    isCasual: false,
    existingTopics: ['Database']
  },
  {
    id: '5',
    statement: "Let's just do a mock login for the demo",
    speaker: 'Alice',
    expectedTopic: 'Scope',
    expectedChoice: 'Mock login',
    isConflictTrigger: false,
    isCasual: false,
    existingTopics: ['Database']
  },
  {
    id: '6',
    statement: "We need full auth and database for MVP",
    speaker: 'Bob',
    expectedTopic: 'Scope',
    expectedChoice: 'Full auth and database',
    isConflictTrigger: true,
    conflictTarget: "Alice's Mock login scope",
    isCasual: false,
    existingTopics: ['Database', 'Scope']
  },
  {
    id: '7',
    statement: "looks good to me",
    speaker: 'Teammate',
    expectedTopic: null,
    expectedChoice: null,
    isConflictTrigger: false,
    isCasual: true,
    existingTopics: ['Database', 'Scope']
  },
  {
    id: '8',
    statement: "let's do it",
    speaker: 'Teammate',
    expectedTopic: null,
    expectedChoice: null,
    isConflictTrigger: false,
    isCasual: true,
    existingTopics: ['Database', 'Scope']
  },
  {
    id: '9',
    statement: "sounds good, see you at the standup",
    speaker: 'Teammate',
    expectedTopic: null,
    expectedChoice: null,
    isConflictTrigger: false,
    isCasual: true,
    existingTopics: ['Database', 'Scope']
  },
  {
    id: '10',
    statement: "I will build the client in React Native",
    speaker: 'Alice',
    expectedTopic: 'Frontend Framework',
    expectedChoice: 'React Native',
    isConflictTrigger: false,
    isCasual: false,
    existingTopics: ['Database', 'Scope']
  }
];

function isMatch(
  item: GroundTruthItem,
  result: any | null
): boolean {
  if (item.isCasual) {
    return result === null;
  }
  if (!result) return false;

  const resTopic = result.topic.toLowerCase().trim();
  const resChoice = result.choice.toLowerCase().trim();
  const expTopic = (item.expectedTopic || '').toLowerCase().trim();
  const expChoice = (item.expectedChoice || '').toLowerCase().trim();

  // Topic match
  let topicMatches = resTopic === expTopic;
  if (!topicMatches) {
    if (expTopic === 'database' && (resTopic === 'database' || resTopic === 'db')) topicMatches = true;
    if (expTopic === 'frontend framework' && (resTopic === 'frontend' || resTopic === 'frontend framework' || resTopic === 'mobile client')) topicMatches = true;
    if (expTopic === 'scope' && resTopic === 'scope') topicMatches = true;
  }

  // Choice match
  let choiceMatches = resChoice === expChoice;
  if (!choiceMatches) {
    if (expChoice.includes('postgres') && resChoice.includes('postgres')) choiceMatches = true;
    if (expChoice.includes('mongo') && resChoice.includes('mongo')) choiceMatches = true;
    if (expChoice.includes('mock') && resChoice.includes('mock')) choiceMatches = true;
    if (expChoice.includes('full auth') && (resChoice.includes('full') || resChoice.includes('auth'))) choiceMatches = true;
    if (expChoice.includes('react native') && resChoice.includes('react native')) choiceMatches = true;
  }

  return topicMatches && choiceMatches;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PassRecord {
  inspection: LLMCallInspection;
  isCorrect: boolean;
}

interface ItemBenchmarkResult {
  item: GroundTruthItem;
  geminiPasses: PassRecord[];
  groqPasses: PassRecord[];
  geminiP50: number;
  groqP50: number;
  geminiMin: number;
  geminiMax: number;
  groqMin: number;
  groqMax: number;
  geminiStrictJsonAll: boolean;
  groqStrictJsonAll: boolean;
  geminiCorrect: boolean;
  groqCorrect: boolean;
  geminiRepresentative: string;
  groqRepresentative: string;
}

function calcP50(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function runBenchmark() {
  console.log('='.repeat(80));
  console.log('ISOLYNE LLM PROVIDER BENCHMARK: Gemini 3.7 Flash vs. Groq (llama-3.1-8b-instant)');
  console.log('='.repeat(80));
  console.log(`Evaluating ${GROUND_TRUTH_DATA.length} reference statements across 3 sequential passes per provider.`);
  console.log(`Inserting 500ms pacing delay between API calls to prevent rate limits.\n`);

  const results: ItemBenchmarkResult[] = [];

  for (const item of GROUND_TRUTH_DATA) {
    console.log(`[TEST ITEM ${item.id}/${GROUND_TRUTH_DATA.length}] "${item.statement}" (${item.speaker})`);
    
    // 3 passes Gemini
    const geminiPasses: PassRecord[] = [];
    for (let pass = 1; pass <= 3; pass++) {
      const inspection = await executeGeminiBenchmarkCall(item.statement, item.existingTopics, new Date().toISOString());
      const correct = isMatch(item, inspection.result);
      geminiPasses.push({ inspection, isCorrect: correct });
      const c = inspection.result ? (typeof inspection.result.choice === 'object' ? inspection.result.choice.raw_text : inspection.result.choice) : '';
      process.stdout.write(`  Gemini Pass ${pass}: ${inspection.latencyMs}ms | ${inspection.result ? `${inspection.result.topic} -> ${c}` : 'null (rejection)'} | strictJSON: ${inspection.isStrictJson} | correct: ${correct}\n`);
      await sleep(500);
    }

    // 3 passes Groq
    const groqPasses: PassRecord[] = [];
    for (let pass = 1; pass <= 3; pass++) {
      const inspection = await executeGroqBenchmarkCall(item.statement, item.existingTopics, new Date().toISOString());
      const correct = isMatch(item, inspection.result);
      groqPasses.push({ inspection, isCorrect: correct });
      const c = inspection.result ? (typeof inspection.result.choice === 'object' ? inspection.result.choice.raw_text : inspection.result.choice) : '';
      process.stdout.write(`  Groq Pass ${pass}:   ${inspection.latencyMs}ms | ${inspection.result ? `${inspection.result.topic} -> ${c}` : 'null (rejection)'} | strictJSON: ${inspection.isStrictJson} | correct: ${correct}\n`);
      await sleep(500);
    }

    const geminiLats = geminiPasses.map(p => p.inspection.latencyMs);
    const groqLats = groqPasses.map(p => p.inspection.latencyMs);

    const geminiP50 = calcP50(geminiLats);
    const groqP50 = calcP50(groqLats);
    const geminiMin = Math.min(...geminiLats);
    const geminiMax = Math.max(...geminiLats);
    const groqMin = Math.min(...groqLats);
    const groqMax = Math.max(...groqLats);

    const geminiStrictJsonAll = geminiPasses.every(p => p.inspection.isStrictJson);
    const groqStrictJsonAll = groqPasses.every(p => p.inspection.isStrictJson);

    const geminiCorrect = geminiPasses.every(p => p.isCorrect);
    const groqCorrect = groqPasses.every(p => p.isCorrect);

    const formatResult = (p: PassRecord) => {
      if (!p.inspection.result) return 'null';
      return `{${p.inspection.result.topic}: "${p.inspection.result.choice}"}`;
    };

    results.push({
      item,
      geminiPasses,
      groqPasses,
      geminiP50,
      groqP50,
      geminiMin,
      geminiMax,
      groqMin,
      groqMax,
      geminiStrictJsonAll,
      groqStrictJsonAll,
      geminiCorrect,
      groqCorrect,
      geminiRepresentative: formatResult(geminiPasses[0]),
      groqRepresentative: formatResult(groqPasses[0])
    });

    console.log();
  }

  // Generate Reports
  console.log('\n' + '='.repeat(80));
  console.log('BENCHMARK SUMMARY & SIDE-BY-SIDE REPORT');
  console.log('='.repeat(80) + '\n');

  console.log('### Ground Truth Reference Table\n');
  console.log('| # | Statement | Speaker | Expected Topic | Expected Choice | Conflict Trigger? | Casual Chat? |');
  console.log('|---|---|---|---|---|---|---|');
  for (const item of GROUND_TRUTH_DATA) {
    console.log(`| ${item.id} | "${item.statement}" | ${item.speaker} | ${item.expectedTopic || '*null*'} | ${item.expectedChoice || '*null*'} | ${item.isConflictTrigger ? `Yes (${item.conflictTarget})` : 'No'} | ${item.isCasual ? 'Yes' : 'No'} |`);
  }

  console.log('\n### Side-by-Side Performance Comparison\n');
  console.log('| Input Line | Expected {topic, choice} | Gemini Extracted | Gemini p50 | Gemini Correct? | Groq Extracted | Groq p50 | Groq Correct? |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    const expected = r.item.isCasual ? 'null' : `{${r.item.expectedTopic}: "${r.item.expectedChoice}"}`;
    const geminiOk = r.geminiCorrect ? '✅ Yes' : '❌ No';
    const groqOk = r.groqCorrect ? '✅ Yes' : '❌ No';
    console.log(`| "${r.item.statement}" | \`${expected}\` | \`${r.geminiRepresentative}\` | ${r.geminiP50}ms | ${geminiOk} | \`${r.groqRepresentative}\` | ${r.groqP50}ms | ${groqOk} |`);
  }

  // Aggregate Stats
  const totalItems = results.length;
  const geminiAccuracy = Math.round((results.filter(r => r.geminiCorrect).length / totalItems) * 100);
  const groqAccuracy = Math.round((results.filter(r => r.groqCorrect).length / totalItems) * 100);

  const allGeminiPasses = results.flatMap(r => r.geminiPasses);
  const allGroqPasses = results.flatMap(r => r.groqPasses);

  const geminiSchemaErrors = allGeminiPasses.filter(p => !p.inspection.isStrictJson || p.inspection.error).length;
  const groqSchemaErrors = allGroqPasses.filter(p => !p.inspection.isStrictJson || p.inspection.error).length;

  const allGeminiLats = allGeminiPasses.map(p => p.inspection.latencyMs);
  const allGroqLats = allGroqPasses.map(p => p.inspection.latencyMs);

  const geminiOverallP50 = calcP50(allGeminiLats);
  const geminiOverallMin = Math.min(...allGeminiLats);
  const geminiOverallMax = Math.max(...allGeminiLats);

  const groqOverallP50 = calcP50(allGroqLats);
  const groqOverallMin = Math.min(...allGroqLats);
  const groqOverallMax = Math.max(...allGroqLats);

  console.log('\n### Aggregate Statistics\n');
  console.log('| Metric | Gemini 3.7 Flash | Groq (llama-3.1-8b-instant) | Delta / Ratio |');
  console.log('|---|---|---|---|');
  console.log(`| **Accuracy (%)** | ${geminiAccuracy}% (${results.filter(r => r.geminiCorrect).length}/${totalItems}) | ${groqAccuracy}% (${results.filter(r => r.groqCorrect).length}/${totalItems}) | ${groqAccuracy - geminiAccuracy >= 0 ? `+${groqAccuracy - geminiAccuracy}%` : `${groqAccuracy - geminiAccuracy}%`} |`);
  console.log(`| **Schema Error Count (across ${allGeminiPasses.length} calls)** | ${geminiSchemaErrors} | ${groqSchemaErrors} | ${groqSchemaErrors === geminiSchemaErrors ? 'Parity (0 errors)' : `${groqSchemaErrors - geminiSchemaErrors}`} |`);
  console.log(`| **Latency p50** | ${geminiOverallP50}ms | ${groqOverallP50}ms | ${geminiOverallP50 > 0 ? `${(geminiOverallP50 / groqOverallP50).toFixed(1)}x faster` : 'N/A'} |`);
  console.log(`| **Latency Min / Max** | ${geminiOverallMin}ms / ${geminiOverallMax}ms | ${groqOverallMin}ms / ${groqOverallMax}ms | Groq spread: ${groqOverallMax - groqOverallMin}ms vs Gemini: ${geminiOverallMax - geminiOverallMin}ms |`);
}

runBenchmark().catch(err => {
  console.error('Fatal Benchmark Error:', err);
  process.exit(1);
});
