// PomiABSPro - Achievement/Badge System

export interface Badge {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  category: 'consistency' | 'volume' | 'mental' | 'specialist' | 'secret';
  icon: string;
  condition: (metrics: BadgeCheckMetrics) => boolean;
  isSecret?: boolean;
}

export interface BadgeCheckMetrics {
  totalReps: number;
  totalSessions: number;
  currentStreak: number;
  bestStreak: number;
  challengesCompleted: string[];
  minutesTrainedWhileTired?: number;
  shortSessionsCompleted: number;
  comebackAfterBreak: boolean;
  repsByMuscle: Record<string, number>;
}

export const badges: Badge[] = [
  // CONSISTENCY
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    nameEs: 'Guerrero Semanal',
    description: '7 consecutive days of training.',
    descriptionEs: '7 días consecutivos de entrenamiento.',
    category: 'consistency',
    icon: '🗓️',
    condition: (m) => m.currentStreak >= 7 || m.bestStreak >= 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    nameEs: 'Maestro del Mes',
    description: '30 consecutive days. Unstoppable.',
    descriptionEs: '30 días consecutivos. Imparable.',
    category: 'consistency',
    icon: '📆',
    condition: (m) => m.currentStreak >= 30 || m.bestStreak >= 30,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    nameEs: 'Centurión',
    description: '100 total training sessions completed.',
    descriptionEs: '100 sesiones de entrenamiento completadas.',
    category: 'consistency',
    icon: '🏛️',
    condition: (m) => m.totalSessions >= 100,
  },
  // VOLUME
  {
    id: 'thousand-club',
    name: '1K Club',
    nameEs: 'Club 1K',
    description: 'Reach 1,000 total repetitions.',
    descriptionEs: 'Alcanza 1,000 repeticiones totales.',
    category: 'volume',
    icon: '🔢',
    condition: (m) => m.totalReps >= 1000,
  },
  {
    id: 'ten-thousand',
    name: '10K Legend',
    nameEs: 'Leyenda 10K',
    description: '10,000 total repetitions. Legend status.',
    descriptionEs: '10,000 repeticiones totales. Estatus de leyenda.',
    category: 'volume',
    icon: '⭐',
    condition: (m) => m.totalReps >= 10000,
  },
  {
    id: 'hundred-thousand',
    name: '100K Elite',
    nameEs: 'Élite 100K',
    description: '100,000 repetitions. Truly elite.',
    descriptionEs: '100,000 repeticiones. Verdaderamente élite.',
    category: 'volume',
    icon: '👑',
    condition: (m) => m.totalReps >= 100000,
  },
  // MENTAL
  {
    id: 'tired-warrior',
    name: 'Tired Warrior',
    nameEs: 'Guerrero Cansado',
    description: 'Completed a session when marked as tired.',
    descriptionEs: 'Completó una sesión marcado como cansado.',
    category: 'mental',
    icon: '😤',
    condition: (m) => (m.minutesTrainedWhileTired || 0) >= 5,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameEs: 'Minimalista',
    description: 'Complete 10 sessions of 5 minutes or less.',
    descriptionEs: 'Completa 10 sesiones de 5 minutos o menos.',
    category: 'mental',
    icon: '⚡',
    condition: (m) => m.shortSessionsCompleted >= 10,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    nameEs: 'Fénix',
    description: 'Return after 7+ days of inactivity.',
    descriptionEs: 'Regresa después de 7+ días de inactividad.',
    category: 'mental',
    icon: '🔥',
    condition: (m) => m.comebackAfterBreak,
  },
  // SPECIALIST
  {
    id: 'core-master',
    name: 'Core Master',
    nameEs: 'Maestro del Core',
    description: 'Complete 2,000 core repetitions.',
    descriptionEs: 'Completa 2,000 repeticiones de core.',
    category: 'specialist',
    icon: '🎯',
    condition: (m) => (m.repsByMuscle['core'] || 0) >= 2000,
  },
  {
    id: 'leg-dominator',
    name: 'Leg Dominator',
    nameEs: 'Dominador de Piernas',
    description: 'Complete 2,000 leg repetitions.',
    descriptionEs: 'Completa 2,000 repeticiones de piernas.',
    category: 'specialist',
    icon: '🦵',
    condition: (m) => (m.repsByMuscle['legs'] || 0) + (m.repsByMuscle['quads'] || 0) >= 2000,
  },
  {
    id: 'endurance-king',
    name: 'Endurance King',
    nameEs: 'Rey de Resistencia',
    description: 'Complete 3 cardio-style challenges.',
    descriptionEs: 'Completa 3 retos de estilo cardio.',
    category: 'specialist',
    icon: '🫀',
    condition: (m) => m.challengesCompleted.filter(c => c.includes('cardio')).length >= 3,
  },
  // SECRET
  {
    id: 'midnight-warrior',
    name: '???',
    nameEs: '???',
    description: 'Train between midnight and 4 AM.',
    descriptionEs: 'Entrena entre medianoche y 4 AM.',
    category: 'secret',
    icon: '🌙',
    condition: () => false, // Special unlock condition
    isSecret: true,
  },
  {
    id: 'perfect-week',
    name: '???',
    nameEs: '???',
    description: 'Hit daily target every day for a week.',
    descriptionEs: 'Cumple la meta diaria cada día por una semana.',
    category: 'secret',
    icon: '✨',
    condition: () => false, // Special unlock condition
    isSecret: true,
  },
];

export const checkBadges = (metrics: BadgeCheckMetrics): string[] => {
  return badges
    .filter(badge => !badge.isSecret && badge.condition(metrics))
    .map(badge => badge.id);
};

export const getBadgesByCategory = (category: Badge['category']) =>
  badges.filter(b => b.category === category);
