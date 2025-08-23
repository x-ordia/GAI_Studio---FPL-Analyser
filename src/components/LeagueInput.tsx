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
    <div className="min-h-screen bg-gradient-to-br from-fpl-purple to-fpl-purple-light text-fpl-text flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-fpl-purple/60 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-fpl-text tracking-wider mb-2">
          FPL<span className="text-fpl-green">.AI</span> Ranker
        </h1>
        <p className="text-fpl-text-dark mb-6">Enter your FPL mini-league ID to begin.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 155881"
            className="w-full px-4 py-3 bg-fpl-purple-light border-2 border-transparent focus:border-fpl-green rounded-lg text-fpl-text text-center text-lg placeholder-fpl-text-dark transition-colors outline-none focus:ring-0"
            aria-label="FPL League ID"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-fpl-green text-fpl-purple font-bold rounded-lg text-lg hover:bg-opacity-80 transition-all transform hover:scale-105"
          >
            Load League
          </button>
        </form>

        {error && <p className="text-fpl-pink mt-4">{error}</p>}
        
        <div className="mt-6 text-sm text-fpl-text-dark bg-black/20 p-3 rounded-lg">
          <p>
            <strong className="text-fpl-text">Important:</strong> For this tool to work, your FPL league must be set to <strong className="text-fpl-text">"Public"</strong> in the FPL website settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeagueInput;