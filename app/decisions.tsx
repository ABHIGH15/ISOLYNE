import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { StatementChannel } from '../src/presentation/components/StatementChannel';
import { useKernel } from '../src/presentation/state/KernelContext';
import { DecisionRecordView } from '../src/presentation/contracts/types';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function DecisionsScreen() {
  const { decisions } = useKernel();

  const grouped = decisions.reduce((acc, dec) => {
    if (!acc[dec.topic]) acc[dec.topic] = [];
    acc[dec.topic].push(dec);
    return acc;
  }, {} as Record<string, DecisionRecordView[]>);

  const topics = Object.keys(grouped);

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
          <Text style={s.title}>[01] SPRINT LOG</Text>
          <Text style={s.subtitle}>// WHAT DOES THE TEAM BELIEVE?</Text>
        </Animated.View>
      </BlurView>

      <ScrollView style={s.recordList} contentContainerStyle={s.recordListContent} showsVerticalScrollIndicator={false}>
        {topics.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={s.emptyState}>
            <Text style={s.emptyTitle}>NO DATA</Text>
            <Text style={s.emptyDesc}>Use the terminal below to log assumptions.</Text>
          </Animated.View>
        ) : (
          topics.map((topic, index) => {
            const topicDecisions = grouped[topic];
            const isDisputed = topicDecisions.some(d => d.status === 'disputed');

            return (
              <Animated.View 
                entering={FadeInUp.duration(400).delay(100 + index * 100).springify()} 
                key={topic} 
                style={[s.topicCard, isDisputed && s.topicCardDisputed]}
              >
                <View style={s.topicHeader}>
                  <Text style={[s.topicTitle, isDisputed && s.topicTitleDisputed]}>{topic}</Text>
                  {isDisputed && <Text style={s.disputedBadge}>DISPUTED</Text>}
                </View>

                {topicDecisions.map(d => (
                  <View key={d.id} style={s.decisionRow}>
                    <Text style={s.decisionActor}>
                      [{d.isTeamCommitment ? 'SYSTEM' : d.actorId}]
                    </Text>
                    <Text style={[s.decisionChoice, isDisputed && s.decisionChoiceDisputed]}>
                      {d.choice}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <StatementChannel />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  header: {
    padding: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100
  },
  title: { ...type.title, color: color.text, marginBottom: 4, fontFamily: 'Orbitron', fontSize: 24, letterSpacing: 2 },
  subtitle: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, letterSpacing: 1 },
  
  recordList: { flex: 1 },
  recordListContent: { padding: space.xl, paddingTop: 160, gap: space.xl, paddingBottom: 300 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyTitle: { ...type.title, color: color.textMuted, marginBottom: space.sm, fontFamily: 'Orbitron', fontSize: 32 },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  
  topicCard: { paddingVertical: space.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  topicCardDisputed: { borderColor: 'transparent' },
  
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg },
  topicTitle: { ...type.label, color: color.textMuted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, letterSpacing: 2 },
  topicTitleDisputed: { color: color.risk },
  disputedBadge: { ...type.meta, color: color.risk, borderWidth: 1, borderColor: color.risk, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },

  decisionRow: { marginBottom: space.md, flexDirection: 'row', alignItems: 'flex-start' },
  decisionActor: { ...type.meta, color: color.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, width: 80, marginTop: 2 },
  decisionChoice: { ...type.bodyStrong, color: color.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, flex: 1 },
  decisionChoiceDisputed: { color: color.risk },
});
