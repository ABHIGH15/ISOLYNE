export type SignalType = 
  | "member_joined" 
  | "decision_stated" 
  | "alignment_agree" 
  | "alignment_challenge" 
  | "integration_contract_stated"
  | "divergence_detected";

export interface Signal {
  id: string;
  squadId: string;
  actorId: string;
  type: SignalType;
  timestamp: string;
  payload?: any;
}
