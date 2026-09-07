import { AwarenessGap } from '../../../domain/AwarenessGap';

export interface GapRepository {
  save(gap: AwarenessGap): Promise<void>;
  getActive(squadId: string): Promise<AwarenessGap[]>;
  resolve(gapId: string): Promise<void>;
}
