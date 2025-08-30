import React, { useState, useCallback, useEffect } from 'react';
import { Team, AiAnalysisResult, View, FplFixture, FplTeamInfo, KeyMatch, PredictedStanding, LuckAnalysis } from './types';
import { analyzeTeamStrength, analyzeFixtures, predictFinalStandings, analyzeLeagueLuck } from './services/geminiService';
import { fetchLeagueDetails, fetchFixtures } from './services/fplService';
import Header from './components/Header';
import PerformanceChart from './components/PerformanceChart';
import TeamRankings from './components/TeamRankings';
import Loader from './components/Loader';
import LeagueInput from './components/LeagueInput';
import Dashboard from './components/Dashboard';
import PvpAnalysis from './components/PvpAnalysis';
// FIX: Import Transition type from framer-motion to resolve type error.
import { motion, AnimatePresence, Transition } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: "100vw",
  }
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

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
  const [luckAnalysis, setLuckAnalysis] = useState<LuckAnalysis[] | null>(null);
  const [isLoadingLuck, setIsLoadingLuck] = useState<boolean>(false);

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
        setLuckAnalysis(null);

        const { teams: leagueTeams, bootstrap } = await fetchLeagueDetails(leagueId);
        setTeams(leagueTeams);
        setFplTeams(bootstrap.teams);

        const nextGameweek = bootstrap.events.find(e => e.is_next);
        if (nextGameweek) {
          const fixtureData = await fetchFixtures(nextGameweek.id);
          setFixtures(fixtureData);
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

  const handleAnalyzeKeyMatches = useCallback(async () => {
    if (fixtures.length === 0 || fplTeams.length === 0) return;

    setError(null);
    setIsLoadingKeyMatches(true);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const fixtureNames = fixtures.map(f => {
        const home = fplTeams.find(t => t.id === f.team_h)?.name || '...';
        const away = fplTeams.find(t => t.id === f.team_a)?.name || '...';
        return `${home} vs ${away}`;
      });
      const analyzedMatches = await analyzeFixtures(fixtureNames);
      setKeyMatches(analyzedMatches);
    } catch (err) {
      console.error("Error analyzing key matches:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
      setError(`Failed to analyze key matches: ${errorMessage}`);
    } finally {
      setIsLoadingKeyMatches(false);
    }
  }, [fixtures, fplTeams]);

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

  const handleAnalyzeLuck = useCallback(async () => {
    if (teams.length === 0 || !teams[0].players) return;

    setError(null);
    setIsLoadingLuck(true);

    try {
        if (!process.env.API_KEY) {
            throw new Error("API key is not configured.");
        }
        const result = await analyzeLeagueLuck(teams);
        setLuckAnalysis(result);
    } catch (err) {
        console.error("Error analyzing league luck:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
        setError(`Failed to analyze league luck: ${errorMessage}`);
    } finally {
        setIsLoadingLuck(false);
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
    setLuckAnalysis(null);
    setLeagueId(id);
  };

  const handleChangeLeague = () => {
    setLeagueId(null);
    setTeams([]);
  };

  const renderAppContent = () => {
    if (!leagueId) {
      return <LeagueInput onSubmit={handleLeagueSubmit} />;
    }
  
    if (isFetchingLeague) {
      return (
        <div className="min-h-screen text-brand-text flex flex-col justify-center items-center">
          <Loader />
          <p className="text-xl mt-6 font-semibold tracking-wide">Fetching FPL League Data for ID: {leagueId}...</p>
          <p className="text-brand-text-muted mt-1">Please hold on, this may take a moment.</p>
        </div>
      );
    }
  
    if (fetchError) {
      return (
        <div className="min-h-screen text-brand-text flex justify-center items-center p-4">
          <div className="bg-brand-danger/10 border border-brand-danger text-brand-text px-6 py-4 rounded-lg text-center max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Failed to Load League Data</h2>
            <p className="text-brand-danger/90">{fetchError}</p>
             <button 
                  onClick={handleChangeLeague}
                  className="mt-6 px-5 py-2.5 bg-brand-accent text-white font-bold rounded-lg hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
              >
                  Try a Different League
              </button>
          </div>
        </div>
      );
    }
  
    const renderView = () => {
      if (teams.length === 0) {
          return (
              <div className="text-center py-10 bg-brand-surface rounded-xl border border-white/10">
                  <p className="text-xl text-brand-text-muted">No teams found in this league.</p>
                  <button 
                    onClick={handleChangeLeague}
                    className="mt-4 px-5 py-2.5 bg-brand-accent text-white font-bold rounded-lg hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
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
                          onAnalyzeKeyMatches={handleAnalyzeKeyMatches}
                          predictedStandings={predictedStandings}
                          isLoadingPredictions={isLoadingPredictions}
                          onPredictStandings={handlePredictStandings}
                          luckAnalysis={luckAnalysis}
                          isLoadingLuck={isLoadingLuck}
                          onAnalyzeLuck={handleAnalyzeLuck}
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
          case View.PvP:
              return <PvpAnalysis teams={teams} fixtures={fixtures} fplTeams={fplTeams} />;
          default:
              return null;
      }
    }

    return (
      <>
        <Header activeView={activeView} setActiveView={setActiveView} onChangeLeague={handleChangeLeague} />
        <main className="container mx-auto p-4 md:p-8">
          {error && (
              <div className="bg-brand-danger/10 border border-brand-danger text-brand-text px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                  <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <svg className="fill-current h-6 w-6 text-brand-danger/80" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </button>
              </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-fixed bg-center"
      style={{ 
        backgroundImage: `url('https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
      }}
    >
      <div className="min-h-screen text-brand-text font-sans overflow-x-hidden bg-brand-dark/80 backdrop-blur-[2px]">
        {renderAppContent()}
      </div>
    </div>
  );
};

export default App;