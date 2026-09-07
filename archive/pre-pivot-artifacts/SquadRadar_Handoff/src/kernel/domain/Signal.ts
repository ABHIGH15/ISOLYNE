export type SignalType = "member_joined" | "alignment_agree";

export interface Signal {
  id: string;
  squadId: string;
  actorId: string;
  type: SignalType;
  timestamp: string;
  payload?: any;
}
