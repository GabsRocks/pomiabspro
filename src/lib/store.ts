// PomiABSPro - Local Storage Manager (Offline-first)
import { Language } from './i18n';

export interface UserProfile {
  name: string;
  level: 'sedentary' | 'active' | 'advanced';
  injuries: string[];
  preferences: {
    noJumps: boolean;
    noFloor: boolean;
    noEquipment: boolean;
  };
  dailyTimeMinutes: number;
  rhythm: 'slow' | 'normal' | 'aggressive';
  schedule: 'morning' | 'night';
  primaryGoal: string;
  secondaryGoal: string;
  silentMode: boolean;
  language: Language;
  setupComplete: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: {
    exerciseId: string;
    reps: number;
    sets: number;
  }[];
  totalReps: number;
  durationMinutes: number;
  mode: 'guided' | 'challenge' | 'free' | 'discipline';
}

export interface UserMetrics {
  totalReps: number;
  totalSessions: number;
  totalMinutes: number;
  activeDays: string[];
  currentStreak: number;
  bestStreak: number;
  repsByMuscle: Record<string, number>;
  challengesCompleted: string[];
  badgesUnlocked: string[];
}

export interface AppState {
  profile: UserProfile;
  metrics: UserMetrics;
  sessions: WorkoutSession[];
  activeChallenge: string | null;
  lastSessionDate: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  level: 'sedentary',
  injuries: [],
  preferences: {
    noJumps: false,
    noFloor: false,
    noEquipment: false,
  },
  dailyTimeMinutes: 15,
  rhythm: 'normal',
  schedule: 'morning',
  primaryGoal: 'discipline',
  secondaryGoal: '',
  silentMode: false,
  language: 'es',
  setupComplete: false,
};

const DEFAULT_METRICS: UserMetrics = {
  totalReps: 0,
  totalSessions: 0,
  totalMinutes: 0,
  activeDays: [],
  currentStreak: 0,
  bestStreak: 0,
  repsByMuscle: {},
  challengesCompleted: [],
  badgesUnlocked: [],
};

const STORAGE_KEY = 'pomiabspro_data';

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    profile: DEFAULT_PROFILE,
    metrics: DEFAULT_METRICS,
    sessions: [],
    activeChallenge: null,
    lastSessionDate: null,
  };
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const exportData = (): string => {
  const state = loadState();
  return JSON.stringify(state, null, 2);
};

export const exportCSV = (): string => {
  const state = loadState();
  const headers = ['Date', 'Total Reps', 'Duration (min)', 'Mode'];
  const rows = state.sessions.map(s => 
    [s.date, s.totalReps, s.durationMinutes, s.mode].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const calculateStreak = (activeDays: string[]): number => {
  if (activeDays.length === 0) return 0;
  
  const sorted = [...activeDays].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
