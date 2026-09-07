export type ExperimentSession = {
  sessionId: string;
  participantId?: string;
  startedAt: number;
  momentShownAt?: number;
  firstReadCompleteAt?: number;
  actionClickedAt?: number;
  resolvedAt?: number;
  askedForExplanation: boolean;
  completed: boolean;
};

export class ExperimentTracker {
  private session: ExperimentSession;

  constructor(sessionId: string, participantId?: string) {
    this.session = {
      sessionId,
      participantId,
      startedAt: Date.now(),
      askedForExplanation: false,
      completed: false,
    };
  }

  public markShown(nowMs: number = Date.now()) {
    if (!this.session.momentShownAt) this.session.momentShownAt = nowMs;
  }

  public markAction(nowMs: number = Date.now()) {
    if (!this.session.actionClickedAt) this.session.actionClickedAt = nowMs;
  }

  public markResolved(nowMs: number = Date.now()) {
    if (!this.session.resolvedAt) {
      this.session.resolvedAt = nowMs;
      this.session.completed = true;
    }
  }

  public flagExplanationAsked() {
    this.session.askedForExplanation = true;
  }

  public getSession(): ExperimentSession {
    return this.session;
  }
}
