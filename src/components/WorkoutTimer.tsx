// PomiABSPro - Workout Timer Component (Exercise Time Only)
import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTimerProps {
  isActive: boolean; // Only count when exercising, not resting
  targetMinutes?: number;
  onTimeUpdate?: (elapsedSeconds: number) => void;
  onTargetReached?: () => void;
  className?: string;
}

const WorkoutTimer = ({ 
  isActive, 
  targetMinutes,
  onTimeUpdate, 
  onTargetReached,
  className 
}: WorkoutTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastTickRef = useRef<number>(Date.now());
  const hasReachedTargetRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      lastTickRef.current = Date.now();
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds(prev => {
        const newValue = prev + 1;
        onTimeUpdate?.(newValue);
        
        // Check if target reached
        if (targetMinutes && !hasReachedTargetRef.current) {
          const targetSeconds = targetMinutes * 60;
          if (newValue >= targetSeconds) {
            hasReachedTargetRef.current = true;
            onTargetReached?.();
          }
        }
        
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, targetMinutes, onTimeUpdate, onTargetReached]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage if target is set
  const progressPercent = targetMinutes 
    ? Math.min((elapsedSeconds / (targetMinutes * 60)) * 100, 100)
    : 0;

  // Determine color based on progress/milestone
  const getTimeColor = () => {
    if (targetMinutes) {
      if (progressPercent >= 100) return 'text-green-400';
      if (progressPercent >= 75) return 'text-yellow-400';
      if (progressPercent >= 50) return 'text-accent';
      if (progressPercent >= 25) return 'text-primary';
      return 'text-muted-foreground';
    }
    
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes >= 45) return 'text-yellow-400';
    if (minutes >= 30) return 'text-accent';
    if (minutes >= 20) return 'text-primary';
    if (minutes >= 10) return 'text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2 font-mono">
        <Clock className={cn("w-4 h-4", getTimeColor())} />
        <span className={cn("text-lg font-bold tabular-nums", getTimeColor())}>
          {formatTime(elapsedSeconds)}
        </span>
        {targetMinutes && (
          <span className="text-xs text-muted-foreground">
            / {targetMinutes}:00
          </span>
        )}
      </div>
      
      {/* Progress bar for target */}
      {targetMinutes && (
        <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              progressPercent >= 100 ? "bg-accent" : "bg-primary"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default WorkoutTimer;