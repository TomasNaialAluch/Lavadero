export type MachineId = 'lavarropas' | 'secarropas1' | 'secarropas2'

export interface MachineConfig {
  id: MachineId
  name: string
  kind: 'wash' | 'dry'
  defaultMinutes: number
  /** Secarropas 2 en 1 (apilados): cuál de los dos módulos es */
  position?: 'top' | 'bottom'
}

export const MACHINES: MachineConfig[] = [
  { id: 'lavarropas', name: 'Lavarropas', kind: 'wash', defaultMinutes: 120 },
  { id: 'secarropas1', name: 'Secarropas arriba', kind: 'dry', defaultMinutes: 60, position: 'top' },
  { id: 'secarropas2', name: 'Secarropas abajo', kind: 'dry', defaultMinutes: 60, position: 'bottom' },
]

export const machineById = (id: MachineId) => MACHINES.find((m) => m.id === id)!

/** Una máquina en uso. null = libre. */
export interface ActiveUse {
  floor: string
  startedAt: number
  endsAt: number
}
export type MachineState = Record<MachineId, ActiveUse | null>

/** Historial (anónimo) para las estadísticas. */
export interface UsageLog {
  machine: MachineId
  startedAt: number
  minutes: number
}

export interface Reservation {
  id: string
  machine: MachineId
  floor: string
  start: number
  end: number
}
