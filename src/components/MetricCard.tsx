import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  variant = 'default',
  size = 'md',
}: MetricCardProps) => {
  return (
    <div
      className={cn(
        'card-brutal p-4 transition-all duration-150',
        variant === 'primary' && 'border-primary',
        variant === 'accent' && 'border-accent',
        size === 'lg' && 'p-6'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="terminal-text uppercase tracking-wider">{label}</span>
        {Icon && (
          <Icon
            className={cn(
              'w-4 h-4',
              variant === 'primary' && 'text-primary',
              variant === 'accent' && 'text-accent',
              variant === 'default' && 'text-muted-foreground'
            )}
          />
        )}
      </div>
      <div
        className={cn(
          'font-mono font-bold tracking-tight',
          size === 'sm' && 'text-2xl',
          size === 'md' && 'text-3xl',
          size === 'lg' && 'text-4xl',
          variant === 'primary' && 'text-primary',
          variant === 'accent' && 'text-accent'
        )}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
