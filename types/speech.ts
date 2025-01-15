export interface TextToSpeechOptions {
  text: string
  speakers?: { name: string; voice: string; gender: 'male' | 'female' }[]
  useAwsVoice?: boolean
  voice: string
  language?: string
  speakingRate?: number
  pitch?: number
  volumeGainDb?: number
}

export interface SpeechResponse {
  audioContent: string
  duration?: number
}

export interface TTSClientConfig {
  credentials: {
    client_email: string
    private_key: string
    project_id: string
  }
}

export interface AudioProcessingError extends Error {
  code?: string
  details?: unknown
}

export interface VoiceProfile {
  name: string
  languageCode: string
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  naturalSampleRateHertz: number
}

export interface ScriptSegment {
  speaker: string
  text: string
  voice?: string
}
