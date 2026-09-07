import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../presentation/contracts/types';
import { kernel, signalRepo } from './kernelService';
import { Signal } from '../kernel/domain/Signal';

export const PROJECTS_KEY = 'isolyne_projects_v1';
export const ACTIVE_PROJECT_KEY = 'isolyne_active_project_v1';
export const ROSTER_PREFIX = 'isolyne_roster_';
export const DEFAULT_PROJECT_ID = 'shipaton-2026';
export const DEFAULT_PROJECT_NAME = 'Shipaton 2026';
export const SIGNALS_KEY = 'isolyne-signals';

export async function loadOrCreateProjects(): Promise<{ projects: Project[]; activeId: string }> {
  let projects: Project[] = [];
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        projects = parsed;
      }
    }
  } catch {}

  if (projects.length === 0) {
    const defaultProj: Project = {
      id: DEFAULT_PROJECT_ID,
      name: DEFAULT_PROJECT_NAME,
      createdAt: new Date().toISOString()
    };
    projects = [defaultProj];
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }

  let activeId = projects[0].id;
  try {
    const storedActive = await AsyncStorage.getItem(ACTIVE_PROJECT_KEY);
    if (storedActive && projects.some(p => p.id === storedActive)) {
      activeId = storedActive;
    }
  } catch {}
  await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, activeId);

  return { projects, activeId };
}

export async function createProjectRecord(
  name: string, 
  ownerName: string = 'Alice', 
  teammates: string[] = ['Bob']
): Promise<Project> {
  const { projects } = await loadOrCreateProjects();
  const cleanName = name.trim() || 'Untitled Project';
  const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newProject: Project = {
    id: newId,
    name: cleanName,
    createdAt: new Date().toISOString()
  };

  const updatedProjects = [...projects, newProject];
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, newId);

  // Initial roster
  const cleanTeammates = teammates.map(t => t.trim()).filter(Boolean);
  const initialRoster = Array.from(new Set([ownerName, ...cleanTeammates]));
  await AsyncStorage.setItem(`${ROSTER_PREFIX}${newId}`, JSON.stringify(initialRoster));

  // Dispatch initial member_joined signals
  for (const member of initialRoster) {
    await kernel.processSignal({
      id: `sig_join_${Date.now()}_${member.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      squadId: newId,
      actorId: member,
      type: 'member_joined',
      timestamp: new Date().toISOString()
    });
  }

  return newProject;
}

export async function deleteProjectRecord(
  projectId: string,
  currentActiveId: string
): Promise<{ remainingProjects: Project[]; nextActiveId: string }> {
  const { projects } = await loadOrCreateProjects();
  let remainingProjects = projects.filter(p => p.id !== projectId);

  if (remainingProjects.length === 0) {
    const defaultProj: Project = {
      id: DEFAULT_PROJECT_ID,
      name: DEFAULT_PROJECT_NAME,
      createdAt: new Date().toISOString()
    };
    remainingProjects = [defaultProj];
  }

  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(remainingProjects));
  await AsyncStorage.removeItem(`${ROSTER_PREFIX}${projectId}`);

  // Purge squad signals
  signalRepo['signals'] = signalRepo['signals'].filter((s: Signal) => s.squadId !== projectId);
  await AsyncStorage.setItem(SIGNALS_KEY, JSON.stringify(signalRepo['signals'])).catch(() => {});

  let nextActiveId = currentActiveId;
  if (currentActiveId === projectId) {
    nextActiveId = remainingProjects[0].id;
    await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, nextActiveId);
  }

  return { remainingProjects, nextActiveId };
}

export async function getProjectRoster(squadId: string, defaultOwner: string = 'Alice'): Promise<string[]> {
  const rosterKey = `${ROSTER_PREFIX}${squadId}`;
  try {
    const raw = await AsyncStorage.getItem(rosterKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Legacy fallback for default project
  if (squadId === DEFAULT_PROJECT_ID) {
    try {
      const legacy = await AsyncStorage.getItem('isolyne_roster_v1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await AsyncStorage.setItem(rosterKey, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch {}
  }

  return [defaultOwner, 'Bob'];
}

export async function setProjectRoster(squadId: string, roster: string[]): Promise<void> {
  await AsyncStorage.setItem(`${ROSTER_PREFIX}${squadId}`, JSON.stringify(roster));
}

export async function addTeammateToProject(squadId: string, teammateName: string, defaultOwner: string = 'Alice'): Promise<string[]> {
  const currentRoster = await getProjectRoster(squadId, defaultOwner);
  const clean = teammateName.trim();
  if (!clean || currentRoster.includes(clean)) return currentRoster;

  const updated = [...currentRoster, clean];
  await setProjectRoster(squadId, updated);

  // Dispatch member_joined signal to the kernel
  await kernel.processSignal({
    id: `sig_join_${Date.now()}_${clean.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    squadId,
    actorId: clean,
    type: 'member_joined',
    timestamp: new Date().toISOString()
  });

  return updated;
}

export async function removeTeammateFromProject(squadId: string, teammateName: string, defaultOwner: string = 'Alice'): Promise<string[]> {
  const currentRoster = await getProjectRoster(squadId, defaultOwner);
  const clean = teammateName.trim();
  
  // Service-level invariant: the device owner / project lead cannot be removed from their own workspace
  if (!clean || clean.toLowerCase() === defaultOwner.toLowerCase()) {
    return currentRoster;
  }

  const updated = currentRoster.filter(m => m.toLowerCase() !== clean.toLowerCase());
  await setProjectRoster(squadId, updated);

  // Note: Past decision signals and timeline entries remain intact for historical audit integrity.
  // The member is removed from active roster and future statement authorship.

  return updated;
}
