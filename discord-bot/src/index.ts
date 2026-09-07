import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import { interpretStatement } from '../../src/services/llmParser';
import { ConsensusGapDetector } from '../../src/kernel/detection/ConsensusGapDetector';
import type { RealityState } from '../../src/kernel/domain/RealityState';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('Error: DISCORD_BOT_TOKEN is not set in discord-bot/.env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Reusable consensus gap detector from the pure kernel
const consensusDetector = new ConsensusGapDetector();

interface InMemDecision {
  actorId: string;
  topic: string;
  choice: string;
  verbatim: string;
  timestamp: number;
}

// In-memory only channel state (deliberately not persisted, demo companion)
const channelDecisions = new Map<string, InMemDecision[]>();
const alertedConflicts = new Set<string>();

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

client.once(Events.ClientReady, (readyClient) => {
  console.log('============================================================');
  console.log(' ISOLYNE RADAR BOT · Collaboration Intelligence Companion');
  console.log(' Standalone gateway demo (decoupled from local app storage)');
  console.log('============================================================');
  console.log(`[ISOLYNE] Connected as: ${readyClient.user.tag}`);
  console.log('[ISOLYNE] Engine: ConsensusGapDetector (Pure Domain Kernel)');
  console.log('[ISOLYNE] Monitoring: Discord Gateway (GuildMessages, MessageContent)');
  console.log('[ISOLYNE] Status: Silence is a feature, until you drift.');
  console.log('============================================================');
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots (including ourselves)
  if (message.author.bot) return;

  const rawText = message.content.trim();
  if (!rawText) return;

  // Diagnostic echo check from Section 1
  if (rawText.toLowerCase() === 'ping') {
    try {
      await message.reply('pong');
      const channelName = 'name' in message.channel ? message.channel.name : 'thread';
      console.log(`[ECHO] Handled "ping" from ${message.author.tag} in #${channelName} -> Replied "pong"`);
    } catch (err) {
      console.error('[ECHO] Failed to send reply:', err);
    }
    return;
  }

  // Support both real Discord authors and optional name prefix for solo testing ("Alice: Postgres")
  let actorId = message.member?.displayName || message.author.displayName || message.author.username;
  let textToParse = rawText;

  const prefixMatch = rawText.match(/^\[?([A-Za-z0-9_.\s-]+)\]?:\s*(.+)$/i);
  if (prefixMatch) {
    actorId = prefixMatch[1].trim();
    textToParse = prefixMatch[2].trim();
  }

  const channelId = message.channelId;
  if (!channelDecisions.has(channelId)) {
    channelDecisions.set(channelId, []);
  }
  const decisions = channelDecisions.get(channelId)!;

  // Query existing topics for bounded parsing
  const existingTopics = Array.from(new Set(decisions.map((d) => d.topic)));

  // Use the real proven parser (falls back to keyword parser when no Gemini key is present)
  const parsed = await interpretStatement(textToParse, existingTopics);
  if (!parsed) {
    // Casual conversation or unparseable statement; silently ignore
    return;
  }

  console.log(`[STATEMENT PARSED] ${actorId}: topic="${parsed.topic}", choice="${parsed.choice}" (source: "${textToParse}")`);

  // Update or append this actor's latest decision for this topic
  const existingIndex = decisions.findIndex(
    (d) => d.actorId.toLowerCase() === actorId.toLowerCase() && d.topic.toLowerCase() === parsed.topic.toLowerCase()
  );

  const newDecision: InMemDecision = {
    actorId,
    topic: parsed.topic,
    choice: parsed.choice,
    verbatim: textToParse,
    timestamp: Date.now(),
  };

  if (existingIndex >= 0) {
    decisions[existingIndex] = newDecision;
  } else {
    decisions.push(newDecision);
  }

  // Construct RealityState to pass into the pure ConsensusGapDetector
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

  // Run the real kernel gap detection
  const gap = consensusDetector.detect(realityState);

  if (gap && gap.type === 'consensus_gap') {
    // Look for contradictory choices between two distinct actors on this topic
    const topicDecisions = decisions.filter(
      (d) => d.topic.toLowerCase() === parsed.topic.toLowerCase()
    );

    const prevDecision = topicDecisions.find(
      (d) =>
        d.actorId.toLowerCase() !== actorId.toLowerCase() &&
        d.choice.toLowerCase() !== parsed.choice.toLowerCase()
    );

    if (prevDecision) {
      // Deterministic conflict signature to avoid spamming the exact same alert
      const conflictKey = `${channelId}:${parsed.topic.toLowerCase()}:${[prevDecision.actorId, actorId].sort().join('-')}:${[prevDecision.choice, parsed.choice].sort().join('-')}`;
      if (!alertedConflicts.has(conflictKey)) {
        alertedConflicts.add(conflictKey);

        const choiceA = formatChoiceDisplay(prevDecision.choice, parsed.topic);
        const choiceB = formatChoiceDisplay(parsed.choice, parsed.topic);
        const reply = `Isolyne detected a gap: @${prevDecision.actorId} said ${choiceA}, @${actorId} said ${choiceB} — same topic (${parsed.topic.toLowerCase()}), different choices.\n> *Your team is running with different assumptions about ${parsed.topic.toLowerCase()}. Aligning now will save hours of rework.*`;

        try {
          await message.reply(reply);
          const channelName = 'name' in message.channel ? message.channel.name : 'thread';
          console.log(`[GAP DETECTED & REPLIED] #${channelName} ->\n${reply}`);
        } catch (err) {
          console.error('[GAP DETECTED] Failed to send reply to Discord:', err);
        }
      } else {
        const channelName = 'name' in message.channel ? message.channel.name : 'thread';
        console.log(`[GAP DEDUP SUPPRESSED] #${channelName} -> Duplicate conflict signature already alerted: ${conflictKey}`);
      }
    }
  }
});

const handleShutdown = (signal: string) => {
  console.log(`\n[ISOLYNE] Shutting down (${signal}). Disconnecting Discord Gateway...`);
  client.destroy();
  console.log('[ISOLYNE] Gateway disconnected cleanly. Process exiting.');
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

client.login(token).catch((err) => {
  console.error('Failed to log in to Discord:', err);
  process.exit(1);
});
