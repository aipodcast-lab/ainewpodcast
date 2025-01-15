import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, storage } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface VoiceCloneResponse {
  status: 'success' | 'error';
  audioUrl?: string;
  error?: string;
}

export const createVoiceClone = async (audioFile: File): Promise<VoiceCloneResponse> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return {
      status: 'error',
      error: 'Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.'
    };
  }

  try {
    // Store the original audio file for now since Gemini doesn't support direct voice cloning
    const fileName = `voice-samples/${uuidv4()}.${audioFile.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, audioFile);
    const audioUrl = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    await addDoc(collection(db, 'voiceProfiles'), {
      audioUrl,
      createdAt: new Date().toISOString(),
      status: 'pending' // For future voice cloning implementation
    });

    return {
      status: 'success',
      audioUrl
    };
  } catch (error) {
    console.error('Error creating voice clone:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

interface PodcastAudioResponse {
  status: 'success' | 'error';
  audioUrl?: string;
  error?: string;
}

export const generatePodcastAudio = async (
  text: string,
  voice: string,
  language: string = 'en'
): Promise<PodcastAudioResponse> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return {
      status: 'error',
      error: 'Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.'
    };
  }

  try {
    const response = await fetch('/api/synthesize-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        language
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    const { audioContent } = await response.json();
    const audioBlob = await fetch(`data:audio/mp3;base64,${audioContent}`).then(r => r.blob());
    
    const fileName = `podcasts/${uuidv4()}.mp3`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, audioBlob);
    const downloadUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'podcasts'), {
      audioUrl: downloadUrl,
      createdAt: new Date().toISOString(),
      voice,
      language
    });

    return {
      status: 'success',
      audioUrl: downloadUrl
    };
  } catch (error) {
    console.error('Error generating podcast audio:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};