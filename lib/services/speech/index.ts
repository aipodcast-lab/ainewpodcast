import { TextToSpeechOptions, SpeechResponse } from '@/types/speech';
import { parseScript } from './script-parser';
import { getVoiceForSpeaker } from './voice-mapper';

export async function synthesizeSpeech(options: TextToSpeechOptions): Promise<SpeechResponse> {
  if (!options.text?.trim()) {
    throw new Error('Text content is required');
  }

  try {
    const segments = parseScript(options.text);
    const audioSegments: string[] = [];
    let totalDuration = 0;
    
    for (const segment of segments) {
      const voice = getVoiceForSpeaker(segment.speaker);
      const response = await fetch('/api/synthesize-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          text: segment.text,
          voice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Speech synthesis failed');
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received for segment');
      }

      audioSegments.push(data.audioContent);
      totalDuration += data.duration || 0;
    }

    return {
      audioContent: audioSegments.join(''),
      duration: totalDuration
    };
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to synthesize speech');
  }
}