import React, { useMemo } from 'react';
import type { Team, FplFixture, FplTeamInfo, KeyMatch, PredictedStanding, LuckAnalysis } from '../types';
import Loader from './Loader';
import { TrophyIcon, StarIcon, ExclamationTriangleIcon, CalendarDaysIcon } from './icons/DashboardIcons';
import { SparklesIcon } from './icons/SparklesIcon';
import OwnershipStats from './OwnershipStats';
import LuckIndex from './LuckIndex';

const GameweekHighlights: React.FC<{ teams: Team[] }> = ({ teams }) => {
    const highlights = useMemo(() => {
        if (teams.length === 0 || teams.every(t => t.liveGwPoints === undefined)) return null;

        let topScorer = { managerName: 'N/A', points: -Infinity };
        let bestCaptain = { managerName: 'N/A', playerName: 'N/A', points: -Infinity, captainedPoints: -Infinity };
        let worstBenching = { managerName: 'N/A', points: -1 };

        teams.forEach(team => {
            if ((team.liveGwPoints ?? -Infinity) > topScorer.points) {
                topScorer = { managerName: team.managerName, points: team.liveGwPoints! };
            }
            if (team.liveCaptain && (team.liveCaptain.captainedPoints > bestCaptain.captainedPoints)) {
                bestCaptain = {
                    managerName: team.managerName,
                    playerName: team.liveCaptain.name,
                    points: team.liveCaptain.points,
                    captainedPoints: team.liveCaptain.captainedPoints,
                };
            }
            if ((team.liveBenchPoints ?? -1) > worstBenching.points) {
                worstBenching = { managerName: team.managerName, points: team.liveBenchPoints! };
            }
        });

        return { topScorer, bestCaptain, worstBenching };
    }, [teams]);
    
    if (!highlights) return null;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center">Gameweek Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-black/20 p-4 rounded-lg">
                    <TrophyIcon className="w-8 h-8 mx-auto text-brand-warning mb-2" />
                    <h3 className="font-semibold text-brand-text-muted">Top Scorer</h3>
                    <p className="text-lg font-bold text-brand-text truncate" title={highlights.topScorer.managerName}>{highlights.topScorer.managerName}</p>
                    <p className="text-2xl font-bold text-brand-success">{highlights.topScorer.points} pts</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <StarIcon className="w-8 h-8 mx-auto text-brand-success mb-2" />
                    <h3 className="font-semibold text-brand-text-muted">Best Captain</h3>
                    <p className="text-lg font-bold text-brand-text truncate" title={highlights.bestCaptain.managerName}>{highlights.bestCaptain.managerName}</p>
                    <p className="text-md text-brand-text truncate" title={highlights.bestCaptain.playerName}>{highlights.bestCaptain.playerName} ({highlights.bestCaptain.captainedPoints} pts)</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-brand-danger mb-2" />
                    <h3 className="font-semibold text-brand-text-muted">Benching Blunder</h3>
                    <p className="text-lg font-bold text-brand-text truncate" title={highlights.worstBenching.managerName}>{highlights.worstBenching.managerName}</p>
                    <p className="text-2xl font-bold text-brand-danger">{highlights.worstBenching.points} pts left</p>
                </div>
            </div>
        </div>
    );
};

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

const ChipBadge: React.FC<{ chip: string | null | undefined }> = ({ chip }) => {
    if (!chip || chip === 'null') return null;

    const chipDetails: { [key: string]: { label: string; tooltip: string; className: string } } = {
        'bboost': { label: 'BB', tooltip: 'Bench Boost', className: 'bg-brand-accent/80' },
        '3xc': { label: 'TC', tooltip: 'Triple Captain', className: 'bg-brand-danger/80' },
        'freehit': { label: 'FH', tooltip: 'Free Hit', className: 'bg-brand-success/80' },
        'wildcard': { label: 'WC', tooltip: 'Wildcard', className: 'bg-brand-warning/80 text-brand-dark' },
    };

    const detail = chipDetails[chip];
    if (!detail) return null;

    return (
        <div className="group relative flex justify-center">
            <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-md ${detail.className}`}>
                {detail.label}
            </span>
            <span className="absolute bottom-full mb-2 hidden w-max group-hover:block bg-brand-dark text-white text-xs rounded py-1 px-2 z-10">
                {detail.tooltip}
            </span>
        </div>
    );
};


const LeagueTable: React.FC<{ teams: Team[] }> = ({ teams }) => {
    const sortedTeams = [...teams].sort((a, b) => {
        const totalA = a.gameweekHistory[a.gameweekHistory.length - 1]?.totalPoints || 0;
        const totalB = b.gameweekHistory[b.gameweekHistory.length - 1]?.totalPoints || 0;
        return totalB - totalA;
      });

    return (
        <div className="bg-brand-surface rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden">
            <h2 className="text-xl font-bold p-4 text-brand-text text-center">League Table</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-sm text-brand-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="p-3 text-center">#</th>
                            <th className="p-3">Team</th>
                            <th className="p-3 hidden md:table-cell">Manager</th>
                            <th className="p-3 text-center">GW</th>
                            <th className="p-3 text-center">Chip</th>
                            <th className="p-3 text-center">Bench</th>
                            <th className="p-3 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => (
                            <tr key={team.id} className="border-t border-white/10 hover:bg-black/20 transition-colors">
                                <td className="p-3 text-center font-bold text-brand-text-muted">{index + 1}</td>
                                <td className="p-3 font-semibold text-brand-text">{team.teamName}</td>
                                <td className="p-3 text-brand-text-muted hidden md:table-cell">{team.managerName}</td>
                                <td className="p-3 text-center font-bold text-brand-success">{team.liveGwPoints ?? '-'}</td>
                                <td className="p-3 text-center">
                                    <ChipBadge chip={team.activeChip} />
                                </td>
                                <td className="p-3 text-center font-bold text-brand-danger">{team.liveBenchPoints ?? '-'}</td>
                                <td className="p-3 text-center font-bold text-brand-text">{team.gameweekHistory[team.gameweekHistory.length - 1]?.totalPoints || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

interface DashboardProps {
    teams: Team[];
    fixtures: FplFixture[];
    fplTeams: FplTeamInfo[];
    keyMatches: KeyMatch[] | null;
    isLoadingKeyMatches: boolean;
    onAnalyzeKeyMatches: () => void;
    predictedStandings: PredictedStanding[] | null;
    isLoadingPredictions: boolean;
    onPredictStandings: () => void;
    luckAnalysis: LuckAnalysis[] | null;
    isLoadingLuck: boolean;
    onAnalyzeLuck: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    teams, 
    keyMatches, 
    isLoadingKeyMatches, 
    onAnalyzeKeyMatches,
    predictedStandings, 
    isLoadingPredictions, 
    onPredictStandings,
    luckAnalysis,
    isLoadingLuck,
    onAnalyzeLuck
}) => {
    return (
        <div className="space-y-8">
            <LeagueTable teams={teams} />
            <PredictedFinalStandings
                standings={predictedStandings}
                isLoading={isLoadingPredictions}
                onPredict={onPredictStandings}
            />
            <GameweekHighlights teams={teams} />
            <LuckIndex 
                analysis={luckAnalysis}
                isLoading={isLoadingLuck}
                onAnalyze={onAnalyzeLuck}
            />
            <OwnershipStats teams={teams} />
            <KeyMatchesAnalysis 
                keyMatches={keyMatches} 
                isLoading={isLoadingKeyMatches} 
                onAnalyze={onAnalyzeKeyMatches} 
            />
        </div>
    );
};

export default Dashboard;