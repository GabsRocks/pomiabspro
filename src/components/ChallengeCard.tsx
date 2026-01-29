import { cn } from '@/lib/utils';
import { Lock, Check, ChevronRight } from 'lucide-react';
import { Challenge } from '@/lib/challenges';
import { useApp } from '@/contexts/AppContext';

interface ChallengeCardProps {
  challenge: Challenge;
  status: 'locked' | 'available' | 'active' | 'completed';
  progress?: number;
  onClick?: () => void;
}

const ChallengeCard = ({ challenge, status, progress = 0, onClick }: ChallengeCardProps) => {
  const { language } = useApp();

  const name = language === 'es' ? challenge.nameEs : challenge.name;
  const description = language === 'es' ? challenge.descriptionEs : challenge.description;

  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className={cn(
        'w-full text-left p-4 transition-all duration-150 border-2',
        status === 'locked' && 'bg-muted/50 border-border opacity-50 cursor-not-allowed',
        status === 'available' && 'bg-card border-border hover:border-primary',
        status === 'active' && 'bg-card border-primary animate-pulse-glow',
        status === 'completed' && 'bg-card border-success/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{challenge.icon}</span>
            <h3 className="font-bold text-foreground truncate">{name}</h3>
            {status === 'locked' && <Lock className="w-4 h-4 text-muted-foreground" />}
            {status === 'completed' && <Check className="w-4 h-4 text-success" />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

          {/* Target info */}
          <div className="flex items-center gap-4 mt-2">
            {challenge.targetReps && (
              <span className="font-mono text-xs text-muted-foreground">
                {challenge.targetReps.toLocaleString()} reps
              </span>
            )}
            {challenge.targetDays && (
              <span className="font-mono text-xs text-muted-foreground">
                {challenge.targetDays} días
              </span>
            )}
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wider px-2 py-0.5',
                challenge.difficulty === 1 && 'bg-success/20 text-success',
                challenge.difficulty === 2 && 'bg-warning/20 text-warning',
                challenge.difficulty === 3 && 'bg-elite/20 text-elite'
              )}
            >
              {challenge.difficulty === 3 ? 'ELITE' : challenge.difficulty === 2 ? 'HARD' : 'NORMAL'}
            </span>
          </div>

          {/* Progress bar for active challenges */}
          {status === 'active' && (
            <div className="mt-3">
              <div className="progress-military h-2">
                <div
                  className="progress-military-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-1">
                {progress.toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {status !== 'locked' && status !== 'completed' && (
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </button>
  );
};

export default ChallengeCard;
