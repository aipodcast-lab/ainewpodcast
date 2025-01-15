import { TextToSpeechOptions } from '@/types/speech';

export function validateAudioOptions(options: TextToSpeechOptions): void {
  if (!options?.text?.trim()) {
    throw new Error('Text content is required');
  }

  if (!options?.voice?.trim()) {
    throw new Error('Voice selection is required');
  }

  if (options.text.length > 5000) {
    throw new Error('Text content exceeds maximum length of 5000 characters');
  }
}

export function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:audio\/\w+;base64,/, '');
    
    if (!base64Data) {
      throw new Error('Invalid base64 data');
    }

    // Convert base64 to byte array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('Base64 to Blob conversion error:', error);
    throw new Error('Failed to convert audio data');
  }
}

export function validateAudioBlob(blob: Blob): void {
  if (!blob) {
    throw new Error('Audio blob is required');
  }

  if (blob.size === 0) {
    throw new Error('Generated audio file is empty');
  }

  if (blob.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Audio file size exceeds 10MB limit');
  }
}