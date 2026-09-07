import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';

export default function ProjectHomeScreen() {
  const router = useRouter();
  const { radarState, roster, userName, simulateIncomingBob, isReceiving, activeProject } = useKernel();
  const [guideDismissed, setGuideDismissed] = React.useState(false);

  const handleSimulateConflict = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    simulateIncomingBob('Database', 'MongoDB', `Let's use Mongo for the prototype database.`);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      
      <View style={s.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{activeProject?.name || 'Shipaton 2026'}</Text>
            <Text style={s.subtitle}>Project Hub</Text>
          </View>
          <Pressable 
            style={s.projectsPill} 
            onPress={() => router.push('/projects')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Switch Project"
          >
            <Feather name="folder" size={13} color={color.accent} />
            <Text style={s.projectsPillText}>Projects</Text>
          </Pressable>
        </View>
      </View>

      {/* §3.5 Guided First-Decision Walkthrough */}
      {!guideDismissed && (
        <View style={s.guideCard}>
          <View style={s.guideHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="compass" size={18} color={color.accent} />
              <Text style={s.guideTitle}>Guided First Run · Experience the Catch</Text>
            </View>
            <Pressable onPress={() => setGuideDismissed(true)} hitSlop={8}>
              <Feather name="x" size={16} color={color.textMuted} />
            </Pressable>
          </View>
          <Text style={s.guideBody}>
            Isolyne watches for silent misalignment across your team. Try the 3-step loop:
          </Text>

          <View style={s.guideSteps}>
            <View style={s.guideStepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepHeading}>Log an assumption</Text>
                <Text style={s.stepDesc}>State what you are building in plain English.</Text>
                <Pressable style={s.stepActionBtn} onPress={() => router.push('/decisions')}>
                  <Text style={s.stepActionBtnText}>Go to Decisions Channel →</Text>
                </Pressable>
              </View>
            </View>

            <View style={s.guideStepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepHeading}>Simulate teammate disagreement</Text>
                <Text style={s.stepDesc}>Trigger an incoming teammate decision on the same topic.</Text>
                <Pressable 
                  style={[s.stepActionBtn, isReceiving && { opacity: 0.5 }]} 
                  onPress={handleSimulateConflict}
                  disabled={isReceiving}
                >
                  <Feather name="zap" size={14} color={color.risk} />
                  <Text style={[s.stepActionBtnText, { color: color.risk }]}>
                    {isReceiving ? 'Simulating incoming...' : 'Trigger Teammate Conflict'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={s.guideStepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepHeading}>Watch the Radar catch it</Text>
                <Text style={s.stepDesc}>Inspect the verbatim evidence and align in one tap.</Text>
                <Pressable style={s.stepActionBtn} onPress={() => router.push('/radar')}>
                  <Text style={s.stepActionBtnText}>View Radar Status →</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={s.statusWidget}>
        <View style={s.statusHeader}>
          <Text style={s.widgetTitle}>Radar Status</Text>
          <View style={[s.badge, radarState.status === 'clear' ? s.badgeClear : s.badgeAlert]}>
            <Text style={s.badgeText}>{radarState.status === 'clear' ? 'ALL CLEAR' : 'DRIFT DETECTED'}</Text>
          </View>
        </View>
        <Text style={s.widgetDesc}>
          {radarState.status === 'clear' 
            ? "Your team's shared reality is perfectly aligned." 
            : radarState.gap?.title || "A silent divergence needs your attention."}
        </Text>
        <Pressable style={s.widgetBtn} onPress={() => router.push('/radar')}>
          <Text style={s.widgetBtnText}>Open Radar</Text>
          <Feather name="arrow-right" size={16} color={color.textOnAccent} />
        </Pressable>
      </View>

      <View style={s.grid}>
        
        <Pressable style={s.gridCard} onPress={() => router.push('/decisions')}>
          <Feather name="message-square" size={24} color={color.accent} style={s.cardIcon} />
          <Text style={s.cardTitle}>Decisions</Text>
          <Text style={s.cardDesc}>Log assumptions and choices in natural language.</Text>
        </Pressable>
        
        <Pressable style={s.gridCard} onPress={() => router.push('/timeline')}>
          <Feather name="clock" size={24} color={color.accent} style={s.cardIcon} />
          <Text style={s.cardTitle}>Timeline</Text>
          <Text style={s.cardDesc}>The shared history of how we built this.</Text>
        </Pressable>

      </View>

      <View style={s.rosterWidget}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.widgetTitle}>Active Roster</Text>
          <Pressable 
            onPress={() => router.push('/team')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Manage Team"
          >
            <Text style={s.manageTeamLink}>Manage Team →</Text>
          </Pressable>
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
      </View>

      <View style={s.proWidget}>
         <Feather name="unlock" size={16} color={color.caution} />
         <View style={{flex: 1}}>
           <Text style={s.proTitle}>Upgrade to Isolyne Pro</Text>
           <Text style={s.proDesc}>Unlock your full collaboration history — because knowing how you shipped is as valuable as what you shipped.</Text>
         </View>
         <Pressable style={s.proBtn} onPress={() => router.push('/paywall')}>
           <Text style={s.proBtnText}>Upgrade</Text>
         </Pressable>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  content: { padding: space.xl, paddingBottom: 100, gap: space.xl },
  
  header: { marginBottom: space.sm },
  title: { ...type.display, color: color.text },
  subtitle: { ...type.body, color: color.textSecondary, marginTop: 4 },
  projectsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, alignSelf: 'flex-start' },
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

  statusWidget: { backgroundColor: color.bgElevated, padding: space.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: color.lineStrong },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  widgetTitle: { ...type.title, color: color.text },
  badge: { paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeClear: { backgroundColor: color.joinSoft },
  badgeAlert: { backgroundColor: color.riskSoft },
  badgeText: { ...type.label, color: color.text },
  widgetDesc: { ...type.body, color: color.textSecondary, marginBottom: space.lg },
  widgetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, backgroundColor: color.accent, paddingVertical: space.md, borderRadius: radius.pill },
  widgetBtnText: { ...type.button, color: color.textOnAccent },

  grid: { flexDirection: 'row', gap: space.md },
  gridCard: { flex: 1, backgroundColor: color.bgQuiet, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  cardIcon: { marginBottom: space.md },
  cardTitle: { ...type.meta, color: color.text, marginBottom: 4 },
  cardDesc: { ...type.body, color: color.textMuted, fontSize: 13 },

  rosterWidget: { backgroundColor: color.bgQuiet, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  manageTeamLink: { ...type.meta, color: color.accent, fontSize: 12, fontWeight: '700' },
  rosterCount: { ...type.meta, color: color.accent },
  rosterList: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  rosterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.bgElevated, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  rosterPillSelf: { backgroundColor: color.joinSoft, borderColor: color.joinLine },
  rosterName: { ...type.meta, color: color.textSecondary },

  proWidget: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.cautionSoft, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: color.cautionLine },
  proTitle: { ...type.meta, color: color.caution },
  proDesc: { ...type.label, color: color.caution, opacity: 0.8, marginTop: 2 },
  proBtn: { backgroundColor: color.caution, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  proBtnText: { ...type.button, color: color.bgElevated }
});
