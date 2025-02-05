import { TextToSpeechOptions } from '@/types/speech'
import { validateAudioOptions } from '@/lib/utils/audio'

export async function synthesizeText(
  options: TextToSpeechOptions
): Promise<string> {
  validateAudioOptions(options)

  try {
    const response = await fetch('/api/synthesize-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: options.text.trim(),
        speakers: options.speakers,
        useAwsVoice: options.useAwsVoice || false,
        voice: options.voice.trim(),
        language: options.language || 'en-US',
        speakingRate: options.speakingRate || 1.0,
        pitch: options.pitch || 0.0,
        volumeGainDb: options.volumeGainDb || 0.0
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: 'Failed to parse response' }))
      throw new Error(
        data.error || `Speech synthesis failed: ${response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.audioContent) {
      throw new Error('No audio content received from speech service')
    }

    return data.audioContent
  } catch (error) {
    console.error('Speech synthesis error:', error)
    throw error instanceof Error
      ? error
      : new Error('Failed to synthesize speech')
  }
}
