import { z } from 'zod';

export const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export const configSchema = z.object({
  apiKey: z.string().min(1, 'ElevenLabs API key is required'),
  modelId: z.string().default('eleven_monolingual_v1'),
});

export type ElevenLabsConfig = z.infer<typeof configSchema>;

export function getConfig(): ElevenLabsConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    modelId: process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID,
  };

  return configSchema.parse(config);
}