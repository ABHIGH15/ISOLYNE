import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  SquadRuntime,
  TestClock,
  EvaluatorRegistry,
  FormationEvaluator,
  Event,
  Squad,
  Builder,
  Signal,
} from '../../src/runtime';
import { TrialRecorder } from '../../src/runtime/telemetry/TrialResult';

// ── Frozen Trial Scenario: Leadership Gap ──────────────────────────
const startTimeMs = Date.now();

const trialEvent: Event = {
  id: 'evt_trial_001',
  name: 'Trial Hackathon',
  startTime: new Date(startTimeMs).toISOString(),
  endTime: new Date(startTimeMs + 36 * 60 * 60 * 1000).toISOString(),
};

const trialViewer: Builder = {
  id: 'trial_viewer',
  name: 'You',
  role: 'mobile',
  builderStyle: 'architect',
  goal: 'prize',
  intensity: 'all_nighter',
  hour1Ownership: 'mobile',
  preferredTeamSize: 4,
};

const trialSquad: Squad = {
  id: 'sqd_trial',
  eventId: 'evt_trial_001',
  name: 'Your Team',
  idea: 'TBD',
  members: [
    trialViewer,
    { ...trialViewer, id: 'p2', name: 'Jordan', role: 'design', builderStyle: 'executor' },
    { ...trialViewer, id: 'p3', name: 'Sam', role: 'backend', builderStyle: 'executor' },
    { ...trialViewer, id: 'p4', name: 'Riley', role: 'frontend', builderStyle: 'explorer' },
  ],
  commitments: [],
};

// ── Component ──────────────────────────────────────────────────────

type Phase = 'reveal' | 'align' | 'resolved_agreed' | 'resolved_challenged';

export default function TrialScreen() {
  const [phase, setPhase] = useState<Phase>('reveal');
  const [researcherOpen, setResearcherOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [reaction, setReaction] = useState('');

  const recorder = useMemo(() => new TrialRecorder(), []);

  const { runtime, clock } = useMemo(() => {
    const registry = new EvaluatorRegistry();
    registry.register(new FormationEvaluator());
    const clk = new TestClock(startTimeMs);
    const rt = new SquadRuntime(trialEvent, trialSquad, registry, clk);
    return { runtime: rt, clock: clk };
  }, []);

  useEffect(() => {
    recorder.startTrial(`trial_${Date.now()}`);
  }, []);

  const moment = phase === 'reveal' ? runtime.evaluate(trialViewer.id) : null;

  const handleReviewDecision = () => {
    recorder.markClicked();
    setPhase('align');
  };

  const handleAlign = (status: 'agree' | 'challenge') => {
    const alignSig: Signal = {
      id: `sig_align_${Date.now()}`,
      version: 1,
      actorId: trialViewer.id,
      squadId: trialSquad.id,
      type: 'alignment_made',
      timestamp: clock.now(),
      payload: {
        alignment: {
          id: `aln_${Date.now()}`,
          decisionId: 'ghost-1',
          builderId: trialViewer.id,
          status,
          timestamp: clock.now()
        }
      }
    };
    runtime.emit(alignSig);

    if (status === 'agree') {
      const commitSig: Signal = {
        id: `sig_trial_${Date.now()}`,
        version: 1,
        actorId: trialViewer.id,
        squadId: trialSquad.id,
        type: 'commitment_made',
        timestamp: clock.now(),
        payload: {
          commitment: {
            id: `cmt_trial_${Date.now()}`,
            builderId: trialViewer.id,
            type: 'role',
            value: 'lead',
            timestamp: clock.now(),
          },
        },
      };
      runtime.emit(commitSig);
      setPhase('resolved_agreed');
    } else {
      setPhase('resolved_challenged');
    }
  };

  // ── Reveal Phase ─────────────────────────────────────────────────
  if (phase === 'reveal' && moment) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.content}>
          <Text style={s.situation}>Situation</Text>
          <Text style={s.title}>{moment.ghostDecision.title}</Text>

          <View style={s.divider} />

          <Text style={s.consequenceLabel}>If nobody acts:</Text>
          <Text style={s.consequence}>{moment.ghostDecision.foresight}</Text>

          <Pressable style={s.commitButton} onPress={handleReviewDecision}>
            <Text style={s.commitText}>{moment.ghostDecision.options[0]?.label}</Text>
          </Pressable>
        </View>

        <ResearcherOverlay
          open={researcherOpen}
          onToggle={() => setResearcherOpen(!researcherOpen)}
          onUnderstood={() => recorder.markUnderstood()}
          onAskedQuestion={() => recorder.markAskedQuestion()}
          recorder={recorder}
        />
      </SafeAreaView>
    );
  }

  // ── Align Phase ─────────────────────────────────────────────────
  if (phase === 'align') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.content}>
          <Text style={s.situation}>Leadership decision proposed</Text>
          <Text style={s.title}>Abhi will own final decisions.</Text>
          
          <View style={s.divider} />
          
          <Text style={s.consequenceLabel}>Before this locks:</Text>
          <Text style={s.consequence}>Does this match your team's understanding?</Text>

          <View style={s.alignActionRow}>
            <Pressable style={[s.commitButton, { flex: 1, marginRight: 8, backgroundColor: '#000' }]} onPress={() => handleAlign('agree')}>
              <Text style={s.commitText}>[Agree]</Text>
            </Pressable>
            <Pressable style={[s.commitButton, { flex: 1, marginLeft: 8, backgroundColor: '#f44336' }]} onPress={() => handleAlign('challenge')}>
              <Text style={s.commitText}>[Challenge]</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Resolved Phase ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <View style={s.resolvedContent}>
        {phase === 'resolved_agreed' ? (
          <>
            <Text style={s.checkmark}>✓</Text>
            <Text style={s.resolvedTitle}>Leadership ownership established</Text>
            <Text style={s.resolvedSub}>Abhi owns final decisions.{'\n'}Everyone is aligned.</Text>
          </>
        ) : (
          <>
            <Text style={[s.checkmark, { color: '#f44336' }]}>⚠</Text>
            <Text style={s.resolvedTitle}>Alignment required</Text>
            <Text style={s.resolvedSub}>The team disagrees.{'\n'}Resolve before committing.</Text>
          </>
        )}
      </View>

      {/* Researcher post-trial capture */}
      <ResearcherOverlay
        open={researcherOpen}
        onToggle={() => setResearcherOpen(!researcherOpen)}
        onUnderstood={() => recorder.markUnderstood()}
        onAskedQuestion={() => recorder.markAskedQuestion()}
        recorder={recorder}
        postTrial
        reaction={reaction}
        onReactionChange={setReaction}
        notes={notes}
        onNotesChange={setNotes}
        onFinish={() => {
          recorder.setVerbalReaction(reaction);
          recorder.setResearcherNotes(notes);
          const result = recorder.finishTrial();
          console.log('=== TRIAL RESULT ===');
          console.log(JSON.stringify(result, null, 2));
        }}
      />
    </SafeAreaView>
  );
}

// ── Researcher Overlay ─────────────────────────────────────────────

type OverlayProps = {
  open: boolean;
  onToggle: () => void;
  onUnderstood: () => void;
  onAskedQuestion: () => void;
  recorder: TrialRecorder;
  postTrial?: boolean;
  reaction?: string;
  onReactionChange?: (t: string) => void;
  notes?: string;
  onNotesChange?: (t: string) => void;
  onFinish?: () => void;
};

function ResearcherOverlay({
  open,
  onToggle,
  onUnderstood,
  onAskedQuestion,
  recorder,
  postTrial,
  reaction,
  onReactionChange,
  notes,
  onNotesChange,
  onFinish,
}: OverlayProps) {
  const trial = recorder.getCurrentTrial();
  const timeElapsed = trial?.sawDecisionAt
    ? ((Date.now() - trial.sawDecisionAt) / 1000).toFixed(1)
    : '—';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={s.researcherBar}
    >
      <Pressable onPress={onToggle} style={s.researcherToggle}>
        <Text style={s.researcherToggleText}>
          {open ? '▼ Researcher' : '▶ Researcher'}
        </Text>
      </Pressable>

      {open && (
        <ScrollView style={s.researcherPanel}>
          <Text style={s.researcherMeta}>
            Time since shown: {timeElapsed}s{'\n'}
            Understood: {trial?.understoodBeforeExplanation ? '✓' : '—'}{'\n'}
            Asked question: {trial?.askedQuestion ? '⚠ YES' : '—'}{'\n'}
            Clicked: {trial?.clickedAction ? '✓' : '—'}{'\n'}
            Time to click: {trial?.timeToClick ? `${(trial.timeToClick / 1000).toFixed(1)}s` : '—'}
          </Text>

          <View style={s.researcherButtons}>
            <Pressable style={[s.rBtn, { backgroundColor: '#e8f5e9' }]} onPress={onUnderstood}>
              <Text style={s.rBtnText}>✓ Understood</Text>
            </Pressable>
            <Pressable style={[s.rBtn, { backgroundColor: '#ffebee' }]} onPress={onAskedQuestion}>
              <Text style={[s.rBtnText, { color: '#c62828' }]}>⚠ Asked Question</Text>
            </Pressable>
          </View>

          {postTrial && (
            <View style={s.postTrial}>
              <Text style={s.postTrialLabel}>
                Ask: "What just happened?"
              </Text>
              <TextInput
                style={s.postTrialInput}
                placeholder="Record verbal reaction..."
                value={reaction}
                onChangeText={onReactionChange}
                multiline
              />
              <Text style={s.postTrialLabel}>Researcher notes</Text>
              <TextInput
                style={s.postTrialInput}
                placeholder="Observations, hesitations, body language..."
                value={notes}
                onChangeText={onNotesChange}
                multiline
              />
              <Pressable style={s.finishBtn} onPress={onFinish}>
                <Text style={s.finishBtnText}>Save Trial Result</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  situation: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 28,
  },
  consequenceLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  consequence: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    marginBottom: 48,
  },
  commitButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  commitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  alignActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  // Resolved
  resolvedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  checkmark: {
    fontSize: 56,
    color: '#10b981',
    marginBottom: 16,
  },
  resolvedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  resolvedSub: {
    fontSize: 16,
    color: '#666',
  },

  // Researcher
  researcherBar: {
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  researcherToggle: {
    padding: 12,
  },
  researcherToggleText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  researcherPanel: {
    padding: 12,
    maxHeight: 320,
  },
  researcherMeta: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  researcherButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  rBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  rBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e7d32',
  },
  postTrial: {
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingTop: 16,
  },
  postTrialLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  postTrialInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  finishBtn: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
