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
      respondToProposal(userName, 'agree', radarState.proposal.id, radarState.gap.id, choice);
    }
  };

  const handleAssignOwner = (member: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (radarState.proposal && radarState.gap) {
      respondToProposal(userName, 'agree', radarState.proposal.id, radarState.gap.id, member);
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
      
      <Animated.View entering={FadeIn.duration(800)} style={s.topBar}>
        <Text style={s.projectName}>PROJECT: ISOLYNE</Text>
      </Animated.View>

      <RadarMotif status={radarState.status as any} />

      {radarState.status === 'clear' ? (
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={s.statusCenter}>
          <Text style={s.statusTitle}>ALL CLEAR</Text>
          <Text style={s.statusBody}>No architectural drift detected.</Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInUp.duration(600).springify()} style={s.radarCenter}>
          <Text style={s.radarTitle}>DRIFT DETECTED</Text>
          <View style={s.radarCard}>
            
            <Text style={s.gapTopic}>{radarState.gap?.topic}</Text>
            <Text style={s.gapBody}>{radarState.gap?.description}</Text>

            {radarState.gap?.evidence && radarState.gap.evidence.length > 0 && (
              <View style={s.evidenceList}>
                {radarState.gap?.evidence?.map((ev, i) => (
                  <View key={i} style={s.evidenceRow}>
                    <Text style={s.evidenceActor}>{ev.actorId}</Text>
                    <View style={s.evidenceContent}>
                      {ev.verbatim ? (
                        <Text style={s.evidenceVerbatim}>"{ev.verbatim}"</Text>
                      ) : null}
                      <Text style={s.evidenceChoice}>Stated choice: {ev.choice}</Text>
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
                        <Text style={s.btnResolveText}>
                          {member === userName ? `Claim (${member})` : `Assign ${member}`}
                        </Text>
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
                        <Text style={s.btnResolveText}>{opt}</Text>
                      </InteractiveCard>
                    ))
                  )}
                  <InteractiveCard 
                    style={s.btnDiscuss} 
                    onPress={handleDiscuss}
                    accessibilityRole="button"
                    accessibilityLabel="Discuss this gap"
                  >
                    <Text style={s.btnDiscussText}>Discuss</Text>
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

          </View>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg, padding: space.xl, justifyContent: 'center', alignItems: 'center' },
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: space.xl, right: space.xl, flexDirection: 'row', justifyContent: 'center', zIndex: 10 },
  projectName: { ...type.label, color: color.textSecondary, letterSpacing: 1 },
  
  statusCenter: { alignItems: 'center', paddingHorizontal: space.xl, position: 'absolute', zIndex: 5 },
  statusTitle: { ...type.display, color: color.text, marginBottom: space.sm, letterSpacing: 4, fontFamily: 'Orbitron', fontSize: 32 },
  statusBody: { ...type.body, color: color.textSecondary, textAlign: 'center' },

  radarCenter: { width: '100%', maxWidth: 500, alignSelf: 'center', position: 'absolute', bottom: Platform.OS === 'ios' ? 120 : 100, zIndex: 20 },
  radarTitle: { ...type.risk, color: color.risk, marginBottom: space.lg, letterSpacing: 1, textAlign: 'center' },
  
  radarCard: { backgroundColor: color.glass, borderWidth: 1, borderColor: color.riskLine, borderRadius: radius.xl, padding: space.xl, width: '100%', shadowColor: color.risk, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  gapTopic: { ...type.meta, color: color.textSecondary, marginBottom: space.md, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Orbitron' },
  gapBody: { ...type.body, color: color.risk, marginBottom: space.md },
  
  evidenceList: { marginBottom: space.xl, gap: space.md, backgroundColor: 'transparent', padding: space.md, borderRadius: radius.sm, borderWidth: 1, borderColor: color.lineStrong },
  evidenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingBottom: space.md, borderBottomWidth: 1, borderColor: color.line },
  evidenceActor: { ...type.label, color: color.textSecondary, width: 80, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  evidenceContent: { flex: 1, gap: 4 },
  evidenceVerbatim: { ...type.body, color: color.text, fontStyle: 'italic' },
  evidenceChoice: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  
  proposalBox: { borderTopWidth: 1, borderColor: color.lineStrong, paddingTop: space.xl },
  proposalDesc: { ...type.meta, color: color.textSecondary, marginBottom: space.md },
  
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  btnResolve: { backgroundColor: color.glass, borderWidth: 1, borderColor: color.risk, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, alignItems: 'center' },
  btnResolveText: { ...type.button, color: color.risk },
  
  btnDiscuss: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, alignItems: 'center' },
  btnDiscussText: { ...type.button, color: color.textSecondary },

  momentOfDoubtBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.lg, paddingTop: space.md, borderTopWidth: 1, borderColor: color.lineStrong },
  momentOfDoubtText: { ...type.meta, color: color.textSecondary, fontSize: 11, flex: 1 },
  momentOfDoubtLink: { color: color.caution, fontWeight: '700' },
});
