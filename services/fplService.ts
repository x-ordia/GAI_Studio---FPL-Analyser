import type { Team, FplBootstrap, FplLeague, FplHistory, FplPicks, FplFixture, FplLiveGameweek, FplTransferHistory, FplElementSummary, FplPlayerGameweekHistory, LivePlayer, Transfer, GameweekHistory } from '../types';

const CORS_PROXY = 'https://cors.eu.org/';
const FPL_API_BASE = 'https://fantasy.premierleague.com/api/';

const fetchData = async <T>(url: string): Promise<T> => {
    const proxiedUrl = `${CORS_PROXY}${url}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}. Details: ${errorText}`);
    }
    return response.json() as Promise<T>;
};

export const fetchFixtures = async (gameweekId: number): Promise<FplFixture[]> => {
    return fetchData<FplFixture[]>(`${FPL_API_BASE}fixtures/?event=${gameweekId}`);
};

export const fetchLiveGameweekData = async (gameweekId: number): Promise<FplLiveGameweek> => {
    return fetchData<FplLiveGameweek>(`${FPL_API_BASE}event/${gameweekId}/live/`);
};

export const fetchMissingTeamData = async (teamId: number, bootstrapData: FplBootstrap): Promise<{ gameweekHistory: GameweekHistory[], transferHistory: Transfer[] }> => {
    const [historyData, transferData] = await Promise.all([
        fetchData<FplHistory>(`${FPL_API_BASE}entry/${teamId}/history/`),
        fetchData<FplTransferHistory[]>(`${FPL_API_BASE}entry/${teamId}/transfers/`)
    ]);

    const gameweekHistory = historyData.current.map(gw => ({
        gameweek: gw.event,
        points: gw.points,
        totalPoints: gw.total_points,
        transferCost: gw.event_transfers_cost,
    }));

    const transferHistory = transferData.map(t => {
        const playerIn = bootstrapData.elements.find(e => e.id === t.element_in);
        const playerOut = bootstrapData.elements.find(e => e.id === t.element_out);
        
        return {
            gameweek: t.event,
            playerIn: playerIn ? `${playerIn.first_name} ${playerIn.second_name}` : 'Unknown Player',
            playerOut: playerOut ? `${playerOut.first_name} ${playerOut.second_name}` : 'Unknown Player',
            time: t.time,
            playerInPoints: 0,
            playerOutPoints: 0,
        };
    }).sort((a, b) => b.gameweek - a.gameweek || new Date(b.time).getTime() - new Date(a.time).getTime());

    return { gameweekHistory, transferHistory };
};


export const fetchLeagueDetails = async (leagueId: number): Promise<{ teams: Team[], bootstrap: FplBootstrap }> => {
    const bootstrapData = await fetchData<FplBootstrap>(`${FPL_API_BASE}bootstrap-static/`);
    const leagueData = await fetchData<FplLeague>(`${FPL_API_BASE}leagues-classic/${leagueId}/standings/`);

    if (!leagueData || !leagueData.standings) {
        throw new Error("Standings data not found. The league may be private or the ID is incorrect.");
    }

    const currentGameweek = bootstrapData.events.find(e => e.is_current);
    if (!currentGameweek) {
        throw new Error("Could not determine the current gameweek.");
    }

    const liveData = await fetchLiveGameweekData(currentGameweek.id);
    const livePlayerScores = new Map<number, number>();
    liveData.elements.forEach(p => livePlayerScores.set(p.id, p.stats.total_points));

    const teamStandings = leagueData.standings.results;
    if (!teamStandings || teamStandings.length === 0) {
        return { teams: [], bootstrap: bootstrapData };
    }

    const teamsDataPromises = teamStandings.map(async (standing) => {
        const teamId = standing.entry;

        // OPTIMIZATION: Only fetch picks data initially. History and transfers will be lazy-loaded.
        const [picksData] = await Promise.all([
            fetchData<FplPicks>(`${FPL_API_BASE}entry/${teamId}/event/${currentGameweek.id}/picks/`),
        ]);

        let liveGwPoints = 0;
        let liveBenchPoints = 0;
        let liveCaptain: { name: string; points: number; captainedPoints: number; } | undefined;

        const players: LivePlayer[] = picksData.picks
            .map(p => {
                const playerData = bootstrapData.elements.find(e => e.id === p.element);
                if (!playerData) return null;

                const playerTeam = bootstrapData.teams.find(t => t.id === playerData.team);
                const playerPosition = bootstrapData.element_types.find(et => et.id === playerData.element_type);
                const points = livePlayerScores.get(p.element) ?? 0;
                
                if (p.position <= 11) {
                    liveGwPoints += points * p.multiplier;
                } else {
                    liveBenchPoints += points;
                }

                if (p.is_captain) {
                    liveCaptain = {
                        name: `${playerData.first_name} ${playerData.second_name}`,
                        points: points,
                        captainedPoints: points * p.multiplier,
                    };
                }

                return {
                    id: playerData.id,
                    name: `${playerData.first_name} ${playerData.second_name}`,
                    position: playerPosition!.singular_name_short,
                    team: playerTeam?.name || 'Unknown',
                    livePoints: points,
                    isCaptain: p.is_captain,
                    isViceCaptain: p.is_vice_captain,
                    multiplier: p.multiplier,
                };
            }).filter((p): p is LivePlayer => p !== null);

        const transferHistory: Transfer[] = [];

        const gameweekHistory: GameweekHistory[] = [{
            gameweek: currentGameweek.id,
            points: 0, // Not available in light fetch
            totalPoints: standing.total,
            transferCost: 0, // Not available in light fetch
        }];

        return {
            id: teamId,
            teamName: standing.entry_name,
            managerName: standing.player_name,
            players,
            gameweekHistory,
            transferHistory,
            liveGwPoints,
            liveBenchPoints,
            liveCaptain,
            activeChip: picksData.active_chip,
        };
    });

    const results = await Promise.allSettled(teamsDataPromises);
    
    const successfulTeams: Team[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            successfulTeams.push(result.value as Team);
        } else {
            console.warn("Failed to fetch data for one team:", result.reason);
        }
    });
    
    if (successfulTeams.length === 0 && teamStandings.length > 0) {
        throw new Error("Could not fetch details for any team. The proxy may be down or the league is private.");
    }

    return { teams: successfulTeams, bootstrap: bootstrapData };
};