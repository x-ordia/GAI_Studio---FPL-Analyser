
import React, { useMemo, useState } from 'react';
import type { Team, Transfer } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons/ArrowIcons';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TransferHistoryProps {
    teams: Team[];
}

const TransferHistory: React.FC<TransferHistoryProps> = ({ teams }) => {
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

    if (transfersByGameweek.length === 0) {
        return (
            <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 mt-8">
                <h2 className="text-2xl font-bold mb-4 text-fpl-text text-center">League Transfer History</h2>
                <p className="text-center text-fpl-text-dark">No transfers have been made in this league yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-fpl-text text-center">League Transfer History</h2>
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
                                                    <li key={i} className="text-sm">
                                                        <div className="flex items-center gap-2 text-fpl-green">
                                                            <ArrowUpCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                            <span>{t.playerIn}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-fpl-pink">
                                                            <ArrowDownCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                            <span>{t.playerOut}</span>
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
        </div>
    );
};

export default TransferHistory;
