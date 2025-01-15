import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiConfig } from '../config/gemini';

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini() {
  if (!genAI) {
    const { apiKey } = getGeminiConfig();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generatePodcastScript(title: string, description: string): Promise<string> {
  const ai = initializeGemini();
  
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a podcast script for "${title}". ${description ? `Description: ${description}.` : ''} 
    Format the script with clear speaker labels (e.g., "Host 1:", "Host 2:", "Guest:") followed by their lines.
    Include natural conversation flow, questions, and responses.
    Make it engaging and conversational, about 5-10 minutes in length.
    Ensure different hosts have distinct personalities and perspectives.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();

    if (!script?.trim()) {
      throw new Error('No script content was generated');
    }

    return script;
  } catch (error: any) {
    if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('API quota exceeded. Please check your billing details or try again later.');
    }
    throw new Error('Failed to generate podcast script. Please try again.');
  }
}