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
        colors={[color.bgElevated, color.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />
      
      {/* Floating Header */}
      <BlurView intensity={90} tint="dark" style={s.header}>
        <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 20 }}>
          <Text style={s.title}>Decisions</Text>
          <Text style={s.subtitle}>What does the team currently believe?</Text>
        </Animated.View>
      </BlurView>

      <ScrollView style={s.recordList} contentContainerStyle={s.recordListContent} showsVerticalScrollIndicator={false}>
        {topics.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={s.emptyState}>
            <View style={s.emptyIconCircle}>
              <Feather name="folder" size={24} color={color.textSecondary} />
            </View>
            <Text style={s.emptyTitle}>No Assumptions Yet</Text>
            <Text style={s.emptyDesc}>Use the channel below to state what you are working on. Isolyne builds a shared record from natural conversation.</Text>
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
                    <View style={s.decisionInfo}>
                      <Text style={[s.decisionChoice, isDisputed && s.decisionChoiceDisputed]}>
                        {d.choice}
                      </Text>
                      <Text style={s.decisionActor}>
                        {d.isTeamCommitment ? 'Team commitment' : d.actorId}
                      </Text>
                    </View>
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
  root: { flex: 1, backgroundColor: color.bg },
  header: {
    padding: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100
  },
  title: { ...type.display, color: color.text, marginBottom: 2, fontFamily: 'Orbitron' },
  subtitle: { ...type.body, color: color.textSecondary, fontSize: 13 },
  
  recordList: { flex: 1 },
  recordListContent: { padding: space.xl, paddingTop: 140, gap: space.xl, paddingBottom: 260 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.glass, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyTitle: { ...type.title, color: color.text, marginBottom: space.sm, fontFamily: 'Orbitron' },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center' },
  
  topicCard: { paddingLeft: space.lg, borderLeftWidth: 2, borderColor: color.lineStrong, marginBottom: space.md },
  topicCardDisputed: { borderColor: color.risk },
  
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  topicTitle: { ...type.label, color: color.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  topicTitleDisputed: { color: color.risk },
  disputedBadge: { ...type.meta, color: color.risk, borderWidth: 1, borderColor: color.risk, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  decisionRow: { marginBottom: space.md },
  decisionInfo: { flexDirection: 'column' },
  decisionChoice: { ...type.bodyStrong, color: color.text, marginBottom: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  decisionChoiceDisputed: { color: color.risk },
  decisionActor: { ...type.meta, color: color.textMuted }
});
