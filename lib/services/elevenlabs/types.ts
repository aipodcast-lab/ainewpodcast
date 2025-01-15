export interface VoiceCloneResponse {
  voice_id: string;
  name: string;
}

export interface TextToSpeechResponse {
  audio: ArrayBuffer;
  metadata: {
    duration: number;
    text_length: number;
  };
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}