import React, { useState } from 'react';

interface LeagueInputProps {
  onSubmit: (leagueId: number) => void;
}

const LeagueInput: React.FC<LeagueInputProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(inputValue, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid, positive league ID.');
    } else {
      setError('');
      onSubmit(id);
    }
  };

  return (
    <div className="min-h-screen text-brand-text flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-brand-surface backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl shadow-brand-accent/10 p-8 text-center animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text tracking-wider mb-2">
          FPL<span className="text-brand-accent">.AI</span> Ranker
        </h1>
        <p className="text-brand-text-muted mb-8">Enter your FPL mini-league ID to begin analysis.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 155881"
            className="w-full px-4 py-3 bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text text-center text-lg placeholder-brand-text-muted transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
            aria-label="FPL League ID"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-brand-accent text-white font-bold rounded-lg text-lg hover:bg-brand-accent-hover transition-all transform hover:scale-105 shadow-lg shadow-brand-accent/20"
          >
            Load League
          </button>
        </form>

        {error && <p className="text-brand-danger mt-4">{error}</p>}
        
        <div className="mt-8 text-sm text-brand-text-muted bg-black/20 p-3 rounded-lg border border-white/10">
          <p>
            <strong className="text-brand-text">Important:</strong> For this tool to work, your FPL league must be set to <strong className="text-brand-text">"Public"</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeagueInput;