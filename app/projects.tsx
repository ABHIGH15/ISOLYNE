import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { useKernel } from '../src/presentation/state/KernelContext';
import { kernel } from '../src/services/kernelService';

export default function ProjectsScreen() {
  const router = useRouter();
  const { 
    projects, 
    activeProjectId, 
    selectProject, 
    createProject, 
    deleteProject, 
    userName 
  } = useKernel();

  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [teammateInput, setTeammateInput] = useState('');
  const [teammates, setTeammates] = useState<string[]>(['Bob']);
  const [submitting, setSubmitting] = useState(false);

  // Status map: { [projectId]: 'clear' | 'attention' }
  const [projectStatuses, setProjectStatuses] = useState<Record<string, 'clear' | 'attention'>>({});
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const loadStatuses = useCallback(async () => {
    try {
      const statuses: Record<string, 'clear' | 'attention'> = {};
      for (const p of projects) {
        const ev = await kernel.evaluateSquad(p.id);
        statuses[p.id] = ev.selectedGap ? 'attention' : 'clear';
      }
      setProjectStatuses(statuses);
    } catch (e) {
      console.warn('Failed to load project statuses', e);
    } finally {
      setLoadingStatuses(false);
    }
  }, [projects]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleAddTeammate = () => {
    const clean = teammateInput.trim();
    if (!clean || teammates.includes(clean) || clean.toLowerCase() === userName.toLowerCase()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeammates([...teammates, clean]);
    setTeammateInput('');
  };

  const handleRemoveTeammate = (tName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeammates(teammates.filter(t => t !== tName));
  };

  const handleCreate = async () => {
    const cleanName = projectName.trim();
    if (!cleanName) return;

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createProject(cleanName, teammates);
      setIsCreating(false);
      setProjectName('');
      setTeammates(['Bob']);
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = async (projectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await selectProject(projectId);
    router.replace('/');
  };

  const handleDelete = (projectId: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const confirmDelete = async () => {
      await deleteProject(projectId);
      await loadStatuses();
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(`Delete "${name}"?\n\nThis permanently destroys all local signals, decisions, and roster records for this project on this device.`);
      if (ok) confirmDelete();
    } else {
      Alert.alert(
        'Delete Project',
        `Are you sure you want to delete "${name}"? This permanently destroys all local signals, decisions, and roster records for this project on this device.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Projects</Text>
          <Text style={s.subtitle}>Local squad workspaces on this device</Text>
        </View>
        <Pressable 
          style={[s.toggleBtn, isCreating && s.toggleBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsCreating(!isCreating);
          }}
        >
          <Feather name={isCreating ? "x" : "plus"} size={16} color={isCreating ? color.text : color.textOnAccent} />
          <Text style={[s.toggleBtnText, isCreating && s.toggleBtnTextActive]}>
            {isCreating ? "Cancel" : "New Project"}
          </Text>
        </Pressable>
      </View>

      {/* Creation Card */}
      {isCreating && (
        <View style={s.createCard}>
          <Text style={s.createCardTitle}>Create New Project</Text>
          <Text style={s.createCardDesc}>
            Spin up a separate, isolated workspace with its own team roster, reality ledger, and radar state.
          </Text>

          <Text style={s.inputLabel}>PROJECT NAME</Text>
          <TextInput 
            style={s.textInput}
            placeholder="e.g. HackMIT 2026 or Auth Microservice"
            placeholderTextColor={color.textMuted}
            value={projectName}
            onChangeText={setProjectName}
            autoFocus
            autoCorrect={false}
          />

          <Text style={s.inputLabel}>TEAM ROSTER</Text>
          <View style={s.rosterList}>
            <View style={[s.rosterPill, s.rosterPillSelf]}>
              <Feather name="user-check" size={13} color={color.join} />
              <Text style={[s.rosterName, { color: color.join }]}>{userName} (You)</Text>
            </View>
            {teammates.map((t, idx) => (
              <View key={idx} style={s.rosterPill}>
                <Feather name="user" size={13} color={color.textSecondary} />
                <Text style={s.rosterName}>{t}</Text>
                <Pressable onPress={() => handleRemoveTeammate(t)} hitSlop={8}>
                  <Feather name="x" size={13} color={color.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={s.addTeammateRow}>
            <TextInput 
              style={s.teammateInput}
              placeholder="Teammate name (e.g. Charlie)"
              placeholderTextColor={color.textMuted}
              value={teammateInput}
              onChangeText={setTeammateInput}
              onSubmitEditing={handleAddTeammate}
              autoCorrect={false}
            />
            <Pressable style={s.addBtn} onPress={handleAddTeammate}>
              <Feather name="plus" size={16} color={color.textOnAccent} />
            </Pressable>
          </View>

          <Pressable 
            style={[s.submitBtn, (!projectName.trim() || submitting) && s.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={!projectName.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={color.textOnAccent} />
            ) : (
              <>
                <Text style={s.submitBtnText}>Create & Open Workspace</Text>
                <Feather name="arrow-right" size={16} color={color.textOnAccent} />
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Projects List */}
      <View style={s.projectList}>
        <Text style={s.sectionHeader}>WORKSPACE LEDGER ({projects.length})</Text>

        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          const status = projectStatuses[project.id] || 'clear';

          return (
            <Pressable 
              key={project.id}
              style={[s.projectCard, isActive && s.projectCardActive]}
              onPress={() => handleSelect(project.id)}
            >
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={s.nameRow}>
                    <Text style={[s.projectName, isActive && s.projectNameActive]}>
                      {project.name}
                    </Text>
                    {isActive && (
                      <View style={s.activePill}>
                        <Text style={s.activePillText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.projectMeta}>
                    Created {formatDate(project.createdAt)} · ID: {project.id}
                  </Text>
                </View>

                {/* Delete button */}
                <Pressable 
                  style={s.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id, project.name);
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${project.name}`}
                >
                  <Feather name="trash-2" size={16} color={color.textMuted} />
                </Pressable>
              </View>

              <View style={s.cardBottom}>
                <View style={s.statusPill}>
                  <View style={[s.statusDot, status === 'attention' ? s.statusDotRisk : s.statusDotClear]} />
                  <Text style={[s.statusText, status === 'attention' ? s.statusTextRisk : s.statusTextClear]}>
                    {status === 'attention' ? 'Divergence Detected' : 'All Clear'}
                  </Text>
                </View>

                <View style={s.openLink}>
                  <Text style={s.openLinkText}>{isActive ? 'Current' : 'Switch'}</Text>
                  <Feather name="chevron-right" size={14} color={color.accent} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  content: { padding: space.xl, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xl },
  title: { ...type.display, color: color.text, marginBottom: 2 },
  subtitle: { ...type.body, color: color.textSecondary, fontSize: 13 },

  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.accent, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  toggleBtnActive: { backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong },
  toggleBtnText: { ...type.label, color: color.textOnAccent, fontSize: 12 },
  toggleBtnTextActive: { color: color.textSecondary },

  createCard: { backgroundColor: color.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: color.accent, padding: space.xl, marginBottom: space.xl },
  createCardTitle: { ...type.title, color: color.text, fontSize: 17, marginBottom: space.xs },
  createCardDesc: { ...type.body, color: color.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: space.lg },

  inputLabel: { ...type.label, color: color.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: space.xs },
  textInput: { backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, color: color.text, ...type.body, fontSize: 14, marginBottom: space.lg },

  rosterList: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  rosterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.bgQuiet, paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: color.lineStrong },
  rosterPillSelf: { backgroundColor: color.joinSoft, borderColor: color.joinLine },
  rosterName: { ...type.meta, color: color.textSecondary, fontSize: 12 },

  addTeammateRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.xl },
  teammateInput: { flex: 1, backgroundColor: color.bgQuiet, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, color: color.text, ...type.body, fontSize: 13 },
  addBtn: { width: 40, height: 40, backgroundColor: color.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, backgroundColor: color.accent, paddingVertical: space.md, borderRadius: radius.pill },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { ...type.button, color: color.textOnAccent, fontSize: 14 },

  projectList: { gap: space.md },
  sectionHeader: { ...type.label, color: color.textMuted, fontSize: 11, letterSpacing: 1.5, marginBottom: space.xs },

  projectCard: { backgroundColor: color.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: space.lg },
  projectCardActive: { borderColor: color.accent, backgroundColor: color.bgQuiet },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 2 },
  projectName: { ...type.title, color: color.text, fontSize: 16 },
  projectNameActive: { color: color.accent },
  activePill: { backgroundColor: color.accentDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, borderWidth: 1, borderColor: color.accent },
  activePillText: { ...type.label, color: color.accent, fontSize: 9, fontWeight: '700' },
  projectMeta: { ...type.meta, color: color.textMuted, fontSize: 11 },
  deleteBtn: { padding: space.xs },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: color.line, paddingTop: space.md },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotClear: { backgroundColor: color.join },
  statusDotRisk: { backgroundColor: color.risk },
  statusText: { ...type.meta, fontSize: 12 },
  statusTextClear: { color: color.join },
  statusTextRisk: { color: color.risk, fontWeight: '600' },

  openLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openLinkText: { ...type.meta, color: color.accent, fontSize: 12 }
});
