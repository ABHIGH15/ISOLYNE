import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useKernel } from '../src/presentation/state/KernelContext';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInLeft, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RadarMotif } from '../src/presentation/components/RadarMotif';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function MenuRow({ index, title, desc, route, accentColor = color.textMuted }: { index: string, title: string, desc: string, route: string, accentColor?: string }) {
  const router = useRouter();
  return (
    <Pressable 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(route as any);
      }}
      style={({ pressed }) => [
        { paddingVertical: space.xl, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.5 : 1 }
      ]}
    >
      <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: accentColor, fontSize: 12, marginRight: space.lg }}>[{index}]</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ ...type.title, fontFamily: 'Orbitron', color: color.text, fontSize: 18, letterSpacing: 2, marginBottom: 4 }}>{title}</Text>
        <Text style={{ ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 }}>{desc.toUpperCase()}</Text>
      </View>
      <Feather name="arrow-up-right" size={20} color={accentColor} />
    </Pressable>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { hasIsolynePro } from '../src/services/purchases';

export default function HomeScreen() {
  const router = useRouter();
  const { radarState, roster, userName, decisions, timelineEvents } = useKernel();
  const isClear = radarState.status === 'clear';
  const statusColor = isClear ? color.join : color.risk;
  const [isPro, setIsPro] = useState(false);

  useFocusEffect(
    useCallback(() => {
      hasIsolynePro().then(status => setIsPro(status));
    }, [])
  );

  // Haptic Triage: Feel the gap type before looking at the screen
  useEffect(() => {
    if (radarState.status === 'divergence_detected' && radarState.activeGaps?.length) {
      const gapType = radarState.activeGaps[0].type;
      if (gapType === 'ownership') {
        // 3 fast light taps for ownership missing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);
      } else if (gapType === 'consensus') {
        // 1 heavy thud for semantic contradiction
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [radarState.status]);
  
  return (
    <View style={s.root}>
      {/* Immersive Radar Background */}
      <View style={{ position: 'absolute', top: -150, right: -150, opacity: 0.15, transform: [{ scale: 1.2 }] }}>
         <RadarMotif size={800} status={radarState.status as any} />
      </View>
      
      <LinearGradient
        colors={['transparent', color.bg, color.bg]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.4, 1]}
      />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
               <View style={[s.liveIndicator, { backgroundColor: statusColor, shadowColor: statusColor }]} />
               <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: statusColor, fontSize: 12, letterSpacing: 1 }}>
                 SYS.OP.NORMAL
               </Text>
            </View>
            {isPro && (
              <View style={{ backgroundColor: color.join, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                <Text style={{ fontFamily: 'Orbitron', color: '#000', fontSize: 10, letterSpacing: 1 }}>PRO ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={s.title} numberOfLines={1} adjustsFontSizeToFit>ISOLYNE</Text>
          
          <View style={s.metricsGrid}>
             <View style={s.metricBox}>
                <Text style={s.metricValue}>{decisions.length}</Text>
                <Text style={s.metricLabel}>ASSUMPTIONS</Text>
             </View>
             <View style={s.metricBox}>
                <Text style={s.metricValue}>{timelineEvents.filter(e => e.type === 'resolution').length}</Text>
                <Text style={s.metricLabel}>RESOLUTIONS</Text>
             </View>
             <View style={s.metricBox}>
                <Text style={s.metricValue}>{roster.length}</Text>
                <Text style={s.metricLabel}>AGENTS</Text>
             </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200)} style={s.statusBanner}>
           <Text style={s.statusBannerLabel}>CURRENT DRIFT STATUS</Text>
           <Text style={[s.statusBannerTitle, { color: statusColor }]}>
             {isClear ? 'ALIGNMENT: 100%' : 'DIVERGENCE DETECTED'}
           </Text>
           <Text style={s.statusBannerDesc}>
             {isClear ? 'All reality branches are merged. No contradictions found in the current logic tree.' : radarState.gap?.description}
           </Text>
           {!isClear && (
             <Pressable style={[s.actionBtn, { borderColor: statusColor }]} onPress={() => router.push('/radar' as any)}>
               <Text style={[s.actionBtnText, { color: statusColor }]}>INITIALIZE RADAR</Text>
             </Pressable>
           )}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(300)}>
          <MenuRow index="01" title="SPRINT LOG" desc="Voice-to-text sprint assumptions" route="/decisions" />
          <MenuRow index="02" title="TIMELINE" desc="Cryptographic alignment history" route="/timeline" />
          <MenuRow index="03" title="ROSTER" desc="Manage network agents" route="/team" />
          <MenuRow index="04" title="ISOLYNE PRO" desc={isPro ? "Devpost exports active" : "Unlock Devpost exports"} route="/paywall" accentColor={isPro ? color.join : color.caution} />
        </Animated.View>

        <View style={{ height: 120 }} />

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  scroll: { flex: 1 },
  content: { padding: space.xl, paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 100 },
  
  header: { marginBottom: space.xl },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  title: { color: color.text, fontFamily: 'Orbitron', fontSize: 64, letterSpacing: -2, includeFontPadding: false, marginLeft: -4 },
  
  metricsGrid: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  metricBox: { flex: 1, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingTop: space.sm },
  metricValue: { ...type.display, color: color.text, fontSize: 32, fontFamily: 'Orbitron' },
  metricLabel: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },

  statusBanner: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: space.xl, borderRadius: radius.md, marginBottom: space.xl },
  statusBannerLabel: { ...type.meta, color: color.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1, marginBottom: space.sm },
  statusBannerTitle: { ...type.title, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 1, marginBottom: space.sm },
  statusBannerDesc: { ...type.body, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, lineHeight: 18 },
  actionBtn: { marginTop: space.lg, borderWidth: 1, paddingVertical: space.md, alignItems: 'center', borderRadius: 4 },
  actionBtnText: { ...type.button, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 1 },
});
