
import React, { useMemo, useState } from 'react';
import type { Team, Transfer } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons/ArrowIcons';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TransferHistoryProps {
    teams: Team[];
}

const AllTransfersView: React.FC<{ teams: Team[] }> = ({ teams }) => {
    const [openGameweek, setOpenGameweek] = useState<number | null>(null);

    const transfersByGameweek = useMemo(() => {
        const grouped: { [key: number]: { teamName: string; managerName: string; transfers: Transfer[] }[] } = {};

        teams.forEach(team => {
            if (team.transferHistory) {
                team.transferHistory.forEach(transfer => {
                    const gameweek = transfer.gameweek;
                    if (!grouped[gameweek]) {
                        grouped[gameweek] = [];
                    }
                    
                    let teamEntry = grouped[gameweek].find(t => t.managerName === team.managerName);
                    
                    if (!teamEntry) {
                        teamEntry = { teamName: team.teamName, managerName: team.managerName, transfers: [] };
                        grouped[gameweek].push(teamEntry);
                    }
                    
                    teamEntry.transfers.push(transfer);
                });
            }
        });
        
        return Object.entries(grouped)
            .map(([gw, data]) => ({ gameweek: parseInt(gw), data }))
            .sort((a, b) => b.gameweek - a.gameweek);
    }, [teams]);

    const toggleGameweek = (gameweek: number) => {
        setOpenGameweek(openGameweek === gameweek ? null : gameweek);
    };

    const latestGameweek = transfersByGameweek.length > 0 ? transfersByGameweek[0].gameweek : null;

    useState(() => {
        if (latestGameweek && openGameweek === null) {
            setOpenGameweek(latestGameweek);
        }
    });

    if (transfersByGameweek.length === 0) {
        return <p className="text-center text-fpl-text-dark">No transfers have been made in this league yet.</p>;
    }

    return (
        <div className="space-y-2">
            {transfersByGameweek.map(({ gameweek, data }) => (
                <div key={gameweek} className="bg-fpl-purple/80 rounded-lg overflow-hidden border border-white/10">
                    <button
                        onClick={() => toggleGameweek(gameweek)}
                        className="w-full flex justify-between items-center p-4 text-left font-bold text-lg text-fpl-text"
                        aria-expanded={openGameweek === gameweek}
                    >
                        <span>Gameweek {gameweek}</span>
                        <ChevronDownIcon className={`w-6 h-6 transition-transform ${openGameweek === gameweek ? 'rotate-180' : ''}`} />
                    </button>
                    {openGameweek === gameweek && (
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <div className="space-y-4">
                                {data.sort((a,b) => a.teamName.localeCompare(b.teamName)).map(teamData => (
                                    <div key={teamData.managerName}>
                                        <p className="font-semibold text-fpl-text">{teamData.teamName} <span className="text-fpl-text-dark text-sm">({teamData.managerName})</span></p>
                                        <ul className="mt-1 space-y-1 pl-4">
                                            {teamData.transfers.map((t, i) => (
                                                <li key={i} className="text-sm space-y-1">
                                                    <div className="flex items-center justify-between gap-2 text-fpl-green">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <ArrowUpCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                            <span className="truncate" title={t.playerIn}>{t.playerIn}</span>
                                                        </div>
                                                        <span className="font-semibold font-mono bg-fpl-green/20 px-2 py-0.5 rounded text-xs whitespace-nowrap">{t.playerInPoints} pts</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2 text-fpl-pink">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <ArrowDownCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                            <span className="truncate" title={t.playerOut}>{t.playerOut}</span>
                                                        </div>
                                                        <span className="font-semibold font-mono bg-fpl-pink/20 px-2 py-0.5 rounded text-xs whitespace-nowrap">{t.playerOutPoints} pts</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const SingleTeamView: React.FC<{ team: Team }> = ({ team }) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-fpl-text mb-2 text-center">{team.teamName}'s Transfer History</h3>
             <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-sm text-fpl-text-dark uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Gameweek</th>
                            <th className="p-3">Player In</th>
                            <th className="p-3">Player Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.transferHistory.length > 0 ? (
                            team.transferHistory.map((t, i) => (
                                <tr key={i} className="border-t border-white/10 bg-fpl-purple/80">
                                    <td className="p-3 font-semibold text-fpl-text-dark w-28">GW {t.gameweek}</td>
                                    <td className="p-3 text-fpl-green">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpCircleIcon className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate" title={t.playerIn}>{t.playerIn}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-fpl-pink">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownCircleIcon className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate" title={t.playerOut}>{t.playerOut}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-fpl-text-dark bg-fpl-purple/80">
                                    No transfers recorded for this team.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TransferHistory: React.FC<TransferHistoryProps> = ({ teams }) => {
    const [selectedView, setSelectedView] = useState<string>('all');

    const selectedTeamData = useMemo(() => {
        if (selectedView === 'all') return null;
        return teams.find(t => t.id === parseInt(selectedView, 10));
    }, [selectedView, teams]);
    
    return (
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-fpl-text text-center">League Transfer History</h2>
            
            <div className="mb-6 max-w-sm mx-auto">
                <label htmlFor="transfer-view-select" className="block text-sm font-medium text-fpl-text-dark mb-1 text-center">
                    Display transfers for:
                </label>
                <select
                    id="transfer-view-select"
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                    className="w-full bg-fpl-purple-light border-2 border-fpl-purple rounded-lg text-fpl-text p-2 transition-colors focus:border-fpl-green outline-none ring-0"
                    aria-label="Select a team to view their transfer history"
                >
                    <option value="all">All Teams (by Gameweek)</option>
                    {teams.sort((a, b) => a.teamName.localeCompare(b.teamName)).map(team => (
                        <option key={team.id} value={team.id.toString()}>
                            {team.teamName}
                        </option>
                    ))}
                </select>
            </div>

            {selectedView === 'all' ? (
                <AllTransfersView teams={teams} />
            ) : selectedTeamData ? (
                <SingleTeamView team={selectedTeamData} />
            ) : null}
        </div>
    );
};

export default TransferHistory;
