import { ELEVENLABS_API_URL, getConfig } from './config';
import type { VoiceCloneResponse } from './types';

export async function cloneVoice(
  name: string,
  audioFile: File,
  description?: string
): Promise<VoiceCloneResponse> {
  const config = getConfig();
  const formData = new FormData();

  formData.append('name', name);
  formData.append('files', audioFile);
  if (description) {
    formData.append('description', description);
  }

  console.log({
    formData,
  });

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': config.apiKey,
    },
    body: formData,
  });

  console.log({
    responseCloneService: response,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to clone voice');
  }

  return response.json();
}
