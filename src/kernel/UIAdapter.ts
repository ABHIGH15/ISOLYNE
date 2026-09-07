import { PersistentCIKernel } from './persistence/PersistentCIKernel';
import { SignalType } from './domain/Signal';

export class KernelUIAdapter {
  constructor(private kernel: PersistentCIKernel) {}

  async loadActiveProposal(squadId: string) {
    return await this.kernel.evaluateSquad(squadId);
  }

  async respondToProposal(squadId: string, actorId: string, response: 'agree' | 'challenge', proposalId: string, gapId: string, payload?: any) {
    const signalType: SignalType = response === 'agree' ? 'alignment_agree' : 'alignment_challenge';
    
    return await this.kernel.processAlignment(
      { 
        id: `sig_${Date.now()}_${Math.random()}`, 
        squadId, 
        actorId, 
        type: signalType, 
        timestamp: new Date().toISOString(), 
        payload 
      }, 
      proposalId, 
      gapId
    );
  }
}
