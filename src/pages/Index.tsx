import { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import DashboardView from '@/views/DashboardView';
import ChallengesView from '@/views/ChallengesView';
import ExercisesView from '@/views/ExercisesView';
import MetricsView from '@/views/MetricsView';
import ProfileView from '@/views/ProfileView';
import WorkoutView from '@/views/WorkoutView';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onStartWorkout={() => setIsWorkoutActive(true)} />;
      case 'challenges':
        return <ChallengesView />;
      case 'exercises':
        return <ExercisesView />;
      case 'metrics':
        return <MetricsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView onStartWorkout={() => setIsWorkoutActive(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isWorkoutActive ? (
        <WorkoutView onClose={() => setIsWorkoutActive(false)} />
      ) : (
        <>
          {renderView()}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
