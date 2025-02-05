export const VOICE_PROFILES = {
  'host 1': 'en-US-Neural2-D',  // Male voice
  'host 2': 'en-US-Neural2-F',  // Female voice
  'host 3': 'en-US-Neural2-A',  // Different male voice
  'guest': 'en-US-Neural2-C',   // Different female voice
  'narrator': 'en-US-Neural2-E' // Neutral voice
} as const;

export function getVoiceForSpeaker(speaker: string): string {
  const normalizedSpeaker = speaker.toLowerCase().trim();
  return (VOICE_PROFILES as Record<string, string>)[normalizedSpeaker] || VOICE_PROFILES['host 1'];
}