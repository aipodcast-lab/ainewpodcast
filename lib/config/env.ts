// Environment variable validation and access
export const env = {
  google: {
    clientEmail: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PRIVATE_KEY,
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  },
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
  }
} as const;

export function validateEnv() {
  const { clientEmail, privateKey, apiKey } = env.google;
  const firebase = env.firebase;
  const gemini = env.gemini;

  if (!clientEmail) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_EMAIL is not defined');
  }

  if (!privateKey) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLOUD_PRIVATE_KEY is not defined');
  }

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY is not defined');
  }

  if (!firebase.apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not defined');
  }

  if (!firebase.authDomain) {
    throw new Error('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is not defined');
  }

  if (!firebase.projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined');
  }

  if (!firebase.storageBucket) {
    throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not defined');
  }

  if (!gemini.apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
  }

  return {
    google: {
      clientEmail,
      privateKey,
      apiKey,
    },
    firebase,
    gemini
  };
}