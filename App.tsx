import React, { useState, useEffect } from 'react';
import { UserProfile, DailyState, StrengthProgress, ViewState, Activity } from './types';
import { INITIAL_PROFILE, LEVEL_THRESHOLDS } from './constants';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import Navigation from './components/Navigation';
import AIGuide from './views/AIGuide';
import History from './views/History';
import Settings from './views/Settings';

const App: React.FC = () => {
  // --- State Management ---
  
  // Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('via_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure default structure if old version
      return { ...INITIAL_PROFILE, ...parsed };
    }
    return INITIAL_PROFILE;
  });

  // Daily Activities
  const [dailyState, setDailyState] = useState<DailyState>(() => {
    const saved = localStorage.getItem('via_daily');
    return saved ? JSON.parse(saved) : { date: '', activities: [], hasShuffled: false };
  });

  // Progress (Leveling up)
  const [progress, setProgress] = useState<StrengthProgress[]>(() => {
    const saved = localStorage.getItem('via_progress');
    return saved ? JSON.parse(saved) : [];
  });

  // History Log
  const [history, setHistory] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('via_history');
    return saved ? JSON.parse(saved) : [];
  });

  // View Routing
  const [currentView, setCurrentView] = useState<ViewState>('onboarding');

  // --- Effects ---

  useEffect(() => {
    localStorage.setItem('via_profile', JSON.stringify(profile));
    if (profile.isOnboarded && currentView === 'onboarding') {
      setCurrentView('dashboard');
    }
  }, [profile, currentView]);

  useEffect(() => {
    localStorage.setItem('via_daily', JSON.stringify(dailyState));
  }, [dailyState]);

  useEffect(() => {
    localStorage.setItem('via_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('via_history', JSON.stringify(history));
  }, [history]);

  // --- Handlers ---

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setCurrentView('dashboard');
  };

  const handleSaveSettings = (newProfile: UserProfile) => {
     setProfile(newProfile);
     setCurrentView('dashboard');
  };

  const handleCompleteActivity = (activity: Activity, journal: string) => {
    const now = Date.now();
    const updatedActivity = { ...activity, completedAt: now, journalEntry: journal };

    if (!activity.isManualLog) {
      // Update Daily State (mark as completed if it was a daily activity)
      setDailyState(prev => ({
        ...prev,
        activities: prev.activities.map(a => a.id === activity.id ? updatedActivity : a)
      }));
    }

    // Add to History
    setHistory(prev => [...prev, updatedActivity]);

    // Update Progress
    setProgress(prev => {
      const existing = prev.find(p => p.strengthId === activity.strengthId);
      
      // Calculate new count
      const newCount = (existing?.exp || 0) + 1; // treat exp as count
      
      // Calculate Level based on Thresholds
      let newLevel = 1;
      for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
         if (newCount >= LEVEL_THRESHOLDS[i]) {
            newLevel = i + 1; // Levels are 1-based (Level 1 is starting point)
         } else {
            break;
         }
      }

      if (existing) {
        return prev.map(p => p.strengthId === activity.strengthId ? { ...p, exp: newCount, level: newLevel } : p);
      } else {
        return [...prev, { strengthId: activity.strengthId, exp: newCount, level: newLevel }];
      }
    });
  };

  const handleAddCustomActivity = (activity: Activity) => {
    // Add custom activity from AI to today's list
    setDailyState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }));
    setCurrentView('dashboard');
  };

  // --- Render ---

  if (!profile.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <main className="h-full">
        {currentView === 'dashboard' && (
          <Dashboard 
            profile={profile} 
            dailyState={dailyState} 
            updateDailyState={setDailyState}
            progress={progress}
            onCompleteActivity={handleCompleteActivity}
            history={history}
          />
        )}
        {currentView === 'guide' && (
          <AIGuide 
            profile={profile}
            onAddActivity={handleAddCustomActivity}
          />
        )}
        {currentView === 'history' && (
          <History history={history} />
        )}
        {currentView === 'settings' && (
          <Settings 
             profile={profile}
             onSave={handleSaveSettings}
             onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;