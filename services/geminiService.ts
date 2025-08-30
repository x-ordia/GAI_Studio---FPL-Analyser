import { GoogleGenAI, Type } from "@google/genai";
import type { Player, AiAnalysisResult, KeyMatch, Team, PredictedStanding, LuckAnalysis, FplFixture, FplTeamInfo, PvpAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateStadiumImage = async (): Promise<string> => {
    const prompt = `An aesthetic, dramatic, cinematic, low-angle shot of a single football on the green grass of a brightly lit stadium pitch at night. The stadium is full of cheering fans in the background, which are slightly blurred with a beautiful bokeh effect. The lighting is professional and highlights the texture of the football and the grass.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
        
        const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;
        
        if (!base64ImageBytes) {
            throw new Error("No image bytes returned from the API.");
        }
        
        return base64ImageBytes;
    } catch (error) {
        console.error("Gemini image generation failed:", error);
        throw new Error("The AI image generation failed. Please check your API key and try again.");
    }
};

export const analyzeTeamStrength = async (players: Player[]): Promise<AiAnalysisResult> => {
  const playerList = players.map(p => `- ${p.name} (${p.position} from ${p.team})`).join('\n');

  const prompt = `
    Analyze the following Fantasy Premier League (FPL) team based on the provided list of 11 starting players.
    
    Team Players:
    ${playerList}

    Your Task:
    1.  Act as an expert FPL analyst.
    2.  Consider the players' current form, their teams' general performance, and their likely upcoming fixtures over the next 3-4 gameweeks. You do not need real-time data, use your general knowledge.
    3.  Evaluate the team's overall balance (attack, midfield, defense, goalkeeper).
    4.  Provide a final "Team Strength Score" on a scale from 0 to 100, where 100 is a perfect team with high potential for points.
    5.  Provide a brief, insightful "Justification" for your score (2-3 sentences). Highlight one key strength and one potential weakness.

    Return the result ONLY in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "The team strength score from 0 to 100.",
            },
            justification: {
              type: Type.STRING,
              description: "A brief analysis of the team's strengths and weaknesses.",
            },
          },
          required: ["score", "justification"],
        },
        temperature: 0.5,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (typeof result.score === 'number' && typeof result.justification === 'string') {
      return result as AiAnalysisResult;
    } else {
      throw new Error("Invalid JSON structure received from API.");
    }

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("The AI analysis failed. Please check your API key and try again.");
  }
};

