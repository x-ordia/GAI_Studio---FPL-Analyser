import React from 'react';
import type { LuckAnalysis } from '../types';
import Loader from './Loader';
import { LuckIcon } from './icons/LuckIcon';

interface LuckIndexProps {
    analysis: LuckAnalysis[] | null;
    isLoading: boolean;
    onAnalyze: () => void;
}

const LuckIndex: React.FC<LuckIndexProps> = ({ analysis, isLoading, onAnalyze }) => {
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-brand-success';
        if (score >= 60) return 'text-brand-warning';
        if (score >= 40) return 'text-orange-400';
        return 'text-brand-danger';
    };

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-brand-text text-center flex items-center justify-center gap-2">
                <LuckIcon className="w-6 h-6 text-brand-success" />
                AI Luck Index
            </h2>
            {!analysis && !isLoading && (
                <div className="text-center">
                    <p className="text-brand-text-muted mb-4">Analyze gameweek decisions like captaincy and bench choices to see who got lucky.</p>
                    <button
                        onClick={onAnalyze}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-brand-success text-brand-dark shadow-lg shadow-brand-success/20"
                    >
                        <LuckIcon className="w-5 h-5" />
                        <span>Analyze League Luck</span>
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="text-center py-8">
                    <Loader />
                    <p className="text-brand-text-muted mt-2">The AI is consulting its crystal ball...</p>
                </div>
            )}
            {analysis && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-sm text-brand-text-muted uppercase tracking-wider">
                            <tr>
                                <th className="p-3 text-center">Score</th>
                                <th className="p-3">Team</th>
                                <th className="p-3">AI Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.map((team) => (
                                <tr key={team.teamName} className="border-t border-white/10">
                                    <td className={`p-3 text-center font-bold text-2xl w-24 ${getScoreColor(team.luckScore)}`}>
                                        {team.luckScore}
                                    </td>
                                    <td className="p-3 font-semibold text-brand-text">{team.teamName}</td>
                                    <td className="p-3 text-sm text-brand-text-muted italic">"{team.justification}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
        </div>
    );
};

export default LuckIndex;