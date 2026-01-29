import { cn } from '@/lib/utils';
import { Badge } from '@/lib/badges';
import { Lock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BadgeDisplayProps {
  badge: Badge;
  unlocked: boolean;
}

const BadgeDisplay = ({ badge, unlocked }: BadgeDisplayProps) => {
  const { language } = useApp();

  const name = badge.isSecret && !unlocked
    ? '???'
    : language === 'es' ? badge.nameEs : badge.name;

  const description = badge.isSecret && !unlocked
    ? (language === 'es' ? 'Logro secreto' : 'Secret achievement')
    : language === 'es' ? badge.descriptionEs : badge.description;

  const categoryColors: Record<Badge['category'], string> = {
    consistency: 'border-info',
    volume: 'border-warning',
    mental: 'border-destructive',
    specialist: 'border-primary',
    secret: 'border-elite',
  };

  return (
    <div
      className={cn(
        'p-4 border-2 transition-all duration-150',
        unlocked ? categoryColors[badge.category] : 'border-border opacity-50',
        unlocked && 'bg-card',
        !unlocked && 'bg-muted/30'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={cn('text-2xl', !unlocked && 'grayscale')}>
          {unlocked ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
        </span>
        <div>
          <h3 className={cn('font-bold', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
            {name}
          </h3>
          <span
            className={cn(
              'text-[10px] uppercase tracking-wider font-bold',
              unlocked ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {unlocked
              ? (language === 'es' ? 'Desbloqueado' : 'Unlocked')
              : (language === 'es' ? 'Bloqueado' : 'Locked')}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default BadgeDisplay;
