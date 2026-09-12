import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../theme/tokens';
import { useKernel } from '../state/KernelContext';
import { interpretStatement } from '../../services/llmParser';
import { TimelineChoice, formatChoice } from '../../kernel/domain/Timeline';

type CandidateSignal = {
  topic: string;
  choice: string | TimelineChoice;
  isExistingTopic: boolean;
  verbatim: string;
};

export function StatementChannel() {
  const { processSignal, decisions, activeActor, setActiveActor, roster, isReceiving, activeProjectId } = useKernel();
  
  // Graceful degradation: if activeActor was removed from roster, fallback to first available member
  React.useEffect(() => {
    if (roster.length > 0 && !roster.includes(activeActor)) {
      setActiveActor(roster[0]);
    }
  }, [roster, activeActor, setActiveActor]);

  const effectiveActor = roster.includes(activeActor) ? activeActor : (roster[0] || 'Alice');

  const [input, setInput] = useState('');
  const [inferencePhase, setInferencePhase] = useState<'idle' | 'extracting'>('idle');
  const [candidate, setCandidate] = useState<CandidateSignal | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const teammate = roster.find(m => m !== effectiveActor) || 'Bob';

  const handleInterpret = async () => {
    if (!input.trim() || inferencePhase !== 'idle') return;
    
    const submittedInput = input.trim();
    setInferencePhase('extracting');
    setParseError(null);
    
    try {
      const existingTopics = Array.from(new Set(decisions.map(d => d.topic)));
      const result = await interpretStatement(submittedInput, existingTopics);
      
      if (!result) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setParseError("Couldn't quite catch that — try naming what you're deciding and your choice.");
        setCandidate(null);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCandidate({ 
          topic: result.topic, 
          choice: result.choice, 
          isExistingTopic: existingTopics.includes(result.topic),
          verbatim: submittedInput
        });
      }
    } catch (err) {
      console.warn(err);
      setParseError("Something went wrong interpreting that.");
    } finally {
      setInferencePhase('idle');
    }
  };

  const handleLock = async () => {
    if (!candidate) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    await processSignal({
      id: `sig_${Date.now()}_${Math.random()}`,
      squadId: activeProjectId,
      actorId: effectiveActor,
      type: 'decision_stated',
      timestamp: new Date().toISOString(),
      payload: {
        topic: candidate.topic,
        choice: candidate.choice,
        verbatim: candidate.verbatim
      }
    });
    
    setCandidate(null);
    setInput('');
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCandidate(null);
  };

  return (
    <KeyboardAvoidingView 
      style={s.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={s.inputContainer}>
        {isReceiving && (
          <View style={s.incomingToast}>
            <View style={s.avatarPill}>
              <Text style={s.avatarText}>{teammate.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={s.incomingToastText}>{teammate} is typing...</Text>
            <ActivityIndicator size="small" color={color.textSecondary} />
          </View>
        )}

        {/* Dynamic Actor Selector Pill */}
        {roster.length > 1 && (
          <View style={s.actorSwitchRow}>
            <Text style={s.actorSwitchLabel}>Posting as:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.actorPills}>
              {roster.map((actor, idx) => (
                <Pressable
                  key={idx}
                  style={[s.actorPill, activeActor === actor && s.actorPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveActor(actor);
                  }}
                >
                  <Text style={[s.actorPillText, activeActor === actor && s.actorPillTextActive]}>
                    {actor}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {inferencePhase === 'extracting' && (
          <View style={s.statusRow}>
            <ActivityIndicator size="small" color={color.accent} />
            <Text style={s.statusText}>Isolyne is extracting decision logic...</Text>
          </View>
        )}

        {candidate && inferencePhase === 'idle' && (
          <View style={s.candidateCard}>
            <View style={s.candidateHeaderRow}>
               <Text style={s.candidateHeader}>I understood this as:</Text>
               {candidate.isExistingTopic && <Text style={s.candidateBadge}>Aligned to existing topic</Text>}
            </View>
            <View style={s.candidateData}>
              <Text style={s.candidateTopic}>{candidate.topic}</Text>
              <Text style={s.candidateValue}>{typeof candidate.choice === "object" && candidate.choice !== null ? candidate.choice.raw_text : candidate.choice}</Text>
            </View>
            <View style={s.candidateActions}>
              <Pressable style={s.btnLock} onPress={handleLock} accessibilityRole="button" accessibilityLabel="Lock Decision">
                <Text style={s.btnLockText}>Lock decision</Text>
              </Pressable>
              <Pressable style={s.btnEdit} onPress={handleEdit}>
                <Text style={s.btnEditText}>Edit</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!candidate && (
          <>
            {!input.trim() && (
              <View style={s.starterPrompts}>
                <Text style={s.starterPromptsLabel}>Try a starter statement:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.starterChips}>
                  {[
                    "We're using Postgres for the database",
                    "I will build the client in React Native",
                    "Using GraphQL for the API layer"
                  ].map((prompt, idx) => (
                    <Pressable
                      key={idx}
                      style={s.starterChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInput(prompt);
                      }}
                    >
                      <Text style={s.starterChipText}>"{prompt}"</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={s.inputWrapper}>
              <TextInput 
                style={s.input}
                placeholder="e.g. We're going with Postgres for the DB"
                placeholderTextColor={color.textMuted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleInterpret}
                editable={inferencePhase === 'idle' && !isReceiving}
                returnKeyType="send"
              />
              <Pressable 
                style={[s.sendBtn, (!input.trim() || inferencePhase !== 'idle') && s.sendBtnDisabled]} 
                onPress={handleInterpret}
                disabled={!input.trim() || inferencePhase !== 'idle'}
                accessibilityRole="button"
                accessibilityLabel="Send statement"
              >
                <Text style={s.sendBtnText}>↑</Text>
              </Pressable>
              {parseError && <Text style={s.errorText}>{parseError}</Text>}
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { width: '100%', borderTopWidth: 1, borderColor: color.line },

  incomingToast: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: space.md, 
    backgroundColor: color.bgElevated, 
    paddingVertical: space.sm, 
    paddingHorizontal: space.lg, 
    borderRadius: 999, 
    alignSelf: 'center', 
    marginBottom: space.lg, 
    borderWidth: 1, 
    borderColor: color.lineStrong,
    shadowColor: color.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  avatarPill: { width: 24, height: 24, borderRadius: 12, backgroundColor: color.accentDim, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...type.label, color: color.accent },
  incomingToastText: { ...type.meta, color: color.text, fontStyle: 'italic' },

  actorSwitchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  actorSwitchLabel: { ...type.meta, color: color.textMuted },
  actorPills: { flexDirection: 'row', gap: space.xs },
  actorPill: { paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.line },
  actorPillActive: { backgroundColor: color.accentDim, borderColor: color.accent },
  actorPillText: { ...type.meta, color: color.textSecondary },
  actorPillTextActive: { color: color.accent, fontWeight: '700' },

  inputContainer: { padding: space.xl, backgroundColor: color.bg },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  statusText: { ...type.meta, color: color.accent },

  candidateCard: { backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.accent, borderRadius: radius.md, padding: space.lg },
  candidateHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  candidateHeader: { ...type.meta, color: color.textSecondary },
  candidateBadge: { ...type.meta, color: color.accent, backgroundColor: color.bgQuiet, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  candidateData: { backgroundColor: color.bgQuiet, padding: space.md, borderRadius: radius.sm, marginBottom: space.lg },
  candidateTopic: { ...type.label, color: color.accent, textTransform: 'uppercase', marginBottom: 2 },
  candidateValue: { ...type.body, color: color.text },
  candidateActions: { flexDirection: 'row', gap: space.md },
  btnLock: { flex: 2, backgroundColor: color.accent, paddingVertical: space.md, borderRadius: radius.sm, alignItems: 'center' },
  btnLockText: { ...type.button, color: color.textOnAccent },
  btnEdit: { flex: 1, backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, paddingVertical: space.md, borderRadius: radius.sm, alignItems: 'center' },
  btnEditText: { ...type.button, color: color.text },

  starterPrompts: { marginBottom: space.md },
  starterPromptsLabel: { ...type.label, color: color.textMuted, marginBottom: space.xs, textTransform: 'uppercase' },
  starterChips: { flexDirection: 'row', gap: space.sm },
  starterChip: { backgroundColor: '#1A1D24', borderWidth: 0, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: 6 },
  starterChipText: { ...type.meta, color: color.textMuted },

  inputWrapper: { position: 'relative' },
  input: { ...type.body, color: color.text, backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.md, padding: space.lg, paddingRight: 60, minHeight: 60, paddingTop: space.lg },
  sendBtn: { position: 'absolute', right: space.md, top: space.md, bottom: space.md, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.md, backgroundColor: color.bgQuiet, borderRadius: radius.sm },
  sendBtnDisabled: { opacity: 0.3 },
  sendBtnText: { ...type.bodyStrong, color: color.text },
  errorText: { ...type.meta, color: color.risk, marginTop: space.sm }
});
