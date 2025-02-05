import { ScriptSegment } from '@/types/speech';

export function parseScript(script: string): ScriptSegment[] {
  const lines = script.split('\n');
  const segments: ScriptSegment[] = [];
  let currentSpeaker = '';
  let currentText = '';

  for (const line of lines) {
    const speakerMatch = line.match(/^([\w\s]+):/);
    
    if (speakerMatch) {
      if (currentSpeaker && currentText) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
      }
      currentSpeaker = speakerMatch[1].trim();
      currentText = line.substring(speakerMatch[0].length).trim();
    } else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  }

  if (currentSpeaker && currentText) {
    segments.push({
      speaker: currentSpeaker,
      text: currentText.trim()
    });
  }

  return segments;
}