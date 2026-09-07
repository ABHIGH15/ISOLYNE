import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, LayoutAnimation, Platform, UIManager, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';
import { RadarMotif } from '../src/presentation/components/RadarMotif';
import { AnimatedPressable } from '../src/presentation/components/AnimatedPressable';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function RadarScreen() {
  const router = useRouter();
  const { radarState, respondToProposal, activeActor, simulateIncomingBob, roster, userName } = useKernel();
  const [showEvidence, setShowEvidence] = useState(false);

  const handleResolve = (choice: string) => {
    if (!radarState.proposal || !radarState.gap || !radarState.gap.topic) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    respondToProposal(
      activeActor, 
      'agree', 
      radarState.proposal.id, 
      radarState.gap.id, 
      { type: 'consensus', topic: radarState.gap.topic, choice }
    );
  };

  const handleAssignOwner = (ownerId: string) => {
    if (!radarState.proposal || !radarState.gap) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    respondToProposal(
      activeActor, 
      'agree', 
      radarState.proposal.id, 
      radarState.gap.id, 
      { type: 'ownership', ownerId }
    );
  };

  const handleDiscuss = () => {
    if (!radarState.proposal || !radarState.gap) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    respondToProposal(
      activeActor,
      'challenge',
      radarState.proposal.id,
      radarState.gap.id
    );
  };

  const toggleEvidence = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowEvidence(!showEvidence);
  };

  const handleMagicTrigger = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    simulateIncomingBob();
  };

  return (
    <View style={s.root}>
      <Pressable 
        style={s.topBar}
        onLongPress={handleMagicTrigger}
        delayLongPress={1500}
      >
        <Text style={s.projectName}>ISOLYNE</Text>
      </Pressable>

      <RadarMotif status={radarState.status === 'clear' ? 'clear' : 'alert'} />

      {radarState.status === 'clear' ? (
        <View style={s.statusCenter}>
          <Text style={s.statusTitle}>ALL CLEAR</Text>
          <Text style={s.statusBody}>Isolyne is watching your team's decisions silently. Nothing needs your attention.</Text>
        </View>
      ) : (
        <View style={s.radarCenter}>
          <Text style={s.radarTitle}>{radarState.gap?.title}</Text>
          
          <View style={s.radarCard}>
            <Text style={s.gapTopic}>{radarState.gap?.topic}</Text>
            
            <Text style={s.gapBody}>{radarState.gap?.description}</Text>
            
            <Pressable 
              style={s.evidenceToggle} 
              onPress={toggleEvidence}
              accessibilityRole="button"
              accessibilityLabel={showEvidence ? 'Hide Evidence' : 'View Evidence'}
            >
              <Feather name={showEvidence ? "chevron-up" : "chevron-down"} size={16} color={color.accent} />
              <Text style={s.evidenceToggleText}>{showEvidence ? 'Hide Evidence' : 'View Evidence'}</Text>
            </Pressable>
            
            {showEvidence && (
              <View style={s.evidenceList} accessible={true} accessibilityLabel="Evidence details">
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
                      <AnimatedPressable 
                        key={i} 
                        style={s.btnResolve} 
                        onPress={() => handleAssignOwner(member)}
                        accessibilityRole="button"
                        accessibilityLabel={`Assign ownership to ${member}`}
                      >
                        <Text style={s.btnResolveText}>
                          {member === userName ? `Claim (${member})` : `Assign ${member}`}
                        </Text>
                      </AnimatedPressable>
                    ))
                  ) : (
                    radarState.proposal.options?.map((opt, i) => (
                      <AnimatedPressable 
                        key={i} 
                        style={s.btnResolve} 
                        onPress={() => handleResolve(opt)}
                        accessibilityRole="button"
                        accessibilityLabel={`Resolve by choosing ${opt}`}
                      >
                        <Text style={s.btnResolveText}>{opt}</Text>
                      </AnimatedPressable>
                    ))
                  )}
                  <AnimatedPressable 
                    style={s.btnDiscuss} 
                    onPress={handleDiscuss}
                    accessibilityRole="button"
                    accessibilityLabel="Discuss this gap"
                  >
                    <Text style={s.btnDiscussText}>Discuss</Text>
                  </AnimatedPressable>
                </View>
              </View>
            )}

            {/* Moment of Doubt Pro Anchor */}
            <Pressable 
              style={s.momentOfDoubtBox}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            </Pressable>

          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg, padding: space.xl, justifyContent: 'center', alignItems: 'center' },
  topBar: { position: 'absolute', top: space.xl, left: space.xl, right: space.xl, flexDirection: 'row', justifyContent: 'center' },
  projectName: { ...type.label, color: color.textSecondary, letterSpacing: 1 },
  
  statusCenter: { alignItems: 'center', paddingHorizontal: space.xl },
  statusTitle: { ...type.display, color: color.text, marginBottom: space.sm, letterSpacing: 2 },
  statusBody: { ...type.body, color: color.textSecondary, textAlign: 'center' },

  radarCenter: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  radarTitle: { ...type.risk, color: color.risk, marginBottom: space.lg, letterSpacing: 1, textAlign: 'center' },
  
  radarCard: { backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.riskLine, borderRadius: radius.lg, padding: space.xl, width: '100%' },
  gapTopic: { ...type.meta, color: color.textSecondary, marginBottom: space.md, textTransform: 'uppercase', letterSpacing: 1 },
  gapBody: { ...type.body, color: color.risk, marginBottom: space.md },
  
  evidenceToggle: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: space.sm, marginBottom: space.sm, gap: 4 },
  evidenceToggleText: { ...type.meta, color: color.accent },
  
  evidenceList: { marginBottom: space.xl, gap: space.md, backgroundColor: color.bgQuiet, padding: space.md, borderRadius: radius.sm, borderWidth: 1, borderColor: color.lineStrong },
  evidenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  evidenceActor: { ...type.label, color: color.textSecondary, width: 80, marginTop: 2 },
  evidenceContent: { flex: 1, gap: 4 },
  evidenceVerbatim: { ...type.body, color: color.text, fontStyle: 'italic' },
  evidenceChoice: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  
  proposalBox: { borderTopWidth: 1, borderColor: color.lineStrong, paddingTop: space.xl },
  proposalDesc: { ...type.meta, color: color.textSecondary, marginBottom: space.md },
  
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  btnResolve: { backgroundColor: color.riskSoft, borderWidth: 1, borderColor: color.risk, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, alignItems: 'center' },
  btnResolveText: { ...type.button, color: color.risk },
  
  btnDiscuss: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, alignItems: 'center' },
  btnDiscussText: { ...type.button, color: color.textSecondary },

  momentOfDoubtBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.lg, paddingTop: space.md, borderTopWidth: 1, borderColor: color.lineStrong },
  momentOfDoubtText: { ...type.meta, color: color.textSecondary, fontSize: 11, flex: 1 },
  momentOfDoubtLink: { color: color.caution, fontWeight: '700' }
});
