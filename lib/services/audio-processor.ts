import { TextToSpeechOptions } from '@/types/speech';
import { synthesizeSpeech } from './text-to-speech';
import { uploadAudioToStorage } from './storage';
import { base64ToBuffer, validateAudioBuffer } from '../utils/audio-converter';

export async function processAudioContent(
  text: string,
  options: Omit<TextToSpeechOptions, 'text'> & {
    title?: string;
    description?: string;
  }
): Promise<string> {
  try {
    // Generate audio content
    const audioContent = await synthesizeSpeech({
      text,
      ...options
    });

    // Convert and validate audio buffer
    const audioBuffer = base64ToBuffer(audioContent);
    validateAudioBuffer(audioBuffer);

    // Upload to Firebase Storage
    const downloadUrl = await uploadAudioToStorage(audioBuffer, {
      title: options.title,
      description: options.description,
      mimeType: 'audio/mp3'
    });

    return downloadUrl;
  } catch (error) {
    console.error('Audio processing error:', error);
    if (error instanceof Error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
    throw new Error('Failed to process audio content. Please try again.');
  }
}