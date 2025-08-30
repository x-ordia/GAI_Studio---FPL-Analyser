import React, { useState, useMemo } from 'react';
import type { Team, FplFixture, FplTeamInfo, PvpAnalysisResult } from '../types';
import { analyzePvpMatchup } from '../services/geminiService';
import Loader from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';

interface PvpAnalysisProps {
    teams: Team[];
    fixtures: FplFixture[];
    fplTeams: FplTeamInfo[];
}

const PvpAnalysis: React.FC<PvpAnalysisProps> = ({ teams, fixtures, fplTeams }) => {
    const [team1Id, setTeam1Id] = useState<string>('');
    const [team2Id, setTeam2Id] = useState<string>('');
    const [result, setResult] = useState<PvpAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.teamName.localeCompare(b.teamName)), [teams]);

    const handleAnalyze = async () => {
        if (!team1Id || !team2Id) return;

        const team1 = teams.find(t => t.id === parseInt(team1Id, 10));
        const team2 = teams.find(t => t.id === parseInt(team2Id, 10));

        if (!team1 || !team2) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is not configured.");
            }
            const analysisResult = await analyzePvpMatchup(team1, team2, fixtures, fplTeams);
            setResult(analysisResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to analyze matchup: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderResult = () => {
        if (isLoading) {
            return (
                <div className="text-center py-12">
                    <div className="flex justify-center"><Loader /></div>
                    <p className="text-brand-text-muted mt-3">The AI is analyzing the matchup, considering fixtures, form, and captaincy choices...</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="bg-brand-danger/10 border border-brand-danger text-brand-text px-4 py-3 rounded-lg text-center mt-6">
                    <p>{error}</p>
                </div>
            );
        }
        
        if (!result) {
            return (
                <div className="text-center py-12">
                    <p className="text-brand-text-muted text-lg">Select two teams to get an AI-powered prediction for their next match.</p>
                </div>
            );
        }

        const isTeam1Winner = result.predictedWinner === result.team1Name;
        const isTeam2Winner = result.predictedWinner === result.team2Name;

        return (
            <div className="mt-8 animate-fadeIn space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 text-center">
                    {/* Team 1 Card */}
                    <div className={`bg-black/20 p-6 rounded-xl border-2 transition-all duration-300 ${isTeam1Winner ? 'border-brand-success shadow-lg shadow-brand-success/20' : 'border-transparent'}`}>
                        <h3 className="text-xl font-bold text-brand-text truncate" title={result.team1Name}>{result.team1Name}</h3>
                        <p className="text-5xl font-bold text-brand-text my-2">{result.team1PredictedScore}</p>
                        <p className="text-brand-text-muted">Predicted Points</p>
                    </div>

                    <p className="text-4xl font-bold text-brand-danger">VS</p>
                    
                    {/* Team 2 Card */}
                     <div className={`bg-black/20 p-6 rounded-xl border-2 transition-all duration-300 ${isTeam2Winner ? 'border-brand-success shadow-lg shadow-brand-success/20' : 'border-transparent'}`}>
                        <h3 className="text-xl font-bold text-brand-text truncate" title={result.team2Name}>{result.team2Name}</h3>
                        <p className="text-5xl font-bold text-brand-text my-2">{result.team2PredictedScore}</p>
                        <p className="text-brand-text-muted">Predicted Points</p>
                    </div>
                </div>

                {/* Justification Card */}
                <div className="bg-black/20 p-6 rounded-xl border-l-4 border-brand-accent">
                    <h4 className="text-lg font-bold text-brand-text mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-brand-accent" />
                        AI Justification
                    </h4>
                    <p className="text-brand-text-muted italic whitespace-pre-wrap">"{result.justification}"</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl font-bold mb-6 text-brand-text text-center">Head-to-Head AI Analysis</h2>
            
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-end">
                    <div>
                        <label htmlFor="team1-select" className="block text-sm font-medium text-brand-text-muted mb-1">
                            Team 1
                        </label>
                        <select
                            id="team1-select"
                            value={team1Id}
                            onChange={(e) => setTeam1Id(e.target.value)}
                            className="w-full bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text p-2.5 transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
                        >
                            <option value="" disabled>Select a team</option>
                            {sortedTeams.map(team => (
                                <option key={team.id} value={team.id} disabled={team.id.toString() === team2Id}>
                                    {team.teamName}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="team2-select" className="block text-sm font-medium text-brand-text-muted mb-1">
                            Team 2
                        </label>
                        <select
                            id="team2-select"
                            value={team2Id}
                            onChange={(e) => setTeam2Id(e.target.value)}
                            className="w-full bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text p-2.5 transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
                        >
                            <option value="" disabled>Select a team</option>
                            {sortedTeams.map(team => (
                                <option key={team.id} value={team.id} disabled={team.id.toString() === team1Id}>
                                    {team.teamName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={!team1Id || !team2Id || team1Id === team2Id || isLoading}
                        className="w-full md:w-auto px-5 py-2.5 bg-brand-danger text-white font-bold rounded-lg hover:bg-opacity-80 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-danger/20"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
                    </button>
                </div>
            </div>
            {renderResult()}
        </div>
    );
};

export default PvpAnalysis;