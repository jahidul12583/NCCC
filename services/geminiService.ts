import { GoogleGenAI } from '@google/genai';

/**
 * Calls the Gemini API for dashboard insights.
 * @param {string} prompt The user's query.
 * @returns {Promise<string>} An AI response.
 */
export const getDashboardInsights = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert AI assistant for a coaching center's admin dashboard. Your role is to analyze user queries and provide concise, data-driven insights related to students, finances, batches, and staff performance. Base your answers on the context of a coaching management system.",
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Throw an error so the calling component can handle the UI state
        throw new Error("Failed to get insights from AI assistant. Please check your API key configuration and network.");
    }
};
