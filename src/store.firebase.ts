import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where,
} from 'firebase/firestore'
import { db, ensureAuth } from './firebase'
import type { MachineId, MachineState, Reservation, SumBooking, UsageLog } from './types'
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

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function subscribeSum(cb: (b: SumBooking[]) => void) {
  const q = query(collection(db, 'sum'), where('day', '>=', todayKey()), orderBy('day'))
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ ...(d.data() as Omit<SumBooking, 'id'>), id: d.id }))))
}

/** El id es día_turno: si ya existe, Firebase rechaza la escritura (no se puede reservar dos veces lo mismo). */
export async function addSum(b: Omit<SumBooking, 'id' | 'owner'>) {
  const owner = await ensureAuth()
  await setDoc(doc(db, 'sum', `${b.day}_${b.turn}`), { ...b, owner })
}

export async function removeSum(id: string) {
  await ensureAuth()
  await deleteDoc(doc(db, 'sum', id))
}

export async function removeReservation(id: string) {
  await ensureAuth()
  await deleteDoc(doc(db, 'reservations', id))
}
