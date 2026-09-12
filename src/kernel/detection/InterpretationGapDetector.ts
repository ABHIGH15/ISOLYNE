import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export class InterpretationGapDetector implements GapDetector {
  detect(state: RealityState): AwarenessGap | null {
    const isScopeOrDefinition = (topic: string) => {
      const clean = topic.trim().toLowerCase();
      // Match explicit words with word boundaries to prevent false positives (e.g. "special" or "inspect")
      return /^(scope|mvp|definition|requirements|spec|architecture_style)$/i.test(clean) ||
             /\b(scope|mvp|definition|requirements)\b/i.test(clean);
    };

    const scopeDecisions = new Map<string, Array<{ actorId: string; choice: string; verbatim?: string }>>();

    for (const dec of state.decisions) {
      if (typeof dec.choice !== 'string') continue;
      
      if (isScopeOrDefinition(dec.topic)) {
        if (!scopeDecisions.has(dec.topic)) {
          scopeDecisions.set(dec.topic, []);
        }
        scopeDecisions.get(dec.topic)!.push({ actorId: dec.actorId, choice: dec.choice, verbatim: dec.verbatim });
      }
    }

    for (const [topic, decisions] of scopeDecisions.entries()) {
      const uniqueChoices = new Set(decisions.map(d => d.choice));
      if (uniqueChoices.size > 1) {
        // DETERMINISTIC ID: safe deterministic ID for scope definition divergence
        const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return {
          id: `gap_interpretation_${safeTopic}`,
          type: 'interpretation_gap',
          hiddenReality: `Your team has conflicting interpretations of ${topic}. Defining a unified scope now will prevent building the wrong product.`,
          evidence: decisions,
          topic
        };
      }
    }

    return null;
  }
}
