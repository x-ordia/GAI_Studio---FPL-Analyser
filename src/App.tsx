
import React, { useState, useCallback, useEffect } from 'react';
import { Team, AiAnalysisResult, View, FplFixture, FplTeamInfo, KeyMatch, PredictedStanding } from './types';
import { analyzeTeamStrength, analyzeFixtures, predictFinalStandings } from './services/geminiService';
import { fetchLeagueDetails, fetchFixtures } from './services/fplService';
import Header from './components/Header';
import PerformanceChart from './components/PerformanceChart';
import TeamRankings from './components/TeamRankings';
import Loader from './components/Loader';
import LeagueInput from './components/LeagueInput';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [leagueId, setLeagueId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [aiScores, setAiScores] = useState<Record<number, AiAnalysisResult | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [isFetchingLeague, setIsFetchingLeague] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Dashboard data
  const [fixtures, setFixtures] = useState<FplFixture[]>([]);
  const [fplTeams, setFplTeams] = useState<FplTeamInfo[]>([]);
  const [keyMatches, setKeyMatches] = useState<KeyMatch[] | null>(null);
  const [isLoadingKeyMatches, setIsLoadingKeyMatches] = useState<boolean>(false);
  const [predictedStandings, setPredictedStandings] = useState<PredictedStanding[] | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);


  useEffect(() => {
    if (!leagueId) return;

    const loadLeagueData = async () => {
      try {
        setFetchError(null);
        setIsFetchingLeague(true);
        setTeams([]);
        setFixtures([]);
        setKeyMatches(null);
        setPredictedStandings(null);

        const { teams: leagueTeams, bootstrap } = await fetchLeagueDetails(leagueId);
        setTeams(leagueTeams);
        setFplTeams(bootstrap.teams);

        const nextGameweek = bootstrap.events.find(e => e.is_next);
        if (nextGameweek) {
          const fixtureData = await fetchFixtures(nextGameweek.id);
          setFixtures(fixtureData);

          if (process.env.API_KEY) {
            setIsLoadingKeyMatches(true);
            const fixtureNames = fixtureData.map(f => {
              const home = bootstrap.teams.find(t => t.id === f.team_h)?.name || '...';
              const away = bootstrap.teams.find(t => t.id === f.team_a)?.name || '...';
              return `${home} vs ${away}`;
            });
            const analyzedMatches = await analyzeFixtures(fixtureNames);
            setKeyMatches(analyzedMatches);
            setIsLoadingKeyMatches(false);
          }
        }

      } catch (err) {
        console.error("Failed to fetch FPL league data:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setFetchError(`Could not load league data. This might be due to a few reasons: the FPL API is temporarily down, the league ID is invalid/private, or the CORS proxy service is having issues. Please try again in a few moments. (Error: ${errorMessage})`);
      } finally {
        setIsFetchingLeague(false);
      }
    };

    loadLeagueData();
  }, [leagueId]);

  const handleAnalyzeTeam = useCallback(async (teamId: number) => {
    const teamToAnalyze = teams.find(t => t.id === teamId);
    if (!teamToAnalyze) return;
    
    setError(null);
    setLoadingStates(prev => ({ ...prev, [teamId]: true }));
    setAiScores(prev => ({...prev, [teamId]: null}));

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
      }
      const result = await analyzeTeamStrength(teamToAnalyze.players.slice(0, 11));
      setAiScores(prev => ({ ...prev, [teamId]: result }));
    } catch (err) {
      console.error("Error analyzing team:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
      setError(`Failed to analyze ${teamToAnalyze.teamName}: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [teamId]: false }));
    }
  }, [teams]);

  const handlePredictStandings = useCallback(async () => {
    if (teams.length === 0) return;
    
    setError(null);
    setIsLoadingPredictions(true);
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
      }
      const result = await predictFinalStandings(teams);
      setPredictedStandings(result);
    } catch (err) {
      console.error("Error predicting standings:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI prediction.";
      setError(`Failed to predict final standings: ${errorMessage}`);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [teams]);

  const handleLeagueSubmit = (id: number) => {
    setTeams([]);
    setAiScores({});
    setLoadingStates({});
    setError(null);
    setFetchError(null);
    setActiveView(View.Dashboard);
    setPredictedStandings(null);
    setLeagueId(id);
  };

  const handleChangeLeague = () => {
    setLeagueId(null);
    setTeams([]);
  };

  if (!leagueId) {
    return <LeagueInput onSubmit={handleLeagueSubmit} />;
  }

  if (isFetchingLeague) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fpl-purple to-fpl-purple-light text-fpl-text flex flex-col justify-center items-center">
        <div className="transform scale-150">
          <Loader />
        </div>
        <p className="text-xl mt-6 font-semibold tracking-wide">Fetching FPL League Data for ID: {leagueId}...</p>
        <p className="text-fpl-text-dark mt-1">Please hold on, this may take a moment.</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fpl-purple to-fpl-purple-light text-fpl-text flex justify-center items-center p-4">
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg text-center max-w-lg shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Failed to Load League Data</h2>
          <p>{fetchError}</p>
           <button 
                onClick={handleChangeLeague}
                className="mt-4 px-4 py-2 bg-fpl-green text-fpl-purple font-bold rounded-lg hover:bg-opacity-80 transition-colors"
            >
                Try a Different League
            </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (teams.length === 0) {
        return (
            <div className="text-center py-10 bg-fpl-purple/60 rounded-xl">
                <p className="text-xl text-fpl-text-dark">No teams found in this league.</p>
                <button 
                  onClick={handleChangeLeague}
                  className="mt-4 px-4 py-2 bg-fpl-green text-fpl-purple font-bold rounded-lg hover:bg-opacity-80 transition-colors"
              >
                  Try a Different League
              </button>
            </div>
        );
    }

    switch(activeView) {
        case View.Dashboard:
            return <Dashboard 
                        teams={teams}
                        fixtures={fixtures}
                        fplTeams={fplTeams}
                        keyMatches={keyMatches}
                        isLoadingKeyMatches={isLoadingKeyMatches}
                        predictedStandings={predictedStandings}
                        isLoadingPredictions={isLoadingPredictions}
                        onPredictStandings={handlePredictStandings}
                    />;
        case View.Chart:
            return <PerformanceChart teams={teams} />;
        case View.Rankings:
            return <TeamRankings
                        teams={teams}
                        aiScores={aiScores}
                        loadingStates={loadingStates}
                        onAnalyze={handleAnalyzeTeam}
                    />;
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fpl-purple to-fpl-purple-light text-fpl-text font-sans">
      <Header activeView={activeView} setActiveView={setActiveView} onChangeLeague={handleChangeLeague} />
      <main className="container mx-auto p-4 md:p-8">
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
