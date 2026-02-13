import { cn } from '@/lib/utils';
import { Lock, Check, ChevronDown, Clock, Target, Flame, Users } from 'lucide-react';
import { Challenge } from '@/lib/challenges';
import { useApp } from '@/contexts/AppContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface ChallengeCardProps {
  challenge: Challenge;
  status: 'locked' | 'available' | 'active' | 'completed';
  progress?: number;
  onClick?: () => void;
}

const getRecommendation = (challenge: Challenge, lang: string) => {
  const recs: Record<string, { en: string; es: string }> = {
    volume: { en: 'Those seeking high-volume endurance', es: 'Quienes buscan resistencia de alto volumen' },
    time: { en: 'Building daily consistency habits', es: 'Construir hábitos de consistencia diaria' },
    style: { en: 'Fans of themed training styles', es: 'Fans de estilos de entrenamiento temático' },
    restriction: { en: 'Focused muscle group training', es: 'Entrenamiento enfocado por grupo muscular' },
    military: { en: 'Advanced high-intensity athletes', es: 'Atletas avanzados de alta intensidad' },
  };
  return lang === 'es' ? recs[challenge.type]?.es : recs[challenge.type]?.en;
};

const getDifficultyLabel = (d: number, lang: string) => {
  if (d === 3) return lang === 'es' ? 'ÉLITE' : 'ELITE';
  if (d === 2) return lang === 'es' ? 'DIFÍCIL' : 'HARD';
  return 'NORMAL';
};

const ChallengeCard = ({ challenge, status, progress = 0, onClick }: ChallengeCardProps) => {
  const { language } = useApp();
  const [open, setOpen] = useState(false);

  const name = language === 'es' ? challenge.nameEs : challenge.name;
  const description = language === 'es' ? challenge.descriptionEs : challenge.description;
  const isLocked = status === 'locked';

  return (
    <Collapsible open={open && !isLocked} onOpenChange={(v) => !isLocked && setOpen(v)}>
      <div
        className={cn(
          'border-2 transition-all duration-150',
          isLocked && 'border-border opacity-40',
          status === 'available' && 'border-border hover:border-primary',
          status === 'active' && 'border-primary animate-pulse-glow',
          status === 'completed' && 'border-primary/30'
        )}
      >
        <CollapsibleTrigger asChild disabled={isLocked}>
          <button className="w-full text-left p-4" disabled={isLocked}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl flex-shrink-0">{challenge.icon}</span>
                <h3 className="font-bold text-foreground truncate">{name}</h3>
                {isLocked && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                {status === 'completed' && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5',
                    challenge.difficulty === 1 && 'bg-primary/20 text-primary',
                    challenge.difficulty === 2 && 'bg-accent/20 text-accent',
                    challenge.difficulty === 3 && 'badge-elite'
                  )}
                >
                  {getDifficultyLabel(challenge.difficulty, language)}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    open && !isLocked && 'rotate-180'
                  )}
                />
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t-2 border-border pt-3">
            {/* Description */}
            <p className="text-sm text-muted-foreground">{description}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              {challenge.targetReps && (
                <div className="bg-secondary p-2 border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {language === 'es' ? 'Objetivo' : 'Target'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-foreground text-sm">
                    {challenge.targetReps.toLocaleString()} reps
                  </div>
                </div>
              )}
              {challenge.targetDays && (
                <div className="bg-secondary p-2 border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {language === 'es' ? 'Duración' : 'Duration'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-foreground text-sm">
                    {challenge.targetDays} {language === 'es' ? 'días' : 'days'}
                  </div>
                </div>
              )}
              {challenge.targetMinutes && (
                <div className="bg-secondary p-2 border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {language === 'es' ? 'Tiempo' : 'Time'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-foreground text-sm">
                    {challenge.targetMinutes} min
                  </div>
                </div>
              )}
              <div className="bg-secondary p-2 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {language === 'es' ? 'Dificultad' : 'Difficulty'}
                  </span>
                </div>
                <div className={cn(
                  'font-mono font-bold text-sm',
                  challenge.difficulty === 1 && 'text-primary',
                  challenge.difficulty === 2 && 'text-accent',
                  challenge.difficulty === 3 && 'text-foreground'
                )}>
                  {'★'.repeat(challenge.difficulty)}{'☆'.repeat(3 - challenge.difficulty)}
                </div>
              </div>
            </div>

            {/* Recommended For */}
            <div className="bg-secondary/50 p-2 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {language === 'es' ? 'Recomendado para' : 'Recommended for'}
                </span>
              </div>
              <p className="text-xs text-foreground/80">{getRecommendation(challenge, language)}</p>
            </div>

            {/* Exercises */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                {language === 'es' ? `${challenge.exercises.length} ejercicios` : `${challenge.exercises.length} exercises`}
              </div>
              <div className="flex flex-wrap gap-1">
                {challenge.exercises.map((ex) => (
                  <span key={ex} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 text-muted-foreground capitalize">
                    {ex.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bar for active */}
            {status === 'active' && (
              <div>
                <div className="progress-military h-2">
                  <div className="progress-military-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-1">{progress.toFixed(0)}%</div>
              </div>
            )}

            {/* Action */}
            {status === 'available' && onClick && (
              <button onClick={onClick} className="btn-military w-full text-center text-sm">
                {language === 'es' ? '⚡ INICIAR RETO' : '⚡ START CHALLENGE'}
              </button>
            )}
            {status === 'active' && onClick && (
              <button onClick={onClick} className="w-full text-center text-xs font-mono uppercase tracking-wider text-primary animate-pulse py-2">
                {language === 'es' ? '⏸ CANCELAR RETO' : '⏸ CANCEL CHALLENGE'}
              </button>
            )}
            {status === 'completed' && (
              <div className="text-center py-1">
                <span className="text-xs font-mono uppercase tracking-wider text-primary">
                  ✅ {language === 'es' ? 'COMPLETADO' : 'COMPLETED'}
                </span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ChallengeCard;
