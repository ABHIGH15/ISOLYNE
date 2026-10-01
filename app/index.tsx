import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useKernel } from '../src/presentation/state/KernelContext';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInLeft, FadeInDown, FadeInUp, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { RadarMotif } from '../src/presentation/components/RadarMotif';
import { hasIsolynePro } from '../src/services/purchases';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function MenuRow({ index, title, desc, route, accentColor = color.textMuted }: { index: string, title: string, desc: string, route: string, accentColor?: string }) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value === 1 ? 1 : 0.8
  }));

  return (
    <Pressable 
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(route as any);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${desc}`}
    >
      <Animated.View style={[s.menuRow, animatedStyle]}>
        <View style={s.menuIconWrapper}>
          <Text style={[s.menuIndex, { color: accentColor }]}>{index}</Text>
        </View>
        <View style={s.menuTextContent}>
          <Text style={s.menuTitle}>{title}</Text>
          <Text style={s.menuDesc}>{desc}</Text>
        </View>
        <View style={[s.menuArrow, { backgroundColor: accentColor + '15' }]}>
          <Feather name="arrow-right" size={16} color={accentColor} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

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

  useEffect(() => {
    if (radarState.status === 'attention' && radarState.gap) {
      const gapType = radarState.gap.type;
      if (gapType === 'ownership') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);
      } else if (gapType === 'consensus') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [radarState.status]);
  
  return (
    <View style={s.root}>
      {/* Immersive Radar Background with Glow */}
      <View style={s.radarBgWrapper}>
         <View style={[s.radarGlow, { backgroundColor: statusColor }]} />
         <RadarMotif size={800} status={radarState.status as any} />
      </View>
      
      <LinearGradient
        colors={['transparent', color.bg, color.bg]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.45, 1]}
      />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.header}>
          <View style={s.headerTop}>
            <View style={s.liveBadge}>
               <View style={[s.liveIndicator, { backgroundColor: statusColor, shadowColor: statusColor }]} />
               <Text style={[s.liveText, { color: statusColor }]}>SYS.OP.NORMAL</Text>
            </View>
            {isPro && (
              <View style={s.proBadge}>
                <Text style={s.proText}>PRO ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={s.title} numberOfLines={1} adjustsFontSizeToFit>ISOLYNE</Text>
          
          <View style={s.metricsGrid}>
             <BlurView intensity={20} tint="dark" style={s.metricBox}>
                <Text style={s.metricValue}>{decisions.length}</Text>
                <Text style={s.metricLabel}>ASSUMPTIONS</Text>
             </BlurView>
             <BlurView intensity={20} tint="dark" style={s.metricBox}>
                <Text style={s.metricValue}>{timelineEvents.filter(e => e.type === 'resolution').length}</Text>
                <Text style={s.metricLabel}>RESOLUTIONS</Text>
             </BlurView>
             <BlurView intensity={20} tint="dark" style={s.metricBox}>
                <Text style={s.metricValue}>{roster.length}</Text>
                <Text style={s.metricLabel}>AGENTS</Text>
             </BlurView>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200)} style={s.statusBannerWrapper}>
           <BlurView intensity={30} tint="dark" style={[s.statusBanner, { borderColor: statusColor + '40' }]}>
             <LinearGradient colors={[statusColor + '10', 'transparent']} style={StyleSheet.absoluteFill} />
             <View style={s.statusHeaderRow}>
               <Feather name={isClear ? "check-circle" : "alert-triangle"} size={16} color={statusColor} />
               <Text style={s.statusBannerLabel}>CURRENT DRIFT STATUS</Text>
             </View>
             <Text style={[s.statusBannerTitle, { color: statusColor }]}>
               {isClear ? 'ALIGNMENT: 100%' : 'DIVERGENCE DETECTED'}
             </Text>
             <Text style={s.statusBannerDesc}>
               {isClear ? 'All reality branches are merged. No contradictions found in the current logic tree.' : radarState.gap?.description}
             </Text>
             {!isClear && (
               <Pressable style={s.actionBtn} onPress={() => router.push('/radar' as any)}>
                 <LinearGradient colors={[statusColor, statusColor + '90']} style={s.actionBtnGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                    <Text style={s.actionBtnText}>INITIALIZE RADAR</Text>
                 </LinearGradient>
               </Pressable>
             )}
           </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(300)} style={s.menuList}>
          <MenuRow index="01" title="SPRINT LOG" desc="Voice-to-text sprint assumptions" route="/decisions" accentColor={color.textSecondary} />
          <MenuRow index="02" title="TIMELINE" desc="Cryptographic alignment history" route="/timeline" accentColor={color.textSecondary} />
          <MenuRow index="03" title="ROSTER" desc="Manage network agents" route="/team" accentColor={color.textSecondary} />
          <MenuRow index="04" title="ISOLYNE PRO" desc={isPro ? "Devpost exports active" : "Unlock Devpost exports"} route="/paywall" accentColor={isPro ? color.join : color.caution} />
        </Animated.View>

        <View style={{ height: 120 }} />

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  radarBgWrapper: { position: 'absolute', top: -150, right: -150, opacity: 0.25, transform: [{ scale: 1.2 }] },
  radarGlow: { position: 'absolute', top: 300, left: 300, width: 200, height: 200, borderRadius: 100, filter: 'blur(80px)', opacity: 0.3 },
  scroll: { flex: 1 },
  content: { padding: space.xl, paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 100 },
  
  header: { marginBottom: space.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  liveText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  
  proBadge: { backgroundColor: color.join + '20', borderWidth: 1, borderColor: color.join + '50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  proText: { fontFamily: 'Orbitron', color: color.join, fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  
  title: { color: color.text, fontFamily: 'Orbitron', fontSize: 64, letterSpacing: -2, includeFontPadding: false, marginLeft: -4 },
  
  metricsGrid: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  metricBox: { flex: 1, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' },
  metricValue: { ...type.display, color: color.text, fontSize: 28, fontFamily: 'Orbitron', marginBottom: 4 },
  metricLabel: { ...type.meta, color: color.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },

  statusBannerWrapper: { marginBottom: space.xxl, borderRadius: radius.lg, overflow: 'hidden' },
  statusBanner: { padding: space.xl, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)' },
  statusHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  statusBannerLabel: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, letterSpacing: 1 },
  statusBannerTitle: { ...type.title, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 1, marginBottom: space.sm },
  statusBannerDesc: { ...type.body, color: color.textSecondary, fontSize: 14, lineHeight: 22 },
  actionBtn: { marginTop: space.lg, borderRadius: radius.md, overflow: 'hidden' },
  actionBtnGradient: { paddingVertical: space.md, alignItems: 'center' },
  actionBtnText: { ...type.button, color: '#000', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, letterSpacing: 1.5, fontWeight: '800' },
  
  menuList: { gap: space.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: color.line, borderRadius: radius.lg, padding: space.lg },
  menuIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginRight: space.md },
  menuIndex: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, fontWeight: '800' },
  menuTextContent: { flex: 1 },
  menuTitle: { ...type.title, fontFamily: 'Orbitron', color: color.text, fontSize: 16, letterSpacing: 1, marginBottom: 2 },
  menuDesc: { ...type.body, color: color.textMuted, fontSize: 13 },
  menuArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
