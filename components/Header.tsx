import React from 'react';
import { View } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { RobotIcon } from './icons/RobotIcon';
import { HomeIcon } from './icons/HomeIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onChangeLeague: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onChangeLeague }) => {
  const buttonBaseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105";
  const activeClasses = "bg-fpl-green text-fpl-purple shadow-lg";
  const inactiveClasses = "bg-fpl-purple text-fpl-text hover:bg-opacity-80";

  return (
    <header className="bg-fpl-purple/50 backdrop-blur-sm sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl md:text-2xl font-bold text-fpl-text tracking-wider">
          FPL<span className="text-fpl-green">.AI</span> Ranker
        </h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          <nav className="flex space-x-2 md:space-x-4 border-r border-white/20 pr-2 md:pr-4">
            <button
              onClick={() => setActiveView(View.Dashboard)}
              className={`${buttonBaseClasses} ${activeView === View.Dashboard ? activeClasses : inactiveClasses}`}
              aria-label="Show dashboard"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveView(View.Chart)}
              className={`${buttonBaseClasses} ${activeView === View.Chart ? activeClasses : inactiveClasses}`}
              aria-label="Show performance chart"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Performance</span>
            </button>
            <button
              onClick={() => setActiveView(View.Rankings)}
              className={`${buttonBaseClasses} ${activeView === View.Rankings ? activeClasses : inactiveClasses}`}
              aria-label="Show AI rankings"
            >
              <RobotIcon className="w-5 h-5" />
              <span className="hidden sm:inline">AI Rankings</span>
            </button>
            <button
              onClick={() => setActiveView(View.PvP)}
              className={`${buttonBaseClasses} ${activeView === View.PvP ? activeClasses : inactiveClasses}`}
              aria-label="Show PvP analysis"
            >
              <UsersGroupIcon className="w-5 h-5" />
              <span className="hidden sm:inline">PvP</span>
            </button>
          </nav>
          <button 
            onClick={onChangeLeague} 
            className="text-sm font-semibold text-fpl-text hover:text-fpl-green transition-colors"
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