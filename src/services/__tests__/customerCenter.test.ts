import { describe, it, expect, beforeEach } from 'vitest';
import {
  ISOLYNE_PRO_ENTITLEMENT,
  initPurchases,
  hasIsolynePro,
  purchaseIsolynePro,
  restoreIsolynePro,
  presentCustomerCenter,
  _resetPurchasesStateForTesting,
} from '../purchases';

describe('Customer Center Subscription Logic & Gating', () => {
  beforeEach(async () => {
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    _resetPurchasesStateForTesting();
    await initPurchases();
  });

  it('correctly reports non-subscribed Free Tier state initially', async () => {
    const isPro = await hasIsolynePro();
    expect(isPro).toBe(false);
  });

  it('transitions to Pro Active state only after purchase', async () => {
    expect(await hasIsolynePro()).toBe(false);

    // Perform purchase
    const res = await purchaseIsolynePro('monthly');
    expect(res.ok).toBe(true);

    // Verify Pro state is active
    const isPro = await hasIsolynePro();
    expect(isPro).toBe(true);
  });

  it('restores Pro state correctly', async () => {
    // Unlock pro
    await purchaseIsolynePro('annual');
    expect(await hasIsolynePro()).toBe(true);

    // Call restore
    const restoreRes = await restoreIsolynePro();
    expect(restoreRes.ok).toBe(true);
    expect(await hasIsolynePro()).toBe(true);
  });

  it('provides presentCustomerCenter API without throwing', async () => {
    const res = await presentCustomerCenter();
    expect(res.ok).toBe(true);
    expect(res.preview).toBe(true);
  });
});
