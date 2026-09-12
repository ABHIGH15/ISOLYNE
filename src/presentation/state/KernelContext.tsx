import { scheduleGapNotification } from '../../services/notificationService';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kernel, adapter, signalRepo, initializeKernelStorage, seedDemoDataIfNeeded } from '../../services/kernelService';
import { 
  loadOrCreateProjects, 
  createProjectRecord, 
  deleteProjectRecord, 
  getProjectRoster, 
  setProjectRoster,
  addTeammateToProject,
  removeTeammateFromProject,
  DEFAULT_PROJECT_ID,
  ACTIVE_PROJECT_KEY,
  ROSTER_PREFIX
} from '../../services/projectService';
import { Signal } from '../../kernel/domain/Signal';
import { KernelPresentationAdapter } from '../contracts/KernelPresentationAdapter';
import { RadarState, DecisionRecordView, TimelineEventView, Project } from '../contracts/types';

type KernelContextType = {
  // Project management
  projects: Project[];
  activeProjectId: string;
  activeProject: Project | null;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (name: string, teammates?: string[]) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;

  // Team management
  addTeammate: (name: string) => Promise<void>;
  removeTeammate: (name: string) => Promise<void>;

  // Project-scoped state
  radarState: RadarState;
  decisions: DecisionRecordView[];
  timelineEvents: TimelineEventView[];
  processSignal: (signal: Signal) => Promise<void>;
  respondToProposal: (actorId: string, response: 'agree' | 'challenge', proposalId: string, gapId: string, payload?: any) => Promise<void>;
  userName: string;
  roster: string[];
  setUserName: (name: string) => Promise<void>;
  setRoster: (roster: string[]) => Promise<void>;
  saveUserAndRoster: (name: string, teammates: string[]) => Promise<void>;
  activeActor: string;
  setActiveActor: (actor: string) => void;
  isReady: boolean;
  isReceiving: boolean;
  simulateIncomingBob: (topic?: string, choice?: string, statement?: string) => void;
};

export const KernelContext = createContext<KernelContextType | null>(null);

export function KernelProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT_ID);

  const [radarState, setRadarState] = useState<RadarState>({ status: 'clear' });
  const [decisions, setDecisions] = useState<DecisionRecordView[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventView[]>([]);
  const [userName, setUserNameState] = useState<string>('Alice');
  const [roster, setRosterState] = useState<string[]>(['Alice', 'Bob']);
  const [activeActor, setActiveActor] = useState<string>('Alice');
  const [isReady, setIsReady] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  const updateStateForSquad = useCallback(async (squadId: string, ev: any) => {
    setRadarState(KernelPresentationAdapter.toRadarState(ev));
    setDecisions(KernelPresentationAdapter.toDecisionRecords(ev));
    const signals = await signalRepo.getBySquad(squadId);
    setTimelineEvents(KernelPresentationAdapter.toTimelineEvents(signals));
  }, []);

  const refreshSquad = useCallback(async (squadId: string) => {
    const ev = await kernel.evaluateSquad(squadId);
    await updateStateForSquad(squadId, ev);
  }, [updateStateForSquad]);

  const loadSquadData = useCallback(async (squadId: string, currentUserName: string) => {
    const loadedRoster = await getProjectRoster(squadId, currentUserName);
    setRosterState(loadedRoster);
    setActiveActor(currentUserName);
    await refreshSquad(squadId);
  }, [refreshSquad]);

  useEffect(() => {
    const boot = async () => {
      await initializeKernelStorage();
      await seedDemoDataIfNeeded();

      // 1. Load user name
      const storedName = await AsyncStorage.getItem('isolyne_user_name');
      const resolvedName = storedName || 'Alice';
      if (storedName) {
        setUserNameState(resolvedName);
        setActiveActor(resolvedName);
      }

      // 2. Load or seed projects via projectService
      const { projects: loadedProjects, activeId } = await loadOrCreateProjects();
      setProjects(loadedProjects);
      setActiveProjectId(activeId);

      // 3. Load active project data
      await loadSquadData(activeId, resolvedName);
      setIsReady(true);
    };
    boot();
  }, [loadSquadData]);

  const selectProject = async (projectId: string) => {
    if (!projects.some(p => p.id === projectId)) return;
    setActiveProjectId(projectId);
    await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    await loadSquadData(projectId, userName);
  };

  const createProject = async (name: string, teammates: string[] = ['Bob']): Promise<Project> => {
    const newProject = await createProjectRecord(name, userName, teammates);
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    await loadSquadData(newProject.id, userName);
    return newProject;
  };

  const deleteProject = async (projectId: string) => {
    const { remainingProjects, nextActiveId } = await deleteProjectRecord(projectId, activeProjectId);
    setProjects(remainingProjects);
    if (activeProjectId === projectId) {
      setActiveProjectId(nextActiveId);
      await loadSquadData(nextActiveId, userName);
    }
  };

  const saveUserAndRoster = async (name: string, teammates: string[]) => {
    const cleanName = name.trim() || 'Alice';
    const cleanTeammates = teammates.map(t => t.trim()).filter(Boolean);
    const fullRoster = Array.from(new Set([cleanName, ...cleanTeammates]));
    
    setUserNameState(cleanName);
    setActiveActor(cleanName);
    setRosterState(fullRoster);
    
    await AsyncStorage.setItem('isolyne_user_name', cleanName);
    await AsyncStorage.setItem(`${ROSTER_PREFIX}${activeProjectId}`, JSON.stringify(fullRoster));
    await AsyncStorage.setItem('isolyne_roster_v1', JSON.stringify(fullRoster)); // legacy sync

    // Register join signals for roster
    for (const member of fullRoster) {
      await processSignal({
        id: `sig_join_${Date.now()}_${member.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        squadId: activeProjectId,
        actorId: member,
        type: 'member_joined',
        timestamp: new Date().toISOString()
      });
    }
  };

  const setUserName = async (name: string) => {
    const clean = name.trim() || 'Alice';
    setUserNameState(clean);
    setActiveActor(clean);
    await AsyncStorage.setItem('isolyne_user_name', clean);
  };

  const addTeammate = async (teammateName: string) => {
    const updated = await addTeammateToProject(activeProjectId, teammateName, userName);
    setRosterState(updated);
    await refreshSquad(activeProjectId);
  };

  const removeTeammate = async (teammateName: string) => {
    const updated = await removeTeammateFromProject(activeProjectId, teammateName, userName);
    setRosterState(updated);
    if (activeActor === teammateName) {
      setActiveActor(userName);
    }
    await refreshSquad(activeProjectId);
  };

  const setRoster = async (newRoster: string[]) => {
    setRosterState(newRoster);
    await AsyncStorage.setItem(`${ROSTER_PREFIX}${activeProjectId}`, JSON.stringify(newRoster));
  };

  const processSignal = async (signal: Signal) => {
    // Ensure signal is scoped to active project if omitted or using legacy constant
    const scopedSignal: Signal = {
      ...signal,
      squadId: signal.squadId || activeProjectId
    };
    const ev = await kernel.processSignal(scopedSignal);
    await updateStateForSquad(scopedSignal.squadId, ev);
    
    // Notification hook
    if (ev.selectedGap) {
      await scheduleGapNotification(
        ev.selectedGap.id,
        ev.selectedGap.topic || 'General',
        ev.selectedGap.hiddenReality,
        scopedSignal.actorId
      );
    }
  };

  const respondToProposal = async (actorId: string, response: 'agree' | 'challenge', proposalId: string, gapId: string, payload?: any) => {
    const res = await adapter.respondToProposal(activeProjectId, actorId, response, proposalId, gapId, payload);
    if (res && res.nextEvaluation) {
      await updateStateForSquad(activeProjectId, res.nextEvaluation);
    } else {
      await refreshSquad(activeProjectId);
    }
  };

  const simulateIncomingBob = (topic = 'Architecture', choice = 'Microservices Auth', statement = `Let's spin up microservices auth for the sprint.`) => {
    if (isReceiving) return;
    setIsReceiving(true);
    
    // Choose teammate name (not the active user) or default to Bob
    const teammate = roster.find(m => m !== userName) || 'Bob';

    setTimeout(async () => {
      await processSignal({
        id: `sig_${Date.now()}_${Math.random()}`,
        squadId: activeProjectId,
        actorId: teammate,
        type: 'decision_stated',
        timestamp: new Date().toISOString(),
        payload: {
          topic, 
          choice,
          verbatim: statement
        }
      });
      setIsReceiving(false);
    }, 2500);
  };

  return (
    <KernelContext.Provider value={{ 
      projects,
      activeProjectId,
      activeProject,
      selectProject,
      createProject,
      deleteProject,
      addTeammate,
      removeTeammate,
      radarState, 
      decisions, 
      timelineEvents, 
      processSignal, 
      respondToProposal, 
      userName,
      roster,
      setUserName,
      setRoster,
      saveUserAndRoster,
      activeActor, 
      setActiveActor, 
      isReady, 
      isReceiving, 
      simulateIncomingBob 
    }}>
      {isReady ? children : null}
    </KernelContext.Provider>
  );
}

export const useKernel = () => {
  const ctx = useContext(KernelContext);
  if (!ctx) throw new Error('useKernel must be used within KernelProvider');
  return ctx;
};
