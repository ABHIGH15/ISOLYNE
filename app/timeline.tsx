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
  const { timelineEvents, radarState, activeProjectId, activeProject } = useKernel();
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
      try {
        const { generateAlignmentReport } = require('../src/services/reportExporter');
        const fullReport = await generateAlignmentReport(activeProjectId, activeProject?.name);
        
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
            <Feather name="git-commit" size={32} color={color.textMuted} style={{ marginBottom: space.md }} />
            <Text style={s.emptyTitle}>NO DATA</Text>
            <Text style={s.emptyDesc}>System will record logic branches here.</Text>
          </Animated.View>
        ) : (
          <View style={s.timelineSpineContainer}>
            <View style={s.spineLine} />
            {visibleEvents.map((ev, index) => {
              const isDivergence = ev.type === 'divergence';
              const isResolution = ev.type === 'resolution';
              const dotColor = isDivergence ? color.risk : isResolution ? color.join : color.textMuted;
              
              return (
                <Animated.View 
                  entering={FadeInUp.duration(400).delay(100 + index * 100).springify()} 
                  key={ev.id} 
                  style={s.eventRow}
                >
                  <View style={s.timestampCol}>
                    <Text style={s.timestamp}>{formatTime(ev.timestamp)}</Text>
                  </View>

                  <View style={s.nodeCol}>
                     <View style={[s.nodeDot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
                  </View>
                  
                  <View style={[
                    s.eventContent, 
                    isDivergence && s.eventContentDivergence,
                    isResolution && s.eventContentResolution
                  ]}>
                      <Text style={[
                        s.eventText,
                        isDivergence && s.eventTextDivergence,
                        isResolution && s.eventTextResolution,
                      ]}>
                        {ev.description}
                      </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
        {isGated && (
          <Animated.View entering={FadeInUp.duration(600).delay(visibleEvents.length * 100 + 200)} style={s.gateContainer}>
            <InteractiveCard style={s.gateBanner} onPress={() => router.push('/paywall')}>
              <LinearGradient colors={['rgba(255,255,255,0.05)', 'transparent']} style={StyleSheet.absoluteFill} />
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
  root: { flex: 1, backgroundColor: color.bg },
  header: { padding: space.xl, paddingBottom: space.md, borderBottomWidth: 1, borderColor: color.lineStrong, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: space.md, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: color.lineStrong },
  exportBtnText: { ...type.label, color: color.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },
  title: { ...type.display, color: color.text, marginBottom: 4, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 2 },
  subtitle: { ...type.body, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },
  
  timelineList: { flex: 1 },
  timelineContent: { padding: space.xl, paddingTop: 160, paddingBottom: 120 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyTitle: { ...type.title, color: color.textMuted, marginBottom: space.sm, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 1 },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  timelineSpineContainer: { position: 'relative', paddingLeft: 10 },
  spineLine: { position: 'absolute', left: 71, top: 12, bottom: 0, width: 2, backgroundColor: color.lineStrong },

  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xxl, position: 'relative' },
  
  timestampCol: { width: 50, alignItems: 'flex-end', paddingTop: 2 },
  timestamp: { ...type.meta, color: color.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  
  nodeCol: { width: 44, alignItems: 'center', paddingTop: 4 },
  nodeDot: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, borderWidth: 2, borderColor: color.bg },

  eventContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  eventContentDivergence: { backgroundColor: 'rgba(249, 115, 22, 0.05)', borderColor: color.riskLine },
  eventContentResolution: { backgroundColor: 'rgba(15, 118, 110, 0.05)', borderColor: color.joinLine },

  eventText: { ...type.body, color: color.textSecondary, fontSize: 14, lineHeight: 22 },
  eventTextDivergence: { color: color.risk, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  eventTextResolution: { color: color.join, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },

  gateContainer: { alignItems: 'center', marginTop: space.xl },
  gateBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: space.xl, paddingVertical: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, gap: 10, overflow: 'hidden' },
  gateText: { ...type.button, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 1 },
});
