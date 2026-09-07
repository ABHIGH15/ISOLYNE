import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';

export default function TeamManagementScreen() {
  const router = useRouter();
  const { 
    activeProject, 
    roster, 
    userName, 
    addTeammate, 
    removeTeammate 
  } = useKernel();

  const [newTeammateName, setNewTeammateName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const clean = newTeammateName.trim();
    if (!clean) return;
    if (roster.some(m => m.toLowerCase() === clean.toLowerCase())) {
      Alert.alert('Notice', `${clean} is already on the team.`);
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addTeammate(clean);
      setNewTeammateName('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add teammate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (member: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const confirmRemove = async () => {
      try {
        await removeTeammate(member);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to remove teammate');
      }
    };

    const projectName = activeProject?.name || 'this project';
    const message = `Remove "${member}" from ${projectName}?\n\nTheir past decisions and commitments remain in the project timeline for audit integrity, but they will no longer be an active participant.`;

    if (Platform.OS === 'web') {
      const ok = window.confirm(message);
      if (ok) confirmRemove();
    } else {
      Alert.alert(
        'Remove Teammate',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: confirmRemove }
        ]
      );
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Top Bar with Back Button */}
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={color.text} />
          <Text style={s.backBtnText}>Back</Text>
        </Pressable>
        <View style={s.projectPill}>
          <Feather name="folder" size={12} color={color.accent} />
          <Text style={s.projectPillText}>{activeProject?.name || 'Active Project'}</Text>
        </View>
      </View>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Team Management</Text>
        <Text style={s.subtitle}>Manage who collaborates on {activeProject?.name || 'this workspace'}</Text>
      </View>

      {/* Add Teammate Section */}
      <View style={s.card}>
        <Text style={s.cardTitle}>ADD TEAM MEMBER</Text>
        <Text style={s.cardDesc}>
          Add a collaborator to author statements, resolve drift, or participate in the decision ledger.
        </Text>

        <View style={s.addRow}>
          <TextInput 
            style={s.textInput}
            placeholder="Teammate name (e.g. Dave or Maya)"
            placeholderTextColor={color.textMuted}
            value={newTeammateName}
            onChangeText={setNewTeammateName}
            onSubmitEditing={handleAdd}
            autoCorrect={false}
          />
          <Pressable 
            style={[s.addBtn, (!newTeammateName.trim() || submitting) && s.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!newTeammateName.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={color.textOnAccent} />
            ) : (
              <>
                <Feather name="user-plus" size={16} color={color.textOnAccent} />
                <Text style={s.addBtnText}>Add</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Roster List Section */}
      <View style={s.card}>
        <View style={s.cardHeaderRow}>
          <Text style={s.cardTitle}>ACTIVE ROSTER</Text>
          <Text style={s.memberCount}>{roster.length} members</Text>
        </View>

        <View style={s.memberList}>
          {roster.map((member, idx) => {
            const isSelf = member === userName;

            return (
              <View key={idx} style={s.memberRow}>
                <View style={[s.avatarCircle, isSelf && s.avatarCircleSelf]}>
                  <Text style={[s.avatarText, isSelf && s.avatarTextSelf]}>
                    {member.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.memberName}>{member}</Text>
                    {isSelf && (
                      <View style={s.selfBadge}>
                        <Text style={s.selfBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.memberMeta}>
                    {isSelf ? 'Project Lead / Device Account' : 'Active Contributor'}
                  </Text>
                </View>

                {!isSelf && (
                  <Pressable 
                    style={s.removeBtn}
                    onPress={() => handleRemove(member)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${member}`}
                  >
                    <Feather name="user-x" size={16} color={color.risk} />
                    <Text style={s.removeBtnText}>Remove</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Historical Audit Preservation Notice */}
      <View style={s.noticeCard}>
        <Feather name="shield" size={18} color={color.accent} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={s.noticeTitle}>Historical Ledger Integrity</Text>
          <Text style={s.noticeBody}>
            Removing a teammate removes them from active decision-making and rotation. Their prior statements, resolutions, and commitment records remain preserved in the project timeline to maintain an honest historical audit trail.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  content: { padding: space.xl, paddingBottom: 100, gap: space.xl },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  backBtnText: { ...type.meta, color: color.text, fontSize: 13 },
  projectPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.bgQuiet, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  projectPillText: { ...type.label, color: color.accent, fontSize: 11 },

  header: { marginBottom: space.xs },
  title: { ...type.display, color: color.text, marginBottom: 2 },
  subtitle: { ...type.body, color: color.textSecondary, fontSize: 13 },

  card: { backgroundColor: color.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: space.xl },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  cardTitle: { ...type.label, color: color.textMuted, fontSize: 11, letterSpacing: 1.5, marginBottom: space.xs },
  cardDesc: { ...type.body, color: color.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: space.lg },
  memberCount: { ...type.meta, color: color.accent, fontSize: 12 },

  addRow: { flexDirection: 'row', gap: space.sm },
  textInput: { flex: 1, backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, color: color.text, ...type.body, fontSize: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: color.accent, paddingHorizontal: space.lg, borderRadius: radius.md },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { ...type.button, color: color.textOnAccent, fontSize: 13 },

  memberList: { gap: space.md, marginTop: space.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, borderBottomWidth: 1, borderColor: color.line },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  avatarCircleSelf: { backgroundColor: color.joinSoft, borderColor: color.joinLine },
  avatarText: { ...type.label, color: color.textSecondary, fontSize: 14 },
  avatarTextSelf: { color: color.join },
  memberName: { ...type.bodyStrong, color: color.text, fontSize: 15 },
  selfBadge: { backgroundColor: color.joinSoft, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, borderWidth: 1, borderColor: color.joinLine },
  selfBadgeText: { ...type.label, color: color.join, fontSize: 9, fontWeight: '700' },
  memberMeta: { ...type.meta, color: color.textMuted, fontSize: 11, marginTop: 2 },

  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: color.riskSoft, borderWidth: 1, borderColor: color.riskLine },
  removeBtnText: { ...type.meta, color: color.risk, fontSize: 11, fontWeight: '600' },

  noticeCard: { flexDirection: 'row', gap: space.md, backgroundColor: color.bgQuiet, borderRadius: radius.md, borderWidth: 1, borderColor: color.lineStrong, padding: space.lg },
  noticeTitle: { ...type.bodyStrong, color: color.text, fontSize: 13, marginBottom: 2 },
  noticeBody: { ...type.meta, color: color.textMuted, fontSize: 12, lineHeight: 17 }
});
