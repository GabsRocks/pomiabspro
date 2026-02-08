// PomiABSPro - Workout Configuration Component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Timer, Play } from 'lucide-react';
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

const durationOptions = [5, 10, 20, 30, 45];
const restOptions = [15, 30, 45, 60];

const WorkoutConfig = ({ language, onStart, onCancel }: WorkoutConfigProps) => {
  const [duration, setDuration] = useState(10);
  const [rest, setRest] = useState(30);

  const handleStart = () => {
    onStart({ durationMinutes: duration, restSeconds: rest });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <h1 className="terminal-text text-center text-xl">
          {language === 'es' ? 'CONFIGURAR RUTINA' : 'CONFIGURE WORKOUT'}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Duration Selection */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="terminal-text text-sm">
              {language === 'es' ? 'TIEMPO DE EJERCICIO' : 'EXERCISE TIME'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {durationOptions.map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={cn(
                  "card-brutal p-3 text-center transition-all",
                  duration === mins 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "hover:bg-muted"
                )}
              >
                <div className="font-mono text-xl font-bold">{mins}</div>
                <div className="text-xs uppercase">min</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rest Selection */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-accent" />
            <span className="terminal-text text-sm">
              {language === 'es' ? 'TIEMPO DE DESCANSO' : 'REST TIME'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {restOptions.map((secs) => (
              <button
                key={secs}
                onClick={() => setRest(secs)}
                className={cn(
                  "card-brutal p-3 text-center transition-all",
                  rest === secs 
                    ? "bg-accent text-accent-foreground border-accent" 
                    : "hover:bg-muted"
                )}
              >
                <div className="font-mono text-xl font-bold">{secs}</div>
                <div className="text-xs uppercase">seg</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card-brutal p-4 w-full max-w-sm">
          <div className="text-center text-muted-foreground text-sm mb-2">
            {language === 'es' ? 'Tu rutina:' : 'Your workout:'}
          </div>
          <div className="text-center">
            <span className="font-mono text-2xl font-bold text-primary">{duration}</span>
            <span className="text-muted-foreground mx-2">
              {language === 'es' ? 'min ejercicio' : 'min exercise'}
            </span>
            <span className="text-muted-foreground">+</span>
            <span className="font-mono text-2xl font-bold text-accent ml-2">{rest}</span>
            <span className="text-muted-foreground ml-2">
              {language === 'es' ? 'seg descanso' : 'sec rest'}
            </span>
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