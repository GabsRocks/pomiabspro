import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { exercises } from '@/lib/exercises';
import { X, Play, Pause, SkipForward, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutViewProps {
  onClose: () => void;
}

const WorkoutView = ({ onClose }: WorkoutViewProps) => {
  const { state, t, addSession, addReps, language } = useApp();
  const { preferences } = state.profile;

  // Filter exercises based on user preferences
  const availableExercises = exercises.filter(e =>
    (!preferences.noJumps || !e.requiresJumps) &&
    (!preferences.noFloor || !e.requiresFloor) &&
    (!preferences.noEquipment || !e.requiresEquipment)
  );

  // Pick random exercises for the workout
  const [workoutExercises] = useState(() => {
    const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());

  const currentExercise = workoutExercises[currentIndex];

  // Rest timer
  useEffect(() => {
    if (isResting && restTime > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setRestTime(restTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      if (currentIndex < workoutExercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  }, [isResting, restTime, isPaused, currentIndex, workoutExercises.length]);

  const handleComplete = () => {
    const reps = currentExercise.reps * currentExercise.sets;
    setCompletedReps(completedReps + reps);
    addReps(reps, currentExercise.muscles[0]);

    if (currentIndex < workoutExercises.length - 1) {
      setIsResting(true);
      setRestTime(currentExercise.restSeconds);
    } else {
      // Workout complete
      const durationMinutes = Math.round((Date.now() - startTime) / 60000);
      addSession({
        date: new Date().toISOString(),
        exercises: workoutExercises.map(e => ({
          exerciseId: e.id,
          reps: e.reps,
          sets: e.sets,
        })),
        totalReps: completedReps + currentExercise.reps * currentExercise.sets,
        durationMinutes: Math.max(1, durationMinutes),
        mode: 'guided',
      });
      onClose();
    }
  };

  const handleSkip = () => {
    if (currentIndex < workoutExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const progress = ((currentIndex + (isResting ? 1 : 0)) / workoutExercises.length) * 100;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-sm">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="terminal-text">
            {currentIndex + 1}/{workoutExercises.length}
          </div>
        </div>
        <div className="font-mono text-primary">{completedReps} reps</div>
      </div>

      {/* Progress */}
      <div className="progress-military h-2">
        <div
          className="progress-military-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isResting ? (
          <div className="text-center animate-fade-in">
            <div className="terminal-text mb-4">
              {language === 'es' ? 'DESCANSO' : 'REST'}
            </div>
            <div className="metric-display text-accent mb-8">{restTime}</div>
            <div className="text-muted-foreground">
              {language === 'es' ? 'Siguiente:' : 'Next:'}{' '}
              {language === 'es'
                ? workoutExercises[currentIndex + 1]?.nameEs
                : workoutExercises[currentIndex + 1]?.name}
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? currentExercise.nameEs : currentExercise.name}
            </h2>
            <p className="text-muted-foreground mb-8">
              {language === 'es' ? currentExercise.instructionsEs : currentExercise.instructions}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card-brutal p-4 text-center">
                <div className="terminal-text mb-1">REPS</div>
                <div className="font-mono text-3xl font-bold text-primary">
                  {currentExercise.reps}
                </div>
              </div>
              <div className="card-brutal p-4 text-center">
                <div className="terminal-text mb-1">SETS</div>
                <div className="font-mono text-3xl font-bold text-accent">
                  {currentExercise.sets}
                </div>
              </div>
            </div>

            {/* Muscles */}
            <div className="flex gap-2 justify-center mb-6">
              {currentExercise.muscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs uppercase tracking-wider px-2 py-1 bg-secondary text-muted-foreground"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t-2 border-border">
        <div className="flex gap-3 max-w-sm mx-auto">
          {isResting ? (
            <>
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                className="flex-1 h-14 border-2"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                onClick={() => {
                  setIsResting(false);
                  setCurrentIndex(currentIndex + 1);
                }}
                className="flex-1 h-14 btn-military"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                {language === 'es' ? 'SALTAR' : 'SKIP'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="h-14 px-6 border-2"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 h-14 btn-military"
              >
                <Check className="w-5 h-5 mr-2" />
                {t.common.complete}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutView;
