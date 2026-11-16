// Modo local: guarda todo en localStorage. Sirve para probar sin Firebase.
import type { ActiveUse, MachineId, MachineState, Reservation, SumBooking, UsageLog } from './types'
import { MACHINES } from './types'
import { localDeviceId } from './identity'

const K = { machines: 'tw.machines', logs: 'tw.logs', res: 'tw.res' }
const listeners = new Set<() => void>()

function read<T>(k: string, d: T): T {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : d
  } catch {
    return d
  }
}
function write(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v))
  listeners.forEach((l) => l())
}
window.addEventListener('storage', () => listeners.forEach((l) => l()))

function sub<T>(get: () => T, cb: (v: T) => void) {
  const fire = () => cb(get())
  listeners.add(fire)
  fire()
  return () => {
    listeners.delete(fire)
  }
}

// Datos de ejemplo para que las estadísticas no estén vacías al probar.
if (!localStorage.getItem(K.logs)) {
  const logs: UsageLog[] = []
  for (let i = 0; i < 120; i++) {
    const d = new Date(Date.now() - Math.floor(Math.random() * 30) * 864e5)
    const hour = Math.random() < 0.6 ? 18 + Math.floor(Math.random() * 4) : 9 + Math.floor(Math.random() * 11)
    d.setHours(hour, 0, 0, 0)
    logs.push({ machine: MACHINES[Math.floor(Math.random() * 3)].id, startedAt: d.getTime(), minutes: 60 })
  }
  localStorage.setItem(K.logs, JSON.stringify(logs))
}

const emptyMachines = () => Object.fromEntries(MACHINES.map((m) => [m.id, null])) as MachineState

export const subscribeMachines = (cb: (s: MachineState) => void) =>
  sub(() => ({ ...emptyMachines(), ...read<Partial<MachineState>>(K.machines, {}) }) as MachineState, cb)

export async function startMachine(id: MachineId, floor: string, minutes: number) {
  const now = Date.now()
  write(K.machines, { ...read(K.machines, {}), [id]: { owner: localDeviceId(), floor, startedAt: now, endsAt: now + minutes * 60000 } })
  write(K.logs, [...read<UsageLog[]>(K.logs, []), { machine: id, startedAt: now, minutes }])
}
export async function setEndsAt(id: MachineId, endsAt: number) {
  const m = read<Record<string, ActiveUse | null>>(K.machines, {})
  const cur = m[id]
  if (cur) write(K.machines, { ...m, [id]: { ...cur, endsAt } })
}
export async function freeMachine(id: MachineId) {
  write(K.machines, { ...read(K.machines, {}), [id]: null })
}
export const subscribeLogs = (cb: (l: UsageLog[]) => void) => sub(() => read<UsageLog[]>(K.logs, []), cb)
export const subscribeReservations = (cb: (r: Reservation[]) => void) =>
  sub(() => read<Reservation[]>(K.res, []), cb)
export async function addReservation(r: Omit<Reservation, 'id'>) {
  write(K.res, [...read<Reservation[]>(K.res, []), { ...r, id: crypto.randomUUID() }])
}
export async function removeReservation(id: string) {
  write(K.res, read<Reservation[]>(K.res, []).filter((r) => r.id !== id))
}

// SUM (modo de prueba, en este navegador)
export const subscribeSum = (cb: (b: SumBooking[]) => void) => sub(() => read<SumBooking[]>('tw.sum', []), cb)
export async function addSum(b: Omit<SumBooking, 'id' | 'owner'>) {
  const id = `${b.day}_${b.turn}`
  const all = read<SumBooking[]>('tw.sum', [])
  if (all.some((x) => x.id === id)) throw new Error('ya reservado')
  write('tw.sum', [...all, { ...b, id, owner: localDeviceId() }])
}
export async function removeSum(id: string) {
  write('tw.sum', read<SumBooking[]>('tw.sum', []).filter((x) => x.id !== id))
}
