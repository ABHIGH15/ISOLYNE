import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useKernel } from '../src/presentation/state/KernelContext';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { hasIsolynePro, getIsolyneProPackages, purchasePackage } from '../src/services/purchases';
import { Share } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { InteractiveCard } from '../src/presentation/components/InteractiveCard';
import * as Haptics from 'expo-haptics';

export default function TimelineScreen() {
  const { timelineEvents, radarState } = useKernel();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [canExport, setCanExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      hasIsolynePro().then(status => {
        setIsPro(status);
        setCanExport(status);
      });
    }, [])
  );

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (canExport || isPro) {
      const fullReport = `[ISOLYNE_SYS REPORT]\n` +
        `STATUS: ${radarState.status.toUpperCase()}\n\n` + 
        timelineEvents.map(e => `[${new Date(e.timestamp).toISOString()}] ${e.type.toUpperCase()}: ${e.description}`).join('\n');
      
      try {
        await Share.share({
          message: fullReport,
          title: 'Isolyne Alignment Report'
        });
      } catch (err) {}
      return;
    }

    try {
      setExporting(true);
      const pkgs = await getIsolyneProPackages();
      const lifetime = (pkgs as any).lifetime; 
      
      if (!lifetime) {
        Alert.alert("Export Unavailable", "One-time export unlock is currently unavailable.");
        setExporting(false);
        return;
      }
      
      if (Platform.OS === 'web') {
        const confirm = window.confirm(`Unlock unlimited timeline exports for ${lifetime.product.priceString}?`);
        if (confirm) {
          const res = await purchasePackage(lifetime);
          if (res.ok) {
            setCanExport(true);
            window.alert("Export unlocked! Tap again to share.");
          } else if (res.message) {
            window.alert(res.message);
          }
        }
        setExporting(false);
      } else {
        Alert.alert(
          "Export Devpost Post-Mortem",
          `Unlock unlimited timeline exports for ${lifetime.product.priceString}.`,
          [
            { text: "Cancel", style: "cancel", onPress: () => setExporting(false) },
            { text: `Purchase ${lifetime.product.priceString}`, onPress: async () => {
              const res = await purchasePackage(lifetime);
              if (res.ok) {
                setCanExport(true);
                Alert.alert("Success", "Export unlocked! Tap again to share.");
              } else if (res.message) {
                Alert.alert("Purchase Failed", res.message);
              }
              setExporting(false);
            }}
          ]
        );
      }
    } catch (e) {
      setExporting(false);
    }
  };

  const visibleEvents = isPro === true ? timelineEvents : timelineEvents.slice(0, 3);
  const isGated = isPro === false && timelineEvents.length > 3;

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['transparent', color.bg, color.bg]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.4, 1]}
      />
      
      {/* Brutalist Header */}
      <BlurView intensity={90} tint="dark" style={s.header}>
        <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={s.title}>[02] TIMELINE</Text>
              <Text style={s.subtitle}>// ALIGNMENT HISTORY</Text>
            </View>
            <InteractiveCard style={s.exportBtn} onPress={handleExport} disabled={exporting}>
              {exporting ? (
                <ActivityIndicator size="small" color={color.text} />
              ) : (
                <>
                  <Feather name={canExport || isPro ? "share" : "lock"} size={12} color={color.text} />
                  <Text style={s.exportBtnText}>{canExport || isPro ? 'EXPORT' : 'UNLOCK ($2.99)'}</Text>
                </>
              )}
            </InteractiveCard>
          </View>
        </Animated.View>
      </BlurView>

      <ScrollView style={s.timelineList} contentContainerStyle={s.timelineContent} showsVerticalScrollIndicator={false}>
        {isPro === null ? null : timelineEvents.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={s.emptyState}>
            <Text style={s.emptyTitle}>NO DATA</Text>
            <Text style={s.emptyDesc}>System will record logic branches here.</Text>
          </Animated.View>
        ) : (
          visibleEvents.map((ev, index) => (
            <Animated.View 
              entering={FadeInUp.duration(400).delay(100 + index * 100).springify()} 
              key={ev.id} 
              style={s.eventRow}
            >
              <Text style={s.timestamp}>{formatTime(ev.timestamp)}</Text>
              
              <View style={[
                s.eventContent, 
                ev.type === 'divergence' && s.eventContentDivergence,
                ev.type === 'resolution' && s.eventContentResolution
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  {ev.type === 'divergence' && <Text style={{ color: color.risk, fontFamily: 'Menlo', fontSize: 12, marginTop: 2 }}>[!]</Text>}
                  {ev.type === 'resolution' && <Text style={{ color: color.join, fontFamily: 'Menlo', fontSize: 12, marginTop: 2 }}>[✓]</Text>}
                  
                  <Text style={[
                    s.eventText,
                    ev.type === 'divergence' && s.eventTextDivergence,
                    ev.type === 'resolution' && s.eventTextResolution,
                  ]}>
                    {ev.description}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        )}
        {isGated && (
          <Animated.View entering={FadeInUp.duration(600).delay(visibleEvents.length * 100 + 200)} style={s.gateContainer}>
            <InteractiveCard style={s.gateBanner} onPress={() => router.push('/paywall')}>
              <Feather name="lock" size={14} color={color.textSecondary} />
              <Text style={s.gateText}>UNLOCK FULL HISTORY</Text>
            </InteractiveCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  header: { padding: space.xl, paddingBottom: space.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: space.md, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  exportBtnText: { ...type.label, color: color.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },
  title: { ...type.display, color: color.text, marginBottom: 4, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 2 },
  subtitle: { ...type.body, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },
  
  timelineList: { flex: 1 },
  timelineContent: { padding: space.xl, paddingTop: 160, paddingBottom: 120 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyTitle: { ...type.title, color: color.textMuted, marginBottom: space.sm, fontFamily: 'Orbitron', fontSize: 32 },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  timestamp: { ...type.meta, color: color.textMuted, width: 60, paddingTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  
  eventContent: { flex: 1 },
  eventContentDivergence: { },
  eventContentResolution: { },

  eventText: { ...type.body, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 18, flex: 1 },
  eventTextDivergence: { color: color.risk },
  eventTextResolution: { color: color.join },

  gateContainer: { alignItems: 'center', marginTop: space.xl },
  gateBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
  gateText: { ...type.body, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 1 },
});
