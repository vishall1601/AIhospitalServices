import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const medicalModel = {
  getChat: () => {
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are Swasthya Delhi AI (Arogya AI Assistant), a medical assistant for Delhi. 
        ALWAYS provide a disclaimer: "I am an AI assistant, not a doctor. For emergencies, call 102/112."
        Be polite, professional, and focus on health services in Delhi. 
        Help with finding hospitals (AIIMS, Safdarjung, etc.) and explaining health schemes.`,
        temperature: 0.7,
      }
    });
  },
  
  analyzeHealthData: async (records: any[]) => {
    try {
      const prompt = `Analyze the following health records of a user from Delhi. Look for patterns, trends, or potential concerns. Provide a clear, structured summary.
      
      Records: ${JSON.stringify(records)}
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional health data analyst. Provide structured insights based on user vitals and symptoms."
        }
      });
      
      return response.text || "I couldn't analyze the data at this moment. Please ensure your records are complete.";
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return "Health data analysis is currently unavailable. Please try again later.";
    }
  }
};
