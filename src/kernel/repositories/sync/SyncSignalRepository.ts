import { Signal } from '../../domain/Signal';
import { SignalRepository } from '../interfaces/SignalRepository';

export interface SyncAdapter {
  connect(): void;
  disconnect(): void;
  sendSignal(signal: Signal): void;
  onSignalReceived(callback: (signal: Signal) => void): void;
}

export class SyncSignalRepository implements SignalRepository {
  private localRepo: SignalRepository;
  private syncAdapter: SyncAdapter | null;
  private onRemoteSignalCallback?: (squadId: string) => void;

  constructor(localRepo: SignalRepository, syncAdapter: SyncAdapter | null = null) {
    this.localRepo = localRepo;
    this.syncAdapter = syncAdapter;

    if (this.syncAdapter) {
      this.syncAdapter.onSignalReceived(async (signal) => {
        // Prevent dupes if we already have it (naive check)
        const existing = await this.localRepo.getBySquad(signal.squadId);
        if (!existing.some(s => s.id === signal.id)) {
          await this.localRepo.save(signal);
          if (this.onRemoteSignalCallback) {
            this.onRemoteSignalCallback(signal.squadId);
          }
        }
      });
      this.syncAdapter.connect();
    }
  }

  async save(signal: Signal): Promise<void> {
    // 1. Save locally
    await this.localRepo.save(signal);
    
    // 2. Broadcast via adapter
    if (this.syncAdapter) {
      this.syncAdapter.sendSignal(signal);
    }
  }

  async getBySquad(squadId: string): Promise<Signal[]> {
    return this.localRepo.getBySquad(squadId);
  }

  onRemoteSignal(callback: (squadId: string) => void) {
    this.onRemoteSignalCallback = callback;
  }
}
