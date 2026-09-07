import { Commitment } from '../domain/Commitment';
import { DecisionProposal } from '../domain/DecisionProposal';
import { Signal } from '../domain/Signal';

export class CommitmentResolver {
  resolve(signal: Signal, proposal: DecisionProposal): Commitment {
    let statement = '';
    
    if (signal.payload?.type === 'ownership') {
      statement = `${signal.payload.ownerId} owns final decision coordination`;
    } else if (signal.payload?.type === 'definition' || signal.payload?.type === 'interpretation') {
      statement = `Team commits to shared scope definition for ${signal.payload.topic}: ${signal.payload.choice || signal.payload.definition}`;
    } else if (signal.payload?.type === 'consensus') {
      statement = `Team aligns on ${signal.payload.topic}: ${signal.payload.choice}`;
    } else if (signal.payload?.type === 'integration') {
      statement = `Team aligns on contract for ${signal.payload.interfaceId}`;
    } else {
      statement = 'General team alignment reached';
    }

    return {
      id: `commit_${Date.now()}`,
      ownerId: signal.actorId,
      statement
    };
  }
}
