import { useEffect, useState } from 'react'
import { store, emptyState } from './store'
import type { MachineState, Reservation, UsageLog } from './types'

export function useMachines() {
  const [s, setS] = useState<MachineState>(emptyState())
  useEffect(() => store.subscribeMachines(setS), [])
  return s
}
export function useLogs() {
  const [s, setS] = useState<UsageLog[]>([])
  useEffect(() => store.subscribeLogs(setS), [])
  return s
}
export function useReservations() {
  const [s, setS] = useState<Reservation[]>([])
  useEffect(() => store.subscribeReservations(setS), [])
  return s
}
export function useNow(intervalMs = 1000) {
  const [n, setN] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setN(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return n
}
