import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { hasIsolynePro, restoreIsolynePro, ISOLYNE_PRO_ENTITLEMENT } from '../src/services/purchases';

let RevenueCatUI: any = null;
if (Platform.OS !== 'web') {
  try {
    RevenueCatUI = require('react-native-purchases-ui').default;
  } catch (e) {}
}

export default function CustomerCenterScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyAnswer, setSurveyAnswer] = useState<string | null>(null);
  const [promoAccepted, setPromoAccepted] = useState(false);

  const checkStatus = async () => {
    try {
      const active = await hasIsolynePro();
      setIsPro(active);
    } catch (e) {
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await restoreIsolynePro();
      await checkStatus();
      if (res.ok) {
        Alert.alert('Purchases Restored', 'Isolyne Pro status restored successfully.');
      } else {
        Alert.alert('Notice', res.message || 'No active Isolyne Pro subscription found.');
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e.message || 'Failed to restore.');
    }
  };

  const handleApplyPromoOffer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPromoAccepted(true);
    Alert.alert(
      'Demo Retention Offer Applied',
      'Simulation: 50% discount registered for next renewal period. Your Isolyne Pro access remains active.',
      [{ text: 'Continue', onPress: () => router.back() }]
    );
  };

  const handleSelectSurvey = (reason: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSurveyAnswer(reason);
  };

  // If native RevenueCatUI CustomerCenter is available and supported on this platform/build
  if (RevenueCatUI && RevenueCatUI.CustomerCenterView && Platform.OS !== 'web') {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar style="light" />
        <RevenueCatUI.CustomerCenterView
          style={{ flex: 1 }}
          onDismiss={() => router.back()}
          onFeedbackSurveyCompleted={({ feedbackSurveyOptionId }: { feedbackSurveyOptionId: string }) => {
            console.log('Customer Center survey completed:', feedbackSurveyOptionId);
          }}
          onPromotionalOfferSucceeded={({ offerId }: { offerId: string }) => {
            console.log('Customer Center promo offer succeeded:', offerId);
          }}
        />
      </SafeAreaView>
    );
  }

  // Fallback / Preview Mode Customer Center UI (Expo Go, Web, Test environments)
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />

      {/* Top Navigation */}
      <View style={s.topBar}>
        <View style={s.brandPill}>
          <Feather name="user-check" size={14} color={color.join} />
          <Text style={s.brandText}>CUSTOMER CENTER</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.closeBtn}>
          <Feather name="x" size={20} color={color.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <ActivityIndicator size="small" color={color.accent} style={{ marginVertical: space.xl }} />
        ) : isPro ? (
          /* Subscribed User View */
          <>
            <View style={s.statusCard}>
              <View style={s.statusHeader}>
                <View>
                  <Text style={s.planTitle}>Isolyne Pro</Text>
                  <Text style={s.planSubtitle}>Active Subscription · Entitlement: {ISOLYNE_PRO_ENTITLEMENT}</Text>
                </View>
                <View style={s.activeBadge}>
                  <Text style={s.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={s.statusDesc}>
                Full collaboration ledger, team cross-sprint memory, and retrospective exports are enabled.
              </Text>
            </View>

            {/* Retention & Cancellation Management Section */}
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>Subscription Management & Survey</Text>
              <Text style={s.sectionDesc}>
                Thinking of cancelling? Help us understand what we could improve:
              </Text>

              <View style={s.surveyOptions}>
                {[
                  'Project / sprint completed',
                  'Too expensive for our squad',
                  'Missing a feature we need',
                  'Technical difficulties'
                ].map((reason, idx) => (
                  <Pressable
                    key={idx}
                    style={[s.surveyOption, surveyAnswer === reason && s.surveyOptionSelected]}
                    onPress={() => handleSelectSurvey(reason)}
                  >
                    <Feather 
                      name={surveyAnswer === reason ? "check-circle" : "circle"} 
                      size={16} 
                      color={surveyAnswer === reason ? color.accent : color.textMuted} 
                    />
                    <Text style={[s.surveyText, surveyAnswer === reason && s.surveyTextSelected]}>
                      {reason}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Scripted Retention Offer Triggered on Survey Selection */}
              {surveyAnswer && !promoAccepted && (
                <View style={s.retentionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.xs }}>
                    <Feather name="gift" size={16} color={color.caution} />
                    <Text style={s.retentionTitle}>Special Retention Offer (Demo)</Text>
                  </View>
                  <Text style={s.retentionBody}>
                    Keep your team's historical audit trail for 50% off your next renewal period.
                  </Text>
                  <Pressable style={s.retentionBtn} onPress={handleApplyPromoOffer}>
                    <Text style={s.retentionBtnText}>Claim 50% Off & Stay Subscribed</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Non-Subscribed / Free Tier View */
          <View style={s.statusCard}>
            <View style={s.statusHeader}>
              <View>
                <Text style={s.planTitle}>Isolyne Free</Text>
                <Text style={s.planSubtitle}>Community Tier</Text>
              </View>
              <View style={s.freeBadge}>
                <Text style={s.freeBadgeText}>FREE TIER</Text>
              </View>
            </View>
            <Text style={s.statusDesc}>
              Continuous silent drift detection and 1-tap consensus alignment are active and 100% free forever.
            </Text>
            <Pressable 
              style={s.upgradeBtn} 
              onPress={() => router.push('/paywall')}
            >
              <Text style={s.upgradeBtnText}>Upgrade to Isolyne Pro</Text>
              <Feather name="arrow-right" size={16} color={color.textOnAccent} />
            </Pressable>
          </View>
        )}

        {/* Self-Service Actions */}
        <View style={s.actionsList}>
          <Pressable style={s.actionRow} onPress={handleRestore}>
            <Feather name="refresh-cw" size={18} color={color.text} />
            <Text style={s.actionText}>Restore Purchases</Text>
            <Feather name="chevron-right" size={16} color={color.textMuted} />
          </Pressable>

          <Pressable 
            style={s.actionRow} 
            onPress={() => Alert.alert('Support', 'Contact our developer team at support@isolyne.app for help with team billing.')}
          >
            <Feather name="mail" size={18} color={color.text} />
            <Text style={s.actionText}>Contact Support</Text>
            <Feather name="chevron-right" size={16} color={color.textMuted} />
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm },
  brandPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.joinSoft, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: color.joinLine },
  brandText: { ...type.label, color: color.join, fontSize: 10, letterSpacing: 1 },
  closeBtn: { padding: 4 },

  content: { padding: space.xl, gap: space.xl, paddingBottom: 60 },

  statusCard: { backgroundColor: color.bgElevated, borderRadius: radius.lg, padding: space.xl, borderWidth: 1, borderColor: color.lineStrong },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.md },
  planTitle: { ...type.title, color: color.text, fontSize: 18, marginBottom: 2 },
  planSubtitle: { ...type.meta, color: color.textSecondary, fontSize: 12 },
  activeBadge: { backgroundColor: color.joinSoft, paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: color.joinLine },
  activeBadgeText: { ...type.label, color: color.join, fontSize: 10, fontWeight: '700' },
  freeBadge: { backgroundColor: color.bgQuiet, paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  freeBadgeText: { ...type.label, color: color.textSecondary, fontSize: 10, fontWeight: '700' },
  statusDesc: { ...type.body, color: color.textMuted, fontSize: 13, lineHeight: 18 },

  upgradeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, backgroundColor: color.accent, paddingVertical: space.md, borderRadius: radius.pill, marginTop: space.lg },
  upgradeBtnText: { ...type.button, color: color.textOnAccent, fontSize: 14 },

  sectionCard: { backgroundColor: color.bgQuiet, borderRadius: radius.lg, padding: space.xl, borderWidth: 1, borderColor: color.lineStrong },
  sectionTitle: { ...type.bodyStrong, color: color.text, fontSize: 15, marginBottom: 4 },
  sectionDesc: { ...type.meta, color: color.textSecondary, fontSize: 13, marginBottom: space.lg },

  surveyOptions: { gap: space.sm, marginBottom: space.lg },
  surveyOption: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.bgElevated, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  surveyOptionSelected: { borderColor: color.accent, backgroundColor: color.accentDim },
  surveyText: { ...type.body, color: color.textSecondary, fontSize: 14 },
  surveyTextSelected: { color: color.text, fontWeight: '600' },

  retentionCard: { backgroundColor: color.cautionSoft, borderRadius: radius.md, padding: space.lg, borderWidth: 1, borderColor: color.cautionLine, marginTop: space.sm },
  retentionTitle: { ...type.bodyStrong, color: color.caution, fontSize: 14 },
  retentionBody: { ...type.meta, color: color.caution, fontSize: 12, lineHeight: 16, marginBottom: space.md },
  retentionBtn: { backgroundColor: color.caution, paddingVertical: space.md, borderRadius: radius.pill, alignItems: 'center' },
  retentionBtnText: { ...type.button, color: color.bgElevated, fontSize: 13 },

  actionsList: { backgroundColor: color.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: color.lineStrong, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderBottomWidth: 1, borderColor: color.line },
  actionText: { ...type.body, color: color.text, flex: 1, fontSize: 14 }
});