export const analyzeFixtures = async (fixtures: string[]): Promise<KeyMatch[]> => {
  const prompt = `
    You are an expert football analyst for Fantasy Premier League (FPL).
    From the following list of upcoming Premier League fixtures, identify the top 3 most 'key matches'.
    A 'key match' could be a clash between top teams, a derby, a match with significant FPL assets, or a potential high-scoring game.
    For each of the 3 key matches you select, provide a brief, one-sentence justification explaining why it's a key match from an FPL perspective.

    Fixtures:
    ${fixtures.join('\n')}

    Return the result ONLY in the specified JSON format. Do not include any other text or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            key_matches: {
              type: Type.ARRAY,
              description: "An array of the top 3 key matches.",
              items: {
                type: Type.OBJECT,
                properties: {
                  match: {
                    type: Type.STRING,
                    description: "The fixture, e.g., 'Arsenal vs Man City'.",
                  },
                  justification: {
                    type: Type.STRING,
                    description: "A one-sentence justification for why it's a key match for FPL.",
                  },
                },
                required: ["match", "justification"],
              },
            },
          },
          required: ["key_matches"],
        },
        temperature: 0.3,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    const matches = result.key_matches || result.keyMatches;

    if (Array.isArray(matches)) {
        return matches.map(m => ({ match: m.match, justification: m.justification }));
    } else {
        throw new Error("Invalid JSON structure received from API for fixtures.");
    }
  } catch (error) {
    console.error("Gemini API call for fixtures failed:", error);
    throw new Error("The AI fixture analysis failed.");
  }
};

export const predictFinalStandings = async (teams: Team[]): Promise<PredictedStanding[]> => {
  const teamSummaries = teams
    .sort((a, b) => (b.gameweekHistory[b.gameweekHistory.length - 1]?.totalPoints || 0) - (a.gameweekHistory[a.gameweekHistory.length - 1]?.totalPoints || 0))
    .map((team, index) => {
      const totalPoints = team.gameweekHistory[team.gameweekHistory.length - 1]?.totalPoints || 0;
      const playerList = team.players.map(p => p.name).join(', ');
      return `
Team: ${team.teamName} (${team.managerName})
Current Rank: ${index + 1}
Current Points: ${totalPoints}
Squad Players: ${playerList}
      `.trim();
    }).join('\n---\n');

  const prompt = `
    You are an expert football and Fantasy Premier League (FPL) analyst.
    Based on the current league standings and the squad players for each team provided below, predict the final league table at the end of the season.

    Current League Data:
    ${teamSummaries}

    Your Task:
    1.  Analyze each team's list of squad players to assess their long-term potential and strength.
    2.  Consider the current points and rank, but give significant weight to the quality of the players in each squad for predicting future performance.
    3.  Use your knowledge of player form, team fixtures, and overall FPL strategy to project how each team will perform over the rest of the season.
    4.  Create a predicted final ranking. It is crucial that you re-rank the teams based on your analysis; the final order should likely be different from the current order, reflecting future potential rather than just past performance.
    5.  For each team, provide a brief, one-sentence justification for their predicted final rank, referencing their squad strength or future prospects.
    6.  Return the result ONLY in the specified JSON format. The list must be ordered by the predicted final rank (1 to N).
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predicted_standings: {
              type: Type.ARRAY,
              description: "The predicted final league standings, ordered by rank.",
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.NUMBER, description: "The predicted final rank (e.g., 1)." },
                  teamName: { type: Type.STRING, description: "The FPL team's name." },
                  justification: { type: Type.STRING, description: "A brief justification for the predicted rank." }
                },
                required: ["rank", "teamName", "justification"]
              }
            }
          },
          required: ["predicted_standings"]
        },
        temperature: 0.6,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    const standings = result.predicted_standings || result.predictedStandings;

    if (Array.isArray(standings)) {
      return standings as PredictedStanding[];
    } else {
      throw new Error("Invalid JSON structure received from API for standings prediction.");
    }
  } catch (error) {
    console.error("Gemini API call for standings prediction failed:", error);
    throw new Error("The AI standings prediction failed.");
  }
};

