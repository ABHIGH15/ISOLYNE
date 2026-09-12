import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';
import { TimelineEventView } from '../src/presentation/contracts/types';

export default function TimelineScreen() {
  const { timelineEvents } = useKernel();

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Timeline</Text>
        <Text style={s.subtitle}>How did we get here?</Text>
      </View>

      <ScrollView style={s.timelineList} contentContainerStyle={s.timelineContent}>
        {timelineEvents.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconCircle}>
              <Feather name="clock" size={24} color={color.textSecondary} />
            </View>
            <Text style={s.emptyTitle}>Blank Canvas</Text>
            <Text style={s.emptyDesc}>As your team locks in choices, Isolyne builds a shared history of exactly how the project evolved.</Text>
          </View>
        ) : (
          timelineEvents.map((ev, index) => (
            <View key={ev.id} style={s.eventRow}>
              {/* Timeline Connector Line */}
              {index !== timelineEvents.length - 1 && (
                <View style={s.line} />
              )}
              {/* Spine Dot */}
              <View style={[
                s.spineDot,
                ev.type === 'divergence' && { backgroundColor: color.risk, borderColor: color.risk },
                ev.type === 'resolution' && { backgroundColor: color.join, borderColor: color.join }
              ]} />
              
              <Text style={s.timestamp}>{formatTime(ev.timestamp)}</Text>
              
              <View style={[
                s.eventCard, 
                ev.type === 'divergence' && s.eventCardDivergence,
                ev.type === 'resolution' && s.eventCardResolution
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {ev.type === 'divergence' && <Feather name="alert-circle" size={16} color={color.risk} accessibilityLabel="Divergence alert" />}
                  {ev.type === 'resolution' && <Feather name="check-circle" size={16} color={color.join} accessibilityLabel="Resolved" />}
                  <Text style={[
                    s.eventText,
                    ev.type === 'divergence' && s.eventTextDivergence,
                    ev.type === 'resolution' && s.eventTextResolution,
                    { flex: 1 }
                  ]}>
                    {ev.description}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  header: { padding: space.xl, borderBottomWidth: 1, borderColor: color.line },
  title: { ...type.display, color: color.text, marginBottom: space.sm },
  subtitle: { ...type.body, color: color.textSecondary },
  
  timelineList: { flex: 1 },
  timelineContent: { padding: space.xl, paddingBottom: 100 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: space.xl },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyIcon: { fontSize: 24 },
  emptyTitle: { ...type.title, color: color.text, marginBottom: space.sm },
  emptyDesc: { ...type.body, color: color.textMuted, textAlign: 'center' },

  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.xl, position: 'relative', paddingLeft: 12 },
  line: { position: 'absolute', left: 70, top: 24, bottom: -space.xl, width: 2, backgroundColor: color.lineStrong },
  spineDot: { position: 'absolute', left: 67, top: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: color.textMuted, zIndex: 2 },
  
  timestamp: { ...type.meta, color: color.textMuted, width: 45, paddingTop: 2 },
  
  eventCard: { flex: 1, backgroundColor: color.bgQuiet, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  eventCardDivergence: { backgroundColor: color.riskSoft, borderColor: color.riskLine },
  eventCardResolution: { backgroundColor: color.joinSoft, borderColor: color.joinLine },

  eventText: { ...type.body, color: color.textSecondary },
  eventTextDivergence: { color: color.risk },
  eventTextResolution: { color: color.join },
});
