import type { Team, FplBootstrap, FplLeague, FplHistory, FplPicks, FplFixture, FplLiveGameweek } from '../types';

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
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


export const fetchLeagueDetails = async (leagueId: number): Promise<{ teams: Team[], bootstrap: FplBootstrap }> => {
    const bootstrapData = await fetchData<FplBootstrap>(`${FPL_API_BASE}bootstrap-static/`);
    const leagueData = await fetchData<FplLeague>(`${FPL_API_BASE}leagues-classic/${leagueId}/standings/`);

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

        const [historyData, picksData] = await Promise.all([
            fetchData<FplHistory>(`${FPL_API_BASE}entry/${teamId}/history/`),
            fetchData<FplPicks>(`${FPL_API_BASE}entry/${teamId}/event/${currentGameweek.id}/picks/`)
        ]);

        let liveGwPoints = 0;
        let liveBenchPoints = 0;
        let liveCaptain: { name: string; points: number; captainedPoints: number; } | undefined;

        const players = picksData.picks
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
                };
            }).filter(Boolean);

        const gameweekHistory = historyData.current.map(gw => ({
            gameweek: gw.event,
            points: gw.points,
            totalPoints: gw.total_points,
        }));

        return {
            id: teamId,
            teamName: standing.entry_name,
            managerName: standing.player_name,
            players: players as any,
            gameweekHistory,
            liveGwPoints,
            liveBenchPoints,
            liveCaptain,
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