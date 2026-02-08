// PomiABSPro - Workout Timer Component
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTimerProps {
  startTime: number;
  isPaused: boolean;
  onTimeUpdate?: (elapsedSeconds: number) => void;
  className?: string;
}

const WorkoutTimer = ({ startTime, isPaused, onTimeUpdate, className }: WorkoutTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseStart, setLastPauseStart] = useState<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (lastPauseStart === null) {
        setLastPauseStart(Date.now());
      }
      return;
    }
    
    if (lastPauseStart !== null) {
      setPausedTime(prev => prev + (Date.now() - lastPauseStart));
      setLastPauseStart(null);
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const totalPausedMs = pausedTime + (lastPauseStart ? now - lastPauseStart : 0);
      const elapsed = Math.floor((now - startTime - totalPausedMs) / 1000);
      setElapsedSeconds(elapsed);
      onTimeUpdate?.(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isPaused, pausedTime, lastPauseStart, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on milestone
  const getTimeColor = () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes >= 45) return 'text-yellow-400';
    if (minutes >= 30) return 'text-accent';
    if (minutes >= 20) return 'text-primary';
    if (minutes >= 10) return 'text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn("flex items-center gap-2 font-mono", className)}>
      <Clock className={cn("w-4 h-4", getTimeColor())} />
      <span className={cn("text-lg font-bold tabular-nums", getTimeColor())}>
        {formatTime(elapsedSeconds)}
      </span>
    </div>
  );
};

export default WorkoutTimer;