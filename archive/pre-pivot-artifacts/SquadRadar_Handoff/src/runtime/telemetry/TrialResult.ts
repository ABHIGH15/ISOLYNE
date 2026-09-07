export type TrialResult = {
  sessionId: string;
  participantType?: string;
  sawDecisionAt: number;
  understoodBeforeExplanation: boolean;
  askedQuestion: boolean;
  clickedAction: boolean;
  timeToClick: number | null;  // null if never clicked
  verbalReaction: string;
  researcherNotes: string;
};

export class TrialRecorder {
  private results: TrialResult[] = [];
  private current: Partial<TrialResult> | null = null;

  public startTrial(sessionId: string, participantType?: string): void {
    this.current = {
      sessionId,
      participantType,
      sawDecisionAt: Date.now(),
      understoodBeforeExplanation: false,
      askedQuestion: false,
      clickedAction: false,
      timeToClick: null,
      verbalReaction: '',
      researcherNotes: '',
    };
  }

  public markUnderstood(): void {
    if (this.current) this.current.understoodBeforeExplanation = true;
  }

  public markAskedQuestion(): void {
    if (this.current) this.current.askedQuestion = true;
  }

  public markClicked(): void {
    if (this.current && !this.current.clickedAction) {
      this.current.clickedAction = true;
      this.current.timeToClick = Date.now() - (this.current.sawDecisionAt ?? Date.now());
    }
  }

  public setVerbalReaction(text: string): void {
    if (this.current) this.current.verbalReaction = text;
  }

  public setResearcherNotes(text: string): void {
    if (this.current) this.current.researcherNotes = text;
  }

  public finishTrial(): TrialResult | null {
    if (!this.current) return null;
    const result = this.current as TrialResult;
    this.results.push(result);
    this.current = null;
    return result;
  }

  public getAllResults(): TrialResult[] {
    return [...this.results];
  }

  public getCurrentTrial(): Partial<TrialResult> | null {
    return this.current;
  }
}
