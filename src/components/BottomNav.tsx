import { Home, Target, Dumbbell, User, BarChart3 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useApp();

  const tabs = [
    { id: 'dashboard', icon: Home, label: t.nav.dashboard },
    { id: 'challenges', icon: Target, label: t.nav.challenges },
    { id: 'exercises', icon: Dumbbell, label: t.nav.exercises },
    { id: 'metrics', icon: BarChart3, label: t.nav.metrics },
    { id: 'profile', icon: User, label: t.nav.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full transition-colors duration-150',
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 mb-1',
                activeTab === id && 'drop-shadow-[0_0_8px_hsl(142,70%,40%)]'
              )}
            />
            <span className="text-[10px] uppercase tracking-wider font-medium">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
