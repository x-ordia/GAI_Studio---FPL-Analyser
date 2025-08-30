
import React from 'react';
import { View } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { RobotIcon } from './icons/RobotIcon';
import { HomeIcon } from './icons/HomeIcon';

// Inlined UsersGroupIcon to avoid adding new files
const UsersGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM10.5 18.75a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72M9 12.75a3 3 0 11-6 0 3 3 0 016 0zM21 12.75a9.086 9.086 0 01-3.741-.479 3 3 0 01-4.682-2.72M3 12.75a9.086 9.086 0 003.741.479 3 3 0 004.682-2.72m-7.5 2.962A3.75 3.75 0 109 10.5a3.75 3.75 0 00-6 2.25z" />
    </svg>
);

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onChangeLeague: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onChangeLeague }) => {
  const buttonBaseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-300";
  const activeClasses = "bg-brand-accent text-white shadow-lg shadow-brand-accent/20";
  const inactiveClasses = "bg-transparent text-brand-text-muted hover:bg-brand-surface hover:text-brand-text";

  return (
    <header className="bg-brand-surface/50 backdrop-blur-lg sticky top-0 z-50 border-b border-white/10 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text tracking-wider">
          FPL<span className="text-brand-accent">.AI</span> Ranker
        </h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          <nav className="hidden sm:flex items-center bg-black/20 p-1 rounded-xl border border-white/10 space-x-1">
            <button
              onClick={() => setActiveView(View.Dashboard)}
              className={`${buttonBaseClasses} ${activeView === View.Dashboard ? activeClasses : inactiveClasses}`}
              aria-label="Show dashboard"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveView(View.Chart)}
              className={`${buttonBaseClasses} ${activeView === View.Chart ? activeClasses : inactiveClasses}`}
              aria-label="Show performance chart"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Performance</span>
            </button>
            <button
              onClick={() => setActiveView(View.Rankings)}
              className={`${buttonBaseClasses} ${activeView === View.Rankings ? activeClasses : inactiveClasses}`}
              aria-label="Show AI rankings"
            >
              <RobotIcon className="w-5 h-5" />
              <span>AI Rankings</span>
            </button>
            <button
              onClick={() => setActiveView(View.PvP)}
              className={`${buttonBaseClasses} ${activeView === View.PvP ? activeClasses : inactiveClasses}`}
              aria-label="Show PvP analysis"
            >
              <UsersGroupIcon className="w-5 h-5" />
              <span>PvP</span>
            </button>
          </nav>
          <button 
            onClick={onChangeLeague} 
            className="text-sm font-semibold text-brand-text-muted hover:text-brand-accent transition-colors"
            aria-label="Change league"
          >
            Change League
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
