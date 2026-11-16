import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where,
} from 'firebase/firestore'
import { db, ensureAuth } from './firebase'
import type { MachineId, MachineState, Reservation, UsageLog } from './types'
import { MACHINES } from './types'

const DAY = 24 * 60 * 60 * 1000

export function subscribeMachines(cb: (s: MachineState) => void) {
  const state = Object.fromEntries(MACHINES.map((m) => [m.id, null])) as MachineState
  const unsubs = MACHINES.map((m) =>
    onSnapshot(doc(db, 'machines', m.id), (snap) => {
      const d = snap.data()
      state[m.id] = d && d.active ? { owner: d.owner, floor: d.floor, startedAt: d.startedAt, endsAt: d.endsAt } : null
      cb({ ...state })
    }),
  )
  return () => unsubs.forEach((u) => u())
}

export async function startMachine(id: MachineId, floor: string, minutes: number) {
  const owner = await ensureAuth()
  const now = Date.now()
  await setDoc(doc(db, 'machines', id), {
    active: true, owner, floor, startedAt: now, endsAt: now + minutes * 60000,
  })
  await addDoc(collection(db, 'logs'), { machine: id, startedAt: now, minutes })
}

export async function setEndsAt(id: MachineId, endsAt: number) {
  await ensureAuth()
  await updateDoc(doc(db, 'machines', id), { endsAt })
}

export async function freeMachine(id: MachineId) {
  await ensureAuth()
  await setDoc(doc(db, 'machines', id), { active: false })
}

export function subscribeLogs(cb: (l: UsageLog[]) => void) {
  const q = query(collection(db, 'logs'), where('startedAt', '>', Date.now() - 60 * DAY), orderBy('startedAt'))
  return onSnapshot(q, (s) => cb(s.docs.map((d) => d.data() as UsageLog)))
}

export function subscribeReservations(cb: (r: Reservation[]) => void) {
  const q = query(collection(db, 'reservations'), where('end', '>', Date.now() - DAY), orderBy('end'))
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ ...(d.data() as Omit<Reservation, 'id'>), id: d.id }))))
}

export async function addReservation(r: Omit<Reservation, 'id'>) {
  await ensureAuth()
  await addDoc(collection(db, 'reservations'), r)
}

export async function removeReservation(id: string) {
  await ensureAuth()
  await deleteDoc(doc(db, 'reservations', id))
}
