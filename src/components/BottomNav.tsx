import React from 'react';
import { TabName } from '../types';
import { Home, BookOpen, BarChart2, PieChart, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabName; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Study', icon: <Home className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'library', label: 'Deck', icon: <BookOpen className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart2 className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'sector', label: 'Sectors', icon: <PieChart className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'settings', label: 'Config', icon: <Settings className="w-5 h-5 stroke-[2.5]" /> }
  ];

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto bg-white dark:bg-slate-900 border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7] rounded-2xl p-1.5 flex items-center justify-around transition-all"
      aria-label="Primary navigation"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isActive
                ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:bg-[#A855F7] dark:text-white dark:border-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span className="mt-1 text-[10px] uppercase font-black tracking-tight leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
