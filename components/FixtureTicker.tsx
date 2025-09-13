import React, { useMemo } from 'react';
import type { FplFixture, FplTeamInfo } from '../types';
import { TableCellsIcon } from './icons/TableCellsIcon';
import Loader from './Loader';

interface FixtureTickerProps {
    fplTeams: FplTeamInfo[];
    allFixtures: FplFixture[];
    currentGameweek: number | null;
}

const getDifficultyColor = (difficulty: number): string => {
    switch (difficulty) {
        case 1: return 'bg-emerald-900 border-emerald-700';
        case 2: return 'bg-emerald-700 border-emerald-500';
        case 3: return 'bg-gray-600 border-gray-400';
        case 4: return 'bg-red-700 border-red-500';
        case 5: return 'bg-red-900 border-red-700';
        default: return 'bg-brand-dark border-brand-surface';
    }
};

const getOverallFormColor = (wins: number): string => {
    switch (wins) {
        case 3: return 'bg-brand-success text-white';
        case 2: return 'bg-yellow-500 text-brand-dark';
        case 1: return 'bg-orange-500 text-white';
        default: return 'bg-brand-danger text-white';
    }
};

const FixtureTicker: React.FC<FixtureTickerProps> = ({ fplTeams, allFixtures, currentGameweek }) => {
    const processedData = useMemo(() => {
        if (!fplTeams.length || !allFixtures.length || !currentGameweek) {
            return null;
        }

        const teamsMap = new Map<number, FplTeamInfo>(fplTeams.map(team => [team.id, team]));
        
        const finishedFixtures = allFixtures
            .filter(f => f.finished)
            .sort((a, b) => (b.event ?? 0) - (a.event ?? 0));

        const data = fplTeams
            .map(team => {
                const last3Fixtures = finishedFixtures
                    .filter(f => f.team_h === team.id || f.team_a === team.id)
                    .slice(0, 3);

                const formResults = last3Fixtures.map(fixture => {
                    const isHome = fixture.team_h === team.id;
                    const homeScore = fixture.team_h_score;
                    const awayScore = fixture.team_a_score;

                    if (homeScore === null || awayScore === null) return 'U';

                    if (homeScore === awayScore) return 'D';
                    if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) {
                        return 'W';
                    }
                    return 'L';
                }).reverse();
                
                let formPoints = 0;
                formResults.forEach(res => {
                    if (res === 'W') formPoints += 3;
                    if (res === 'D') formPoints += 1;
                });
                
                const winCount = formResults.filter(r => r === 'W').length;
                
                const upcomingFixtures = allFixtures
                    .filter(f => (f.team_h === team.id || f.team_a === team.id) && f.event && f.event >= currentGameweek && !f.finished)
                    .sort((a, b) => (a.event ?? 99) - (b.event ?? 99))
                    .slice(0, 10);
                
                const fixtures = upcomingFixtures.map(fixture => {
                    const isHome = fixture.team_h === team.id;
                    const opponentId = isHome ? fixture.team_a : fixture.team_h;
                    const opponent = teamsMap.get(opponentId);
                    const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;

                    return {
                        opponentName: opponent?.short_name || '???',
                        location: isHome ? '(H)' : '(A)',
                        difficulty,
                        gameweek: fixture.event,
                    };
                });
                
                return {
                    teamId: team.id,
                    teamName: team.name,
                    fixtures,
                    formResults,
                    formPoints,
                    winCount,
                };
            })
            .sort((a, b) => {
                if (b.formPoints !== a.formPoints) {
                    return b.formPoints - a.formPoints;
                }
                return a.teamName.localeCompare(b.teamName);
            });

        return { data };
    }, [fplTeams, allFixtures, currentGameweek]);

    if (!processedData) {
        return (
            <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
                 <h2 className="text-xl font-bold mb-4 text-brand-text text-center flex items-center justify-center gap-2">
                    <TableCellsIcon className="w-6 h-6" />
                    PL Fixture Ticker
                </h2>
                <div className="flex justify-center py-8">
                   <Loader />
                </div>
            </div>
        )
    }
    
    const { data } = processedData;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center flex items-center justify-center gap-2">
                <TableCellsIcon className="w-6 h-6" />
                PL Fixture Ticker
            </h2>
            <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/20 text-xs text-brand-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="p-2.5 sticky left-0 bg-black/20 z-10">Team</th>
                            <th className="p-2.5 text-center">Form</th>
                            <th className="p-2.5 text-center" colSpan={10}>Upcoming Fixtures</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {data.map(teamData => (
                            <tr key={teamData.teamId} className="hover:bg-black/20 transition-colors">
                                <td className="p-2.5 font-bold sticky left-0 bg-brand-surface hover:bg-black/20 transition-colors z-10">{teamData.teamName}</td>
                                <td className="p-2.5">
                                    <div className="flex justify-center">
                                         {teamData.formResults.length > 0 ? (
                                            <span className={`px-2 py-1 font-bold text-xs rounded-md ${getOverallFormColor(teamData.winCount)}`}>
                                                {teamData.formResults.join('-')}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-brand-text-muted">N/A</span>
                                        )}
                                    </div>
                                </td>
                                {teamData.fixtures.map((fixture, index) => (
                                    <td key={index} className={`p-0`}>
                                        <div className={`text-center font-bold text-white border-l-2 h-full py-2.5 ${getDifficultyColor(fixture.difficulty)}`}>
                                            {fixture.opponentName} <span className="font-normal text-white/70">{fixture.location}</span>
                                        </div>
                                    </td>
                                ))}
                                {Array.from({ length: 10 - teamData.fixtures.length }).map((_, i) => (
                                    <td key={`empty-${i}`} className="p-2.5 bg-brand-dark/50 border-l-2 border-brand-surface"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FixtureTicker;