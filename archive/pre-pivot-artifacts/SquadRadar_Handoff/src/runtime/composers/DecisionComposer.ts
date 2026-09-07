import { Insight, GhostDecision } from '../types';

/**
 * Translates raw Insights from evaluators into human-readable Ghost Decisions.
 */
export class DecisionComposer {
  public static compose(insights: Insight[]): GhostDecision[] {
    return insights.map(insight => {
      // In a real implementation, this would use a content generation layer 
      // or AI pipeline to map 'type' and 'facts' to human language.
      // For now, we bridge the legacy pre-rendered story if present.
      
      if (insight.type === 'formation_risk' && insight.legacyStory) {
        // Render the template with variables for human-readable output
        const renderTemplate = (msg: { template: string; variables: Record<string, string | number | boolean> }): string => {
          let text = msg.template;
          for (const [key, val] of Object.entries(msg.variables)) {
            text = text.replace(`{${key}}`, String(val));
          }
          return text;
        };

        return {
          id: `ghost-${insight.id}`,
          insightId: insight.id,
          category: 'leadership',
          title: renderTemplate(insight.legacyStory.headline),
          foresight: `A possible solution:\n${insight.facts.viewerRole === 'mobile' ? 'Abhi' : 'You'} takes ownership.`,
          urgency: insight.severity,
          options: [
            {
              id: 'commit_join',
              label: 'Review decision',
              actionType: 'proposal',
              actionValue: 'lead'
            }
          ]
        };
      }

      // Default fallback
      return {
        id: `ghost-${insight.id}`,
        insightId: insight.id,
        category: 'stuck',
        title: 'Unrecognized Risk',
        foresight: 'An unknown risk was detected in the team composition.',
        urgency: insight.severity,
        options: []
      };
    });
  }
}
