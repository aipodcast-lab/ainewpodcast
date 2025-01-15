import { ScriptSegment } from '@/types/speech';

const VOICE_PROFILES = {
  host1: 'en-US-Neural2-D', // Male voice
  host2: 'en-US-Neural2-F', // Female voice
  host3: 'en-US-Neural2-A', // Male voice with different tone
  guest: 'en-US-Neural2-C'  // Female voice with different tone
} as const;

export function getVoiceForRole(role: keyof typeof VOICE_PROFILES): string {
  return VOICE_PROFILES[role] || VOICE_PROFILES.host1;
}

export function parseScriptBySpeaker(script: string): ScriptSegment[] {
  const lines = script.split('\n');
  const parsedScript: ScriptSegment[] = [];
  let currentSpeaker = '';
  let currentText = '';

  lines.forEach(line => {
    const speakerMatch = line.match(/^([\w\s]+):/);
    if (speakerMatch) {
      if (currentSpeaker && currentText) {
        parsedScript.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = speakerMatch[1];
      currentText = line.substring(speakerMatch[0].length).trim();
    } else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  });

  if (currentSpeaker && currentText) {
    parsedScript.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return parsedScript;
}