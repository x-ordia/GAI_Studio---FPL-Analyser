import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Team } from '../types';

interface PerformanceChartProps {
  teams: Team[];
}

const CHART_COLORS = ['#00ADB5', '#EEEEEE', '#fca311', '#e63946', '#20c997', '#be95c4', '#3a86ff', '#ff006e', '#fb5607', '#8338ec', '#06d6a0', '#ffd166'];


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
    <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-brand-text text-center">How it unrolled</h2>
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
          <XAxis dataKey="name" stroke="#a9a9a9" tick={{ fill: '#a9a9a9' }} />
          <YAxis stroke="#a9a9a9" tick={{ fill: '#a9a9a9' }} />
          <Tooltip
              contentStyle={{ 
                  backgroundColor: 'rgba(34, 40, 49, 0.8)',
                  borderColor: '#00ADB5',
                  color: '#EEEEEE',
                  backdropFilter: 'blur(4px)',
              }}
              labelStyle={{ color: '#00ADB5', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ color: '#EEEEEE', cursor: 'pointer' }}
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
  );
};

export default PerformanceChart;