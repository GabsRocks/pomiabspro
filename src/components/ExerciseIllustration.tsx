// PomiABSPro - Exercise Illustration Component
import { cn } from '@/lib/utils';

interface ExerciseIllustrationProps {
  category: 'chair' | 'strength' | 'cardio' | 'office' | 'stretch' | 'yoga' | 'military';
  muscles: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// SVG-based exercise illustrations for offline use
const categoryIcons: Record<string, JSX.Element> = {
  chair: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chair */}
      <rect x="25" y="60" width="50" height="5" className="fill-primary" />
      <rect x="25" y="65" width="5" height="25" className="fill-primary" />
      <rect x="70" y="65" width="5" height="25" className="fill-primary" />
      <rect x="70" y="30" width="5" height="35" className="fill-primary" />
      <rect x="25" y="30" width="50" height="5" className="fill-muted-foreground" />
      {/* Person silhouette */}
      <circle cx="50" cy="20" r="8" className="fill-accent" />
      <path d="M40 35 L50 50 L60 35" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 55 L50 50 L65 55" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  strength: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dumbbell */}
      <rect x="15" y="40" width="15" height="20" rx="2" className="fill-primary" />
      <rect x="70" y="40" width="15" height="20" rx="2" className="fill-primary" />
      <rect x="30" y="45" width="40" height="10" className="fill-muted-foreground" />
      {/* Person */}
      <circle cx="50" cy="20" r="8" className="fill-accent" />
      <line x1="50" y1="28" x2="50" y2="45" className="stroke-accent" strokeWidth="4" />
      <line x1="35" y1="50" x2="65" y2="50" className="stroke-accent" strokeWidth="4" />
      <path d="M42 45 L58 45" className="stroke-accent" strokeWidth="3" />
    </svg>
  ),
  cardio: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Running person */}
      <circle cx="50" cy="18" r="8" className="fill-accent" />
      <path d="M45 26 L40 50 L30 70" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 26 L55 45 L70 55" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 50 L55 65 L45 85" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 65 L70 80" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      {/* Motion lines */}
      <line x1="20" y1="30" x2="30" y2="30" className="stroke-primary" strokeWidth="2" />
      <line x1="15" y1="40" x2="28" y2="40" className="stroke-primary" strokeWidth="2" />
      <line x1="20" y1="50" x2="30" y2="50" className="stroke-primary" strokeWidth="2" />
    </svg>
  ),
  office: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk */}
      <rect x="10" y="55" width="80" height="5" className="fill-muted-foreground" />
      <rect x="15" y="60" width="5" height="30" className="fill-muted-foreground" />
      <rect x="80" y="60" width="5" height="30" className="fill-muted-foreground" />
      {/* Monitor */}
      <rect x="35" y="35" width="30" height="20" rx="2" className="fill-primary" />
      <rect x="47" y="55" width="6" height="5" className="fill-primary" />
      {/* Person stretching */}
      <circle cx="50" cy="20" r="6" className="fill-accent" />
      <path d="M50 26 L50 40" className="stroke-accent" strokeWidth="3" />
      <path d="M35 30 L50 35 L65 30" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  stretch: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stretching person */}
      <circle cx="50" cy="25" r="8" className="fill-accent" />
      <path d="M50 33 L50 55" className="stroke-accent" strokeWidth="4" />
      <path d="M30 40 L50 45 L70 35" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 55 L35 80" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 55 L65 80" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      {/* Flexibility arcs */}
      <path d="M25 50 Q 20 40, 25 30" className="stroke-primary" strokeWidth="2" fill="none" />
      <path d="M75 35 Q 80 45, 75 55" className="stroke-primary" strokeWidth="2" fill="none" />
    </svg>
  ),
  yoga: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Yoga pose - tree */}
      <circle cx="50" cy="18" r="7" className="fill-accent" />
      <path d="M50 25 L50 55" className="stroke-accent" strokeWidth="4" />
      <path d="M35 35 L50 40 L65 35" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 55 L50 85" className="stroke-accent" strokeWidth="4" />
      <path d="M50 60 L35 75" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      {/* Om symbol stylized */}
      <circle cx="50" cy="50" r="35" className="stroke-primary/30" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="40" className="stroke-primary/20" strokeWidth="1" fill="none" />
    </svg>
  ),
  military: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Military boot camp - intense exercise */}
      <circle cx="50" cy="15" r="7" className="fill-destructive" />
      {/* Body in push-up position */}
      <path d="M50 22 L50 35 L25 55" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 35 L75 55" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      <path d="M25 55 L15 75" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      <path d="M75 55 L85 75" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      {/* Sweat drops */}
      <circle cx="35" cy="20" r="2" className="fill-primary" />
      <circle cx="65" cy="22" r="2" className="fill-primary" />
      {/* Fire/intensity */}
      <path d="M45 80 Q 50 70, 55 80 Q 50 75, 45 80" className="fill-warning" />
      <path d="M50 85 Q 53 78, 56 85 Q 53 82, 50 85" className="fill-destructive" />
    </svg>
  ),
};

// Muscle group indicators
const musclePositions: Record<string, { x: number; y: number }> = {
  core: { x: 50, y: 50 },
  legs: { x: 50, y: 75 },
  arms: { x: 30, y: 40 },
  chest: { x: 50, y: 35 },
  back: { x: 50, y: 45 },
  shoulders: { x: 50, y: 30 },
  triceps: { x: 65, y: 40 },
  glutes: { x: 50, y: 60 },
  quads: { x: 50, y: 70 },
  calves: { x: 50, y: 82 },
  obliques: { x: 60, y: 50 },
};

const ExerciseIllustration = ({ 
  category, 
  muscles, 
  className,
  size = 'md' 
}: ExerciseIllustrationProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      "bg-secondary/50 rounded-lg border-2 border-border",
      sizeClasses[size],
      className
    )}>
      <div className="w-full h-full p-2">
        {categoryIcons[category] || categoryIcons.strength}
      </div>
      
      {/* Muscle indicators */}
      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap justify-center">
        {muscles.slice(0, 3).map((muscle) => (
          <span
            key={muscle}
            className="text-[8px] px-1 py-0.5 bg-primary/20 text-primary rounded uppercase font-mono"
          >
            {muscle.slice(0, 4)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExerciseIllustration;