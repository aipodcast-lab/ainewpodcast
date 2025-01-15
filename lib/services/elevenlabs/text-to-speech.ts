import { ELEVENLABS_API_URL, getConfig } from './config';
import type { TextToSpeechResponse, VoiceSettings } from './types';

export async function textToSpeech(
  text: string,
  voiceId: string,
  settings?: Partial<VoiceSettings>
): Promise<TextToSpeechResponse> {
  const config = getConfig();
  
  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          ...settings,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Text-to-speech conversion failed');
  }

  const audioBuffer = await response.arrayBuffer();
  const duration = Number(response.headers.get('x-duration')) || 0;
  const textLength = text.length;

  return {
    audio: audioBuffer,
    metadata: {
      duration,
      text_length: textLength,
    },
  };
}