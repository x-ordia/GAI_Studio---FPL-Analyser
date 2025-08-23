
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Team } from '../types';

interface PerformanceChartProps {
  teams: Team[];
}

const CHART_COLORS = ['#00ff87', '#e90052', '#04f5ff', '#faff00', '#ffa500'];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ teams }) => {
  const chartData = teams[0]?.gameweekHistory.map((_, index) => {
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

  return (
    <div className="bg-fpl-purple/60 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-fpl-text text-center">League Performance Overview</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#f1f5f9" tick={{ fill: '#f1f5f9' }} />
            <YAxis stroke="#f1f5f9" tick={{ fill: '#f1f5f9' }} />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(55, 0, 60, 0.8)',
                    borderColor: '#00ff87',
                    color: '#f1f5f9'
                }}
                labelStyle={{ color: '#00ff87', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ color: '#f1f5f9' }} />
            {teams.map((team, index) => (
              <Line
                key={team.id}
                type="monotone"
                dataKey={team.teamName}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;