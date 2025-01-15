import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { parseScriptBySpeaker, getVoiceForRole } from '../utils/voice-parser';

export async function processAudioContent(
  script: string,
  metadata: {
    title?: string;
    description?: string;
    duration?: number;
  }
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error('Google Cloud API key not found');
  }

  try {
    const parsedScript = parseScriptBySpeaker(script);
    const audioSegments: string[] = [];

    for (const segment of parsedScript) {
      const voice = getVoiceForRole(segment.speaker.toLowerCase() as any);
      const audioContent = await synthesizeSpeechSegment(segment.text, voice, apiKey);
      audioSegments.push(audioContent);
    }

    const combinedAudio = audioSegments.join('');
    const finalAudioBuffer = Buffer.from(combinedAudio, 'base64');

    const fileName = `podcasts/${uuidv4()}.mp3`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, finalAudioBuffer);
    const downloadUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'podcasts'), {
      ...metadata,
      audioUrl: downloadUrl,
      createdAt: new Date().toISOString(),
      fileName,
      fileSize: finalAudioBuffer.length,
      mimeType: 'audio/mp3',
    });

    return downloadUrl;
  } catch (error) {
    console.error('Audio processing error:', error);
    throw error;
  }
}

async function synthesizeSpeechSegment(
  text: string,
  voice: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: voice },
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Speech synthesis failed: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.audioContent;
}