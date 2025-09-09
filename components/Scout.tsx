import React, { useState, useMemo } from 'react';
import type { Team, ScoutResult } from '../types';
import Loader from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface ScoutProps {
    teams: Team[];
    scoutResult: ScoutResult | null;
    isLoading: boolean;
    onFetchStrategies: (teamId: number) => void;
}

const Scout: React.FC<ScoutProps> = ({ teams, scoutResult, isLoading, onFetchStrategies }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');

    const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.teamName.localeCompare(b.teamName)), [teams]);

    const handleAnalyze = () => {
        if (!selectedTeamId) return;
        onFetchStrategies(parseInt(selectedTeamId, 10));
    };

    const renderResult = () => {
        if (isLoading) {
            return (
                <div className="text-center py-12">
                    <div className="flex justify-center"><Loader /></div>
                    <p className="text-brand-text-muted mt-3">AI is scouting the web for the latest FPL expert strategies...</p>
                    <p className="text-sm text-brand-text-muted/70">This can take up to 30 seconds.</p>
                </div>
            );
        }

        if (!scoutResult) {
            return (
                <div className="text-center py-12">
                    <p className="text-brand-text-muted text-lg">Select your team to get a summary of the latest strategies from top FPL experts.</p>
                </div>
            );
        }

        if (scoutResult.strategies.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-brand-text-muted text-lg">The AI scout couldn't find any specific strategy articles for this team right now.</p>
                </div>
            )
        }
        
        const { strategies, sources } = scoutResult;

        return (
            <div className="mt-8 animate-fadeIn space-y-6">
                {strategies.map((strategy, index) => (
                    <div key={index} className="bg-black/20 p-4 sm:p-6 rounded-xl border-l-4 border-brand-accent">
                        <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
                           <BookOpenIcon className="w-6 h-6 text-brand-accent"/>
                           {strategy.sourceName}
                        </h3>

                        {strategy.keyTakeaways && strategy.keyTakeaways.length > 0 && (
                            <div className="bg-brand-dark/50 p-3 rounded-lg mb-4 border border-white/10">
                                <h4 className="text-sm font-bold text-brand-text mb-2">Key Takeaways:</h4>
                                <ul className="space-y-1.5 pl-5 list-disc text-sm text-brand-text">
                                    {strategy.keyTakeaways.map((takeaway, i) => (
                                        <li key={i}>{takeaway}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-brand-text-muted whitespace-pre-wrap text-sm leading-relaxed">{strategy.strategySummary}</p>
                    </div>
                ))}

                {sources.length > 0 && (
                     <div className="bg-black/20 p-4 rounded-xl mt-6 border border-white/10">
                        <h4 className="text-sm font-bold text-brand-text-muted mb-2 text-center">Information Sourced From:</h4>
                        <ul className="text-xs text-center space-y-1">
                            {sources.map(source => (
                                <li key={source.uri}>
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-brand-accent hover:underline"
                                        title={source.uri}
                                    >
                                        {source.title || new URL(source.uri).hostname}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold mb-2 text-brand-text text-center">AI Web Scout</h2>
            <p className="text-brand-text-muted text-center mb-6">Get a blog-style summary of expert strategies powered by Google Search.</p>
            
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
                    <div>
                        <label htmlFor="team-scout-select" className="block text-sm font-medium text-brand-text-muted mb-1">
                            Select a Team to Tailor Research
                        </label>
                        <select
                            id="team-scout-select"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-full bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text p-2.5 transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
                        >
                            <option value="" disabled>Select a team</option>
                            {sortedTeams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {/* FIX: Corrected property access from team.Name to team.teamName to match the Team type definition. */}
                                    {team.teamName} ({team.managerName})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        onClick={handleAnalyze}
                        disabled={!selectedTeamId || isLoading}
                        className="w-full md:w-auto px-5 py-2.5 bg-brand-accent text-white font-bold rounded-lg hover:bg-brand-accent-hover transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        <span>{isLoading ? 'Scouting...' : 'Scout for Strategies'}</span>
                    </button>
                </div>
            </div>
            {renderResult()}
        </div>
    );
};

export default Scout;