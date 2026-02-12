import { useState } from 'react';
import { Shield, Flame, Clock, Zap, ChevronRight, Lock, Check, Swords } from 'lucide-react';
import { getMilitaryChallenges, Challenge } from '@/lib/challenges';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MilitarySectionProps {
  onStartChallenge: (challenge: Challenge) => void;
  completedIds: string[];
  activeChallengeId: string | null;
}

const MilitarySection = ({ onStartChallenge, completedIds, activeChallengeId }: MilitarySectionProps) => {
  const { state } = useApp();
  const lang = state.profile.language;
  const challenges = getMilitaryChallenges();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatus = (c: Challenge) => {
    if (completedIds.includes(c.id)) return 'completed';
    if (activeChallengeId === c.id) return 'active';
    if (c.unlockCondition && !completedIds.includes(c.unlockCondition)) return 'locked';
    return 'available';
  };

  const phaseLabels: Record<string, { en: string; es: string }> = {
    'military-bootcamp-45': { en: 'Phase 1 — Bootcamp', es: 'Fase 1 — Bootcamp' },
    'delta-force': { en: 'Phase 2 — Delta Force', es: 'Fase 2 — Fuerza Delta' },
    'navy-seal-challenge': { en: 'Phase 3 — Navy SEAL', es: 'Fase 3 — Navy SEAL' },
    'ranger-endurance': { en: 'Phase 4 — Ranger', es: 'Fase 4 — Ranger' },
    'marine-corps-45': { en: 'Phase 5 — Marine Corps', es: 'Fase 5 — Cuerpo de Marines' },
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-2 border-primary/50 p-6" style={{ background: 'var(--gradient-military)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Shield className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-7 h-7 text-primary-foreground" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-primary-foreground">
              {lang === 'es' ? 'RETOS MILITARES' : 'MILITARY CHALLENGES'}
            </h2>
          </div>
          <p className="text-primary-foreground/80 text-sm font-medium max-w-md">
            {lang === 'es'
              ? '45 minutos de destrucción total. Quema grasa desde el minuto 1. Sin piedad, sin excusas.'
              : '45 minutes of total destruction. Fat burning from minute 1. No mercy, no excuses.'}
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-foreground/70" />
              <span className="font-mono text-sm text-primary-foreground/90">45 MIN</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary-foreground/70" />
              <span className="font-mono text-sm text-primary-foreground/90">
                {lang === 'es' ? 'ALTA INTENSIDAD' : 'HIGH INTENSITY'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-foreground/70" />
              <span className="font-mono text-sm text-primary-foreground/90">ELITE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border-2 border-border p-3 text-center">
          <div className="font-mono text-2xl font-bold text-primary">
            {challenges.filter(c => completedIds.includes(c.id)).length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {lang === 'es' ? 'Completados' : 'Completed'}
          </div>
        </div>
        <div className="bg-card border-2 border-border p-3 text-center">
          <div className="font-mono text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>
            {challenges.length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {lang === 'es' ? 'Total Retos' : 'Total'}
          </div>
        </div>
        <div className="bg-card border-2 border-border p-3 text-center">
          <div className="font-mono text-2xl font-bold" style={{ color: 'hsl(var(--elite))' }}>
            45
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {lang === 'es' ? 'Min/Sesión' : 'Min/Session'}
          </div>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="space-y-3">
        {challenges.map((challenge, idx) => {
          const status = getStatus(challenge);
          const isExpanded = expandedId === challenge.id;
          const phase = phaseLabels[challenge.id];
          const name = lang === 'es' ? challenge.nameEs : challenge.name;
          const desc = lang === 'es' ? challenge.descriptionEs : challenge.description;

          return (
            <div
              key={challenge.id}
              className={cn(
                'border-2 transition-all duration-200',
                status === 'locked' && 'border-border opacity-40',
                status === 'available' && 'border-border hover:border-primary cursor-pointer',
                status === 'active' && 'border-primary animate-pulse-glow',
                status === 'completed' && 'border-primary/30'
              )}
            >
              {/* Header */}
              <button
                onClick={() => status !== 'locked' && setExpandedId(isExpanded ? null : challenge.id)}
                disabled={status === 'locked'}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 flex items-center justify-center text-xl border-2',
                      status === 'completed' ? 'border-primary bg-primary/20' : 'border-border bg-secondary'
                    )}>
                      {status === 'locked' ? <Lock className="w-4 h-4 text-muted-foreground" /> :
                       status === 'completed' ? <Check className="w-5 h-5 text-primary" /> :
                       challenge.icon}
                    </div>
                    <div>
                      {phase && (
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
                          {lang === 'es' ? phase.es : phase.en}
                        </div>
                      )}
                      <h3 className="font-bold text-foreground">{name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-elite text-[10px]">ELITE</span>
                    <ChevronRight className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && status !== 'locked' && (
                <div className="px-4 pb-4 space-y-4 border-t-2 border-border pt-4">
                  <p className="text-sm text-muted-foreground">{desc}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary p-2 border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {lang === 'es' ? 'Duración' : 'Duration'}
                      </div>
                      <div className="font-mono font-bold text-foreground">{challenge.targetMinutes} min</div>
                    </div>
                    <div className="bg-secondary p-2 border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {lang === 'es' ? 'Objetivo' : 'Target'}
                      </div>
                      <div className="font-mono font-bold text-foreground">{challenge.targetReps} reps</div>
                    </div>
                  </div>

                  {/* Exercise List */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      {lang === 'es' ? `${challenge.exercises.length} Ejercicios` : `${challenge.exercises.length} Exercises`}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {challenge.exercises.map((ex, i) => (
                        <div key={ex} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                          <span className="font-mono text-primary text-[10px] w-4">{String(i + 1).padStart(2, '0')}</span>
                          <span className="capitalize">{ex.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {status === 'available' && (
                    <button
                      onClick={() => onStartChallenge(challenge)}
                      className="btn-fire w-full text-center"
                    >
                      {lang === 'es' ? '🔥 INICIAR RETO' : '🔥 START CHALLENGE'}
                    </button>
                  )}
                  {status === 'active' && (
                    <div className="text-center">
                      <div className="text-xs font-mono uppercase tracking-wider text-primary animate-pulse">
                        {lang === 'es' ? '⚡ RETO EN PROGRESO' : '⚡ CHALLENGE IN PROGRESS'}
                      </div>
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className="text-center py-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary">
                        ✅ {lang === 'es' ? 'COMPLETADO' : 'COMPLETED'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning Banner */}
      <div className="border-2 border-destructive/30 bg-destructive/5 p-4">
        <p className="text-xs text-destructive font-mono uppercase tracking-wider text-center">
          ⚠️ {lang === 'es'
            ? 'ESTOS RETOS SON DE ALTA INTENSIDAD. CONSULTA CON TU MÉDICO ANTES DE INTENTARLOS.'
            : 'THESE CHALLENGES ARE HIGH INTENSITY. CONSULT YOUR DOCTOR BEFORE ATTEMPTING.'}
        </p>
      </div>
    </div>
  );
};

export default MilitarySection;
