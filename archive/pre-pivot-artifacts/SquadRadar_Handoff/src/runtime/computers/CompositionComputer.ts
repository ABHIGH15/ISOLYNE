import { Squad } from '../types';

export class CompositionComputer {
  public static compute(squad: Squad) {
    const rolesFilled = Array.from(new Set(
      squad.commitments
        .filter(c => c.type === 'role')
        .map(c => c.value)
    ));

    return {
      totalMembers: squad.members.length,
      rolesFilled,
      missingRoles: [] // Derived in a real implementation against project requirements
    };
  }
}
