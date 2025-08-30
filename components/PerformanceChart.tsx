import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Team } from '../types';
import TransferHistory from './TransferHistory';

interface PerformanceChartProps {
  teams: Team[];
}

const CHART_COLORS = ['#3b82f6', '#4ade80', '#f43f5e', '#facc15', '#06b6d4', '#a855f7'];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ teams }) => {
  const chartData = useMemo(() => {
    if (!teams || !teams[0]?.gameweekHistory) {
      return [];
    }
    return teams[0].gameweekHistory.map((_, index) => {
      const dataPoint: { name: string; [key: string]: string | number } = {
        name: `GW${index + 1}`,
      };
      teams.forEach(team => {
        if (team.gameweekHistory[index]) {
          dataPoint[team.teamName] = team.gameweekHistory[index].totalPoints;
        }
      });
      return dataPoint;
    });
  }, [teams]);


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
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            {teams.map((team, index) => (
              <Line
                key={team.id}
                type="monotone"
                dataKey={team.teamName}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 8, strokeWidth: 2, fill: CHART_COLORS[index % CHART_COLORS.length] }}
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