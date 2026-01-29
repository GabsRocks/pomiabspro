import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadState, saveState, AppState, UserProfile, UserMetrics, WorkoutSession, calculateStreak } from '@/lib/store';
import { Language, getTranslation } from '@/lib/i18n';

interface AppContextType {
  state: AppState;
  t: ReturnType<typeof getTranslation>;
  language: Language;
  setLanguage: (lang: Language) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addSession: (session: Omit<WorkoutSession, 'id'>) => void;
  addReps: (reps: number, muscle?: string) => void;
  completeChallenge: (challengeId: string) => void;
  unlockBadge: (badgeId: string) => void;
  setActiveChallenge: (challengeId: string | null) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadState);
  const [language, setLanguageState] = useState<Language>(state.profile.language);

  const t = getTranslation(language);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, language: lang }
    }));
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile }
    }));
  };

  const addSession = (session: Omit<WorkoutSession, 'id'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setState(prev => {
      const newActiveDays = prev.metrics.activeDays.includes(today)
        ? prev.metrics.activeDays
        : [...prev.metrics.activeDays, today];

      const newStreak = calculateStreak(newActiveDays);

      return {
        ...prev,
        sessions: [...prev.sessions, newSession],
        lastSessionDate: today,
        metrics: {
          ...prev.metrics,
          totalReps: prev.metrics.totalReps + session.totalReps,
          totalSessions: prev.metrics.totalSessions + 1,
          totalMinutes: prev.metrics.totalMinutes + session.durationMinutes,
          activeDays: newActiveDays,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.metrics.bestStreak, newStreak),
        },
      };
    });
  };

  const addReps = (reps: number, muscle?: string) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        totalReps: prev.metrics.totalReps + reps,
        repsByMuscle: muscle
          ? {
              ...prev.metrics.repsByMuscle,
              [muscle]: (prev.metrics.repsByMuscle[muscle] || 0) + reps,
            }
          : prev.metrics.repsByMuscle,
      },
    }));
  };

  const completeChallenge = (challengeId: string) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        challengesCompleted: prev.metrics.challengesCompleted.includes(challengeId)
          ? prev.metrics.challengesCompleted
          : [...prev.metrics.challengesCompleted, challengeId],
      },
      activeChallenge: prev.activeChallenge === challengeId ? null : prev.activeChallenge,
    }));
  };

  const unlockBadge = (badgeId: string) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        badgesUnlocked: prev.metrics.badgesUnlocked.includes(badgeId)
          ? prev.metrics.badgesUnlocked
          : [...prev.metrics.badgesUnlocked, badgeId],
      },
    }));
  };

  const setActiveChallenge = (challengeId: string | null) => {
    setState(prev => ({
      ...prev,
      activeChallenge: challengeId,
    }));
  };

  const resetData = () => {
    const defaultState = loadState();
    localStorage.removeItem('pomiabspro_data');
    setState({
      ...defaultState,
      profile: { ...defaultState.profile, setupComplete: false }
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        t,
        language,
        setLanguage,
        updateProfile,
        addSession,
        addReps,
        completeChallenge,
        unlockBadge,
        setActiveChallenge,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
