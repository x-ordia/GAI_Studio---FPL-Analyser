import React from 'react';
import { View } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { HomeIcon } from './icons/HomeIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onChangeLeague: () => void;
}

const navItems = [
  { view: View.Dashboard, label: 'Dashboard', mobileLabel: 'Dashboard', icon: HomeIcon },
  { view: View.History, label: 'History', mobileLabel: 'History', icon: ChartBarIcon },
  { view: View.Analysis, label: 'Analysis', mobileLabel: 'Analysis', icon: SparklesIcon },
  { view: View.PvP, label: 'PvP', mobileLabel: 'PvP', icon: UsersGroupIcon },
  { view: View.Players, label: 'Players', mobileLabel: 'Players', icon: ClipboardListIcon },
  { view: View.Scout, label: 'Scout', mobileLabel: 'Scout', icon: SearchIcon },
];

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, onChangeLeague }) => {
  // Desktop Button Styles
  const desktopButtonBaseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-300";
  const desktopActiveClasses = "bg-brand-accent text-white shadow-lg shadow-brand-accent/20";
  const desktopInactiveClasses = "bg-transparent text-brand-text-muted hover:bg-brand-surface hover:text-brand-text";

  // Mobile Button Styles
  const mobileButtonBaseClasses = "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-300 flex-1 py-2";
  const mobileActiveClasses = "text-brand-accent";
  const mobileInactiveClasses = "text-brand-text-muted hover:text-brand-text";

  return (
    <>
      {/* Top Header */}
      <header className="bg-brand-surface/50 backdrop-blur-lg sticky top-0 z-50 border-b border-white/10 shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-xl md:text-2xl font-bold text-brand-text tracking-wider">
            Mini League <span className="text-brand-accent">Metrics</span>
          </h1>
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center bg-black/20 p-1 rounded-xl border border-white/10 space-x-1">
              {navItems.map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className={`${desktopButtonBaseClasses} ${activeView === view ? desktopActiveClasses : desktopInactiveClasses}`}
                  aria-label={`Show ${label}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
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
      
      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-brand-surface/90 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex justify-around items-center">
          {navItems.map(({ view, label, mobileLabel, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`${mobileButtonBaseClasses} ${activeView === view ? mobileActiveClasses : mobileInactiveClasses}`}
              aria-label={`Show ${label}`}
            >
              <Icon className="w-6 h-6" />
              <span>{mobileLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;