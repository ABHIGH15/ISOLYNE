export type DecisionInteraction = {
  momentId: string;
  shownAt: number;
  viewedAt?: number;
  actionClickedAt?: number;
  timeToResolution?: number;
  abandoned?: boolean;
};

export class TelemetryService {
  private interactions: Map<string, DecisionInteraction> = new Map();
  private lastTrackedMomentId: string | null = null;

  public trackShown(momentId: string, nowMs: number = Date.now()) {
    if (!this.interactions.has(momentId)) {
      this.interactions.set(momentId, {
        momentId,
        shownAt: nowMs
      });
      this.lastTrackedMomentId = momentId;
    }
  }

  public trackAction(momentId: string, nowMs: number = Date.now()) {
    const interaction = this.interactions.get(momentId);
    if (interaction && !interaction.actionClickedAt) {
      interaction.actionClickedAt = nowMs;
      interaction.timeToResolution = nowMs - interaction.shownAt;
      this.interactions.set(momentId, interaction);
    }
  }

  public getMetrics(): DecisionInteraction[] {
    return Array.from(this.interactions.values());
  }

  public markAbandonedIfActive(nowMs: number = Date.now()) {
    if (this.lastTrackedMomentId) {
      const interaction = this.interactions.get(this.lastTrackedMomentId);
      if (interaction && !interaction.actionClickedAt) {
        interaction.abandoned = true;
        interaction.timeToResolution = nowMs - interaction.shownAt;
      }
    }
  }
}
