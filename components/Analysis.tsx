import React from 'react';
import type { Team, KeyMatch, PredictedStanding, LuckAnalysis, FplFixture, FplTeamInfo } from '../types';
import Loader from './Loader';
import { CalendarDaysIcon } from './icons/DashboardIcons';
import { SparklesIcon } from './icons/SparklesIcon';
import LuckIndex from './LuckIndex';
import FixtureTicker from './FixtureTicker';

const KeyMatchesAnalysis: React.FC<{ 
    keyMatches: KeyMatch[] | null;
    isLoading: boolean;
    onAnalyze: () => void;
}> = ({ keyMatches, isLoading, onAnalyze }) => {
    if (!process.env.API_KEY) return null;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center flex items-center justify-center gap-2">
                <CalendarDaysIcon className="w-6 h-6" />
                AI: Key Match Analysis
            </h2>
            {!keyMatches && !isLoading && (
                <div className="text-center">
                    <p className="text-brand-text-muted mb-4">Let the AI identify the most interesting matches of the gameweek.</p>
                    <button
                        onClick={onAnalyze}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-brand-accent text-white shadow-lg shadow-brand-accent/20"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>Analyze Fixtures</span>
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="text-center py-4">
                    <Loader />
                    <p className="text-brand-text-muted mt-2">AI is analyzing the gameweek fixtures...</p>
                </div>
            )}
            {!isLoading && keyMatches && keyMatches.length > 0 && (
                 <div className="bg-black/20 p-4 rounded-lg border-l-4 border-brand-accent">
                    <h3 className="font-bold text-brand-accent mb-2">Key Matches to Watch</h3>
                    <ul className="space-y-2">
                        {keyMatches.map(km => (
                            <li key={km.match}>
                                <p className="font-semibold text-brand-text">{km.match}</p>
                                <p className="text-sm text-brand-text-muted italic">"{km.justification}"</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!isLoading && keyMatches && keyMatches.length === 0 && (
                <p className="text-brand-text-muted text-center">The AI found no standout key matches for the upcoming gameweek.</p>
            )}
        </div>
    );
};

const PredictedFinalStandings: React.FC<{
    standings: PredictedStanding[] | null;
    isLoading: boolean;
    onPredict: () => void;
}> = ({ standings, isLoading, onPredict }) => {
    if (!process.env.API_KEY) return null;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center flex items-center justify-center gap-2">
                <SparklesIcon className="w-6 h-6 text-brand-danger" />
                AI: Predicted Final Standings
            </h2>
            {!standings && !isLoading && (
                <div className="text-center">
                    <p className="text-brand-text-muted mb-4">Get an AI-powered prediction of how the league table might look at the end of the season.</p>
                    <button
                        onClick={onPredict}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-brand-danger text-white shadow-lg shadow-brand-danger/20"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>Predict Now</span>
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="text-center py-8">
                    <Loader />
                    <p className="text-brand-text-muted mt-2">The AI is crunching the numbers... this might take a moment.</p>
                </div>
            )}
            {standings && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-sm text-brand-text-muted uppercase tracking-wider">
                            <tr>
                                <th className="p-3 text-center w-12">#</th>
                                <th className="p-3">Team</th>
                                <th className="p-3">AI Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((team) => (
                                <tr key={team.rank} className="border-t border-white/10">
                                    <td className="p-3 text-center font-bold text-brand-text-muted">{team.rank}</td>
                                    <td className="p-3 font-semibold text-brand-text">{team.teamName}</td>
                                    <td className="p-3 text-sm text-brand-text-muted italic">"{team.justification}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
        </div>
    );
};

interface AnalysisProps {
    teams: Team[];
    keyMatches: KeyMatch[] | null;
    isLoadingKeyMatches: boolean;
    onAnalyzeKeyMatches: () => void;
    predictedStandings: PredictedStanding[] | null;
    isLoadingPredictions: boolean;
    onPredictStandings: () => void;
    luckAnalysis: LuckAnalysis[] | null;
    isLoadingLuck: boolean;
    onAnalyzeLuck: () => void;
    allFixtures: FplFixture[];
    fplTeams: FplTeamInfo[];
    currentGameweek: number | null;
}

const Analysis: React.FC<AnalysisProps> = ({
    teams,
    keyMatches,
    isLoadingKeyMatches,
    onAnalyzeKeyMatches,
    predictedStandings,
    isLoadingPredictions,
    onPredictStandings,
    luckAnalysis,
    isLoadingLuck,
    onAnalyzeLuck,
    allFixtures,
    fplTeams,
    currentGameweek,
}) => {
    return (
        <div className="space-y-8">
            <PredictedFinalStandings
                standings={predictedStandings}
                isLoading={isLoadingPredictions}
                onPredict={onPredictStandings}
            />
            <LuckIndex 
                analysis={luckAnalysis}
                isLoading={isLoadingLuck}
                onAnalyze={onAnalyzeLuck}
            />
            <KeyMatchesAnalysis 
                keyMatches={keyMatches} 
                isLoading={isLoadingKeyMatches} 
                onAnalyze={onAnalyzeKeyMatches} 
            />
            <FixtureTicker 
                fplTeams={fplTeams} 
                allFixtures={allFixtures} 
                currentGameweek={currentGameweek} 
            />
        </div>
    );
};

export default Analysis;