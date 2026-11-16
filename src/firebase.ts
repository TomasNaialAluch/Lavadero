import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth } from 'firebase/auth'
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
const app = firebaseEnabled ? initializeApp(config) : null
export const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore)
const auth: Auth | null = app ? getAuth(app) : null

let authPromise: Promise<string> | null = null

/**
 * Identificador anónimo del celular. Firebase lo crea solo la primera vez y lo guarda en el navegador:
 * los vecinos no inician sesión ni escriben nada. Se usa para saber quién es el dueño de cada lavado.
 */
export function ensureAuth(): Promise<string> {
  if (!auth) return Promise.reject(new Error('Firebase no está configurado'))
  if (!authPromise) {
    authPromise = new Promise<string>((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          unsub()
          resolve(user.uid)
        } else {
          signInAnonymously(auth).catch((err) => {
            unsub()
            authPromise = null
            reject(err)
          })
        }
      })
    })
  }
  return authPromise
}
