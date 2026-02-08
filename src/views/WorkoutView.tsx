import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { exercises } from '@/lib/exercises';
import { X, Play, Pause, SkipForward, Check, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';
import ExerciseIllustration from '@/components/ExerciseIllustration';
import WorkoutTimer from '@/components/WorkoutTimer';

interface WorkoutViewProps {
  onClose: () => void;
}

const WorkoutView = ({ onClose }: WorkoutViewProps) => {
  const { state, t, addSession, addReps, language } = useApp();
  const { profile } = state;
  const { preferences, voiceCoachEnabled, name: userName } = profile;

  const voiceCoach = useVoiceCoach({
    language,
    enabled: voiceCoachEnabled,
    userName: userName || undefined,
  });

  const hasAnnouncedStart = useRef(false);
  const motivationalIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle time updates for milestone announcements
  const handleTimeUpdate = useCallback((elapsedSeconds: number) => {
    if (voiceCoachEnabled && !isResting && !isPaused) {
      voiceCoach.checkTimeMilestone(elapsedSeconds);
    }
  }, [voiceCoach, voiceCoachEnabled, isResting, isPaused]);

  // Reset milestones when starting new workout
  useEffect(() => {
    voiceCoach.resetMilestones();
  }, []);

  // Announce first exercise on mount
  useEffect(() => {
    if (!hasAnnouncedStart.current && currentExercise && voiceCoachEnabled) {
      hasAnnouncedStart.current = true;
      const exerciseName = language === 'es' ? currentExercise.nameEs : currentExercise.name;
      setTimeout(() => {
        voiceCoach.announceStart(exerciseName, currentExercise.reps, currentExercise.sets);
      }, 500);
    }
  }, [currentExercise, voiceCoach, voiceCoachEnabled, language]);

  // Motivational phrases every 5 seconds during active exercise
  useEffect(() => {
    if (!isResting && !isPaused && voiceCoachEnabled) {
      // Start motivational loop after 5 seconds
      motivationalIntervalRef.current = setInterval(() => {
        voiceCoach.startMotivationalLoop(5);
      }, 5000);

      // Actually start the loop
      voiceCoach.startMotivationalLoop(5);
    } else {
      voiceCoach.stopMotivationalLoop();
    }

    return () => {
      if (motivationalIntervalRef.current) {
        clearInterval(motivationalIntervalRef.current);
      }
      voiceCoach.stopMotivationalLoop();
    };
  }, [isResting, isPaused, voiceCoachEnabled, voiceCoach]);

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
    voiceCoach.stopMotivationalLoop();

    if (currentIndex < workoutExercises.length - 1) {
      setIsResting(true);
      setRestTime(currentExercise.restSeconds);
      
      // Announce rest period
      const nextExercise = workoutExercises[currentIndex + 1];
      const nextName = language === 'es' ? nextExercise.nameEs : nextExercise.name;
      voiceCoach.announceRest(currentExercise.restSeconds, nextName);
    } else {
      // Workout complete - announce end
      voiceCoach.announceEnd();
      
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
      
      setTimeout(() => onClose(), 2000);
    }
  };

  const handleSkip = () => {
    voiceCoach.stopMotivationalLoop();
    if (currentIndex < workoutExercises.length - 1) {
      const nextExercise = workoutExercises[currentIndex + 1];
      const nextName = language === 'es' ? nextExercise.nameEs : nextExercise.name;
      voiceCoach.announceExercise(nextName, nextExercise.reps);
      setCurrentIndex(currentIndex + 1);
    } else {
      voiceCoach.stopSpeaking();
      onClose();
    }
  };

  const handleClose = () => {
    voiceCoach.stopSpeaking();
    onClose();
  };

  const progress = ((currentIndex + (isResting ? 1 : 0)) / workoutExercises.length) * 100;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <button onClick={handleClose} className="p-2 hover:bg-muted rounded-sm">
          <X className="w-6 h-6" />
        </button>
        
        {/* Timer */}
        <WorkoutTimer 
          startTime={startTime} 
          isPaused={isPaused || isResting}
          onTimeUpdate={handleTimeUpdate}
        />
        
        <div className="flex items-center gap-3">
          {voiceCoachEnabled ? (
            <Volume2 className="w-4 h-4 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        {isResting ? (
          <div className="text-center animate-fade-in">
            <div className="terminal-text mb-4">
              {language === 'es' ? 'DESCANSO' : 'REST'}
            </div>
            <div className="metric-display text-accent mb-8">{restTime}</div>
            
            {/* Next exercise preview */}
            {workoutExercises[currentIndex + 1] && (
              <div className="space-y-4">
                <div className="text-muted-foreground mb-2">
                  {language === 'es' ? 'Siguiente:' : 'Next:'}
                </div>
                <ExerciseIllustration
                  category={workoutExercises[currentIndex + 1].category}
                  muscles={workoutExercises[currentIndex + 1].muscles}
                  size="lg"
                  className="mx-auto"
                />
                <div className="font-bold text-lg">
                  {language === 'es'
                    ? workoutExercises[currentIndex + 1]?.nameEs
                    : workoutExercises[currentIndex + 1]?.name}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center animate-fade-in w-full max-w-sm">
            {/* Exercise illustration */}
            <ExerciseIllustration
              category={currentExercise.category}
              muscles={currentExercise.muscles}
              size="lg"
              className="mx-auto mb-6"
            />
            
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? currentExercise.nameEs : currentExercise.name}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {language === 'es' ? currentExercise.instructionsEs : currentExercise.instructions}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-brutal p-4 text-center">
                <div className="terminal-text mb-1 text-xs">REPS</div>
                <div className="font-mono text-3xl font-bold text-primary">
                  {currentExercise.reps}
                </div>
              </div>
              <div className="card-brutal p-4 text-center">
                <div className="terminal-text mb-1 text-xs">SETS</div>
                <div className="font-mono text-3xl font-bold text-accent">
                  {currentExercise.sets}
                </div>
              </div>
            </div>

            {/* Muscles */}
            <div className="flex gap-2 justify-center flex-wrap">
              {currentExercise.muscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs uppercase tracking-wider px-2 py-1 bg-secondary text-muted-foreground border border-border"
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
