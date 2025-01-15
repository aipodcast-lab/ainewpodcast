import { GoogleGenerativeAI } from '@google/generative-ai';
import { processAudio } from './services/audio/processor';
import { config } from './config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey || '');

export async function generatePodcastScript(
  title: string,
  description: string,
  speakers?: { name: string; voice: string; gender: 'male' | 'female' }[]
): Promise<string> {
  if (!config.gemini.apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }

  if (!title?.trim()) {
    throw new Error('Podcast title is required');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let customRoles = '';
    if (speakers) {
      const sLen = speakers.length;
      customRoles = `\n we have ${sLen} person in this podcast.`;
      for (let i = 0; i < sLen; i++) {
        const slug = speakers[i].name.toLowerCase().replace(' ', '');
        customRoles += `\n - ${speakers[i].name} is a identify as ${slug} and person gender is ${speakers[i].gender}`;
      }

      customRoles += `\n 
        - for example if name is Sarah it will be identify as **sarah**
      `;
    } else {
      customRoles = `
        - Structure the script with clear speaker labels based on gender (e.g., "male1", "male2", "female1", "female2", etc.) followed by their lines. 
        - If there are only male speakers, use "male1:", "male2:", etc. If only female speakers, use "female1", "female2", etc. For mixed gender speakers, use "male1", "female1", etc.
    `;
    }

    const prompt = `Write a podcast script for the topic: "${title}". ${
      description ? `Here is the description for context: ${description}.` : ''
    } 
    - Start with a brief introduction to set the scene and context for the conversation. and don't add title or description in the script.
    ${customRoles}
    - always start with a ** for the speaker name and make it lowercase.
    - Create a natural, engaging conversation with back-and-forth exchanges, questions, responses, and occasional humor.  
    - Keep each speaker's line concise (under 150 characters) for better readability and flow.
    - Ensure each host has a distinct personality and perspective.
    - Exclude introductions, summaries, or additional notes beyond the dialogue.
    - Maintain a smooth flow throughout the conversation.
    - Use fictional names or characters for any context-specific details.
    - Also make sure you not include more then 2 speakers in the conversation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();

    if (!script?.trim()) {
      throw new Error('No script content was generated');
    }

    return script;
  } catch (error: any) {
    console.error('Script generation error:', error);
    if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error(
        'API quota exceeded. Please check your billing details or try again later.'
      );
    }
    throw new Error('Failed to generate podcast script. Please try again.');
  }
}

export async function createPodcastAudio(
  {
    script,
    speakers,
    useAwsVoice,
  }: {
    script: string;
    speakers?: { name: string; voice: string; gender: 'male' | 'female' }[];
    useAwsVoice?: boolean;
  },
  voice: string
): Promise<string> {
  if (!script?.trim()) {
    throw new Error('Script content is required');
  }

  if (!voice?.trim()) {
    throw new Error('Voice selection is required');
  }

  try {
    // Split long text into smaller chunks if needed
    const maxChunkLength = 4500; // Google TTS limit is 5000
    const chunks =
      script.length > maxChunkLength
        ? splitTextIntoChunks(script, maxChunkLength)
        : [script];

    const audioUrls = await Promise.all(
      chunks.map((chunk) =>
        processAudio({
          text: chunk,
          speakers: speakers,
          useAwsVoice: useAwsVoice,
          voice,
          language: 'en-US',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        })
      )
    );

    // For now, return the first chunk's URL
    // TODO: Implement audio concatenation if needed
    return audioUrls[0];
  } catch (error) {
    console.error('Podcast audio creation error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create podcast audio');
  }
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
