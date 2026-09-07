export interface DecisionProposal {
  id: string;
  gapId: string;
  mode: "assignment";
  description: string;
  targetState: string;
}
