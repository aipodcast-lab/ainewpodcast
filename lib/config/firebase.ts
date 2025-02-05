import { env } from './env';

export const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId
} as const;

export function validateFirebaseConfig() {
  const config = firebaseConfig;
  
  if (!config.apiKey) {
    throw new Error('Firebase API key not found in environment variables');
  }
  
  if (!config.authDomain) {
    throw new Error('Firebase auth domain not found in environment variables');
  }
  
  if (!config.projectId) {
    throw new Error('Firebase project ID not found in environment variables');
  }
  
  if (!config.storageBucket) {
    throw new Error('Firebase storage bucket not found in environment variables');
  }
  
  return config;
}