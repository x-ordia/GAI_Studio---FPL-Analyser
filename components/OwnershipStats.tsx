import React, { useMemo } from 'react';
import type { Team, PlayerOwnership } from '../types';
import { UsersIcon, BoltIcon } from './icons/DashboardIcons';

interface OwnershipStatsProps {
    teams: Team[];
}

const StatList: React.FC<{ title: string; icon: React.ReactNode; players: PlayerOwnership[], barColor: string }> = ({ title, icon, players, barColor }) => (
    <div className="bg-black/20 p-4 rounded-lg flex-1 min-w-[280px] w-full sm:w-auto">
        <h3 className="font-bold text-fpl-text mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <ul className="space-y-2">
            {players.map((player, index) => (
                <li key={player.id} className="text-sm">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-fpl-text truncate pr-2" title={player.name}>{index + 1}. {player.name}</span>
                        <span className="font-mono text-fpl-text-dark">{player.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-fpl-purple rounded-full h-1.5">
                        <div 
                            className={`${barColor} h-1.5 rounded-full`} 
                            style={{ width: `${player.percentage}%` }}
                        ></div>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);


const OwnershipStats: React.FC<OwnershipStatsProps> = ({ teams }) => {
    const ownershipData = useMemo((): PlayerOwnership[] => {
        if (!teams || teams.length === 0) {
            return [];
        }

        const playerCounts = new Map<number, { name: string; count: number }>();
        const totalTeams = teams.length;

        teams.forEach(team => {
            team.players.forEach(player => {
                if (player) {
                    const current = playerCounts.get(player.id);
                    if (current) {
                        playerCounts.set(player.id, { ...current, count: current.count + 1 });
                    } else {
                        playerCounts.set(player.id, { name: player.name, count: 1 });
                    }
                }
            });
        });
        
        const data: PlayerOwnership[] = [];
        playerCounts.forEach((value, key) => {
            data.push({
                id: key,
                name: value.name,
                count: value.count,
                percentage: (value.count / totalTeams) * 100,
            });
        });

        return data;
    }, [teams]);

    const mostOwned = useMemo(() => {
        return [...ownershipData].sort((a, b) => b.count - a.count).slice(0, 10);
    }, [ownershipData]);

    const topDifferentials = useMemo(() => {
        return [...ownershipData].sort((a, b) => a.count - b.count).slice(0, 10);
    }, [ownershipData]);

    if (!teams || teams.length < 2 || mostOwned.length === 0) {
        return null;
    }

    return (
        <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-fpl-text text-center">Player Ownership Stats</h2>
            <div className="flex flex-wrap gap-4 justify-center">
                <StatList 
                    title="Top 10 Most Owned" 
                    icon={<UsersIcon className="w-5 h-5 text-fpl-green" />}
                    players={mostOwned}
                    barColor="bg-fpl-green"
                />
                <StatList 
                    title="Top 10 Differentials" 
                    icon={<BoltIcon className="w-5 h-5 text-fpl-pink" />}
                    players={topDifferentials}
                    barColor="bg-fpl-pink"
                />
            </div>
        </div>
    );
};

export default OwnershipStats;