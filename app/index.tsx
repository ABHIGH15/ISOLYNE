import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useKernel } from '../src/presentation/state/KernelContext';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { InteractiveCard } from '../src/presentation/components/InteractiveCard';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const { radarState, roster, userName, decisions, timelineEvents } = useKernel();
  
  return (
    <View style={s.root}>
      {/* HUD Backdrop */}
      <LinearGradient
        colors={[color.bgElevated, color.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
      <Animated.View entering={FadeInUp.duration(600).delay(100).springify()} style={s.header}>
        <View style={s.projectsPill}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.join }} />
          <Text style={s.projectsPillText}>Project: ISOLYNE</Text>
        </View>
        <Text style={s.title}>MISSION CONTROL</Text>
        <Text style={s.subtitle}>Zero Double-Logging Sync Engine</Text>
      </Animated.View>

      {/* Guide section */}
      {decisions.length === 0 && (
        <Animated.View entering={FadeInUp.duration(600).delay(150).springify()} style={s.guideCard}>
          <View style={s.guideHeader}>
            <Text style={s.guideTitle}>INITIALIZATION PROTOCOL</Text>
            <Feather name="info" size={16} color={color.accent} />
          </View>
          <Text style={s.guideBody}>
            Isolyne analyzes your team's intent in the background. Complete the following to establish a sync baseline.
          </Text>
          
          <View style={s.guideSteps}>
            <View style={s.guideStepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
              <View style={{flex: 1}}>
                <Text style={s.stepHeading}>Log a Technical Decision</Text>
                <Text style={s.stepDesc}>State a fact about your stack or architecture.</Text>
                <InteractiveCard style={s.stepActionBtn} onPress={() => router.push('/decisions')}>
                  <Text style={s.stepActionBtnText}>Open Terminal →</Text>
                </InteractiveCard>
              </View>
            </View>
            <View style={s.guideStepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
              <View style={{flex: 1}}>
                <Text style={s.stepHeading}>Invite a Teammate</Text>
                <Text style={s.stepDesc}>Add a second perspective to form a reality consensus.</Text>
                <InteractiveCard style={s.stepActionBtn} onPress={() => router.push('/team')}>
                  <Text style={s.stepActionBtnText}>Manage Roster →</Text>
                </InteractiveCard>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={s.statusWidget}>
        <View style={s.statusHeader}>
          <Text style={s.widgetTitle}>System Alignment</Text>
          <View style={[s.badge, radarState.status === 'clear' ? s.badgeClear : s.badgeAlert]}>
            <Text style={s.badgeText}>
              {radarState.status === 'clear' ? 'ALL CLEAR' : 'DRIFT DETECTED'}
            </Text>
          </View>
        </View>
        
        <Text style={s.widgetDesc}>
          {radarState.status === 'clear' 
            ? "Your team is fully aligned. All structural constraints match across branches."
            : `A gap was detected in ${radarState.gap?.topic}. Immediate resolution required to unblock sync.`}
        </Text>

        <InteractiveCard style={s.widgetBtn} onPress={() => router.push('/radar')}>
          <Text style={s.widgetBtnText}>Open Radar</Text>
          <Feather name="arrow-right" size={16} color={color.textOnAccent} />
        </InteractiveCard>

        <View style={s.statsRow}>
          <Text style={s.statsText}>
            <Text style={{ fontWeight: '700', color: color.text }}>{decisions.length}</Text> decisions tracked · <Text style={{ fontWeight: '700', color: color.text }}>{timelineEvents.filter(e => e.type === 'resolution').length}</Text> conflicts resolved
          </Text>
          <Text style={s.statsAlignment}>
            Team alignment: <Text style={{ fontWeight: '700', color: radarState.status === 'clear' ? color.join : color.risk }}>{radarState.status === 'clear' ? '100%' : 'Drifting'}</Text>
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(300).springify()} style={s.grid}>
        <InteractiveCard style={s.gridCard} onPress={() => router.push('/decisions')}>
          <Feather name="message-square" size={24} color={color.accent} style={s.cardIcon} />
          <Text style={s.cardTitle}>Decisions</Text>
          <Text style={s.cardDesc}>Log assumptions and choices in natural language.</Text>
        </InteractiveCard>
        
        <InteractiveCard style={s.gridCard} onPress={() => router.push('/timeline')}>
          <Feather name="clock" size={24} color={color.accent} style={s.cardIcon} />
          <Text style={s.cardTitle}>Timeline</Text>
          <Text style={s.cardDesc}>The shared history of how we built this.</Text>
        </InteractiveCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(400).springify()} style={s.rosterWidget}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.widgetTitle}>Active Roster</Text>
          <InteractiveCard 
            onPress={() => router.push('/team')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Manage Team"
          >
            <Text style={s.manageTeamLink}>Manage Team →</Text>
          </InteractiveCard>
        </View>
        <Text style={s.rosterCount}>{roster.length} Members</Text>
        <View style={s.rosterList}>
          {roster.map((member, i) => (
            <View key={i} style={[s.rosterPill, member === userName && s.rosterPillSelf]}>
              <Feather name={member === userName ? "user-check" : "user"} size={14} color={member === userName ? color.join : color.textSecondary} />
              <Text style={[s.rosterName, member === userName && { color: color.join }]}>
                {member} {member === userName ? '(You)' : ''}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(500).springify()} style={s.proWidget}>
         <Feather name="unlock" size={16} color={color.caution} />
         <View style={{flex: 1}}>
           <Text style={s.proTitle}>Upgrade to Isolyne Pro</Text>
           <Text style={s.proDesc}>Unlock your full collaboration history — because knowing how you shipped is as valuable as what you shipped.</Text>
         </View>
         <InteractiveCard style={s.proBtn} onPress={() => router.push('/paywall')}>
           <Text style={s.proBtnText}>Upgrade</Text>
         </InteractiveCard>
      </Animated.View>

      <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  scroll: { flex: 1 },
  content: { padding: space.xl, paddingBottom: 100, gap: space.xl },
  
  header: { marginBottom: space.md, marginTop: space.lg },
  title: { ...type.display, color: color.text, fontFamily: 'Orbitron', letterSpacing: 2 },
  subtitle: { ...type.label, color: color.accent, marginTop: 4, letterSpacing: 2 },
  projectsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.glass, borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, alignSelf: 'flex-start' },
  projectsPillText: { ...type.label, color: color.accent, fontSize: 11 },

  guideCard: { backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.accent, borderRadius: radius.lg, padding: space.xl },
  guideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  guideTitle: { ...type.meta, color: color.accent, fontWeight: '700' },
  guideBody: { ...type.body, color: color.textSecondary, marginBottom: space.lg, fontSize: 13 },
  guideSteps: { gap: space.md },
  guideStepRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: color.accentDim, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { ...type.label, color: color.accent, fontSize: 11 },
  stepHeading: { ...type.bodyStrong, color: color.text, fontSize: 14, marginBottom: 2 },
  stepDesc: { ...type.meta, color: color.textMuted, fontSize: 12, marginBottom: 6 },
  stepActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  stepActionBtnText: { ...type.meta, color: color.accent, fontSize: 12, fontWeight: '700' },

  statusWidget: { backgroundColor: color.glass, padding: space.xl, borderRadius: radius.xl, borderWidth: 1, borderColor: color.lineHighlight, shadowColor: color.accent, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 30 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  widgetTitle: { ...type.title, color: color.text },
  badge: { paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeClear: { backgroundColor: color.joinSoft },
  badgeAlert: { backgroundColor: color.riskSoft },
  badgeText: { ...type.label, color: color.text, fontWeight: '700' },
  widgetDesc: { ...type.body, color: color.textSecondary, marginBottom: space.lg },
  widgetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, backgroundColor: color.text, paddingVertical: space.md, borderRadius: radius.pill },
  widgetBtnText: { ...type.button, color: color.bg },

  statsRow: { marginTop: space.lg, paddingTop: space.md, borderTopWidth: 1, borderColor: color.lineStrong, gap: 4 },
  statsText: { ...type.meta, color: color.textSecondary, fontSize: 11, textAlign: 'center' },
  statsAlignment: { ...type.meta, color: color.textSecondary, fontSize: 11, textAlign: 'center' },

  grid: { flexDirection: 'row', gap: space.md },
  gridCard: { flex: 1, backgroundColor: color.glass, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: color.lineStrong },
  cardIcon: { marginBottom: space.md },
  cardTitle: { ...type.meta, color: color.text, marginBottom: 4 },
  cardDesc: { ...type.body, color: color.textMuted, fontSize: 13 },

  rosterWidget: { backgroundColor: color.glass, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: color.lineStrong },
  manageTeamLink: { ...type.meta, color: color.accent, fontSize: 12, fontWeight: '700' },
  rosterCount: { ...type.meta, color: color.accent },
  rosterList: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  rosterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent', paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  rosterPillSelf: { backgroundColor: color.joinSoft, borderColor: color.joinLine },
  rosterName: { ...type.meta, color: color.textSecondary },

  proWidget: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.cautionSoft, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: color.cautionLine },
  proTitle: { ...type.meta, color: color.caution },
  proDesc: { ...type.label, color: color.caution, opacity: 0.8, marginTop: 2 },
  proBtn: { backgroundColor: color.caution, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  proBtnText: { ...type.button, color: color.bgElevated }
});
