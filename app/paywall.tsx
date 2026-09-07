import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Platform, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { 
  getIsolyneProPackages, 
  purchasePackage, 
  restoreIsolynePro, 
  PurchasesPackage, 
  ISOLYNE_PRO_ENTITLEMENT 
} from '../src/services/purchases';
import { calculateDriftImpact } from '../src/services/impactCalculator';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string; topic?: string }>();
  const isMomentOfDoubt = params.source === 'moment_of_doubt';
  const driftTopic = params.topic;

  const [packages, setPackages] = useState<{ monthly: PurchasesPackage | null; annual: PurchasesPackage | null; all: PurchasesPackage[] }>({
    monthly: null,
    annual: null,
    all: [],
  });
  const [selectedType, setSelectedType] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showCalculator, setShowCalculator] = useState(true);
  const [teamSize, setTeamSize] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);

  useEffect(() => {
    async function load() {
      try {
        const pkgs = await getIsolyneProPackages();
        setPackages(pkgs);
      } catch (err) {
        console.warn('Error loading packages:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePurchase = async () => {
    const pkg = selectedType === 'annual' ? (packages.annual ?? packages.monthly) : (packages.monthly ?? packages.annual);
    if (!pkg) {
      Alert.alert('Notice', 'No package selected.');
      return;
    }

    setPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await purchasePackage(pkg);
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Welcome to Isolyne Pro', 'Your collaboration timeline and export capabilities are unlocked.', [
          { text: 'Continue', onPress: () => router.back() }
        ]);
      } else if (res.message) {
        Alert.alert('Purchase Notice', res.message);
      }
    } catch (err: any) {
      Alert.alert('Purchase Error', err.message || 'Something went wrong.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPurchasing(true);
    try {
      const res = await restoreIsolynePro();
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Purchases Restored', 'Welcome back to Isolyne Pro!', [
          { text: 'Continue', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Notice', res.message || 'No active Isolyne Pro subscription found.');
      }
    } catch (err: any) {
      Alert.alert('Restore Error', err.message || 'Failed to restore purchases.');
    } finally {
      setPurchasing(false);
    }
  };

  const annualPkg = packages.annual;
  const monthlyPkg = packages.monthly;
  const activePkg = selectedType === 'annual' ? (annualPkg ?? monthlyPkg) : (monthlyPkg ?? annualPkg);

  // Use the effective subscription price (intro offer if applicable, otherwise standard package price)
  const hasIntroPrice = selectedType === 'annual' && !!annualPkg?.product.introPrice;
  const effectivePrice = hasIntroPrice
    ? annualPkg!.product.introPrice!.price
    : (activePkg?.product.price ?? (selectedType === 'annual' ? 39.99 : 4.99));
  const effectivePriceString = hasIntroPrice
    ? annualPkg!.product.introPrice!.priceString
    : (activePkg?.product.priceString ?? (selectedType === 'annual' ? '$39.99' : '$4.99'));

  const impact = calculateDriftImpact({
    teamSize,
    hoursPerWeek,
    packagePrice: effectivePrice,
    billingPeriod: selectedType,
  });

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />
      
      {/* Top bar with close button */}
      <View style={s.topBar}>
        <View style={s.brandPill}>
          <Feather name="shield" size={14} color={color.accent} />
          <Text style={s.brandText}>ISOLYNE PRO</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.closeBtn}>
          <Feather name="x" size={20} color={color.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        {/* Header with Moment of Doubt framing */}
        <View style={s.header}>
          {isMomentOfDoubt && (
            <View style={s.momentBadge}>
              <Feather name="alert-triangle" size={13} color={color.risk} />
              <Text style={s.momentBadgeText}>
                CAUGHT SILENT DRIFT{driftTopic ? `: ${driftTopic.toUpperCase()}` : ''}
              </Text>
            </View>
          )}
          <Text style={s.title}>{isMomentOfDoubt ? 'The Moment of Alignment' : 'Isolyne Pro'}</Text>
          <Text style={s.subtitle}>
            Isolyne Pro isn't sold in a settings menu — it's offered the moment your team's Radar goes red, when the value of alignment is undeniable. Free forever: detection. Pro: the resolution history and evidence trail that prevents the next drift.
          </Text>
        </View>

        {/* Feature List */}
        <View style={s.featureList}>
          <View style={s.featureRow}>
            <Feather name="check-circle" size={18} color={color.accent} style={s.featureIcon} />
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Full Collaboration Timeline</Text>
              <Text style={s.featureDesc}>Complete chronological ledger of team statements, divergences, and commitments.</Text>
            </View>
          </View>

          <View style={s.featureRow}>
            <Feather name="check-circle" size={18} color={color.accent} style={s.featureIcon} />
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Cross-Project Memory</Text>
              <Text style={s.featureDesc}>Preserve working agreements, authority patterns, and team lessons across projects.</Text>
            </View>
          </View>

          <View style={s.featureRow}>
            <Feather name="check-circle" size={18} color={color.accent} style={s.featureIcon} />
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Team Retrospective Exports</Text>
              <Text style={s.featureDesc}>One-click export of verified team decisions and alignment timelines for reviews and reports.</Text>
            </View>
          </View>
        </View>

        {/* Package Selector */}
        {loading ? (
          <ActivityIndicator size="small" color={color.accent} style={{ marginVertical: space.xl }} />
        ) : (
          <View style={s.packagesContainer}>
            
            {/* Annual Package Card */}
            {annualPkg && (
              <Pressable 
                style={[s.packageCard, selectedType === 'annual' && s.packageCardSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType('annual');
                }}
              >
                {/* Intro Offer Badge if available */}
                {annualPkg.product.introPrice ? (
                  <View style={s.introBadge}>
                    <Text style={s.introBadgeText}>
                      INTRO OFFER: {annualPkg.product.introPrice.priceString} FIRST YEAR
                    </Text>
                  </View>
                ) : (
                  <View style={s.bestValueBadge}>
                    <Text style={s.bestValueText}>BEST VALUE · SAVE 33%</Text>
                  </View>
                )}

                <View style={s.packageHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.packageTitle}>Annual Plan</Text>
                    <Text style={s.packageDesc}>
                      {annualPkg.product.introPrice 
                        ? `Renews at ${annualPkg.product.priceString}/year after first period` 
                        : 'Billed annually'}
                    </Text>
                  </View>
                  <View style={s.priceBox}>
                    <Text style={s.packagePrice}>
                      {annualPkg.product.introPrice ? annualPkg.product.introPrice.priceString : annualPkg.product.priceString}
                    </Text>
                    <Text style={s.packagePeriod}>/ year</Text>
                  </View>
                </View>
              </Pressable>
            )}

            {/* Monthly Package Card */}
            {monthlyPkg && (
              <Pressable 
                style={[s.packageCard, selectedType === 'monthly' && s.packageCardSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType('monthly');
                }}
              >
                <View style={s.packageHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.packageTitle}>Monthly Plan</Text>
                    <Text style={s.packageDesc}>Flexible month-to-month subscription</Text>
                  </View>
                  <View style={s.priceBox}>
                    <Text style={s.packagePrice}>{monthlyPkg.product.priceString}</Text>
                    <Text style={s.packagePeriod}>/ month</Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Drift Impact Calculator (Expandable) */}
        <View style={s.calcSection}>
          <Pressable
            testID="calc-toggle"
            accessibilityRole="button"
            style={[s.calcToggle, showCalculator && s.calcToggleOpen]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCalculator(!showCalculator);
            }}
          >
            <View style={s.calcToggleLeft}>
              <View style={s.calcIconCircle}>
                <Feather name="activity" size={14} color={color.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.calcToggleTitle}>Estimate your team's cost of drift</Text>
                <Text style={s.calcToggleSubtitle}>
                  {showCalculator ? 'Grounded arithmetic on your active capacity' : 'Tap to calculate build capacity vs. plan cost'}
                </Text>
              </View>
            </View>
            <Feather
              name={showCalculator ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={color.textSecondary}
            />
          </Pressable>

          {showCalculator && (
            <View style={s.calcBody}>
              {/* Stepper: Team Size */}
              <View style={s.stepperRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepperLabel}>Builders on Team</Text>
                  <Text style={s.stepperSubtext}>Active collaborators</Text>
                </View>
                <View style={s.stepperControls}>
                  <Pressable
                    testID="team-minus"
                    accessibilityRole="button"
                    style={[s.stepperBtn, teamSize <= 1 && s.stepperBtnDisabled]}
                    onPress={() => {
                      if (teamSize > 1) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTeamSize(teamSize - 1);
                      }
                    }}
                    disabled={teamSize <= 1}
                  >
                    <Feather name="minus" size={14} color={teamSize <= 1 ? color.textMuted : color.text} />
                  </Pressable>
                  <Text style={s.stepperVal}>{teamSize}</Text>
                  <Pressable
                    testID="team-plus"
                    accessibilityRole="button"
                    style={[s.stepperBtn, teamSize >= 10 && s.stepperBtnDisabled]}
                    onPress={() => {
                      if (teamSize < 10) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTeamSize(teamSize + 1);
                      }
                    }}
                    disabled={teamSize >= 10}
                  >
                    <Feather name="plus" size={14} color={teamSize >= 10 ? color.textMuted : color.text} />
                  </Pressable>
                </View>
              </View>

              {/* Stepper: Hours per Week */}
              <View style={s.stepperRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepperLabel}>Active Build Hours / Wk</Text>
                  <Text style={s.stepperSubtext}>Per person dedicated build time</Text>
                </View>
                <View style={s.stepperControls}>
                  <Pressable
                    testID="hours-minus"
                    accessibilityRole="button"
                    style={[s.stepperBtn, hoursPerWeek <= 5 && s.stepperBtnDisabled]}
                    onPress={() => {
                      if (hoursPerWeek > 5) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setHoursPerWeek(hoursPerWeek - 5);
                      }
                    }}
                    disabled={hoursPerWeek <= 5}
                  >
                    <Feather name="minus" size={14} color={hoursPerWeek <= 5 ? color.textMuted : color.text} />
                  </Pressable>
                  <Text style={s.stepperVal}>{hoursPerWeek}h</Text>
                  <Pressable
                    testID="hours-plus"
                    accessibilityRole="button"
                    style={[s.stepperBtn, hoursPerWeek >= 60 && s.stepperBtnDisabled]}
                    onPress={() => {
                      if (hoursPerWeek < 60) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setHoursPerWeek(hoursPerWeek + 5);
                      }
                    }}
                    disabled={hoursPerWeek >= 60}
                  >
                    <Feather name="plus" size={14} color={hoursPerWeek >= 60 ? color.textMuted : color.text} />
                  </Pressable>
                </View>
              </View>

              <View style={s.calcDivider} />

              {/* Arithmetic Grid */}
              <View style={s.metricsRow}>
                <View style={s.metricCard}>
                  <Text style={s.metricNum}>{impact.weeklyTeamHours}h</Text>
                  <Text style={s.metricLabel}>Weekly Team Build</Text>
                </View>
                <View style={s.metricCard}>
                  <Text style={s.metricNum}>{impact.monthlyTeamHours}h</Text>
                  <Text style={s.metricLabel}>Monthly Team Build</Text>
                </View>
                <View style={s.metricCard}>
                  <Text style={s.metricNum}>
                    {impact.costPerTeamHour < 0.01
                      ? '<$0.01'
                      : `$${impact.costPerTeamHour.toFixed(2)}`}
                  </Text>
                  <Text style={s.metricLabel}>Cost / Team Hour</Text>
                </View>
              </View>

              {/* Grounded Takeaway */}
              <View style={s.calcCallout}>
                <Feather name="shield" size={14} color={color.join} style={{ marginTop: 2 }} />
                <Text style={s.calcCalloutText}>
                  At <Text style={s.calcHighlight}>{effectivePriceString}</Text> ({selectedType}), preventing just{' '}
                  <Text style={s.calcHighlight}>1 hour</Text> of silent drift across your team's{' '}
                  {selectedType === 'annual' ? impact.monthlyTeamHours * 12 : impact.monthlyTeamHours} total build hours recoups 100% of the subscription (representing{' '}
                  <Text style={s.calcHighlight}>
                    {impact.breakEvenPercentage < 0.01
                      ? '<0.01%'
                      : `${impact.breakEvenPercentage.toFixed(2)}%`}
                  </Text>{' '}
                  of team capacity).
                </Text>
              </View>

              <Text style={s.calcFootnote}>
                Derived strictly from your 2 inputs and active RevenueCat package pricing. Zero assumed salaries or industry averages.
              </Text>
            </View>
          )}
        </View>

        {/* CTA Button */}
        <Pressable 
          style={[s.ctaBtn, purchasing && { opacity: 0.7 }]} 
          onPress={handlePurchase}
          disabled={purchasing || loading}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color={color.textOnAccent} />
          ) : (
            <>
              <Text style={s.ctaBtnText}>
                {selectedType === 'annual' && annualPkg?.product.introPrice 
                  ? `Start Annual Plan (${annualPkg.product.introPrice.priceString})` 
                  : 'Unlock Isolyne Pro'}
              </Text>
              <Feather name="arrow-right" size={18} color={color.textOnAccent} />
            </>
          )}
        </Pressable>

        {/* Free Safety Guarantee */}
        <Text style={s.safetyNotice}>
          ✦ Drift detection and 1-tap consensus alignment remain 100% free forever.
        </Text>

        {/* Restore & Legal Footer */}
        <View style={s.footer}>
          <Pressable onPress={handleRestore} disabled={purchasing} hitSlop={8}>
            <Text style={s.footerLink}>Restore</Text>
          </Pressable>
          <Text style={s.footerDot}>·</Text>
          <Pressable onPress={() => router.push('/customer-center')} hitSlop={8}>
            <Text style={s.footerLink}>Customer Center</Text>
          </Pressable>
          <Text style={s.footerDot}>·</Text>
          <Text style={s.footerMeta}>{ISOLYNE_PRO_ENTITLEMENT}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm },
  brandPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.accentDim, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill },
  brandText: { ...type.label, color: color.accent, fontSize: 10, letterSpacing: 1 },
  closeBtn: { padding: 4 },

  content: { padding: space.xl, paddingBottom: 60 },
  
  header: { marginBottom: space.xl },
  momentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.riskSoft, borderWidth: 1, borderColor: color.riskLine, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start', marginBottom: space.sm },
  momentBadgeText: { ...type.label, color: color.risk, fontSize: 10, letterSpacing: 1 },
  title: { ...type.display, color: color.text, marginBottom: space.sm },
  subtitle: { ...type.body, color: color.textSecondary, fontSize: 14, lineHeight: 20 },

  featureList: { backgroundColor: color.bgElevated, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: color.lineStrong, gap: space.md, marginBottom: space.xl },
  featureRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  featureIcon: { marginTop: 2 },
  featureTitle: { ...type.bodyStrong, color: color.text, fontSize: 14, marginBottom: 2 },
  featureDesc: { ...type.meta, color: color.textMuted, fontSize: 12, lineHeight: 16 },

  packagesContainer: { gap: space.md, marginBottom: space.xl },
  packageCard: { backgroundColor: color.bgQuiet, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.lineStrong, padding: space.lg, position: 'relative' },
  packageCardSelected: { borderColor: color.accent, backgroundColor: color.accentDim },
  
  introBadge: { position: 'absolute', top: -10, right: space.lg, backgroundColor: color.accent, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
  introBadgeText: { ...type.label, color: color.textOnAccent, fontSize: 10, fontWeight: '700' },
  bestValueBadge: { position: 'absolute', top: -10, right: space.lg, backgroundColor: color.join, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
  bestValueText: { ...type.label, color: color.textOnAccent, fontSize: 10, fontWeight: '700' },

  packageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packageTitle: { ...type.title, color: color.text, fontSize: 16, marginBottom: 2 },
  packageDesc: { ...type.meta, color: color.textSecondary, fontSize: 12 },
  priceBox: { alignItems: 'flex-end' },
  packagePrice: { ...type.title, color: color.text, fontSize: 18, fontWeight: '700' },
  packagePeriod: { ...type.meta, color: color.textMuted, fontSize: 11 },

  calcSection: { marginBottom: space.xl },
  calcToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.bgElevated,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    padding: space.md,
  },
  calcToggleOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  calcToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
    paddingRight: space.sm,
  },
  calcIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: color.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcToggleTitle: { ...type.bodyStrong, color: color.text, fontSize: 13 },
  calcToggleSubtitle: { ...type.meta, color: color.textMuted, fontSize: 11, marginTop: 1 },

  calcBody: {
    backgroundColor: color.bgElevated,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: color.lineStrong,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    padding: space.lg,
    paddingTop: space.sm,
    gap: space.md,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepperLabel: { ...type.bodyStrong, color: color.text, fontSize: 13 },
  stepperSubtext: { ...type.meta, color: color.textSecondary, fontSize: 11 },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: color.bgQuiet,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperVal: {
    ...type.bodyStrong,
    color: color.text,
    fontSize: 14,
    minWidth: 36,
    textAlign: 'center',
  },
  calcDivider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: color.bgQuiet,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.line,
    padding: space.sm,
    alignItems: 'center',
  },
  metricNum: {
    ...type.title,
    color: color.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    ...type.meta,
    color: color.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  calcCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: color.joinSoft,
    borderWidth: 1,
    borderColor: color.joinLine,
    borderRadius: radius.sm,
    padding: space.md,
  },
  calcCalloutText: {
    ...type.meta,
    color: color.text,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  calcHighlight: {
    color: color.join,
    fontWeight: '700',
  },
  calcFootnote: {
    ...type.meta,
    color: color.textMuted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },

  ctaBtn: { flexDirection: 'row', backgroundColor: color.accent, paddingVertical: space.lg, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: space.sm, marginBottom: space.md },
  ctaBtnText: { ...type.button, color: color.textOnAccent, fontSize: 15 },

  safetyNotice: { ...type.meta, color: color.textSecondary, textAlign: 'center', fontSize: 11, marginBottom: space.xl },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm },
  footerLink: { ...type.meta, color: color.accent, textDecorationLine: 'underline', fontSize: 12 },
  footerDot: { color: color.textMuted },
  footerMeta: { ...type.meta, color: color.textMuted, fontSize: 12 }
});
