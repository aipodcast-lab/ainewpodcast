import { env } from './env';

export function getGeminiConfig() {
  const { apiKey } = env.gemini;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }
  
  return { apiKey };
}