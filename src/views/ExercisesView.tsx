import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ExerciseCard from '@/components/ExerciseCard';
import { exercises, getExercisesByCategory, Exercise } from '@/lib/exercises';
import { cn } from '@/lib/utils';

const ExercisesView = () => {
  const { state, t } = useApp();
  const [activeCategory, setActiveCategory] = useState<Exercise['category']>('chair');

  const categories: { key: Exercise['category']; label: string }[] = [
    { key: 'chair', label: t.exercises.categories.chair },
    { key: 'strength', label: t.exercises.categories.strength },
    { key: 'cardio', label: t.exercises.categories.cardio },
    { key: 'office', label: t.exercises.categories.office },
    { key: 'stretch', label: t.exercises.categories.stretch },
    { key: 'yoga', label: t.exercises.categories.yoga },
  ];

  const filteredExercises = getExercisesByCategory(activeCategory);

  // Apply user preferences filter
  const { noJumps, noFloor, noEquipment } = state.profile.preferences;
  const displayExercises = filteredExercises.filter(e =>
    (!noJumps || !e.requiresJumps) &&
    (!noFloor || !e.requiresFloor) &&
    (!noEquipment || !e.requiresEquipment)
  );

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t.exercises.title}</h1>
      <p className="text-muted-foreground mb-6">
        {state.profile.language === 'es'
          ? `${exercises.length} ejercicios de oficina`
          : `${exercises.length} office workouts`}
      </p>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              'px-3 py-2 text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-150 border-2',
              activeCategory === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter Info */}
      {(noJumps || noFloor || noEquipment) && (
        <div className="mb-4 p-3 bg-secondary border-2 border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {state.profile.language === 'es' ? 'Filtros activos' : 'Active filters'}
          </div>
          <div className="flex gap-2 flex-wrap">
            {noJumps && (
              <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning">
                {t.profile.noJumps}
              </span>
            )}
            {noFloor && (
              <span className="text-xs px-2 py-0.5 bg-info/20 text-info">
                {t.profile.noFloor}
              </span>
            )}
            {noEquipment && (
              <span className="text-xs px-2 py-0.5 bg-elite/20 text-elite">
                {t.profile.noEquipment}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-3">
        {displayExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
          />
        ))}
      </div>

      {displayExercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {state.profile.language === 'es'
              ? 'No hay ejercicios con estos filtros'
              : 'No exercises match your filters'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExercisesView;
