// PomiABSPro - Workout Configuration Component with Chronometer-Style Selectors
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Timer, Play, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutConfigProps {
  language: 'en' | 'es';
  onStart: (config: WorkoutSettings) => void;
  onCancel: () => void;
}

export interface WorkoutSettings {
  durationMinutes: number;
  restSeconds: number;
}

const durationOptions = [5, 10, 15, 20, 30, 45];
const restOptions = [15, 20, 30, 45, 60, 90];

const WorkoutConfig = ({ language, onStart, onCancel }: WorkoutConfigProps) => {
  const [durationIdx, setDurationIdx] = useState(1); // default 10 min
  const [restIdx, setRestIdx] = useState(2); // default 30 sec

  const duration = durationOptions[durationIdx];
  const rest = restOptions[restIdx];

  const cycleDuration = useCallback((dir: 1 | -1) => {
    setDurationIdx(prev => {
      const next = prev + dir;
      if (next < 0) return durationOptions.length - 1;
      if (next >= durationOptions.length) return 0;
      return next;
    });
  }, []);

  const cycleRest = useCallback((dir: 1 | -1) => {
    setRestIdx(prev => {
      const next = prev + dir;
      if (next < 0) return restOptions.length - 1;
      if (next >= restOptions.length) return 0;
      return next;
    });
  }, []);

  const handleStart = () => {
    onStart({ durationMinutes: duration, restSeconds: rest });
  };

  const formatDuration = (mins: number) => {
    return `${mins.toString().padStart(2, '0')}:00`;
  };

  const formatRest = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <h1 className="terminal-text text-center text-xl">
          {language === 'es' ? 'CONFIGURAR RUTINA' : 'CONFIGURE WORKOUT'}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-10">
        {/* Duration Chronometer */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="terminal-text text-sm">
              {language === 'es' ? 'TIEMPO DE EJERCICIO' : 'EXERCISE TIME'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => cycleDuration(-1)}
              className="p-2 rounded-sm border-2 border-border hover:bg-muted active:scale-95 transition-transform"
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="card-brutal px-6 py-4 min-w-[160px] text-center bg-card border-primary/30">
              <div className="font-mono text-4xl font-bold text-primary tracking-wider">
                {formatDuration(duration)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                {language === 'es' ? 'minutos' : 'minutes'}
              </div>
            </div>

            <button
              onClick={() => cycleDuration(1)}
              className="p-2 rounded-sm border-2 border-border hover:bg-muted active:scale-95 transition-transform"
            >
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Rest Chronometer */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-accent" />
            <span className="terminal-text text-sm">
              {language === 'es' ? 'TIEMPO DE DESCANSO' : 'REST TIME'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => cycleRest(-1)}
              className="p-2 rounded-sm border-2 border-border hover:bg-muted active:scale-95 transition-transform"
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="card-brutal px-6 py-4 min-w-[160px] text-center bg-card border-accent/30">
              <div className="font-mono text-4xl font-bold text-accent tracking-wider">
                {formatRest(rest)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                {language === 'es' ? 'segundos' : 'seconds'}
              </div>
            </div>

            <button
              onClick={() => cycleRest(1)}
              className="p-2 rounded-sm border-2 border-border hover:bg-muted active:scale-95 transition-transform"
            >
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="card-brutal p-4 w-full max-w-sm">
          <div className="text-center text-muted-foreground text-sm mb-2">
            {language === 'es' ? 'Tu rutina:' : 'Your workout:'}
          </div>
          <div className="text-center flex items-center justify-center gap-3 flex-wrap">
            <div>
              <span className="font-mono text-2xl font-bold text-primary">{duration}</span>
              <span className="text-muted-foreground text-sm ml-1">
                {language === 'es' ? 'min ejercicio' : 'min exercise'}
              </span>
            </div>
            <span className="text-muted-foreground text-lg">+</span>
            <div>
              <span className="font-mono text-2xl font-bold text-accent">{rest}</span>
              <span className="text-muted-foreground text-sm ml-1">
                {language === 'es' ? 'seg descanso' : 'sec rest'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t-2 border-border">
        <div className="flex gap-3 max-w-sm mx-auto">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-14 border-2"
          >
            {language === 'es' ? 'CANCELAR' : 'CANCEL'}
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 h-14 btn-military"
          >
            <Play className="w-5 h-5 mr-2" />
            {language === 'es' ? 'COMENZAR' : 'START'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutConfig;
