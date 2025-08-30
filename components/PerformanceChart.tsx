import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Team } from '../types';
import TransferHistory from './TransferHistory';

interface PerformanceChartProps {
  teams: Team[];
}

const CHART_COLORS = ['#3b82f6', '#4ade80', '#f43f5e', '#facc15', '#06b6d4', '#a855f7'];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ teams }) => {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!teams || teams.length === 0) {
      return [];
    }

    // Find the maximum gameweek number across all teams to define the chart's x-axis length.
    const maxGameweek = teams.reduce((max, team) => {
      const lastEntry = team.gameweekHistory[team.gameweekHistory.length - 1];
      return lastEntry && lastEntry.gameweek > max ? lastEntry.gameweek : max;
    }, 0);

    if (maxGameweek === 0) {
      return [];
    }

    const data = [];
    // Iterate from gameweek 1 up to the max gameweek.
    for (let gw = 1; gw <= maxGameweek; gw++) {
      // FIX: Update dataPoint type to allow string values for the 'name' property, resolving the index signature conflict.
      const dataPoint: { name: string; [key: string]: string | number | null } = {
        name: `GW${gw}`,
      };

      // For each team, find their total points for the current gameweek.
      teams.forEach(team => {
        const historyEntry = team.gameweekHistory.find(h => h.gameweek === gw);
        // If an entry exists, use the points. Recharts will create a gap for null values.
        dataPoint[team.teamName] = historyEntry ? historyEntry.totalPoints : null;
      });
      data.push(dataPoint);
    }
    return data;
  }, [teams]);

  // The type is not exported from recharts, so we use 'any'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseEnter = (o: any) => {
    const { dataKey } = o;
    setHoveredTeam(dataKey);
  };

  const handleMouseLeave = () => {
    setHoveredTeam(null);
  };

  return (
    <>
      <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-brand-text text-center">League Performance Overview</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(10, 15, 31, 0.8)',
                    borderColor: '#3b82f6',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(4px)',
                }}
                labelStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: '#e2e8f0', cursor: 'pointer' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {teams.map((team, index) => (
              <Line
                key={team.id}
                type="linear"
                dataKey={team.teamName}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={hoveredTeam === team.teamName ? 4 : 3}
                strokeOpacity={hoveredTeam && hoveredTeam !== team.teamName ? 0.2 : 1}
                dot={{ r: 0 }}
                activeDot={{ r: 8, strokeWidth: 2, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <TransferHistory teams={teams} />
    </>
  );
};

export default PerformanceChart;