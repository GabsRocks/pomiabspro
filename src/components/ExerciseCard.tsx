import { cn } from '@/lib/utils';
import { Exercise } from '@/lib/exercises';
import { useApp } from '@/contexts/AppContext';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  compact?: boolean;
}

const ExerciseCard = ({ exercise, onClick, compact = false }: ExerciseCardProps) => {
  const { language } = useApp();

  const name = language === 'es' ? exercise.nameEs : exercise.name;
  const instructions = language === 'es' ? exercise.instructionsEs : exercise.instructions;

  const categoryColors: Record<Exercise['category'], string> = {
    chair: 'bg-info/20 text-info',
    strength: 'bg-destructive/20 text-destructive',
    cardio: 'bg-warning/20 text-warning',
    office: 'bg-primary/20 text-primary',
    stretch: 'bg-success/20 text-success',
    yoga: 'bg-elite/20 text-elite',
    military: 'bg-destructive/30 text-destructive',
  };

  const categoryLabels: Record<Exercise['category'], string> = {
    chair: language === 'es' ? 'Silla' : 'Chair',
    strength: language === 'es' ? 'Fuerza' : 'Strength',
    cardio: 'Cardio',
    office: language === 'es' ? 'Oficina' : 'Office',
    stretch: language === 'es' ? 'Estira' : 'Stretch',
    yoga: 'Yoga',
    military: language === 'es' ? 'Militar' : 'Military',
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 bg-card border-2 border-border hover:border-primary transition-colors duration-150"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{name}</span>
          <span className="font-mono text-sm text-muted-foreground">
            {exercise.reps}x{exercise.sets}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-card border-2 border-border hover:border-primary transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-foreground">{name}</h3>
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider px-2 py-0.5 flex-shrink-0',
            categoryColors[exercise.category]
          )}
        >
          {categoryLabels[exercise.category]}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{instructions}</p>

      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-foreground">
          {exercise.reps} reps × {exercise.sets} sets
        </span>
        <span className="text-muted-foreground">
          {exercise.restSeconds}s rest
        </span>
        <span
          className={cn(
            'font-bold uppercase tracking-wider',
            exercise.difficulty === 1 && 'text-success',
            exercise.difficulty === 2 && 'text-warning',
            exercise.difficulty === 3 && 'text-destructive'
          )}
        >
          {'●'.repeat(exercise.difficulty)}
        </span>
      </div>

      {/* Restriction indicators */}
      <div className="flex gap-2 mt-2">
        {exercise.requiresJumps && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-warning/10 text-warning">
            {language === 'es' ? 'Saltos' : 'Jumps'}
          </span>
        )}
        {exercise.requiresFloor && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-info/10 text-info">
            {language === 'es' ? 'Suelo' : 'Floor'}
          </span>
        )}
        {exercise.requiresEquipment && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-elite/10 text-elite">
            {language === 'es' ? 'Equipo' : 'Equip'}
          </span>
        )}
      </div>
    </button>
  );
};

export default ExerciseCard;
