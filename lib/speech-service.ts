import { TextToSpeechOptions, SpeechResponse } from '@/types/speech';

export async function synthesizeSpeech(options: TextToSpeechOptions): Promise<SpeechResponse> {
  if (!options.text?.trim()) {
    throw new Error('Text content is required');
  }

  if (!options.voice?.trim()) {
    throw new Error('Voice selection is required');
  }

  try {
    const response = await fetch('/api/synthesize-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...options,
        text: options.text.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Speech synthesis failed' }));
      throw new Error(error.message || 'Speech synthesis failed');
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content received from speech service');
    }

    return {
      audioContent: data.audioContent,
      duration: data.duration,
    };
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to synthesize speech');
  }
}