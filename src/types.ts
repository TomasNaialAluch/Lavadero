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

/**
 * SUM (salón de usos múltiples) con la parrilla incluida: se reserva todo junto, por día y turno.
 * Hay dos turnos: de día (desde la mañana hasta ~18 hs) y de noche (desde ~20 hs hasta la madrugada).
 */
export type SumTurn = 'dia' | 'noche'
export const SUM_TURNS: { id: SumTurn; name: string; hours: string }[] = [
  { id: 'dia', name: 'Turno día', hours: 'de la mañana hasta las 18 hs' },
  { id: 'noche', name: 'Turno noche', hours: 'desde las 20 hs hasta las 6 de la mañana' },
]
export interface SumBooking {
  /** `${day}_${turn}`: un solo documento por día y turno, así no se puede reservar dos veces lo mismo */
  id: string
  /** AAAA-MM-DD */
  day: string
  turn: SumTurn
  floor: string
  /** identificador anónimo del celular que reservó (solo él puede cancelar) */
  owner: string
}

/** Una máquina en uso. null = libre. */
export interface ActiveUse {
  /** Identificador anónimo del celular que inició el lavado (solo él puede sumar fichas o terminarlo antes) */
  owner?: string
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
