import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { validateFirebaseConfig } from '../config/firebase';

// Initialize Firebase only if it hasn't been initialized
export function initializeFirebase() {
  if (getApps().length === 0) {
    const config = validateFirebaseConfig();
    return initializeApp(config);
  }
  return getApps()[0];
}

// Get Firestore instance
export function getFirestoreDb() {
  const app = initializeFirebase();
  return getFirestore(app);
}

// Get Storage instance
export function getFirebaseStorage() {
  const app = initializeFirebase();
  return getStorage(app);
}