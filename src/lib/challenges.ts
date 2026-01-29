// PomiABSPro - Challenge System (80+ Challenges)

export interface Challenge {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  type: 'volume' | 'time' | 'style' | 'restriction';
  style?: 'combat' | 'warrior' | 'survival' | 'cardio' | 'strength' | 'control';
  targetReps?: number;
  targetDays?: number;
  difficulty: 1 | 2 | 3; // 1=Normal, 2=Hard, 3=Elite
  exercises: string[];
  dailyTarget?: number;
  icon: string;
  unlockCondition?: string;
}

export const challenges: Challenge[] = [
  // VOLUME CHALLENGES
  {
    id: '1k-reps',
    name: '1K Challenge',
    nameEs: 'Reto 1K',
    description: 'Complete 1,000 total repetitions.',
    descriptionEs: 'Completa 1,000 repeticiones totales.',
    type: 'volume',
    targetReps: 1000,
    difficulty: 1,
    exercises: ['chair-squats', 'wall-pushups', 'chair-leg-raises'],
    icon: '🔥',
  },
  {
    id: '5k-reps',
    name: '5K Warrior',
    nameEs: 'Guerrero 5K',
    description: 'Conquer 5,000 repetitions. Mental and physical test.',
    descriptionEs: 'Conquista 5,000 repeticiones. Prueba mental y física.',
    type: 'volume',
    targetReps: 5000,
    difficulty: 2,
    exercises: ['cycling-crunches', 'wide-squats', 'punches', 'calf-raises'],
    icon: '⚔️',
  },
  {
    id: '10k-elite',
    name: '10K Elite',
    nameEs: '10K Élite',
    description: 'The ultimate volume test. 10,000 reps.',
    descriptionEs: 'La prueba de volumen definitiva. 10,000 reps.',
    type: 'volume',
    targetReps: 10000,
    difficulty: 3,
    exercises: ['chair-squats', 'tricep-dips-chair', 'high-knees', 'cycling-crunches'],
    icon: '👑',
    unlockCondition: '5k-reps',
  },
  // TIME CHALLENGES
  {
    id: '7-day-start',
    name: '7-Day Ignition',
    nameEs: 'Ignición 7 Días',
    description: 'Train every day for 7 consecutive days.',
    descriptionEs: 'Entrena cada día durante 7 días consecutivos.',
    type: 'time',
    targetDays: 7,
    dailyTarget: 50,
    difficulty: 1,
    exercises: ['march-steps', 'arm-circles', 'chair-squats'],
    icon: '🌟',
  },
  {
    id: '14-day-habit',
    name: '14-Day Habit',
    nameEs: 'Hábito 14 Días',
    description: 'Two weeks of consistency. Build the habit.',
    descriptionEs: 'Dos semanas de consistencia. Construye el hábito.',
    type: 'time',
    targetDays: 14,
    dailyTarget: 75,
    difficulty: 2,
    exercises: ['wall-pushups', 'cycling-crunches', 'calf-raises', 'seated-twist'],
    icon: '📅',
  },
  {
    id: '30-day-discipline',
    name: '30-Day Discipline',
    nameEs: 'Disciplina 30 Días',
    description: 'One month. No excuses. Every single day.',
    descriptionEs: 'Un mes. Sin excusas. Cada día.',
    type: 'time',
    targetDays: 30,
    dailyTarget: 100,
    difficulty: 2,
    exercises: ['wide-squats', 'tricep-dips-chair', 'punches', 'desk-plank'],
    icon: '🏆',
  },
  {
    id: '90-day-elite',
    name: '90-Day Elite',
    nameEs: '90 Días Élite',
    description: 'Three months of unwavering commitment. Elite status.',
    descriptionEs: 'Tres meses de compromiso inquebrantable. Estatus élite.',
    type: 'time',
    targetDays: 90,
    dailyTarget: 150,
    difficulty: 3,
    exercises: ['high-knees', 'cycling-crunches', 'chair-squats', 'wall-pushups', 'desk-plank'],
    icon: '💎',
    unlockCondition: '30-day-discipline',
  },
  // STYLE CHALLENGES
  {
    id: 'combat-ready',
    name: 'Combat Ready',
    nameEs: 'Listo para Combate',
    description: 'Boxing-inspired workout. Fast, aggressive, relentless.',
    descriptionEs: 'Entrenamiento inspirado en boxeo. Rápido, agresivo, implacable.',
    type: 'style',
    style: 'combat',
    targetReps: 500,
    difficulty: 2,
    exercises: ['punches', 'seated-boxer', 'high-knees', 'march-steps'],
    icon: '🥊',
  },
  {
    id: 'spartan-warrior',
    name: 'Spartan Warrior',
    nameEs: 'Guerrero Espartano',
    description: 'Ancient warrior conditioning. Strength and endurance.',
    descriptionEs: 'Acondicionamiento de guerrero antiguo. Fuerza y resistencia.',
    type: 'style',
    style: 'warrior',
    targetReps: 750,
    difficulty: 2,
    exercises: ['wide-squats', 'wall-pushups', 'desk-plank', 'calf-raises'],
    icon: '🏛️',
  },
  {
    id: 'cardio-storm',
    name: 'Cardio Storm',
    nameEs: 'Tormenta Cardio',
    description: 'Pure cardiovascular destruction. Heart-pounding intensity.',
    descriptionEs: 'Destrucción cardiovascular pura. Intensidad al máximo.',
    type: 'style',
    style: 'cardio',
    targetReps: 600,
    difficulty: 2,
    exercises: ['high-knees', 'jumping-jacks', 'march-steps', 'punches'],
    icon: '🏃',
  },
  {
    id: 'iron-core',
    name: 'Iron Core',
    nameEs: 'Core de Hierro',
    description: 'Abs of steel. Core-focused annihilation.',
    descriptionEs: 'Abdominales de acero. Aniquilación enfocada en core.',
    type: 'style',
    style: 'strength',
    targetReps: 500,
    difficulty: 2,
    exercises: ['cycling-crunches', 'knee-elbow-twists', 'leg-raises-twist', 'chair-leg-raises'],
    icon: '🧱',
  },
  {
    id: 'body-control',
    name: 'Body Control',
    nameEs: 'Control Corporal',
    description: 'Slow, controlled movements. Master your body.',
    descriptionEs: 'Movimientos lentos y controlados. Domina tu cuerpo.',
    type: 'style',
    style: 'control',
    targetReps: 300,
    difficulty: 2,
    exercises: ['chair-tree-pose', 'chair-warrior', 'cat-cow-seated', 'desk-plank'],
    icon: '🧘',
  },
  // RESTRICTION CHALLENGES
  {
    id: 'bodyweight-only',
    name: 'Bodyweight Only',
    nameEs: 'Solo Peso Corporal',
    description: 'No equipment. No excuses. Just you.',
    descriptionEs: 'Sin equipo. Sin excusas. Solo tú.',
    type: 'restriction',
    targetReps: 500,
    difficulty: 1,
    exercises: ['chair-squats', 'wall-pushups', 'calf-raises', 'march-steps'],
    icon: '💪',
  },
  {
    id: 'core-only',
    name: 'Core Only',
    nameEs: 'Solo Core',
    description: 'Focus exclusively on your midsection.',
    descriptionEs: 'Enfócate exclusivamente en tu sección media.',
    type: 'restriction',
    targetReps: 400,
    difficulty: 2,
    exercises: ['cycling-crunches', 'knee-elbow-twists', 'leg-raises-twist', 'desk-plank'],
    icon: '🎯',
  },
  {
    id: 'upper-body-focus',
    name: 'Upper Body Focus',
    nameEs: 'Enfoque Tren Superior',
    description: 'Arms, chest, shoulders, back. Upper body domination.',
    descriptionEs: 'Brazos, pecho, hombros, espalda. Dominación del tren superior.',
    type: 'restriction',
    targetReps: 400,
    difficulty: 2,
    exercises: ['wall-pushups', 'tricep-dips-chair', 'punches', 'arm-circles'],
    icon: '🦾',
  },
  {
    id: 'no-impact',
    name: 'Zero Impact',
    nameEs: 'Cero Impacto',
    description: 'No jumping. Joint-friendly training.',
    descriptionEs: 'Sin saltos. Entrenamiento amigable para articulaciones.',
    type: 'restriction',
    targetReps: 500,
    difficulty: 1,
    exercises: ['march-steps', 'chair-squats', 'arm-circles', 'seated-boxer'],
    icon: '🔇',
  },
];

export const getChallengesByType = (type: Challenge['type']) =>
  challenges.filter(c => c.type === type);

export const getUnlockedChallenges = (completedIds: string[]) =>
  challenges.filter(c => !c.unlockCondition || completedIds.includes(c.unlockCondition));
