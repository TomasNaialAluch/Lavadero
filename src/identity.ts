import { useEffect, useState } from 'react'
import { ensureAuth, firebaseEnabled } from './firebase'

/*
  Identidad anónima del celular, sin login.
  - Con Firebase: el uid anónimo de Firebase Auth (lo hacen cumplir las reglas del servidor).
  - Modo de prueba (sin Firebase): un id aleatorio guardado en este navegador.
*/
const KEY = 'tw.deviceId'

export function localDeviceId(): string {
  try {
    let v = localStorage.getItem(KEY)
    if (!v) {
      v = crypto.randomUUID()
      localStorage.setItem(KEY, v)
    }
    return v
  } catch {
    return 'sin-almacenamiento'
  }
}

/** uid de este celular (espera a que Firebase termine de crearlo) */
export const myUid = (): Promise<string> => (firebaseEnabled ? ensureAuth() : Promise.resolve(localDeviceId()))

/** uid de este celular para la pantalla; null mientras se prepara */
export function useUid(): string | null {
  const [uid, setUid] = useState<string | null>(firebaseEnabled ? null : localDeviceId())
  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    ensureAuth().then((u) => alive && setUid(u)).catch(() => {})
    return () => { alive = false }
  }, [])
  return uid
}
