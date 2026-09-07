import { ExperimentSession } from '../telemetry/ExperimentSession';

export const Metrics = {
  evaluateRecognition(session: ExperimentSession): boolean {
    if (!session.momentShownAt || !session.actionClickedAt) return false;
    const timeToUnderstand = session.actionClickedAt - session.momentShownAt;
    // Target: < 10 seconds
    return timeToUnderstand < 10000;
  },

  evaluateCommitment(session: ExperimentSession): boolean {
    // Target: buttonClicked without asking questions
    return !!session.actionClickedAt && !session.askedForExplanation;
  },

  evaluateResolution(session: ExperimentSession): boolean {
    // Researcher confirms user accepts resolved state
    return session.completed && !session.askedForExplanation;
  },

  isProtocolFailure(session: ExperimentSession): boolean {
    // If they ask "What does this mean?", the system failed.
    return session.askedForExplanation;
  }
};
