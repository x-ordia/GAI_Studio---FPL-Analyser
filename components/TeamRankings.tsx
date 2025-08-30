import React from 'react';
import type { Team, AiAnalysisResult } from '../types';
import { RobotIcon } from './icons/RobotIcon';
import Loader from './Loader';

interface TeamRankingsProps {
  teams: Team[];
  aiScores: Record<number, AiAnalysisResult | null>;
  loadingStates: Record<number, boolean>;
  onAnalyze: (teamId: number) => void;
}

const TeamCard: React.FC<{
    team: Team;
    rank: number;
    aiScore: AiAnalysisResult | null;
    isLoading: boolean;
    onAnalyze: (teamId: number) => void;
    style: React.CSSProperties;
}> = ({ team, rank, aiScore, isLoading, onAnalyze, style }) => {
    const totalPoints = team.gameweekHistory[team.gameweekHistory.length - 1]?.totalPoints || 0;

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-brand-success';
        if (score >= 70) return 'text-brand-warning';
        if (score >= 50) return 'text-orange-400';
        return 'text-brand-danger';
    };

    return (
        <div 
          className="bg-brand-surface rounded-xl shadow-lg border border-white/10 overflow-hidden transition-all duration-300 group hover:border-brand-accent/50 hover:shadow-2xl hover:shadow-brand-accent/10 animate-fadeInUp opacity-0"
          style={style}
        >
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto sm:flex-1">
                    <span className="text-2xl font-bold text-brand-text-muted w-8 text-center">{rank}</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-brand-text truncate" title={team.teamName}>{team.teamName}</p>
                        <p className="text-sm text-brand-text-muted truncate" title={team.managerName}>{team.managerName}</p>
                    </div>
                </div>

                <div className="text-center w-24">
                    <p className="text-brand-text-muted text-sm">Total Points</p>
                    <p className="text-xl font-bold text-brand-text">{totalPoints}</p>
                </div>

                <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                    <div className="text-center w-28">
                        <p className="text-brand-text-muted text-sm">AI Score</p>
                        {isLoading ? <div className="mt-1"><Loader /></div> :
                         aiScore ? <p className={`text-2xl font-bold ${getScoreColor(aiScore.score)}`}>{aiScore.score}<span className="text-base text-brand-text-muted">/100</span></p> :
                         <p className="text-lg text-brand-text-muted">-</p>
                        }
                    </div>
                    <button
                        onClick={() => onAnalyze(team.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <RobotIcon className="w-5 h-5" />
                        <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
                    </button>
                </div>
            </div>
            {aiScore && (
                <div className="px-4 sm:px-6 pb-4 border-t border-white/10 bg-black/20">
                    <p className="text-brand-text-muted font-semibold pt-3 mb-1">AI Justification:</p>
                    <p className="text-brand-text text-sm italic">"{aiScore.justification}"</p>
                </div>
            )}
        </div>
    );
};

const TeamRankings: React.FC<TeamRankingsProps> = ({ teams, aiScores, loadingStates, onAnalyze }) => {
  const sortedTeams = [...teams].sort((a, b) => {
    const totalA = a.gameweekHistory[a.gameweekHistory.length - 1]?.totalPoints || 0;
    const totalB = b.gameweekHistory[b.gameweekHistory.length - 1]?.totalPoints || 0;
    return totalB - totalA;
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-brand-text text-center">AI Team Strength Rankings</h2>
      <div className="space-y-4">
        {sortedTeams.map((team, index) => (
          <TeamCard
            key={team.id}
            team={team}
            rank={index + 1}
            aiScore={aiScores[team.id] || null}
            isLoading={loadingStates[team.id] || false}
            onAnalyze={onAnalyze}
            style={{ animationDelay: `${index * 75}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamRankings;