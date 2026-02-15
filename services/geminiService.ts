
import { GoogleGenAI, Type } from "@google/genai";
import { Grid, AIResponse } from "../types.ts";

export const getAIHint = async (grid: Grid, score: number): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const boardStr = grid.map(row => 
    row.map(tile => (tile ? tile.value : 0)).join(' | ')
  ).join('\n');

  const prompt = `
    I am playing the game 2048. Here is my current board state (0 means empty):
    Score: ${score}
    Board:
    ${boardStr}

    Analyze the board and suggest the best next move: UP, DOWN, LEFT, or RIGHT.
    Think carefully about keeping high-value tiles in a corner and maintaining a clean board.
    Return your answer in JSON format with "recommendedMove" and "reasoning".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedMove: {
              type: Type.STRING,
              description: "The suggested direction: UP, DOWN, LEFT, or RIGHT",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation for this move choice",
            },
          },
          required: ["recommendedMove", "reasoning"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const result = JSON.parse(text.trim());
    return result as AIResponse;
  } catch (error) {
    console.error("AI Hint Error:", error);
    throw new Error("Failed to get AI strategy. Please try again.");
  }
};
