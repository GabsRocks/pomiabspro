import { useApp } from '@/contexts/AppContext';
import MetricCard from '@/components/MetricCard';
import BadgeDisplay from '@/components/BadgeDisplay';
import { badges } from '@/lib/badges';
import { Flame, Calendar, Clock, Target, Zap, Trophy } from 'lucide-react';

const MetricsView = () => {
  const { state, t } = useApp();
  const { metrics } = state;

  // Calculate discipline index (0-100)
  const disciplineIndex = Math.min(
    100,
    Math.round(
      (metrics.currentStreak * 5) +
      (metrics.totalSessions * 0.5) +
      (metrics.challengesCompleted.length * 10)
    )
  );

  const hours = Math.floor(metrics.totalMinutes / 60);
  const mins = metrics.totalMinutes % 60;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t.metrics.title}</h1>
      <p className="text-muted-foreground mb-6">
        {state.profile.language === 'es'
          ? 'Métricas que sí importan'
          : 'Metrics that matter'}
      </p>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard
          icon={Zap}
          label={t.metrics.totalReps}
          value={metrics.totalReps.toLocaleString()}
          variant="accent"
        />
        <MetricCard
          icon={Flame}
          label={t.metrics.bestStreak}
          value={metrics.bestStreak}
          subtitle={t.dashboard.days}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard
          icon={Calendar}
          label={t.metrics.activeDays}
          value={metrics.activeDays.length}
          subtitle={t.dashboard.days}
        />
        <MetricCard
          icon={Clock}
          label={t.metrics.trainTime}
          value={`${hours}:${mins.toString().padStart(2, '0')}`}
          subtitle={t.metrics.hours}
        />
      </div>

      {/* Discipline Index */}
      <div className="card-brutal p-6 mb-6 border-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="terminal-text">{t.metrics.disciplineIndex}</div>
            <div className="text-xs text-muted-foreground">
              {state.profile.language === 'es'
                ? 'No peso. No estética. Disciplina.'
                : 'Not weight. Not aesthetics. Discipline.'}
            </div>
          </div>
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div className="metric-display text-primary mb-2">{disciplineIndex}</div>
        <div className="progress-military h-3">
          <div
            className="progress-military-fill"
            style={{ width: `${disciplineIndex}%` }}
          />
        </div>
      </div>

      {/* Muscle Breakdown */}
      {Object.keys(metrics.repsByMuscle).length > 0 && (
        <div className="card-brutal p-4 mb-6">
          <h3 className="terminal-text mb-3">
            {state.profile.language === 'es' ? 'REPS POR MÚSCULO' : 'REPS BY MUSCLE'}
          </h3>
          <div className="space-y-2">
            {Object.entries(metrics.repsByMuscle)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([muscle, reps]) => (
                <div key={muscle} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{muscle}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {reps.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-warning" />
          <h2 className="font-bold">{t.badges.title}</h2>
          <span className="text-xs text-muted-foreground">
            {metrics.badgesUnlocked.length}/{badges.filter(b => !b.isSecret).length}
          </span>
        </div>
        <div className="grid gap-3">
          {badges
            .filter(b => !b.isSecret || metrics.badgesUnlocked.includes(b.id))
            .slice(0, 6)
            .map((badge) => (
              <BadgeDisplay
                key={badge.id}
                badge={badge}
                unlocked={metrics.badgesUnlocked.includes(badge.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsView;
