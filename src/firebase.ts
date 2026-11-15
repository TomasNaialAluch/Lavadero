import { initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const e = import.meta.env
const config = {
  apiKey: e.VITE_FIREBASE_API_KEY,
  authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: e.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)
export const db: Firestore = firebaseEnabled ? getFirestore(initializeApp(config)) : (null as unknown as Firestore)
