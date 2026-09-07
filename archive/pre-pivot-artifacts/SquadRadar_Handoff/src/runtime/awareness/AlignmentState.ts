export type AlignmentStatus = 'pending' | 'aligned' | 'divergent' | 'expired';

export interface AlignmentState {
  proposalId: string;
  status: AlignmentStatus;
  agrees: number;
  challenges: number;
  missing: number;
  totalMembers: number;
}
