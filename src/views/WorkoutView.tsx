import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { exercises } from '@/lib/exercises';
import { X, Play, Pause, SkipForward, Check, Volume2, VolumeX, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';

import WorkoutTimer from '@/components/WorkoutTimer';
import WorkoutConfig, { WorkoutSettings } from '@/components/WorkoutConfig';

interface WorkoutViewProps {
  onClose: () => void;
}

// Detailed posture tips per muscle group (bilingual)
const postureTips: Record<string, { en: string; es: string }> = {
  core: {
    en: 'Keep your spine neutral. Engage your abs by pulling your belly button toward your spine. Avoid arching your lower back.',
    es: 'Mantén la columna neutra. Activa el abdomen llevando el ombligo hacia la columna. Evita arquear la espalda baja.',
  },
  legs: {
    en: 'Feet shoulder-width apart. Push through your heels. Keep knees aligned with your toes, never past them.',
    es: 'Pies al ancho de los hombros. Empuja con los talones. Rodillas alineadas con los dedos, nunca más adelante.',
  },
  arms: {
    en: 'Keep elbows close to your body. Wrists straight and firm. Shoulders down and back, not shrugged.',
    es: 'Mantén los codos pegados al cuerpo. Muñecas rectas y firmes. Hombros abajo y atrás, no encogidos.',
  },
  shoulders: {
    en: 'Depress your shoulder blades. Keep a slight bend in your elbows. Avoid using momentum.',
    es: 'Baja los omóplatos. Mantén una ligera flexión en los codos. Evita usar impulso.',
  },
  chest: {
    en: 'Keep your chest open and proud. Squeeze at the top of the movement. Controlled descent, explosive push.',
    es: 'Pecho abierto y firme. Aprieta al final del movimiento. Descenso controlado, empuje explosivo.',
  },
  back: {
    en: 'Retract your shoulder blades. Keep your core engaged throughout. Look slightly forward, not down.',
    es: 'Retrae los omóplatos. Core activo durante todo el movimiento. Mira ligeramente al frente, no hacia abajo.',
  },
  obliques: {
    en: 'Rotate from your torso, not your hips. Keep your core tight. Controlled movement, no swinging.',
    es: 'Rota desde el torso, no las caderas. Core apretado. Movimiento controlado, sin balanceo.',
  },
  glutes: {
    en: 'Squeeze your glutes at the top. Keep your hips level. Push through your heels.',
    es: 'Aprieta los glúteos arriba. Mantén las caderas niveladas. Empuja con los talones.',
  },
  'full-body': {
    en: 'Maintain a straight line from head to heels. Breathe rhythmically. Land softly on the balls of your feet.',
    es: 'Línea recta de cabeza a talones. Respira rítmicamente. Aterriza suave en la punta de los pies.',
  },
  triceps: {
    en: 'Elbows pointing straight back, not flared. Squeeze at full extension. Slow negatives for max burn.',
    es: 'Codos hacia atrás, no abiertos. Aprieta en extensión completa. Negativas lentas para máxima quema.',
  },
  calves: {
    en: 'Rise to the balls of your feet. Pause at the top. Full range of motion, stretch at the bottom.',
    es: 'Elévate en las puntas. Pausa arriba. Rango completo de movimiento, estira abajo.',
  },
  hip: {
    en: 'Keep hips square. Open through the hip flexors. Engage your core for stability.',
    es: 'Caderas cuadradas. Abre los flexores de cadera. Activa el core para estabilidad.',
  },
};

// Motivational atmosphere messages that rotate during workout
const motivationalAtmosphere = {
  es: [
    '🔥 ZONA DE COMBATE — Cada repetición te acerca a tu mejor versión',
    '⚡ MODO DESTRUCCIÓN — El dolor es debilidad abandonando tu cuerpo',
    '🎯 ENFOQUE TOTAL — Tu mente controla el músculo, no al revés',
    '💪 SIN RENDIRSE — Los campeones entrenan cuando no quieren',
    '🏆 ÉLITE ACTIVA — Estás donde el 1% se forja',
    '🫡 DISCIPLINA PURA — La motivación falla, la disciplina nunca',
    '🔥 QUEMANDO GRASA — Cada segundo cuenta, no pares',
    '⚔️ GUERRERO ACTIVO — Tu cuerpo puede, tu mente decide',
  ],
  en: [
    '🔥 COMBAT ZONE — Every rep brings you closer to your best self',
    '⚡ DESTROY MODE — Pain is weakness leaving your body',
    '🎯 TOTAL FOCUS — Your mind controls the muscle, not the other way',
    '💪 NO SURRENDER — Champions train when they don\'t want to',
    '🏆 ELITE ACTIVE — You\'re where the top 1% is forged',
    '🫡 PURE DISCIPLINE — Motivation fails, discipline never does',
    '🔥 BURNING FAT — Every second counts, don\'t stop',
    '⚔️ WARRIOR ACTIVE — Your body can, your mind decides',
  ],
};

const WorkoutView = ({ onClose }: WorkoutViewProps) => {
  const { state, t, addSession, addReps, language, updateProfile } = useApp();
  const { profile } = state;
  const { preferences, voiceCoachEnabled, voiceVolume = 1.0, name: userName } = profile;

  // Workout configuration state
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [workoutSettings, setWorkoutSettings] = useState<WorkoutSettings | null>(null);
  const [showPosture, setShowPosture] = useState(true);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [atmosphereIndex, setAtmosphereIndex] = useState(0);

  const voiceCoach = useVoiceCoach({
    language,
    enabled: voiceCoachEnabled,
    userName: userName || undefined,
    volume: voiceVolume,
  });

  const hasAnnouncedStart = useRef(false);
  const startTimeRef = useRef<number>(0);

  // Filter exercises based on user preferences
  const availableExercises = exercises.filter(e =>
    (!preferences.noJumps || !e.requiresJumps) &&
    (!preferences.noFloor || !e.requiresFloor) &&
    (!preferences.noEquipment || !e.requiresEquipment)
  );

  // Pick random exercises for the workout
  const [workoutExercises] = useState(() => {
    const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const currentExercise = workoutExercises[currentIndex];

  // Rotate motivational atmosphere every 8 seconds
  useEffect(() => {
    if (isConfiguring || workoutComplete || isResting) return;
    const interval = setInterval(() => {
      setAtmosphereIndex(prev => (prev + 1) % motivationalAtmosphere[language].length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isConfiguring, workoutComplete, isResting, language]);

  // Get posture tips for current exercise muscles
  const currentPostureTips = useMemo(() => {
    if (!currentExercise) return [];
    return currentExercise.muscles
      .map(muscle => {
        const tip = postureTips[muscle];
        return tip ? { muscle, text: language === 'es' ? tip.es : tip.en } : null;
      })
      .filter(Boolean) as { muscle: string; text: string }[];
  }, [currentExercise, language]);

  // Handle workout configuration
  const handleStartWorkout = (settings: WorkoutSettings) => {
    setWorkoutSettings(settings);
    setIsConfiguring(false);
    startTimeRef.current = Date.now();
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    updateProfile({ voiceVolume: value[0] });
  };

  // Handle time updates for milestone announcements
  const handleTimeUpdate = useCallback((elapsedSeconds: number) => {
    if (voiceCoachEnabled && !isResting && !isPaused) {
      voiceCoach.checkTimeMilestone(elapsedSeconds);
    }
  }, [voiceCoach, voiceCoachEnabled, isResting, isPaused]);

  // Handle target time reached
  const handleTargetReached = useCallback(() => {
    if (voiceCoachEnabled) {
      const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
      const message = language === 'es'
        ? `¡${name}, completaste tu tiempo objetivo! ¡Increíble trabajo!`
        : `${name}, you hit your target time! Incredible work!`;
      voiceCoach.speak(message);
    }
  }, [voiceCoach, voiceCoachEnabled, userName, language]);

  // Reset milestones when starting new workout
  useEffect(() => {
    if (!isConfiguring) {
      voiceCoach.resetMilestones();
    }
  }, [isConfiguring]);

  // Announce first exercise on mount
  useEffect(() => {
    if (!isConfiguring && !hasAnnouncedStart.current && currentExercise && voiceCoachEnabled) {
      hasAnnouncedStart.current = true;
      const exerciseName = language === 'es' ? currentExercise.nameEs : currentExercise.name;
      setTimeout(() => {
        voiceCoach.announceStart(exerciseName, currentExercise.reps, currentExercise.sets);
      }, 500);
    }
  }, [isConfiguring, currentExercise, voiceCoach, voiceCoachEnabled, language]);

  // Motivational phrases every 5 seconds during active exercise
  useEffect(() => {
    if (!isConfiguring && !isResting && !isPaused && voiceCoachEnabled) {
      voiceCoach.startMotivationalLoop(5);
    } else {
      voiceCoach.stopMotivationalLoop();
    }

    return () => {
      voiceCoach.stopMotivationalLoop();
    };
  }, [isConfiguring, isResting, isPaused, voiceCoachEnabled, voiceCoach]);

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
      setRestTime(workoutSettings?.restSeconds || 30);
      
      const nextExercise = workoutExercises[currentIndex + 1];
      const nextName = language === 'es' ? nextExercise.nameEs : nextExercise.name;
      voiceCoach.announceRest(workoutSettings?.restSeconds || 30, nextName);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setWorkoutComplete(true);
    voiceCoach.announceEnd();
    
    const durationMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    addSession({
      date: new Date().toISOString(),
      exercises: workoutExercises.slice(0, currentIndex + 1).map(e => ({
        exerciseId: e.id,
        reps: e.reps,
        sets: e.sets,
      })),
      totalReps: completedReps + (currentExercise?.reps || 0) * (currentExercise?.sets || 0),
      durationMinutes: Math.max(1, durationMinutes),
      mode: 'guided',
    });
    
    setTimeout(() => onClose(), 3000);
  };

  const handleSkip = () => {
    voiceCoach.stopMotivationalLoop();
    if (currentIndex < workoutExercises.length - 1) {
      const nextExercise = workoutExercises[currentIndex + 1];
      const nextName = language === 'es' ? nextExercise.nameEs : nextExercise.name;
      voiceCoach.announceExercise(nextName, nextExercise.reps);
      setCurrentIndex(currentIndex + 1);
    } else {
      finishWorkout();
    }
  };

  const handleClose = () => {
    voiceCoach.stopSpeaking();
    onClose();
  };

  // Show configuration screen first
  if (isConfiguring) {
    return (
      <WorkoutConfig
        language={language}
        onStart={handleStartWorkout}
        onCancel={onClose}
      />
    );
  }

  const progress = ((currentIndex + (isResting ? 1 : 0)) / workoutExercises.length) * 100;

  // Workout complete screen
  if (workoutComplete) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="terminal-text text-2xl mb-4">
            {language === 'es' ? '¡RUTINA COMPLETADA!' : 'WORKOUT COMPLETE!'}
          </h1>
          <div className="font-mono text-4xl font-bold text-primary mb-2">
            {completedReps}
          </div>
          <div className="text-muted-foreground">
            {language === 'es' ? 'repeticiones totales' : 'total reps'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <button onClick={handleClose} className="p-2 hover:bg-muted rounded-sm">
          <X className="w-6 h-6" />
        </button>
        
        <WorkoutTimer 
          isActive={!isResting && !isPaused}
          targetMinutes={workoutSettings?.durationMinutes}
          onTimeUpdate={handleTimeUpdate}
          onTargetReached={handleTargetReached}
        />
        
        <div className="flex items-center gap-3">
          {/* Volume toggle */}
          <button
            onClick={() => setShowVolumeControl(!showVolumeControl)}
            className="p-1 hover:bg-muted rounded-sm"
          >
            {voiceCoachEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <div className="terminal-text text-xs">
            {currentIndex + 1}/{workoutExercises.length}
          </div>
        </div>
        
        <div className="font-mono text-primary text-sm">{completedReps} reps</div>
      </div>

      {/* Volume Slider (collapsible) */}
      {showVolumeControl && (
        <div className="px-4 py-3 border-b border-border bg-card animate-fade-in">
          <div className="max-w-sm mx-auto flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[voiceVolume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-mono text-xs text-muted-foreground w-10 text-right">
              {Math.round(voiceVolume * 100)}%
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1">
            {language === 'es' ? 'Sube el volumen para escuchar sobre tu música' : 'Turn up to hear over your music'}
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="progress-military h-2">
        <div
          className="progress-military-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Motivational Atmosphere Banner */}
      {!isResting && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
          <p className="text-center text-xs font-bold text-primary tracking-wider animate-fade-in" key={atmosphereIndex}>
            {motivationalAtmosphere[language][atmosphereIndex]}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        {isResting ? (
          <div className="text-center animate-fade-in">
            <div className="terminal-text mb-4">
              {language === 'es' ? 'DESCANSO' : 'REST'}
            </div>
            <div className="metric-display text-accent mb-8">{restTime}</div>
            
            {/* Next exercise preview with posture info */}
            {workoutExercises[currentIndex + 1] && (() => {
              const next = workoutExercises[currentIndex + 1];
              const nextName = language === 'es' ? next.nameEs : next.name;
              const nextInstructions = language === 'es' ? next.instructionsEs : next.instructions;
              return (
                <div className="space-y-3 max-w-sm">
                  <div className="text-muted-foreground text-sm">
                    {language === 'es' ? 'Siguiente:' : 'Next:'}
                  </div>
                  <div className="font-bold text-lg">{nextName}</div>
                  <div className="card-brutal p-3 text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {language === 'es' ? '📋 Postura:' : '📋 Form:'}
                    </p>
                    <p className="text-sm">{nextInstructions}</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {language === 'es'
                      ? '💡 Prepara tu posición mientras descansas'
                      : '💡 Get into position while you rest'}
                  </p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center animate-fade-in w-full max-w-sm">
            
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? currentExercise.nameEs : currentExercise.name}
            </h2>

            {/* Detailed instructions */}
            <div className="card-brutal p-3 mb-4 text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {language === 'es' ? 'CÓMO HACERLO' : 'HOW TO DO IT'}
              </p>
              <p className="text-sm">
                {language === 'es' ? currentExercise.instructionsEs : currentExercise.instructions}
              </p>
            </div>

            {/* Posture tips (collapsible) */}
            {currentPostureTips.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowPosture(!showPosture)}
                  className="flex items-center gap-1 mx-auto text-xs text-primary uppercase tracking-wider mb-2"
                >
                  {language === 'es' ? '🎯 Tips de Postura' : '🎯 Posture Tips'}
                  {showPosture ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showPosture && (
                  <div className="space-y-2 animate-fade-in">
                    {currentPostureTips.map(({ muscle, text }) => (
                      <div key={muscle} className="bg-primary/5 border border-primary/20 rounded-sm p-2 text-left">
                        <span className="text-xs font-bold text-primary uppercase">{muscle}: </span>
                        <span className="text-xs text-foreground">{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
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
