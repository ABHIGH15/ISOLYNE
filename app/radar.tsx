import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';
import { RadarMotif } from '../src/presentation/components/RadarMotif';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { InteractiveCard } from '../src/presentation/components/InteractiveCard';
import { BlurView } from 'expo-blur';

export default function RadarScreen() {
  const router = useRouter();
  const { radarState, respondToProposal, roster, userName } = useKernel();

  useFocusEffect(
    useCallback(() => {
    }, [])
  );

  const handleResolve = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (radarState.proposal && radarState.gap) {
      respondToProposal(userName, 'agree', radarState.proposal.id, radarState.gap.id, {
        type: radarState.gap.type.replace('_gap', ''),
        topic: radarState.gap.topic,
        choice
      });
    }
  };

  const handleAssignOwner = (member: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (radarState.proposal && radarState.gap) {
      respondToProposal(userName, 'agree', radarState.proposal.id, radarState.gap.id, {
        type: 'ownership',
        ownerId: member
      });
    }
  };

  const handleDiscuss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/decisions');
  };

  return (
    <View style={s.root}>
      <LinearGradient
        colors={[color.bgElevated, color.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />
      
      {radarState.status === 'attention' && (
        <View style={s.dangerGlow} />
      )}

      <Animated.View entering={FadeIn.duration(800)} style={s.topBar}>
        <Text style={s.projectName}>ISOLYNE / RADAR</Text>
      </Animated.View>

      <RadarMotif status={radarState.status as any} />

      {radarState.status === 'clear' ? (
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={s.statusCenter}>
          <Feather name="shield" size={32} color={color.join} style={{ marginBottom: space.md }} />
          <Text style={s.statusTitle}>ALL CLEAR</Text>
          <Text style={s.statusBody}>No architectural drift detected across squad topology.</Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInUp.duration(600).springify()} style={s.radarCenter}>
          <BlurView intensity={60} tint="dark" style={s.radarCard}>
            <LinearGradient colors={['rgba(249, 115, 22, 0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
            
            <View style={s.cardHeaderRow}>
               <View style={s.pulseDot} />
               <Text style={s.radarTitle}>DRIFT DETECTED</Text>
            </View>

            <Text style={s.gapTopic}>{radarState.gap?.topic}</Text>
            <Text style={s.gapBody}>{radarState.gap?.description}</Text>

            {radarState.gap?.evidence && radarState.gap.evidence.length > 0 && (
              <View style={s.evidenceList}>
                {radarState.gap?.evidence?.map((ev, i) => (
                  <View key={i} style={s.evidenceRow}>
                    <Text style={s.evidenceActor}>@{ev.actorId}</Text>
                    <View style={s.evidenceContent}>
                      {ev.verbatim ? (
                        <Text style={s.evidenceVerbatim}>"{ev.verbatim}"</Text>
                      ) : null}
                      <Text style={s.evidenceChoice}>→ {ev.choice}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {radarState.proposal && (
              <View style={s.proposalBox}>
                <Text style={s.proposalDesc}>{radarState.proposal.description}</Text>
                <View style={s.optionsRow}>
                  {radarState.gap?.type === 'ownership_gap' ? (
                    (roster.length > 0 ? roster : [userName]).map((member, i) => (
                      <InteractiveCard 
                        key={i} 
                        style={s.btnResolve} 
                        onPress={() => handleAssignOwner(member)}
                        accessibilityRole="button"
                        accessibilityLabel={`Assign ownership to ${member}`}
                      >
                        <LinearGradient colors={[color.risk, color.riskLine]} style={s.btnGradient}>
                           <Text style={s.btnResolveText}>
                             {member === userName ? `Claim (${member})` : `Assign ${member}`}
                           </Text>
                        </LinearGradient>
                      </InteractiveCard>
                    ))
                  ) : (
                    radarState.proposal.options?.map((opt, i) => (
                      <InteractiveCard 
                        key={i} 
                        style={s.btnResolve} 
                        onPress={() => handleResolve(opt)}
                        accessibilityRole="button"
                        accessibilityLabel={`Resolve by choosing ${opt}`}
                      >
                        <LinearGradient colors={['rgba(249, 115, 22, 0.1)', 'rgba(249, 115, 22, 0.05)']} style={s.btnGradient}>
                           <Text style={s.btnResolveText}>{opt}</Text>
                        </LinearGradient>
                      </InteractiveCard>
                    ))
                  )}
                  <InteractiveCard 
                    style={s.btnDiscuss} 
                    onPress={handleDiscuss}
                    accessibilityRole="button"
                    accessibilityLabel="Discuss this gap"
                  >
                    <Text style={s.btnDiscussText}>DISCUSS</Text>
                  </InteractiveCard>
                </View>
              </View>
            )}

            <InteractiveCard 
              style={s.momentOfDoubtBox}
              onPress={() => {
                router.push({
                  pathname: '/paywall',
                  params: { 
                    source: 'moment_of_doubt',
                    topic: radarState.gap?.topic ?? 'Architecture'
                  }
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Preserve resolution history in Isolyne Pro"
            >
              <Feather name="shield" size={13} color={color.caution} />
              <Text style={s.momentOfDoubtText}>
                Free forever: drift detection. <Text style={s.momentOfDoubtLink}>Preserve this evidence trail in Pro →</Text>
              </Text>
            </InteractiveCard>

          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg, padding: space.xl, justifyContent: 'center', alignItems: 'center' },
  dangerGlow: { position: 'absolute', top: '20%', width: '150%', height: '80%', backgroundColor: color.risk, filter: 'blur(200px)', opacity: 0.1 },
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: space.xl, right: space.xl, flexDirection: 'row', justifyContent: 'center', zIndex: 10 },
  projectName: { ...type.label, color: color.textSecondary, letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  
  statusCenter: { alignItems: 'center', paddingHorizontal: space.xl, position: 'absolute', zIndex: 5 },
  statusTitle: { ...type.display, color: color.text, marginBottom: space.sm, letterSpacing: 4, fontFamily: 'Orbitron', fontSize: 28 },
  statusBody: { ...type.body, color: color.textMuted, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  radarCenter: { width: '100%', maxWidth: 500, alignSelf: 'center', position: 'absolute', bottom: Platform.OS === 'ios' ? 120 : 100, zIndex: 20 },
  
  radarCard: { backgroundColor: 'rgba(12, 14, 22, 0.4)', borderWidth: 1, borderColor: color.riskLine, borderRadius: radius.xl, padding: space.xl, width: '100%', overflow: 'hidden' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.lg },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.risk, shadowColor: color.risk, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  radarTitle: { ...type.risk, color: color.risk, letterSpacing: 1, fontFamily: 'Orbitron', fontSize: 18 },
  
  gapTopic: { ...type.meta, color: color.text, marginBottom: space.xs, textTransform: 'uppercase', letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  gapBody: { ...type.body, color: color.textSecondary, marginBottom: space.lg, lineHeight: 22 },
  
  evidenceList: { marginBottom: space.xl, gap: space.sm, backgroundColor: 'rgba(0,0,0,0.4)', padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  evidenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingBottom: space.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  evidenceActor: { ...type.label, color: color.textMuted, width: 70, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },
  evidenceContent: { flex: 1, gap: 4 },
  evidenceVerbatim: { ...type.body, color: color.text, fontStyle: 'italic', fontSize: 14 },
  evidenceChoice: { ...type.meta, color: color.risk, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, fontWeight: '700' },
  
  proposalBox: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingTop: space.xl },
  proposalDesc: { ...type.meta, color: color.textSecondary, marginBottom: space.md, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  btnResolve: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: color.riskLine },
  btnGradient: { paddingHorizontal: space.lg, paddingVertical: space.md, alignItems: 'center', justifyContent: 'center' },
  btnResolveText: { ...type.button, color: color.risk, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 1 },
  
  btnDiscuss: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnDiscussText: { ...type.button, color: color.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 1 },

  momentOfDoubtBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xl, paddingTop: space.md, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  momentOfDoubtText: { ...type.meta, color: color.textMuted, fontSize: 10, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  momentOfDoubtLink: { color: color.caution, fontWeight: '700' },
});
