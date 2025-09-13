import React, { useState, useMemo } from 'react';
import type { Team, FplBootstrap, LivePlayer } from '../types';
import OwnershipStats from './OwnershipStats';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface PlayersProps {
    teams: Team[];
    bootstrapData: FplBootstrap | null;
}

// Helper function to calculate extra points and return breakdown items
const calculateExtraPoints = (player: LivePlayer, bootstrapData: FplBootstrap | null) => {
    const items: { label: string; value: number; color: string }[] = [];
    if (!player.liveStats || !bootstrapData) return { total: 0, items };

    const stats = player.liveStats;
    const playerInfo = bootstrapData.elements.find(p => p.id === player.id);
    const position = bootstrapData.element_types.find(pt => pt.id === playerInfo?.element_type);
    const positionShort = position?.singular_name_short;

    // Positive points
    if (stats.bonus > 0) items.push({ label: 'Bonus', value: stats.bonus, color: 'bg-green-500' });
    if (stats.saves > 0) {
        const savePoints = Math.floor(stats.saves / 3);
        if (savePoints > 0) items.push({ label: 'Saves', value: savePoints, color: 'bg-sky-500' });
    }
    if (stats.penalties_saved > 0) items.push({ label: 'Pen Saved', value: stats.penalties_saved * 5, color: 'bg-green-600' });
    
    // Clean Sheets (position dependent)
    if (stats.clean_sheets > 0 && stats.minutes >= 60) {
        if (positionShort === 'GKP' || positionShort === 'DEF') {
            items.push({ label: 'Clean Sheet', value: 4, color: 'bg-green-400' });
        } else if (positionShort === 'MID') {
            items.push({ label: 'Clean Sheet', value: 1, color: 'bg-green-400' });
        }
    }
    
    // Defensive Contributions (New for 2024/2025)
    const cbi = stats.clearances_blocks_interceptions || 0;
    const tackles = stats.tackles || 0;
    const defensiveActions = cbi + tackles;

    if (positionShort === 'DEF') {
        if (defensiveActions >= 10) {
            items.push({ label: 'Defensive', value: 2, color: 'bg-blue-500' });
        }
    } else if (positionShort === 'MID' || positionShort === 'FWD') {
        const recoveries = stats.recoveries || 0;
        const midFwdActions = defensiveActions + recoveries;
        if (midFwdActions >= 12) {
            items.push({ label: 'Defensive', value: 2, color: 'bg-blue-500' });
        }
    }

    // Negative points
    if (stats.goals_conceded > 0 && (positionShort === 'GKP' || positionShort === 'DEF')) {
        const concededPoints = -Math.floor(stats.goals_conceded / 2);
        if (concededPoints < 0) items.push({ label: 'Conceded', value: concededPoints, color: 'bg-orange-500' });
    }
    if (stats.yellow_cards > 0) items.push({ label: 'Yellow Card', value: -1 * stats.yellow_cards, color: 'bg-yellow-500 text-brand-dark' });
    if (stats.red_cards > 0) items.push({ label: 'Red Card', value: -3 * stats.red_cards, color: 'bg-red-600' });
    if (stats.own_goals > 0) items.push({ label: 'Own Goal', value: -2 * stats.own_goals, color: 'bg-red-700' });
    if (stats.penalties_missed > 0) items.push({ label: 'Pen Missed', value: -2 * stats.penalties_missed, color: 'bg-red-500' });

    const total = items.reduce((acc, item) => acc + item.value, 0);

    return { total, items };
};

const PlayerPointsBreakdown: React.FC<PlayersProps> = ({ teams, bootstrapData }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id.toString() || '');

    const selectedTeam = useMemo(() => {
        if (!selectedTeamId) return null;
        return teams.find(t => t.id === parseInt(selectedTeamId, 10));
    }, [selectedTeamId, teams]);

    if (!bootstrapData) return null;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center">Extra Points Breakdown</h2>

            <div className="mb-6 max-w-sm mx-auto">
                 <label htmlFor="team-select" className="block text-sm font-medium text-brand-text-muted mb-1 text-center">
                    Select a team to view their extra points:
                </label>
                <select
                    id="team-select"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                     className="w-full bg-brand-dark border-2 border-white/10 focus:border-brand-accent rounded-lg text-brand-text p-2.5 transition-colors outline-none focus:ring-2 focus:ring-brand-accent/50"
                >
                    {teams.sort((a,b) => a.teamName.localeCompare(b.teamName)).map(team => (
                        <option key={team.id} value={team.id}>
                            {team.teamName}
                        </option>
                    ))}
                </select>
            </div>
            
             <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-sm text-brand-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Player</th>
                            <th className="p-3 text-center w-32">
                                <div className="flex items-center justify-center gap-1 group relative">
                                    <span>Extra Points</span>
                                    <InformationCircleIcon className="w-4 h-4" />
                                     <div className="absolute bottom-full mb-2 w-64 hidden group-hover:block bg-brand-dark text-white text-xs rounded py-2 px-3 z-10 border border-white/20 shadow-lg text-left normal-case">
                                        <p className="font-bold mb-1">About "Extra Points":</p>
                                        <p>This column shows points from actions other than goals, assists, or playing time. It includes bonuses, saves, clean sheets, and negative points from cards or goals conceded.</p>
                                    </div>
                                </div>
                            </th>
                            <th className="p-3 w-2/5">Breakdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedTeam?.players.map(player => {
                            const { total, items } = calculateExtraPoints(player, bootstrapData);
                            const totalColor = total > 0 ? 'text-brand-success' : total < 0 ? 'text-brand-danger' : 'text-brand-text-muted';
                            
                            const isLastStarter = player.squadPosition === 11;
                            const rowClasses = [
                                "border-t border-white/10 hover:bg-black/20 transition-colors",
                                isLastStarter ? "border-b-4 border-b-brand-accent/50" : ""
                            ].join(" ").trim();

                            return (
                                <tr key={player.id} className={rowClasses}>
                                    <td className="p-3 font-semibold text-brand-text">{player.name}</td>
                                    <td className={`p-3 text-center font-bold text-lg ${totalColor}`}>
                                        {total > 0 ? `+${total}` : total}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {items.length > 0 ? items.map(item => (
                                                <div key={item.label} title={`${item.label}: ${item.value > 0 ? '+' : ''}${item.value}`} className={`px-2 py-1 text-xs font-bold rounded ${item.color} text-white`}>
                                                    {item.label} ({item.value > 0 ? `+${item.value}` : item.value})
                                                </div>
                                            )) : <span className="text-xs text-brand-text-muted">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        </div>
    );
};


const Players: React.FC<PlayersProps> = ({ teams, bootstrapData }) => {
    if (teams.length === 0) {
        return (
            <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
                <div className="text-center py-10">
                    <p className="text-xl text-brand-text-muted">
                        No teams found in this league to display player data.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <PlayerPointsBreakdown teams={teams} bootstrapData={bootstrapData} />
            <OwnershipStats teams={teams} />
        </div>
    );
};

export default Players;