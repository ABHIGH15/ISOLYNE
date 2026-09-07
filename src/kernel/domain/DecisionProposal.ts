export interface DecisionProposal {
  id: string;
  gapId: string;
  mode: "assignment" | "alignment" | "definition";
  description: string;
  targetState: string;
  options?: any[];
}
