import { collection, addDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../firebase';
import { User } from 'firebase/auth';

interface PodcastData {
  title: string;
  description: string;
  script: string;
  thumbnailUrl?: string;
  audioUrl?: string; 
  userEmail: string;
  createdAt: string;
}

export async function savePodcastData(data: Omit<PodcastData, 'createdAt'>) {
  try {
    const db = getFirestoreDb();
    
    const podcastData: PodcastData = {
      ...data,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'podcasts'), podcastData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving podcast data:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to save podcast data');
  }
}