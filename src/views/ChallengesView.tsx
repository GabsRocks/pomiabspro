import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ChallengeCard from '@/components/ChallengeCard';
import MilitarySection from '@/components/MilitarySection';
import { challenges, getChallengesByType, Challenge } from '@/lib/challenges';
import { cn } from '@/lib/utils';

const ChallengesView = () => {
  const { state, t, setActiveChallenge } = useApp();
  const [activeType, setActiveType] = useState<Challenge['type']>('volume');

  const types: { key: Challenge['type']; label: string }[] = [
    { key: 'volume', label: t.challenges.volume },
    { key: 'time', label: t.challenges.time },
    { key: 'style', label: t.challenges.style },
    { key: 'restriction', label: t.challenges.restriction },
    { key: 'military', label: t.challenges.military },
  ];

  const filteredChallenges = getChallengesByType(activeType);

  const getChallengeStatus = (challenge: Challenge) => {
    if (state.metrics.challengesCompleted.includes(challenge.id)) {
      return 'completed';
    }
    if (state.activeChallenge === challenge.id) {
      return 'active';
    }
    if (
      challenge.unlockCondition &&
      !state.metrics.challengesCompleted.includes(challenge.unlockCondition)
    ) {
      return 'locked';
    }
    return 'available';
  };

  const handleChallengeClick = (challenge: Challenge) => {
    const status = getChallengeStatus(challenge);
    if (status === 'available') {
      setActiveChallenge(challenge.id);
    } else if (status === 'active') {
      setActiveChallenge(null);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t.challenges.title}</h1>
      <p className="text-muted-foreground mb-6">
        {state.profile.language === 'es'
          ? `${challenges.length}+ retos disponibles`
          : `${challenges.length}+ challenges available`}
      </p>

      {/* Type Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {types.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={cn(
              'px-3 py-2 text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-150 border-2',
              activeType === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {activeType === 'military' ? (
        <MilitarySection
          onStartChallenge={(challenge) => handleChallengeClick(challenge)}
          completedIds={state.metrics.challengesCompleted}
          activeChallengeId={state.activeChallenge}
        />
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              status={getChallengeStatus(challenge)}
              progress={state.activeChallenge === challenge.id ? 25 : 0}
              onClick={() => handleChallengeClick(challenge)}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 p-4 bg-secondary border-2 border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-mono text-2xl font-bold text-primary">
              {state.metrics.challengesCompleted.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {t.challenges.completed}
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-accent">
              {state.activeChallenge ? 1 : 0}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {t.challenges.active}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesView;
