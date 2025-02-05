export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own podcast data
    match /podcasts/{podcastId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                   request.auth.token.email == request.resource.data.userEmail;
      allow update, delete: if request.auth != null && 
                          request.auth.token.email == resource.data.userEmail;
    }
  }
}
`;

export const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
`;