export const analyzeLeagueLuck = async (teams: Team[]): Promise<LuckAnalysis[]> => {
    const teamSummaries = teams.map(team => {
        const benchPoints = team.liveBenchPoints ?? 0;
        
        const highestScorer = team.players.reduce((max, p) => (p.livePoints > max.livePoints ? p : max), { livePoints: -Infinity, name: 'N/A', isCaptain: false, id:0, position: 'GKP', team: '', multiplier: 0, isViceCaptain: false });
        
        const captain = team.players.find(p => p.isCaptain);
        const captainPoints = captain ? captain.livePoints * (captain.multiplier > 1 ? captain.multiplier : 2) : 0;
        
        const potentialCaptainPoints = highestScorer.livePoints * 2;
        const captaincyPointsLost = Math.max(0, potentialCaptainPoints - captainPoints);

        return `
Team: ${team.teamName} (${team.managerName})
- Points left on bench: ${benchPoints}
- Captaincy points lost: ${captaincyPointsLost} (Captain ${captain?.name} scored ${captainPoints}pts, while the best option ${highestScorer.name} could have returned ${potentialCaptainPoints}pts)
        `.trim();
    }).join('\n---\n');

    const prompt = `
    You are an expert Fantasy Premier League (FPL) analyst. Your task is to analyze the "luck" of each manager in a mini-league for the current gameweek based on their decisions.

    "Luck" in FPL is a combination of good fortune and astute decision-making. A "lucky" manager makes the right calls, while an "unlucky" one makes decisions that backfire. Analyze the following data for each team:
    - **Points left on bench:** High numbers are unlucky or a bad decision.
    - **Captaincy points lost:** This is the difference between the points their captain earned and the points they *could* have earned by captaining their highest-scoring player in their 15-man squad. A high number is unlucky or a bad decision.

    Based on this data, provide a "Luck Score" from 0 to 100 for each team, where 0 is extremely unlucky/poor decisions and 100 is perfectly lucky/optimal decisions. Also, provide a brief, one-sentence justification for the score, referencing the data provided.

    Analyze the following teams:
    ${teamSummaries}

    Return the result ONLY in the specified JSON format. The list should be ordered from luckiest to unluckiest (highest score to lowest).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        luck_analysis: {
                            type: Type.ARRAY,
                            description: "An array of each team's luck analysis, sorted from luckiest to unluckiest.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    teamName: { type: Type.STRING },
                                    luckScore: { type: Type.NUMBER },
                                    justification: { type: Type.STRING }
                                },
                                required: ["teamName", "luckScore", "justification"]
                            }
                        }
                    },
                    required: ["luck_analysis"]
                },
                temperature: 0.4,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        const analysis = result.luck_analysis || result.luckAnalysis;

        if (Array.isArray(analysis)) {
            return analysis as LuckAnalysis[];
        } else {
            throw new Error("Invalid JSON structure received from API for luck analysis.");
        }
    } catch (error) {
        console.error("Gemini API call for luck analysis failed:", error);
        throw new Error("The AI luck analysis failed.");
    }
};

export const analyzePvpMatchup = async (team1: Team, team2: Team, fixtures: FplFixture[], fplTeams: FplTeamInfo[]): Promise<PvpAnalysisResult> => {
    const getTeamInfo = (teamId: number) => fplTeams.find(t => t.id === teamId)?.name || 'Unknown Team';

    const fixturesList = fixtures.map(f => `${getTeamInfo(f.team_h)} vs ${getTeamInfo(f.team_a)}`).join('\n- ');

    const formatTeamForPrompt = (team: Team) => {
        const starters = team.players.filter(p => p.livePoints !== undefined).slice(0, 11);
        const captain = team.players.find(p => p.isCaptain);
        const viceCaptain = team.players.find(p => p.isViceCaptain);

        return `
Team Name: ${team.teamName} (${team.managerName})
Starting XI:
${starters.map(p => `- ${p.name} (${p.position}, ${p.team})`).join('\n')}
Captain: ${captain?.name || 'N/A'}
Vice-Captain: ${viceCaptain?.name || 'N/A'}
    `.trim();
    };

    const prompt = `
You are a world-class Fantasy Premier League (FPL) analyst with deep tactical knowledge and statistical insight. Your task is to predict the outcome of a head-to-head matchup for the upcoming gameweek.

**Upcoming Gameweek Fixtures:**
- ${fixturesList}

**Matchup Details:**

**Team 1: ${formatTeamForPrompt(team1)}**

**Team 2: ${formatTeamForPrompt(team2)}**

**Your Analysis Task:**
1.  **Player-by-Player Fixture Analysis:** For each of the 22 starting players, meticulously assess their upcoming fixture. Consider their individual form, their team's form (both attacking and defensive), their past season performance, and historical performance against their opponent.
2.  **Captaincy Impact:** Give significant weight to the captain choices. A captain with a favorable fixture has a massive impact on the outcome. Evaluate the captaincy decisions for both teams and predict their captaincy returns.
3.  **Predict Scores:** Based on your deep analysis, predict a final points score for each team for this gameweek. Be precise and realistic.
4.  **Declare a Winner:** Based on the predicted scores, state who the winner will be.
5.  **Provide Justification:** Write a detailed, insightful justification for your prediction. Explain the key factors that influenced your decision. This must include:
    *   A direct comparison of the captaincy choices and their likely impact.
    *   An analysis of which team has the more favorable set of fixtures overall.
    *   Highlighting 1-2 key "differential" players from each team who are likely to make a big impact (either positively or negatively).
    *   A concluding summary sentence declaring the most likely winner and why.

**Output Format:**
Return your response ONLY in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedWinner: { type: Type.STRING, description: "The name of the team predicted to win." },
            team1Name: { type: Type.STRING, description: `The name of the first team: ${team1.teamName}` },
            team2Name: { type: Type.STRING, description: `The name of the second team: ${team2.teamName}` },
            team1PredictedScore: { type: Type.NUMBER, description: "The predicted score for team 1." },
            team2PredictedScore: { type: Type.NUMBER, description: "The predicted score for team 2." },
            justification: { type: Type.STRING, description: "A detailed justification for the prediction." }
          },
          required: ["predictedWinner", "team1Name", "team2Name", "team1PredictedScore", "team2PredictedScore", "justification"]
        },
        temperature: 0.4,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.predictedWinner && result.team1Name) {
        return result as PvpAnalysisResult;
    } else {
        throw new Error("Invalid JSON structure received from API for PvP analysis.");
    }
  } catch (error) {
    console.error("Gemini API call for PvP analysis failed:", error);
    throw new Error("The AI head-to-head analysis failed.");
  }
};