// PomiABSPro - Exercise Database (100+ Office Workouts)

import { chairExercises } from './exercises/chair-exercises';
import { strengthExercises } from './exercises/strength-exercises';
import { cardioExercises } from './exercises/cardio-exercises';
import { officeExercises } from './exercises/office-exercises';
import { stretchExercises } from './exercises/stretch-exercises';
import { yogaExercises } from './exercises/yoga-exercises';
import { militaryExercises } from './exercises/military-exercises';

export interface Exercise {
  id: string;
  name: string;
  nameEs: string;
  category: 'chair' | 'strength' | 'cardio' | 'office' | 'stretch' | 'yoga' | 'military';
  muscles: string[];
  reps: number;
  sets: number;
  restSeconds: number;
  requiresFloor: boolean;
  requiresJumps: boolean;
  requiresEquipment: boolean;
  difficulty: 1 | 2 | 3;
  instructions: string;
  instructionsEs: string;
  imageUrl?: string;
}

// Combine all exercises into one array
export const exercises: Exercise[] = [
  ...chairExercises,
  ...strengthExercises,
  ...cardioExercises,
  ...officeExercises,
  ...stretchExercises,
  ...yogaExercises,
  ...militaryExercises,
];

export const getExercisesByCategory = (category: Exercise['category']) => 
  exercises.filter(e => e.category === category);

export const getFilteredExercises = (
  noJumps: boolean,
  noFloor: boolean,
  noEquipment: boolean
) => exercises.filter(e => 
  (!noJumps || !e.requiresJumps) &&
  (!noFloor || !e.requiresFloor) &&
  (!noEquipment || !e.requiresEquipment)
);

export const getMilitaryExercises = () => militaryExercises;

// Get exercises for a specific difficulty level
export const getExercisesByDifficulty = (difficulty: 1 | 2 | 3) =>
  exercises.filter(e => e.difficulty === difficulty);
