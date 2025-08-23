import { GoogleGenAI, Type } from "@google/genai";
import type { Player, AiAnalysisResult, KeyMatch, Team, PredictedStanding } from '../types';

// Initialize the AI client only if the API key is available.
const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const ensureAiInitialized = () => {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized. Make sure your VITE_API_KEY is set in your .env file.");
    }
};

export const analyzeTeamStrength = async (players: Player[]): Promise<AiAnalysisResult> => {
  ensureAiInitialized();
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
    const response = await ai!.models.generateContent({
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
  ensureAiInitialized();
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
    const response = await ai!.models.generateContent({
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
  ensureAiInitialized();
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
    const response = await ai!.models.generateContent({
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