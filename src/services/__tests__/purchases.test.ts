import { describe, it, expect, beforeEach } from 'vitest';
import {
  ISOLYNE_PRO_ENTITLEMENT,
  initPurchases,
  hasIsolynePro,
  purchaseIsolynePro,
  purchasePackage,
  restoreIsolynePro,
  getIsolyneProOffering,
  getIsolyneProPackages,
  getIsolyneProPackage,
  presentCustomerCenter,
  _resetPurchasesStateForTesting,
} from '../purchases';

describe('RevenueCat Purchases Service & Offerings', () => {
  beforeEach(async () => {
    delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    _resetPurchasesStateForTesting();
    await initPurchases();
  });

  it('uses isolyne_pro as the entitlement identifier', () => {
    expect(ISOLYNE_PRO_ENTITLEMENT).toBe('isolyne_pro');
  });

  it('runs in preview mode when API keys are absent', async () => {
    const hasProInitially = await hasIsolynePro();
    expect(hasProInitially).toBe(false);
  });

  it('fetches an Offering containing both Monthly and Annual packages', async () => {
    const offering = await getIsolyneProOffering();
    console.log('LOGGED_OFFERING_OBJECT:', JSON.stringify(offering, null, 2));
    expect(offering).not.toBeNull();
    expect(offering?.identifier).toBe('default');
    expect(offering?.availablePackages).toHaveLength(2);

    expect(offering?.monthly?.identifier).toBe('$rc_monthly');
    expect(offering?.monthly?.packageType).toBe('MONTHLY');
    expect(offering?.monthly?.product.price).toBe(4.99);

    expect(offering?.annual?.identifier).toBe('$rc_annual');
    expect(offering?.annual?.packageType).toBe('ANNUAL');
    expect(offering?.annual?.product.price).toBe(39.99);
  });

  it('exposes Introductory Offer on the Annual package', async () => {
    const { annual } = await getIsolyneProPackages();
    expect(annual).not.toBeNull();
    expect(annual?.product.introPrice).toBeDefined();
    expect(annual?.product.introPrice?.price).toBe(19.99);
    expect(annual?.product.introPrice?.priceString).toBe('$19.99');
    expect(annual?.product.introPrice?.periodUnit).toBe('YEAR');
  });

  it('allows purchasing specific monthly or annual packages in preview mode', async () => {
    const { monthly, annual } = await getIsolyneProPackages();
    expect(monthly).not.toBeNull();
    expect(annual).not.toBeNull();

    // Purchase monthly package
    const monthlyPurchase = await purchasePackage(monthly!);
    expect(monthlyPurchase.ok).toBe(true);
    expect(monthlyPurchase.preview).toBe(true);
    expect(await hasIsolynePro()).toBe(true);

    // Reset and purchase annual package
    _resetPurchasesStateForTesting();
    await initPurchases();
    expect(await hasIsolynePro()).toBe(false);

    const annualPurchase = await purchasePackage(annual!);
    expect(annualPurchase.ok).toBe(true);
    expect(annualPurchase.preview).toBe(true);
    expect(await hasIsolynePro()).toBe(true);
  });

  it('handles local preview unlock and restore end-to-end for Expo Go', async () => {
    const purchaseResult = await purchaseIsolynePro('annual');
    expect(purchaseResult.ok).toBe(true);
    expect(purchaseResult.preview).toBe(true);

    const hasProAfterPurchase = await hasIsolynePro();
    expect(hasProAfterPurchase).toBe(true);

    const restoreResult = await restoreIsolynePro();
    expect(restoreResult.ok).toBe(true);
    expect(restoreResult.preview).toBe(true);
  });

  it('provides presentCustomerCenter API with safe preview fallback', async () => {
    const res = await presentCustomerCenter();
    expect(res.ok).toBe(true);
    expect(res.preview).toBe(true);
  });
});
