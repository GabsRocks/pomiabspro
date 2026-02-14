import { useApp } from '@/contexts/AppContext';
import MetricCard from '@/components/MetricCard';
import { Flame, Calendar, Zap, Play, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { challenges } from '@/lib/challenges';
import { loadPausedWorkout, clearPausedWorkout, PausedWorkout } from '@/lib/pausedWorkout';
import { useState, useEffect } from 'react';

interface DashboardViewProps {
  onStartWorkout: () => void;
  onResumeWorkout: (data: PausedWorkout) => void;
}

const DashboardView = ({ onStartWorkout, onResumeWorkout }: DashboardViewProps) => {
  const { state, t } = useApp();
  const { metrics, activeChallenge } = state;
  const [pausedWorkout, setPausedWorkout] = useState<PausedWorkout | null>(null);

  useEffect(() => {
    setPausedWorkout(loadPausedWorkout());
  }, []);

  const handleDiscard = () => {
    clearPausedWorkout();
    setPausedWorkout(null);
  };

  const handleResume = () => {
    if (pausedWorkout) {
      onResumeWorkout(pausedWorkout);
    }
  };

  const activeC = activeChallenge
    ? challenges.find(c => c.id === activeChallenge)
    : null;

  const todayTarget = activeC?.dailyTarget || 50;
  const todayDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="terminal-text mb-1">{todayDate.toUpperCase()}</div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">{t.dashboard.greeting}</p>
      </div>

      {/* Paused Workout Banner */}
      {pausedWorkout && (
        <div className="mb-6 border-2 border-accent bg-accent/10 p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <span className="font-bold text-accent">
              {state.profile.language === 'es' ? 'Rutina en pausa' : 'Paused workout'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {state.profile.language === 'es'
              ? `Tienes una rutina pendiente (${new Date(pausedWorkout.pausedAt).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}). ¿Deseas continuar o iniciar una nueva?`
              : `You have a pending workout (${new Date(pausedWorkout.pausedAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}). Continue or start a new one?`}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleResume} className="flex-1 btn-military rounded-sm">
              <Play className="w-4 h-4 mr-1" />
              {state.profile.language === 'es' ? 'Continuar' : 'Continue'}
            </Button>
            <Button onClick={handleDiscard} variant="outline" className="flex-1 rounded-sm border-2">
              <Trash2 className="w-4 h-4 mr-1" />
              {state.profile.language === 'es' ? 'Eliminar' : 'Discard'}
            </Button>
          </div>
        </div>
      )}

      <div className="card-active p-6 mb-6">
        <div className="text-center">
          <div className="terminal-text mb-2">{t.dashboard.todayTarget}</div>
          <div className="metric-display text-primary mb-4">
            {todayTarget} <span className="text-lg font-normal">{t.dashboard.reps}</span>
          </div>
          <Button
            onClick={onStartWorkout}
            className="btn-military w-full text-lg h-14 rounded-sm"
          >
            <Play className="w-5 h-5 mr-2" />
            {t.dashboard.startWorkout}
          </Button>
        </div>
      </div>

      {/* Active Challenge */}
      {activeC && (
        <div className="card-brutal p-4 mb-6 border-accent">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{activeC.icon}</span>
            <span className="font-bold text-accent">
              {state.profile.language === 'es' ? activeC.nameEs : activeC.name}
            </span>
          </div>
          <div className="progress-military h-2 mb-2">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: '25%' }}
            />
          </div>
          <div className="font-mono text-xs text-muted-foreground">25% completado</div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard
          icon={Flame}
          label={t.dashboard.streak}
          value={metrics.currentStreak}
          subtitle={t.dashboard.days}
          variant="primary"
        />
        <MetricCard
          icon={Calendar}
          label={t.metrics.activeDays}
          value={metrics.activeDays.length}
          subtitle={t.dashboard.days}
        />
      </div>

      <MetricCard
        icon={Zap}
        label={t.dashboard.totalReps}
        value={metrics.totalReps.toLocaleString()}
        variant="accent"
        size="lg"
      />

      {/* Modes */}
      <div className="mt-6">
        <h2 className="terminal-text mb-3">{state.profile.language === 'es' ? 'MODOS' : 'MODES'}</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(t.modes).map(([key, label]) => (
            <button
              key={key}
              className="p-3 bg-secondary border-2 border-border hover:border-primary text-left transition-colors duration-150"
            >
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
