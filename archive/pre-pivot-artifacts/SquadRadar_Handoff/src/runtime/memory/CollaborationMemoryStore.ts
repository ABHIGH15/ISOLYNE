import { AwarenessGapType } from '../awareness/gaps/AwarenessGapType';

export type CollaborationMemory = {
  id: string;
  eventId: string;
  gapType: AwarenessGapType;
  context: string;
  realityDiscovered: string;
  resolution: string;
  lesson: string;
  timestamp: string;
};

export interface CollaborationMemoryStore {
  save(memory: CollaborationMemory): Promise<void>;
  retrieveReleventMemories(currentContext: any): Promise<CollaborationMemory[]>;
}

export class InMemoryCollaborationMemoryStore implements CollaborationMemoryStore {
  private memories: CollaborationMemory[] = [];

  async save(memory: CollaborationMemory): Promise<void> {
    this.memories.push(memory);
  }

  async retrieveReleventMemories(currentContext: any): Promise<CollaborationMemory[]> {
    // Basic stub: In the real implementation, this retrieves memories 
    // contextually relevant to the current team's stage and gaps.
    return this.memories;
  }
}
