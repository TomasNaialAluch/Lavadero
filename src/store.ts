import type { ActiveUse, MachineId, MachineState, Reservation, SumBooking, UsageLog } from './types'
import { MACHINES } from './types'
import * as fs from './store.firebase'
import * as local from './store.local'
import { firebaseEnabled } from './firebase'

export interface Store {
  subscribeMachines(cb: (s: MachineState) => void): () => void
  startMachine(id: MachineId, floor: string, minutes: number): Promise<void>
  setEndsAt(id: MachineId, endsAt: number): Promise<void>
  freeMachine(id: MachineId): Promise<void>
  subscribeLogs(cb: (l: UsageLog[]) => void): () => void
  subscribeReservations(cb: (r: Reservation[]) => void): () => void
  addReservation(r: Omit<Reservation, 'id'>): Promise<void>
  removeReservation(id: string): Promise<void>
  subscribeSum(cb: (b: SumBooking[]) => void): () => void
  addSum(b: Omit<SumBooking, 'id' | 'owner'>): Promise<void>
  removeSum(id: string): Promise<void>
}

export const store: Store = firebaseEnabled ? fs : local

export const emptyState = (): MachineState =>
  Object.fromEntries(MACHINES.map((m) => [m.id, null as ActiveUse | null])) as MachineState
