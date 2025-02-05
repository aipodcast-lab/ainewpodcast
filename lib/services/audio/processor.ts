import { TextToSpeechOptions } from '@/types/speech';
import { synthesizeText } from '../speech/synthesizer';
import { base64ToBlob, validateAudioBlob } from '@/lib/utils/audio';

export async function processAudio(options: TextToSpeechOptions): Promise<string> {
  try {
    // Generate audio content
    const audioContent = await synthesizeText(options);

    if (!audioContent) {
      throw new Error('No audio content received');
    }

    // Convert to blob and validate
    const audioBlob = base64ToBlob(audioContent);
    validateAudioBlob(audioBlob);

    // Create object URL for playback
    const url = URL.createObjectURL(audioBlob);

    if (!url) {
      throw new Error('Failed to create audio URL');
    }

    return url;
  } catch (error) {
    console.error('Audio processing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process audio');
  }
}