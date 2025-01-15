import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getFirebaseStorage, getFirestoreDb } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadAudioToStorage(
  audioBuffer: Buffer,
  metadata: {
    title?: string;
    description?: string;
    duration?: number;
    mimeType?: string;
  }
): Promise<string> {
  const storage = getFirebaseStorage();
  const db = getFirestoreDb();
  
  try {
    // Generate a unique filename
    const fileName = `podcasts/${uuidv4()}.mp3`;
    const storageRef = ref(storage, fileName);
    
    // Upload the audio file
    await uploadBytes(storageRef, audioBuffer, {
      contentType: metadata.mimeType || 'audio/mp3'
    });
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(storageRef);
    
    // Save metadata to Firestore
    await addDoc(collection(db, 'podcasts'), {
      ...metadata,
      audioUrl: downloadUrl,
      createdAt: new Date().toISOString(),
      fileName,
      fileSize: audioBuffer.length,
    });
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading audio:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
    throw new Error('Failed to upload audio');
  }
}