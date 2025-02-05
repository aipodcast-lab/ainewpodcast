import { getGoogleCredentials } from '../config/google';
import { TextToSpeechOptions, ScriptSegment } from '@/types/speech';
import { parseScriptBySpeaker } from '../utils/voice-parser';

const VOICE_PROFILES = {
  'host 1': 'en-US-Neural2-D',
  'host 2': 'en-US-Neural2-F',
  'host 3': 'en-US-Neural2-A',
  'guest': 'en-US-Neural2-C',
  'narrator': 'en-US-Neural2-E'
} as const;

export async function synthesizeSpeech(options: TextToSpeechOptions): Promise<string> {
  const { apiKey } = getGoogleCredentials();
  
  if (!options.text?.trim()) {
    throw new Error('Text content is required');
  }

  try {
    const parsedScript = parseScriptBySpeaker(options.text);
    const audioSegments: string[] = [];

    for (const segment of parsedScript) {
      const speakerKey = segment.speaker.toLowerCase() as keyof typeof VOICE_PROFILES;
      const voice = VOICE_PROFILES[speakerKey] || VOICE_PROFILES['host 1'];
      const audioContent = await synthesizeSegment(segment, voice, apiKey, options);
      audioSegments.push(audioContent);
    }

    return audioSegments.join('');
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw new Error('Failed to synthesize speech. Please check your credentials and try again.');
  }
}

async function synthesizeSegment(
  segment: ScriptSegment,
  voice: string,
  apiKey: string,
  options: TextToSpeechOptions
): Promise<string> {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: segment.text },
        voice: { 
          languageCode: options.language || 'en-US',
          name: voice
        },
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGainDb || 0.0
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Speech synthesis failed: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.audioContent;
}