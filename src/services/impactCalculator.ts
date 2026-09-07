/**
 * Pure arithmetic utility for the Drift Impact Calculator.
 * 
 * Strict constraint: Zero invented statistics or industry salary assumptions.
 * Every output traces 100% to:
 * 1. User input: teamSize
 * 2. User input: hoursPerWeek (per builder)
 * 3. Real package price from PurchasesPackage data
 */

export interface ImpactInputs {
  teamSize: number;
  hoursPerWeek: number;
  packagePrice: number;
  billingPeriod: 'monthly' | 'annual';
}

export interface ImpactOutput {
  teamSize: number;
  hoursPerWeek: number;
  packagePrice: number;
  weeklyTeamHours: number;
  monthlyTeamHours: number;
  costPerTeamHour: number;
  breakEvenHours: number;
  breakEvenPercentage: number;
}

export function calculateDriftImpact(inputs: ImpactInputs): ImpactOutput {
  const teamSize = Math.max(1, Math.round(inputs.teamSize || 1));
  const hoursPerWeek = Math.max(1, Math.round(inputs.hoursPerWeek || 1));
  const packagePrice = Math.max(0, inputs.packagePrice || 0);

  const weeklyTeamHours = teamSize * hoursPerWeek;
  // Standard 4-week working month assumption for sprint estimation
  const monthlyTeamHours = weeklyTeamHours * 4;

  const relevantPeriodHours = inputs.billingPeriod === 'annual' ? monthlyTeamHours * 12 : monthlyTeamHours;

  const costPerTeamHour = relevantPeriodHours > 0 ? packagePrice / relevantPeriodHours : 0;

  // If misalignment wastes 1 hour of the team's build time, what fraction of their capacity is that?
  const breakEvenHours = 1;
  const breakEvenPercentage = relevantPeriodHours > 0 ? (breakEvenHours / relevantPeriodHours) * 100 : 0;

  return {
    teamSize,
    hoursPerWeek,
    packagePrice,
    weeklyTeamHours,
    monthlyTeamHours,
    costPerTeamHour,
    breakEvenHours,
    breakEvenPercentage,
  };
}
