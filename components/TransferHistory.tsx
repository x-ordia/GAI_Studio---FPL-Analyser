import React, { useMemo, useState, useEffect } from 'react';
import type { Team, Transfer } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons/ArrowIcons';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TransferHistoryProps {
    teams: Team[];
}

const AllTransfersView: React.FC<{ teams: Team[] }> = ({ teams }) => {
    const [openGameweek, setOpenGameweek] = useState<number | null>(null);

    const transfersByGameweek = useMemo(() => {
        const grouped: { [key: number]: { teamName: string; managerName: string; transfers: Transfer[]; transferCost: number }[] } = {};

        teams.forEach(team => {
            if (team.transferHistory) {
                const costMap = new Map<number, number>();
                team.gameweekHistory.forEach(h => {
                    if (h.transferCost > 0) {
                        costMap.set(h.gameweek, h.transferCost);
                    }
                });

                team.transferHistory.forEach(transfer => {
                    const gameweek = transfer.gameweek;
                    if (!grouped[gameweek]) {
                        grouped[gameweek] = [];
                    }
                    
                    let teamEntry = grouped[gameweek].find(t => t.managerName === team.managerName);
                    
                    if (!teamEntry) {
                        const transferCost = costMap.get(gameweek) || 0;
                        teamEntry = { teamName: team.teamName, managerName: team.managerName, transfers: [], transferCost };
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

    // Automatically open the latest gameweek with transfers
    useEffect(() => {
        if (transfersByGameweek.length > 0 && openGameweek === null) {
            setOpenGameweek(transfersByGameweek[0].gameweek);
        }
    }, [transfersByGameweek, openGameweek]);

    if (transfersByGameweek.length === 0) {
        return <p className="text-center text-brand-text-muted">No transfers have been made in this league yet.</p>;
    }

    return (
        <div className="space-y-2">
            {transfersByGameweek.map(({ gameweek, data }) => (
                <div key={gameweek} className="bg-brand-dark/50 rounded-lg overflow-hidden border border-white/10">
                    <button
                        onClick={() => toggleGameweek(gameweek)}
                        className="w-full flex justify-between items-center p-4 text-left font-bold text-lg text-brand-text hover:bg-white/5 transition-colors"
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
                                        <p className="font-semibold text-brand-text flex items-center flex-wrap gap-x-2 gap-y-1">
                                            {teamData.teamName} 
                                            <span className="text-brand-text-muted text-sm">({teamData.managerName})</span>
                                            {teamData.transferCost > 0 && (
                                                <span className="text-xs font-bold text-brand-danger bg-brand-danger/20 px-2 py-0.5 rounded-full">
                                                    -{teamData.transferCost} PTS
                                                </span>
                                            )}
                                        </p>
                                        <ul className="mt-1 space-y-1 pl-4">
                                            {teamData.transfers.map((t, i) => (
                                                <li key={i} className="text-sm space-y-1">
                                                    <div className="flex items-center gap-2 text-brand-success">
                                                        <ArrowUpCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                        <span className="truncate" title={t.playerIn}>{t.playerIn}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-brand-danger">
                                                        <ArrowDownCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                        <span className="truncate" title={t.playerOut}>{t.playerOut}</span>
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
    const transfersByGameweek = useMemo(() => {
        const grouped: { [gw: number]: Transfer[] } = {};
        team.transferHistory.forEach(t => {
            if (!grouped[t.gameweek]) {
                grouped[t.gameweek] = [];
            }
            grouped[t.gameweek].push(t);
        });
        return Object.entries(grouped)
            .map(([gw, transfers]) => ({
                gameweek: parseInt(gw),
                transfers,
            }))
            .sort((a, b) => b.gameweek - a.gameweek);
    }, [team.transferHistory]);

    return (
        <div>
            <h3 className="text-xl font-bold text-brand-text mb-2 text-center">{team.teamName}'s Transfer History</h3>
             <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-sm text-brand-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Player In</th>
                            <th className="p-3">Player Out</th>
                        </tr>
                    </thead>
                    {team.transferHistory.length > 0 ? (
                        transfersByGameweek.map(({ gameweek, transfers }) => {
                            const gwHistory = team.gameweekHistory.find(h => h.gameweek === gameweek);
                            const cost = gwHistory?.transferCost || 0;
                            return (
                                <tbody key={gameweek} className="border-t border-white/10">
                                    <tr className="bg-brand-dark/30">
                                        <th colSpan={2} className="p-2 font-semibold text-brand-text-muted">
                                            <div className="flex justify-between items-center">
                                                <span>Gameweek {gameweek}</span>
                                                {cost > 0 && (
                                                    <span className="text-xs font-bold text-brand-danger bg-brand-danger/20 px-2 py-0.5 rounded-full">
                                                        -{cost} PTS HIT
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                    {transfers.map((t, i) => (
                                        <tr key={`${t.playerIn}-${i}`} className="bg-brand-surface/80">
                                            <td className="p-3 text-brand-success">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                    <span className="truncate" title={t.playerIn}>{t.playerIn}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-brand-danger">
                                                 <div className="flex items-center gap-2">
                                                    <ArrowDownCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                    <span className="truncate" title={t.playerOut}>{t.playerOut}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            );
                        })
                    ) : (
                         <tbody>
                            <tr>
                                <td colSpan={2} className="p-4 text-center text-brand-text-muted bg-brand-surface/80">
                                    No transfers recorded for this team.
                                </td>
                            </tr>
                        </tbody>
                    )}
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
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-brand-text text-center">League Transfer History</h2>
            
            <div className="mb-6 max-w-sm mx-auto">
                <label htmlFor="transfer-view-select" className="block text-sm font-medium text-brand-text-muted mb-1 text-center">
                    Display transfers for:
                </label>
                <select
                    id="transfer-view-select"
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                    className="w-full bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text p-2.5 transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
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