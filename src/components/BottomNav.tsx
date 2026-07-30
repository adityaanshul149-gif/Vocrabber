import React from 'react';
import { TabName } from '../types';
import { Home, BookOpen, BarChart2, PieChart, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabName; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Study', icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'sector', label: 'Sectors', icon: <PieChart className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-purple-100 shadow-lg shadow-purple-900/10 rounded-full p-1.5 flex items-center justify-around"
      aria-label="Primary navigation"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/30 scale-105'
                : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/50'
            }`}
          >
            {tab.icon}
            <span className="mt-0.5 text-[10px] font-semibold leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
