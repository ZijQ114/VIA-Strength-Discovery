import React from 'react';
import { Home, Sparkles, Calendar, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<Props> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Bloom' },
    { id: 'guide', icon: Sparkles, label: 'AI Guide' },
    { id: 'history', icon: Calendar, label: 'Journal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (currentView === 'onboarding') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 px-6 pb-6 md:pb-3 z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              currentView === item.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <item.icon 
              className={`w-6 h-6 ${currentView === item.id ? 'fill-current opacity-20 stroke-2' : 'stroke-2'}`} 
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;