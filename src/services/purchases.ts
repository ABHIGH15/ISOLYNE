import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Purchases: any = null;
let LOG_LEVEL: any = {};
if (Platform.OS !== 'web') {
  try {
    const RNPP = require('react-native-purchases');
    Purchases = RNPP.default;
    LOG_LEVEL = RNPP.LOG_LEVEL;
  } catch (e) {}
}

export type PurchasesIntroPrice = {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
  periodUnit: string;
  periodNumberOfUnits: number;
};

export type PurchasesStoreProduct = {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: PurchasesIntroPrice | null;
  discounts?: any[] | null;
};

export type PurchasesPackage = {
  identifier: string; // '$rc_monthly' | '$rc_annual' | string
  packageType: 'MONTHLY' | 'ANNUAL' | 'CUSTOM' | string;
  product: PurchasesStoreProduct;
  offeringIdentifier: string;
};

export type PurchasesOffering = {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
  monthly?: PurchasesPackage | null;
  annual?: PurchasesPackage | null;
  weekly?: PurchasesPackage | null;
  lifetime?: PurchasesPackage | null;
};

/** RevenueCat entitlement for Isolyne Pro. */
export const ISOLYNE_PRO_ENTITLEMENT = 'isolyne_pro';
export const ISOLYNE_EXPORT_ENTITLEMENT = 'isolyne_export';

type PurchasesState = {
  ready: boolean;
  previewMode: boolean;
  demoUnlocked: boolean;
  exportUnlocked: boolean;
};

const state: PurchasesState = {
  ready: false,
  previewMode: true,
  demoUnlocked: false,
  exportUnlocked: false,
};

export function _resetPurchasesStateForTesting(): void {
  state.ready = false;
  state.previewMode = true;
  state.demoUnlocked = false;
  state.exportUnlocked = false;
}

function apiKey(): string | undefined {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  }
  return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
}

/**
 * Configure RevenueCat. Without keys (or in Expo Go Preview API Mode),
 * purchases fall back to a demo unlock so the story beat still works.
 */
export async function initPurchases(): Promise<void> {
  if (state.ready) return;

  try {
    const cachedDemo = await AsyncStorage.getItem('isolyne_pro_demo_final');
    if (cachedDemo === 'true') state.demoUnlocked = true;
  } catch {}

  const key = apiKey();
  if (!key || !Purchases) {
    state.previewMode = true;
    state.ready = true;
    return;
  }

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
    Purchases.configure({ apiKey: key });
    state.previewMode = false;
  } catch {
    state.previewMode = true;
  }
  state.ready = true;
}

export async function hasIsolynePro(): Promise<boolean> {
  if (!state.ready) await initPurchases();
  if (state.previewMode) return state.demoUnlocked;

  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[ISOLYNE_PRO_ENTITLEMENT] !== 'undefined';
  } catch {
    return state.demoUnlocked;
  }
}

export async function hasReportExport(): Promise<boolean> {
  if (!state.ready) await initPurchases();
  if (state.previewMode) return state.demoUnlocked || state.exportUnlocked;

  try {
    const info = await Purchases.getCustomerInfo();
    return (
      typeof info.entitlements.active[ISOLYNE_PRO_ENTITLEMENT] !== 'undefined' ||
      typeof info.entitlements.active[ISOLYNE_EXPORT_ENTITLEMENT] !== 'undefined'
    );
  } catch {
    return state.demoUnlocked || state.exportUnlocked;
  }
}

/**
 * Deterministic fallback Offering for preview mode / Expo Go / Web / offline testing.
 * Accurately models a RevenueCat Offering with Monthly and Annual packages,
 * including an Introductory Offer on Annual.
 * NOTE: Prices ($4.99/mo, $39.99/yr, $19.99 intro) are default placeholders pending builder pricing decision.
 */
export function getPreviewOffering(): PurchasesOffering {
  const monthlyPkg: PurchasesPackage = {
    identifier: '$rc_monthly',
    packageType: 'MONTHLY',
    offeringIdentifier: 'default',
    product: {
      identifier: 'isolyne_pro_monthly',
      title: 'Isolyne Pro Monthly',
      description: 'Full team alignment history & exports, billed monthly',
      price: 4.99,
      priceString: '$4.99',
      currencyCode: 'USD',
      introPrice: null,
    },
  };

  const exportPkg: PurchasesPackage = {
    identifier: '$rc_lifetime',
    packageType: 'LIFETIME',
    offeringIdentifier: 'default',
    product: {
      identifier: 'isolyne_report_export',
      title: 'Share Alignment Report',
      description: 'One-time unlock for timeline exports',
      price: 2.99,
      priceString: '$2.99',
      currencyCode: 'USD',
      introPrice: null,
    },
  };

  const annualPkg: PurchasesPackage = {
    identifier: '$rc_annual',
    packageType: 'ANNUAL',
    offeringIdentifier: 'default',
    product: {
      identifier: 'isolyne_pro_annual',
      title: 'Isolyne Pro Annual',
      description: 'Full team alignment history & exports, billed annually',
      price: 39.99,
      priceString: '$39.99',
      currencyCode: 'USD',
      introPrice: {
        price: 19.99,
        priceString: '$19.99',
        period: 'P1Y',
        cycles: 1,
        periodUnit: 'YEAR',
        periodNumberOfUnits: 1,
      },
    },
  };

  return {
    identifier: 'default',
    serverDescription: 'Default Isolyne Pro Offering',
    availablePackages: [monthlyPkg, annualPkg, exportPkg],
    monthly: monthlyPkg,
    annual: annualPkg,
  lifetime: exportPkg,
  };
}

/**
 * Fetch the real Offering from RevenueCat or return the deterministic preview offering.
 */
export async function getIsolyneProOffering(): Promise<PurchasesOffering | null> {
  if (!state.ready) await initPurchases();

  if (state.previewMode || !Purchases) {
    return getPreviewOffering();
  }

  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current ?? offerings.all?.['default'] ?? null;
    if (currentOffering) {
      return {
        identifier: currentOffering.identifier,
        serverDescription: currentOffering.serverDescription,
        availablePackages: currentOffering.availablePackages ?? [],
        monthly: currentOffering.monthly ?? currentOffering.availablePackages?.find((p: any) => p.packageType === 'MONTHLY' || p.identifier === '$rc_monthly') ?? null,
        annual: currentOffering.annual ?? currentOffering.availablePackages?.find((p: any) => p.packageType === 'ANNUAL' || p.identifier === '$rc_annual') ?? null,
        lifetime: currentOffering.lifetime ?? currentOffering.availablePackages?.find((p: any) => p.packageType === 'LIFETIME' || p.identifier === '$rc_lifetime') ?? null,
      };
    }
    return getPreviewOffering();
  } catch (err) {
    console.debug('Failed to fetch RevenueCat offerings, using preview offering:', err);
    return getPreviewOffering();
  }
}

/**
 * Get monthly and annual packages from current offering.
 */
export async function getIsolyneProPackages(): Promise<{
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
  all: PurchasesPackage[];
}> {
  const offering = await getIsolyneProOffering();
  if (!offering) {
    return { monthly: null, annual: null, lifetime: null, all: [] };
  }

  const monthly = offering.monthly ?? offering.availablePackages.find(p => p.packageType === 'MONTHLY' || p.identifier === '$rc_monthly') ?? null;
  const annual = offering.annual ?? offering.availablePackages.find(p => p.packageType === 'ANNUAL' || p.identifier === '$rc_annual') ?? null;
  const lifetime = offering.lifetime ?? offering.availablePackages.find(p => p.packageType === 'LIFETIME' || p.identifier === '$rc_lifetime') ?? null;

  return {
    monthly,
    annual,
    lifetime,
    all: offering.availablePackages,
  };
}

/**
 * Get a specific package (default: annual).
 */
export async function getIsolyneProPackage(packageType: 'annual' | 'monthly' = 'annual'): Promise<PurchasesPackage | null> {
  const packages = await getIsolyneProPackages();
  return packageType === 'monthly' ? packages.monthly : (packages.annual ?? packages.monthly);
}

/** Purchase a specific RevenueCat package. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{ ok: boolean; preview: boolean; message?: string }> {
  if (!state.ready) await initPurchases();

  if (state.previewMode || !Purchases) {
    if (pkg.packageType === 'LIFETIME') {
      state.exportUnlocked = true;
    } else {
      state.demoUnlocked = true;
      AsyncStorage.setItem('isolyne_pro_demo_final', 'true').catch(() => {});
    }
    return { ok: true, preview: true };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const active = typeof customerInfo.entitlements.active[ISOLYNE_PRO_ENTITLEMENT] !== 'undefined' || typeof customerInfo.entitlements.active[ISOLYNE_EXPORT_ENTITLEMENT] !== 'undefined';
    return {
      ok: active,
      preview: false,
      message: active ? undefined : 'Purchase completed without isolyne_pro entitlement.',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Purchase cancelled or failed.';
    return { ok: false, preview: false, message };
  }
}

/** Purchase Isolyne Pro (convenience wrapper). */
export async function purchaseIsolynePro(packageType: 'annual' | 'monthly' = 'annual'): Promise<{ ok: boolean; preview: boolean; message?: string }> {
  const pkg = await getIsolyneProPackage(packageType);
  if (!pkg) {
    return { ok: false, preview: false, message: 'No offering or packages configured in RevenueCat.' };
  }
  return purchasePackage(pkg);
}

export async function restoreIsolynePro(): Promise<{ ok: boolean; preview: boolean; message?: string }> {
  if (!state.ready) await initPurchases();

  if (state.previewMode || !Purchases) {
    if (state.demoUnlocked) {
      AsyncStorage.setItem('isolyne_pro_demo_final', 'true').catch(() => {});
    }
    return {
      ok: state.demoUnlocked,
      preview: true,
      message: state.demoUnlocked ? undefined : 'No Isolyne Pro found to restore.',
    };
  }

  try {
    const info = await Purchases.restorePurchases();
    const active = typeof info.entitlements.active[ISOLYNE_PRO_ENTITLEMENT] !== 'undefined';
    return { ok: active, preview: false, message: active ? undefined : 'No Isolyne Pro found to restore.' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Restore failed.';
    return { ok: false, preview: false, message };
  }
}

/**
 * Present RevenueCat Customer Center.
 * In native builds with RevenueCatUI, presents the native Customer Center modal.
 * In preview mode, returns gracefully.
 */
export async function presentCustomerCenter(callbacks?: any): Promise<{ ok: boolean; preview: boolean }> {
  if (!state.ready) await initPurchases();

  if (state.previewMode || !Purchases || Platform.OS === 'web') {
    return { ok: true, preview: true };
  }

  try {
    const RevenueCatUI = require('react-native-purchases-ui').default;
    if (RevenueCatUI && RevenueCatUI.presentCustomerCenter) {
      await RevenueCatUI.presentCustomerCenter({ callbacks });
      return { ok: true, preview: false };
    }
  } catch (e) {
    console.debug('Failed to present native Customer Center:', e);
  }
  return { ok: true, preview: true };
}
