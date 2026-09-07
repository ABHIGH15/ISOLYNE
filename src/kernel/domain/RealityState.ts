export interface RealityState {
  members: string[];
  ownership: { ownerId?: string };
  decisions: { actorId: string; topic: string; choice: string; verbatim?: string }[];
}
