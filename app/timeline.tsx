import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useKernel } from '../src/presentation/state/KernelContext';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    hasIsolynePro().then(status => {
      setIsPro(status);
    });
  }, []);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (canExport || isPro) {
      const fullReport = `[Isolyne Alignment Report]\n` +
        `Current Status: ${radarState.status.toUpperCase()}\n\n` + 
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
      
      Alert.alert(
        "Share Alignment Report",
        `Unlock unlimited timeline exports to share with your team for a one-time purchase of ${lifetime.product.priceString}.`,
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
        colors={[color.bgElevated, color.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />
      
      {/* Floating Header */}
      <BlurView intensity={90} tint="dark" style={s.header}>
        <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={s.title}>Timeline</Text>
              <Text style={s.subtitle}>How did we get here?</Text>
            </View>
            <InteractiveCard style={s.exportBtn} onPress={handleExport} disabled={exporting}>
              {exporting ? (
                <ActivityIndicator size="small" color={color.text} />
              ) : (
                <>
                  <Feather name={canExport || isPro ? "share" : "lock"} size={14} color={color.text} />
                  <Text style={s.exportBtnText}>{canExport || isPro ? 'Export' : 'Export ($2.99)'}</Text>
                </>
              )}
            </InteractiveCard>
          </View>
        </Animated.View>
      </BlurView>

      <ScrollView style={s.timelineList} contentContainerStyle={s.timelineContent} showsVerticalScrollIndicator={false}>
        {isPro === null ? null : timelineEvents.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={s.emptyState}>
            <View style={s.emptyIconCircle}>
              <Feather name="clock" size={24} color={color.textSecondary} />
            </View>
            <Text style={s.emptyTitle}>Blank Canvas</Text>
            <Text style={s.emptyDesc}>As your team locks in choices, Isolyne builds a shared history of exactly how the project evolved.</Text>
          </Animated.View>
        ) : (
          visibleEvents.map((ev, index) => (
            <Animated.View 
              entering={FadeInUp.duration(400).delay(100 + index * 100).springify()} 
              key={ev.id} 
              style={s.eventRow}
            >
              {/* Timeline Connector Line */}
              {index !== visibleEvents.length - 1 && (
                <View style={s.line} />
              )}
              {/* Spine Dot */}
              <View style={[
                s.spineDot,
                ev.type === 'divergence' && { backgroundColor: color.risk, borderColor: color.risk },
                ev.type === 'resolution' && { backgroundColor: color.join, borderColor: color.join }
              ]} />
              
              <Text style={s.timestamp}>{formatTime(ev.timestamp)}</Text>
              
              <InteractiveCard style={[
                s.eventCard, 
                ev.type === 'divergence' && s.eventCardDivergence,
                ev.type === 'resolution' && s.eventCardResolution
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {ev.type === 'divergence' && <Feather name="alert-circle" size={16} color={color.risk} accessibilityLabel="Divergence alert" />}
                  {ev.type === 'resolution' && <Feather name="check-circle" size={16} color={color.join} accessibilityLabel="Resolved" />}
                  <Text style={[
                    s.eventText,
                    ev.type === 'divergence' && s.eventTextDivergence,
                    ev.type === 'resolution' && s.eventTextResolution,
                    { flex: 1 }
                  ]}>
                    {ev.description}
                  </Text>
                </View>
              </InteractiveCard>
            </Animated.View>
          ))
        )}
        {isGated && (
          <Animated.View entering={FadeInUp.duration(600).delay(visibleEvents.length * 100 + 200)} style={s.gateContainer}>
            <View style={s.lineExtender} />
            <InteractiveCard style={s.gateBanner} onPress={() => router.push('/paywall')}>
              <Feather name="lock" size={16} color={color.textSecondary} />
              <Text style={s.gateText}>Unlock full alignment history → Isolyne Pro</Text>
            </InteractiveCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  header: { padding: space.xl, paddingBottom: space.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.glass, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  exportBtnText: { ...type.label, color: color.text },
  title: { ...type.display, color: color.text, marginBottom: 2, fontFamily: 'Orbitron' },
  subtitle: { ...type.body, color: color.textSecondary, fontSize: 13 },
  
  timelineList: { flex: 1 },
  timelineContent: { padding: space.xl, paddingTop: 140, paddingBottom: 120 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.glass, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyTitle: { ...type.title, color: color.text, marginBottom: space.sm, fontFamily: 'Orbitron' },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center' },

  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xl, position: 'relative', paddingLeft: 12 },
  line: { position: 'absolute', left: 66, top: 24, bottom: -space.xl, width: 2, backgroundColor: color.lineStrong },
  spineDot: { position: 'absolute', left: 63, top: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: color.textMuted, zIndex: 2 },
  
  timestamp: { ...type.meta, color: color.textMuted, width: 45, paddingTop: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  
  eventCard: { flex: 1, backgroundColor: color.glass, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  eventCardDivergence: { backgroundColor: 'transparent', borderColor: color.riskLine },
  eventCardResolution: { backgroundColor: 'transparent', borderColor: color.joinLine },

  eventText: { ...type.body, color: color.textSecondary },
  eventTextDivergence: { color: color.risk },
  eventTextResolution: { color: color.join },

  gateContainer: { alignItems: 'center', marginTop: space.xl, position: 'relative' },
  lineExtender: { position: 'absolute', left: 66, top: -space.xl, height: space.xl, width: 2, backgroundColor: color.lineStrong, zIndex: -1 },
  gateBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.glass, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: color.lineHighlight, gap: 8 },
  gateText: { ...type.body, color: color.textSecondary },
});
