// PomiABSPro - Unified Workout View (Config + Execution + Completion)
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { exercises } from '@/lib/exercises';
import {
  X, Play, Pause, SkipForward, Check, Square,
  Volume2, VolumeX, ChevronDown, ChevronUp, Flame,
  Clock, Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';
import WorkoutTimer from '@/components/WorkoutTimer';
import type { WorkoutSettings } from '@/components/WorkoutConfig';
import { savePausedWorkout, clearPausedWorkout, PausedWorkout } from '@/lib/pausedWorkout';

interface WorkoutViewProps {
  onClose: () => void;
  resumeData?: PausedWorkout | null;
}

// ── Config options ──
const durationOptions = [5, 10, 15, 20, 30, 45];
const restOptions = [15, 20, 30, 45, 60, 90];

// ── Posture tips ──
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

type Phase = 'warmup' | 'active' | 'complete';

const WorkoutView = ({ onClose, resumeData }: WorkoutViewProps) => {
  const { state, t, addSession, addReps, language, updateProfile } = useApp();
  const { profile } = state;
  const { preferences, voiceCoachEnabled, voiceVolume = 1.0, name: userName } = profile;

  // ── Phase ── (skip warmup if resuming)
  const [phase, setPhase] = useState<Phase>(resumeData ? 'active' : 'warmup');

  // ── Config state ──
  const [durationIdx, setDurationIdx] = useState(resumeData?.durationIdx ?? 1);
  const [restIdx, setRestIdx] = useState(resumeData?.restIdx ?? 2);
  const duration = durationOptions[durationIdx];
  const rest = restOptions[restIdx];

  // ── Workout state ──
  const [showPosture, setShowPosture] = useState(true);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [atmosphereIndex, setAtmosphereIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(resumeData?.currentIndex ?? 0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedReps, setCompletedReps] = useState(resumeData?.completedReps ?? 0);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfigInline, setShowConfigInline] = useState(false);
  const [warmupTime, setWarmupTime] = useState(60);

  const voiceCoach = useVoiceCoach({
    language,
    enabled: voiceCoachEnabled,
    userName: userName || undefined,
    volume: voiceVolume,
  });

  const hasAnnouncedStart = useRef(false);
  const startTimeRef = useRef<number>(resumeData ? Date.now() : 0);

  // Filter exercises
  const availableExercises = exercises.filter(e =>
    (!preferences.noJumps || !e.requiresJumps) &&
    (!preferences.noFloor || !e.requiresFloor) &&
    (!preferences.noEquipment || !e.requiresEquipment)
  );

  const [workoutExercises] = useState(() => {
    if (resumeData) {
      // Restore the exact exercise order from paused session
      return resumeData.exerciseIds
        .map(id => exercises.find(e => e.id === id))
        .filter(Boolean) as typeof exercises;
    }
    const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  });

  const currentExercise = workoutExercises[currentIndex];

  // ── Helpers ──
  const cycleDuration = (dir: 1 | -1) => {
    setDurationIdx(prev => {
      const next = prev + dir;
      if (next < 0) return durationOptions.length - 1;
      if (next >= durationOptions.length) return 0;
      return next;
    });
  };

  const cycleRest = (dir: 1 | -1) => {
    setRestIdx(prev => {
      const next = prev + dir;
      if (next < 0) return restOptions.length - 1;
      if (next >= restOptions.length) return 0;
      return next;
    });
  };

  const fmtDuration = (mins: number) => `${mins.toString().padStart(2, '0')}:00`;
  const fmtRest = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Posture tips ──
  const currentPostureTips = useMemo(() => {
    if (!currentExercise) return [];
    return currentExercise.muscles
      .map(muscle => {
        const tip = postureTips[muscle];
        return tip ? { muscle, text: language === 'es' ? tip.es : tip.en } : null;
      })
      .filter(Boolean) as { muscle: string; text: string }[];
  }, [currentExercise, language]);

  // ── Announce warmup on mount ──
  const hasAnnouncedWarmup = useRef(false);
  useEffect(() => {
    if (phase === 'warmup' && !hasAnnouncedWarmup.current && voiceCoachEnabled) {
      hasAnnouncedWarmup.current = true;
      voiceCoach.speak(language === 'es' ? '¡Calentamiento! 60 segundos.' : 'Warmup! 60 seconds.');
    }
  }, [phase, voiceCoachEnabled, voiceCoach, language]);

  // ── Warmup countdown ──
  useEffect(() => {
    if (phase !== 'warmup' || isPaused) return;
    if (warmupTime <= 0) {
      setPhase('active');
      startTimeRef.current = Date.now();
      if (voiceCoachEnabled) {
        voiceCoach.speak(language === 'es' ? '¡Vamos! ¡A entrenar!' : "Let's go! Start training!");
      }
      return;
    }
    const timer = setTimeout(() => {
      const next = warmupTime - 1;
      setWarmupTime(next);
      if (next <= 5 && next > 0 && voiceCoachEnabled) {
        voiceCoach.speak(`${next}`);
      }
      if (next === 30 && voiceCoachEnabled) {
        voiceCoach.speak(language === 'es' ? '30 segundos' : '30 seconds');
      }
      if (next === 10 && voiceCoachEnabled) {
        voiceCoach.speak(language === 'es' ? '10 segundos, prepárate' : '10 seconds, get ready');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, warmupTime, isPaused, voiceCoachEnabled, voiceCoach, language]);

  // ── Atmosphere rotation ──
  useEffect(() => {
    if (phase !== 'active' || isResting) return;
    const interval = setInterval(() => {
      setAtmosphereIndex(prev => (prev + 1) % motivationalAtmosphere[language].length);
    }, 8000);
    return () => clearInterval(interval);
  }, [phase, isResting, language]);

  // ── Voice: announce start ──
  useEffect(() => {
    if (phase !== 'active' || hasAnnouncedStart.current || !currentExercise || !voiceCoachEnabled) return;
    hasAnnouncedStart.current = true;
    const exerciseName = language === 'es' ? currentExercise.nameEs : currentExercise.name;
    const totalExercises = workoutExercises.length;
    const totalRepsEstimate = workoutExercises.reduce((sum, e) => sum + e.reps * e.sets, 0);
    setTimeout(() => {
      const intro = language === 'es'
        ? `¡Vamos! ${totalExercises} ejercicios, aproximadamente ${totalRepsEstimate} repeticiones en total.`
        : `Let's go! ${totalExercises} exercises, approximately ${totalRepsEstimate} total reps.`;
      voiceCoach.speak(intro);
      setTimeout(() => {
        voiceCoach.announceStart(exerciseName, currentExercise.reps, currentExercise.sets);
      }, 3000);
    }, 500);
  }, [phase, currentExercise, voiceCoach, voiceCoachEnabled, language, workoutExercises]);

  // ── Motivational loop ──
  useEffect(() => {
    if (phase === 'active' && !isResting && !isPaused && voiceCoachEnabled) {
      voiceCoach.startMotivationalLoop(5);
    } else {
      voiceCoach.stopMotivationalLoop();
    }
    return () => { voiceCoach.stopMotivationalLoop(); };
  }, [phase, isResting, isPaused, voiceCoachEnabled, voiceCoach]);

  // ── Rest timer ──
  useEffect(() => {
    if (isResting && restTime > 0 && !isPaused) {
      const timer = setTimeout(() => {
        const newTime = restTime - 1;
        setRestTime(newTime);
        if (newTime <= 3 && newTime > 0 && voiceCoachEnabled) {
          voiceCoach.speak(`${newTime}`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      if (currentIndex < workoutExercises.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        if (voiceCoachEnabled) {
          const next = workoutExercises[nextIdx];
          const nextName = language === 'es' ? next.nameEs : next.name;
          voiceCoach.announceExercise(nextName, next.reps);
        }
      }
    }
  }, [isResting, restTime, isPaused, currentIndex, workoutExercises, voiceCoachEnabled, voiceCoach, language]);

  const handleVolumeChange = (value: number[]) => {
    updateProfile({ voiceVolume: value[0] });
  };

  const handleTimeUpdate = useCallback((elapsedSeconds: number) => {
    if (voiceCoachEnabled && !isResting && !isPaused) {
      voiceCoach.checkTimeMilestone(elapsedSeconds);
    }
  }, [voiceCoach, voiceCoachEnabled, isResting, isPaused]);

  const handleTargetReached = useCallback(() => {
    if (voiceCoachEnabled) {
      const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
      const msg = language === 'es'
        ? `¡${name}, completaste tu tiempo objetivo! ¡Increíble trabajo!`
        : `${name}, you hit your target time! Incredible work!`;
      voiceCoach.speak(msg);
    }
  }, [voiceCoach, voiceCoachEnabled, userName, language]);

  useEffect(() => {
    if (phase === 'active') voiceCoach.resetMilestones();
  }, [phase]);

  // ── Exercise complete ──
  const handleComplete = () => {
    const reps = currentExercise.reps * currentExercise.sets;
    setCompletedReps(prev => prev + reps);
    addReps(reps, currentExercise.muscles[0]);
    voiceCoach.stopMotivationalLoop();
    setIsPaused(false);

    if (voiceCoachEnabled) {
      voiceCoach.speak(language === 'es' ? '¡Ejercicio completado!' : 'Exercise complete!');
    }

    if (currentIndex < workoutExercises.length - 1) {
      setIsResting(true);
      setRestTime(rest);
      setTimeout(() => {
        const nextExercise = workoutExercises[currentIndex + 1];
        const nextName = language === 'es' ? nextExercise.nameEs : nextExercise.name;
        voiceCoach.announceRest(rest, nextName);
      }, 1500);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    clearPausedWorkout();
    setPhase('complete');
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

  const handleSkipRest = () => {
    setIsResting(false);
    if (currentIndex < workoutExercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (voiceCoachEnabled) {
        const next = workoutExercises[nextIdx];
        const nextName = language === 'es' ? next.nameEs : next.name;
        voiceCoach.announceExercise(nextName, next.reps);
      }
    }
  };

  const handleStop = () => {
    voiceCoach.stopSpeaking();
    if (phase === 'active' && completedReps > 0) {
      finishWorkout();
    } else {
      onClose();
    }
  };

  const togglePause = () => {
    const wasPaused = isPaused;
    setIsPaused(!isPaused);
    if (voiceCoachEnabled) {
      if (wasPaused) {
        voiceCoach.speak(language === 'es' ? '¡Vamos, continúa!' : "Let's go, continue!");
      } else {
        voiceCoach.speak(language === 'es' ? 'Pausa' : 'Pause');
      }
    }
  };

  const handleClose = () => {
    voiceCoach.stopSpeaking();
    // Save paused state if workout is in progress
    if (phase === 'active' || phase === 'warmup') {
      savePausedWorkout({
        exerciseIds: workoutExercises.map(e => e.id),
        currentIndex,
        completedReps,
        durationIdx,
        restIdx,
        pausedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const progress = phase === 'active'
    ? ((currentIndex + (isResting ? 1 : 0)) / workoutExercises.length) * 100
    : phase === 'complete' ? 100 : 0;

  const totalRepsEstimate = workoutExercises.reduce((sum, e) => sum + e.reps * e.sets, 0);

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between p-3 border-b-2 border-border">
        <button onClick={handleClose} className="p-2 hover:bg-muted rounded-sm">
          <X className="w-5 h-5" />
        </button>

        {phase === 'active' && (
          <WorkoutTimer
            isActive={!isResting && !isPaused}
            targetMinutes={duration}
            onTimeUpdate={handleTimeUpdate}
            onTargetReached={handleTargetReached}
          />
        )}

        <div className="flex items-center gap-2">
          {phase === 'active' && (
            <>
              <button
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="p-1 hover:bg-muted rounded-sm"
              >
                {voiceCoachEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              </button>
              <span className="terminal-text text-xs">{currentIndex + 1}/{workoutExercises.length}</span>
              <span className="font-mono text-primary text-xs">{completedReps} reps</span>
            </>
          )}
        </div>
      </div>

      {/* Volume slider */}
      {showVolumeControl && phase === 'active' && (
        <div className="px-4 py-2 border-b border-border bg-card">
          <div className="max-w-sm mx-auto flex items-center gap-3">
            <VolumeX className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <Slider value={[voiceVolume]} onValueChange={handleVolumeChange} min={0} max={1} step={0.1} className="flex-1" />
            <Volume2 className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="font-mono text-xs text-muted-foreground w-8 text-right">{Math.round(voiceVolume * 100)}%</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="progress-military h-1.5">
        <div className="progress-military-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Motivational banner */}
      {phase === 'active' && !isResting && (
        <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20">
          <p className="text-center text-xs font-bold text-primary tracking-wider" key={atmosphereIndex}>
            {motivationalAtmosphere[language][atmosphereIndex]}
          </p>
        </div>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 overflow-auto">
        {/* Config phase removed — goes straight to warmup */}

        {/* ── WARMUP PHASE ── */}
        {phase === 'warmup' && (
          <div className="flex flex-col items-center justify-center h-full p-6 gap-6">
            <div className="text-center">
              <h1 className="terminal-text text-xl mb-2">
                🔥 {language === 'es' ? 'CALENTAMIENTO' : 'WARMUP'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'es' ? 'Prepara tu cuerpo para el entrenamiento' : 'Prepare your body for the workout'}
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - warmupTime / 60)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-mono text-6xl font-bold text-primary">{warmupTime}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {language === 'es' ? 'segundos' : 'seconds'}
                </div>
              </div>
            </div>

            <div className="card-brutal p-3 w-full max-w-sm text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {language === 'es' ? 'Primer ejercicio:' : 'First exercise:'}
              </p>
              <p className="font-bold text-sm">
                {language === 'es' ? workoutExercises[0]?.nameEs : workoutExercises[0]?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {workoutExercises[0]?.reps}×{workoutExercises[0]?.sets} • ~{totalRepsEstimate} {language === 'es' ? 'reps totales' : 'total reps'}
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic text-center">
              💡 {language === 'es' ? 'Estira, mueve articulaciones, activa tu cuerpo' : 'Stretch, move joints, activate your body'}
            </p>
          </div>
        )}

        {/* ── ACTIVE PHASE ── */}
        {phase === 'active' && (
          <div className="flex flex-col items-center p-4 gap-4">
            {/* Inline config toggle */}
            <button
              onClick={() => setShowConfigInline(!showConfigInline)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Clock className="w-3 h-3" />
              <span className="font-mono">{duration}min</span>
              <span className="text-muted-foreground mx-1">|</span>
              <Timer className="w-3 h-3" />
              <span className="font-mono">{rest}s</span>
              {showConfigInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showConfigInline && (
              <div className="flex gap-4 items-center bg-card border border-border rounded-sm p-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <button onClick={() => cycleDuration(-1)} className="p-1 border border-border rounded-sm"><ChevronDown className="w-3 h-3" /></button>
                  <span className="font-mono text-sm text-primary font-bold">{fmtDuration(duration)}</span>
                  <button onClick={() => cycleDuration(1)} className="p-1 border border-border rounded-sm"><ChevronUp className="w-3 h-3" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => cycleRest(-1)} className="p-1 border border-border rounded-sm"><ChevronDown className="w-3 h-3" /></button>
                  <span className="font-mono text-sm text-accent font-bold">{fmtRest(rest)}</span>
                  <button onClick={() => cycleRest(1)} className="p-1 border border-border rounded-sm"><ChevronUp className="w-3 h-3" /></button>
                </div>
              </div>
            )}

            {isResting ? (
              /* ── REST SCREEN ── */
              <div className="text-center w-full max-w-sm">
                <div className="terminal-text mb-2">{language === 'es' ? 'DESCANSO' : 'REST'}</div>
                <div className="metric-display text-accent mb-4">{restTime}</div>

                {workoutExercises[currentIndex + 1] && (() => {
                  const next = workoutExercises[currentIndex + 1];
                  const nextName = language === 'es' ? next.nameEs : next.name;
                  const nextInstructions = language === 'es' ? next.instructionsEs : next.instructions;
                  return (
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-xs">{language === 'es' ? 'Siguiente:' : 'Next:'}</div>
                      <div className="font-bold text-base">{nextName}</div>
                      <div className="card-brutal p-2 text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">📋 {language === 'es' ? 'Postura:' : 'Form:'}</p>
                        <p className="text-xs">{nextInstructions}</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        💡 {language === 'es' ? 'Prepara tu posición' : 'Get into position'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* ── EXERCISE SCREEN ── */
              <div className="text-center w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">
                  {language === 'es' ? currentExercise.nameEs : currentExercise.name}
                </h2>

                {/* Instructions */}
                <div className="card-brutal p-2.5 mb-3 text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {language === 'es' ? 'CÓMO HACERLO' : 'HOW TO DO IT'}
                  </p>
                  <p className="text-sm">{language === 'es' ? currentExercise.instructionsEs : currentExercise.instructions}</p>
                </div>

                {/* Posture tips */}
                {currentPostureTips.length > 0 && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowPosture(!showPosture)}
                      className="flex items-center gap-1 mx-auto text-xs text-primary uppercase tracking-wider mb-1.5"
                    >
                      🎯 {language === 'es' ? 'Tips de Postura' : 'Posture Tips'}
                      {showPosture ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showPosture && (
                      <div className="space-y-1.5">
                        {currentPostureTips.map(({ muscle, text }) => (
                          <div key={muscle} className="bg-primary/5 border border-primary/20 rounded-sm p-2 text-left">
                            <span className="text-xs font-bold text-primary uppercase">{muscle}: </span>
                            <span className="text-xs">{text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reps & Sets */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="card-brutal p-3 text-center">
                    <div className="terminal-text mb-0.5 text-xs">REPS</div>
                    <div className="font-mono text-2xl font-bold text-primary">{currentExercise.reps}</div>
                  </div>
                  <div className="card-brutal p-3 text-center">
                    <div className="terminal-text mb-0.5 text-xs">SETS</div>
                    <div className="font-mono text-2xl font-bold text-accent">{currentExercise.sets}</div>
                  </div>
                </div>

                {/* Muscles */}
                <div className="flex gap-1.5 justify-center flex-wrap">
                  {currentExercise.muscles.map(muscle => (
                    <span key={muscle} className="text-xs uppercase tracking-wider px-2 py-0.5 bg-secondary text-muted-foreground border border-border">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETE PHASE ── */}
        {phase === 'complete' && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🏆</div>
              <h1 className="terminal-text text-xl">
                {language === 'es' ? '¡RUTINA COMPLETADA!' : 'WORKOUT COMPLETE!'}
              </h1>
              <div className="font-mono text-5xl font-bold text-primary">{completedReps}</div>
              <div className="text-muted-foreground text-sm">
                {language === 'es' ? 'repeticiones totales' : 'total reps'}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mt-4">
                <div className="card-brutal p-3 text-center">
                  <div className="terminal-text text-xs mb-0.5">{language === 'es' ? 'EJERCICIOS' : 'EXERCISES'}</div>
                  <div className="font-mono text-xl font-bold text-foreground">{currentIndex + 1}</div>
                </div>
                <div className="card-brutal p-3 text-center">
                  <div className="terminal-text text-xs mb-0.5">{language === 'es' ? 'TIEMPO' : 'TIME'}</div>
                  <div className="font-mono text-xl font-bold text-accent">
                    {Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000))} min
                  </div>
                </div>
              </div>
              <Button onClick={onClose} className="btn-military mt-4 h-12 px-8">
                {language === 'es' ? 'CERRAR' : 'CLOSE'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ══ CONTROLS ══ */}
      {phase !== 'complete' && (
        <div className="p-3 border-t-2 border-border">
          <div className="flex gap-2 max-w-sm mx-auto">
            {phase === 'warmup' ? (
              /* Warmup controls */
              <>
                <Button onClick={togglePause} variant="outline" className="flex-1 h-12 border-2">
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? (language === 'es' ? 'CONTINUAR' : 'RESUME') : (language === 'es' ? 'PAUSA' : 'PAUSE')}
                </Button>
                <Button onClick={() => { setWarmupTime(0); }} className="flex-1 h-12 btn-military">
                  <SkipForward className="w-5 h-5 mr-2" />
                  {language === 'es' ? 'SALTAR' : 'SKIP'}
                </Button>
              </>
            ) : isResting ? (
              /* Rest controls */
              <>
                <Button onClick={togglePause} variant="outline" className="h-12 px-4 border-2">
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                <Button onClick={handleSkipRest} className="flex-1 h-12 btn-military">
                  <SkipForward className="w-5 h-5 mr-2" />
                  {language === 'es' ? 'SIGUIENTE' : 'NEXT'}
                </Button>
                <Button onClick={handleStop} variant="outline" className="h-12 px-4 border-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                  <Square className="w-4 h-4" />
                </Button>
              </>
            ) : (
              /* Exercise controls */
              <>
                <Button onClick={togglePause} variant="outline" className="h-12 px-4 border-2">
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                <Button onClick={handleComplete} className="flex-1 h-12 btn-military">
                  <Check className="w-5 h-5 mr-2" />
                  {t.common.complete}
                </Button>
                <Button onClick={handleSkip} variant="outline" className="h-12 px-4 border-2">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button onClick={handleStop} variant="outline" className="h-12 px-4 border-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;
