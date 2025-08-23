import React, { useMemo } from 'react';
import type { Team, FplFixture, FplTeamInfo, KeyMatch, PredictedStanding } from '../types';
import Loader from './Loader';
import { TrophyIcon, StarIcon, ExclamationTriangleIcon, CalendarDaysIcon } from './icons/DashboardIcons';
import { SparklesIcon } from './icons/SparklesIcon';
import OwnershipStats from './OwnershipStats';

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
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-fpl-text text-center">Gameweek Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-black/20 p-4 rounded-lg">
                    <TrophyIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                    <h3 className="font-semibold text-fpl-text-dark">Top Scorer</h3>
                    <p className="text-lg font-bold text-fpl-text truncate" title={highlights.topScorer.managerName}>{highlights.topScorer.managerName}</p>
                    <p className="text-2xl font-bold text-fpl-green">{highlights.topScorer.points} pts</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <StarIcon className="w-8 h-8 mx-auto text-fpl-green mb-2" />
                    <h3 className="font-semibold text-fpl-text-dark">Best Captain</h3>
                    <p className="text-lg font-bold text-fpl-text truncate" title={highlights.bestCaptain.managerName}>{highlights.bestCaptain.managerName}</p>
                    <p className="text-md text-fpl-text truncate" title={highlights.bestCaptain.playerName}>{highlights.bestCaptain.playerName} ({highlights.bestCaptain.captainedPoints} pts)</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-fpl-pink mb-2" />
                    <h3 className="font-semibold text-fpl-text-dark">Benching Blunder</h3>
                    <p className="text-lg font-bold text-fpl-text truncate" title={highlights.worstBenching.managerName}>{highlights.worstBenching.managerName}</p>
                    <p className="text-2xl font-bold text-fpl-pink">{highlights.worstBenching.points} pts left</p>
                </div>
            </div>
        </div>
    );
};

const KeyMatchesAnalysis: React.FC<{ 
    keyMatches: KeyMatch[] | null,
    isLoading: boolean 
}> = ({ keyMatches, isLoading }) => {
    if (!import.meta.env.VITE_API_KEY) return null;
    if (!keyMatches && !isLoading) return null;

    return (
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-fpl-text text-center flex items-center justify-center gap-2">
                <CalendarDaysIcon className="w-6 h-6" />
                AI: Key Match Analysis
            </h2>
            {isLoading && <div className="text-center py-4"><Loader /></div>}
            {!isLoading && keyMatches && keyMatches.length > 0 && (
                 <div className="bg-black/20 p-4 rounded-lg border-l-4 border-fpl-green">
                    <h3 className="font-bold text-fpl-green mb-2">Key Matches to Watch</h3>
                    <ul className="space-y-2">
                        {keyMatches.map(km => (
                            <li key={km.match}>
                                <p className="font-semibold text-fpl-text">{km.match}</p>
                                <p className="text-sm text-fpl-text-dark italic">"{km.justification}"</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {!isLoading && (!keyMatches || keyMatches.length === 0) && (
                <p className="text-fpl-text-dark text-center">No key matches were identified for the upcoming gameweek.</p>
            )}
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
        <div className="bg-fpl-purple/60 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden">
            <h2 className="text-xl font-bold p-4 text-fpl-text text-center">League Table</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-sm text-fpl-text-dark uppercase tracking-wider">
                        <tr>
                            <th className="p-3 text-center">#</th>
                            <th className="p-3">Team</th>
                            <th className="p-3 hidden md:table-cell">Manager</th>
                            <th className="p-3 text-center">GW</th>
                            <th className="p-3 text-center">Bench</th>
                            <th className="p-3 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => (
                            <tr key={team.id} className="border-t border-white/10">
                                <td className="p-3 text-center font-bold text-fpl-text-dark">{index + 1}</td>
                                <td className="p-3 font-semibold text-fpl-text">{team.teamName}</td>
                                <td className="p-3 text-fpl-text-dark hidden md:table-cell">{team.managerName}</td>
                                <td className="p-3 text-center font-bold text-fpl-green">{team.liveGwPoints ?? '-'}</td>
                                <td className="p-3 text-center font-bold text-fpl-pink">{team.liveBenchPoints ?? '-'}</td>
                                <td className="p-3 text-center font-bold text-fpl-text">{team.gameweekHistory[team.gameweekHistory.length - 1]?.totalPoints || 0}</td>
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
    if (!import.meta.env.VITE_API_KEY) return null;

    return (
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-fpl-text text-center flex items-center justify-center gap-2">
                <SparklesIcon className="w-6 h-6 text-fpl-pink" />
                AI: Predicted Final Standings
            </h2>
            {!standings && !isLoading && (
                <div className="text-center">
                    <p className="text-fpl-text-dark mb-4">Get an AI-powered prediction of how the league table might look at the end of the season.</p>
                    <button
                        onClick={onPredict}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-fpl-pink text-white"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>Predict Now</span>
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="text-center py-8">
                    <Loader />
                    <p className="text-fpl-text-dark mt-2">The AI is crunching the numbers... this might take a moment.</p>
                </div>
            )}
            {standings && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-sm text-fpl-text-dark uppercase tracking-wider">
                            <tr>
                                <th className="p-3 text-center w-12">#</th>
                                <th className="p-3">Team</th>
                                <th className="p-3">AI Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((team) => (
                                <tr key={team.rank} className="border-t border-white/10">
                                    <td className="p-3 text-center font-bold text-fpl-text-dark">{team.rank}</td>
                                    <td className="p-3 font-semibold text-fpl-text">{team.teamName}</td>
                                    <td className="p-3 text-sm text-fpl-text-dark italic">"{team.justification}"</td>
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
    predictedStandings: PredictedStanding[] | null;
    isLoadingPredictions: boolean;
    onPredictStandings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ teams, keyMatches, isLoadingKeyMatches, predictedStandings, isLoadingPredictions, onPredictStandings }) => {
    return (
        <div className="space-y-8">
            <LeagueTable teams={teams} />
            <PredictedFinalStandings
                standings={predictedStandings}
                isLoading={isLoadingPredictions}
                onPredict={onPredictStandings}
            />
            <OwnershipStats teams={teams} />
            <GameweekHighlights teams={teams} />
            <KeyMatchesAnalysis keyMatches={keyMatches} isLoading={isLoadingKeyMatches} />
        </div>
    );
};

export default Dashboard;