import { describe, it, expect } from 'vitest';
import { calculateDriftImpact } from '../impactCalculator';

describe('Drift Impact Calculator Arithmetic', () => {
  it('calculates exact monthly build hours and cost per team hour with real monthly price ($4.99)', () => {
    // 3 builders working 20 hours/week each
    const result = calculateDriftImpact({
      teamSize: 3,
      hoursPerWeek: 20,
      packagePrice: 4.99,
      billingPeriod: 'monthly',
    });

    // 3 * 20 = 60 hours/week
    expect(result.weeklyTeamHours).toBe(60);
    // 60 * 4 = 240 hours/month
    expect(result.monthlyTeamHours).toBe(240);
    // 4.99 / 240 = ~0.02079 / hour
    expect(result.costPerTeamHour).toBeCloseTo(0.02079, 4);
    // 1 hour out of 240 hours = ~0.4167%
    expect(result.breakEvenPercentage).toBeCloseTo(0.4167, 3);
  });

  it('calculates exact annual build hours and cost per team hour with real annual price ($39.99)', () => {
    // 4 builders working 25 hours/week each
    const result = calculateDriftImpact({
      teamSize: 4,
      hoursPerWeek: 25,
      packagePrice: 39.99,
      billingPeriod: 'annual',
    });

    // 4 * 25 = 100 hours/week
    expect(result.weeklyTeamHours).toBe(100);
    // 100 * 4 = 400 hours/month
    expect(result.monthlyTeamHours).toBe(400);
    // 400 * 12 = 4800 hours/year
    // 39.99 / 4800 = ~0.00833 / hour
    expect(result.costPerTeamHour).toBeCloseTo(0.00833, 4);
  });

  it('calculates exact annual build hours and cost per team hour with introductory offer price ($19.99)', () => {
    // 3 builders working 20 hours/week each (default paywall state)
    const result = calculateDriftImpact({
      teamSize: 3,
      hoursPerWeek: 20,
      packagePrice: 19.99,
      billingPeriod: 'annual',
    });

    // 3 * 20 = 60 hours/week
    expect(result.weeklyTeamHours).toBe(60);
    // 60 * 4 = 240 hours/month
    expect(result.monthlyTeamHours).toBe(240);
    // 240 * 12 = 2880 hours/year
    // 19.99 / 2880 = ~0.00694 / hour
    expect(result.costPerTeamHour).toBeCloseTo(0.00694, 4);
    // 1 hour / 2880 = ~0.03472%
    expect(result.breakEvenPercentage).toBeCloseTo(0.03472, 3);
  });

  it('safely handles solo builder edge case', () => {
    const result = calculateDriftImpact({
      teamSize: 1,
      hoursPerWeek: 10,
      packagePrice: 4.99,
      billingPeriod: 'monthly',
    });

    expect(result.teamSize).toBe(1);
    expect(result.weeklyTeamHours).toBe(10);
    expect(result.monthlyTeamHours).toBe(40);
    expect(result.costPerTeamHour).toBeCloseTo(4.99 / 40, 4);
  });

  it('guards against zero or negative inputs with safe minimums', () => {
    const result = calculateDriftImpact({
      teamSize: 0,
      hoursPerWeek: -5,
      packagePrice: 0,
      billingPeriod: 'monthly',
    });

    expect(result.teamSize).toBe(1);
    expect(result.hoursPerWeek).toBe(1);
    expect(result.weeklyTeamHours).toBe(1);
    expect(result.monthlyTeamHours).toBe(4);
    expect(result.costPerTeamHour).toBe(0);
  });

  it('guarantees every output derives strictly from user inputs and package price without external constants', () => {
    const customTeam = 5;
    const customHours = 15;
    const customPrice = 9.99;

    const result = calculateDriftImpact({
      teamSize: customTeam,
      hoursPerWeek: customHours,
      packagePrice: customPrice,
      billingPeriod: 'monthly',
    });

    expect(result.weeklyTeamHours).toBe(customTeam * customHours);
    expect(result.monthlyTeamHours).toBe(customTeam * customHours * 4);
    expect(result.costPerTeamHour).toBe(customPrice / (customTeam * customHours * 4));
  });
});
