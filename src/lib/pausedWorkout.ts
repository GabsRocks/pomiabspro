const PAUSED_KEY = 'pomiabspro_paused_workout';

export interface PausedWorkout {
  exerciseIds: string[];
  currentIndex: number;
  completedReps: number;
  durationIdx: number;
  restIdx: number;
  pausedAt: string;
}

export const savePausedWorkout = (data: PausedWorkout): void => {
  try {
    localStorage.setItem(PAUSED_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save paused workout:', e);
  }
};

export const loadPausedWorkout = (): PausedWorkout | null => {
  try {
    const saved = localStorage.getItem(PAUSED_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const clearPausedWorkout = (): void => {
  localStorage.removeItem(PAUSED_KEY);
};
