import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { StatementChannel } from '../src/presentation/components/StatementChannel';
import { useKernel } from '../src/presentation/state/KernelContext';
import { DecisionRecordView } from '../src/presentation/contracts/types';

export default function DecisionsScreen() {
  const { decisions } = useKernel();

  // Group decisions by topic
  const grouped = decisions.reduce((acc, dec) => {
    if (!acc[dec.topic]) acc[dec.topic] = [];
    acc[dec.topic].push(dec);
    return acc;
  }, {} as Record<string, DecisionRecordView[]>);

  const topics = Object.keys(grouped);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Decisions</Text>
        <Text style={s.subtitle}>What does the team currently believe?</Text>
      </View>

      <ScrollView style={s.recordList} contentContainerStyle={s.recordListContent}>
        {topics.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconCircle}>
              <Feather name="folder" size={24} color={color.textSecondary} />
            </View>
            <Text style={s.emptyTitle}>No Assumptions Yet</Text>
            <Text style={s.emptyDesc}>Use the channel below to state what you are working on. Isolyne builds a shared record from natural conversation.</Text>
          </View>
        ) : (
          topics.map(topic => {
            const topicDecisions = grouped[topic];
            // If any decision in the group is disputed, the whole topic is disputed
            const isDisputed = topicDecisions.some(d => d.status === 'disputed');

            return (
              <View key={topic} style={[s.topicCard, isDisputed && s.topicCardDisputed]}>
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
              </View>
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
    borderBottomWidth: 1,
    borderColor: color.line,
  },
  title: { ...type.display, color: color.text, marginBottom: space.sm },
  subtitle: { ...type.body, color: color.textSecondary },
  
  recordList: { flex: 1 },
  recordListContent: { padding: space.xl, gap: space.xl, paddingBottom: 260 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: space.xl },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyIcon: { fontSize: 24 },
  emptyTitle: { ...type.title, color: color.text, marginBottom: space.sm },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center' },
  
  topicCard: { backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, padding: space.lg },
  topicCardDisputed: { borderColor: color.risk, backgroundColor: color.riskSoft },
  
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg },
  topicTitle: { ...type.label, color: color.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  topicTitleDisputed: { color: color.risk },
  disputedBadge: { ...type.meta, color: color.risk, borderWidth: 1, borderColor: color.risk, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  decisionRow: { marginBottom: space.md },
  decisionInfo: { flexDirection: 'column' },
  decisionChoice: { ...type.bodyStrong, color: color.text, marginBottom: 2 },
  decisionChoiceDisputed: { color: color.risk },
  decisionActor: { ...type.meta, color: color.textMuted }
});
