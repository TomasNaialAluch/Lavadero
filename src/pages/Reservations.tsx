import { useEffect, useMemo, useState } from 'react'
import { store } from '../store'
import { useReservations } from '../hooks'
import { MACHINES, machineById, type MachineId } from '../types'
import './reservations.css'

/*
  Reservas pensadas para gente grande y para que entren en poca pantalla:
  una sola tarjeta, botones grandes, la hora se elige en una botonera (sin escribir).
  Los turnos empiezan en punto y duran una ficha: 2 h el lavarropas, 1 h los secarropas.
*/
const HOUR = 3600000
const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const hhmm = (t: number) => `${new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} hs`
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8:00 a 22:00
const WEEKDAY = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const SHORT: Record<MachineId, string> = { lavarropas: 'Lavarropas', secarropas1: 'Secarropas arriba', secarropas2: 'Secarropas abajo' }

const dayLabel = (t: number, i: number) => (i === 0 ? 'Hoy' : i === 1 ? 'Mañ.' : WEEKDAY[new Date(t).getDay()])
function dayLong(t: number, i: number) {
  if (i === 0) return 'hoy'
  if (i === 1) return 'mañana'
  return new Date(t).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })
}

export default function Reservations() {
  const all = useReservations()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => Date.now() + i * 24 * HOUR), [])
  const [dayIdx, setDayIdx] = useState(0)
  const [machine, setMachine] = useState<MachineId>('lavarropas')
  const [hour, setHour] = useState<number | null>(null)
  const [floor, setFloor] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const day = dayKey(days[dayIdx])
  const cfg = machineById(machine)
  const startOf = (h: number) => new Date(`${day}T${pad(h)}:00:00`).getTime()

  // por cada hora: ¿ya pasó? ¿se pisa con otra reserva de esta máquina?
  const slotState = (h: number) => {
    const start = startOf(h)
    const end = start + cfg.defaultMinutes * 60000
    if (start < Date.now()) return 'past' as const
    if (all.some((r) => r.machine === machine && r.start < end && start < r.end)) return 'busy' as const
    return 'free' as const
  }

  // si la hora elegida deja de estar libre (cambió máquina o día, o la reservó otro), se des-selecciona
  useEffect(() => {
    if (hour !== null && slotState(hour) !== 'free') setHour(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine, dayIdx, all])

  const dayReservations = all.filter((r) => dayKey(r.start) === day).sort((a, b) => a.start - b.start)

  const start = hour !== null ? startOf(hour) : null
  const end = start !== null ? start + cfg.defaultMinutes * 60000 : null

  const submit = async () => {
    if (start === null || end === null) return
    const clash = all.find((r) => r.machine === machine && r.start < end && start < r.end)
    if (clash) return setError(`Se pisa con la reserva de ${hhmm(clash.start)} a ${hhmm(clash.end)}.`)
    setError('')
    try {
      await store.addReservation({ machine, floor: floor.trim() || 'anónimo', start, end })
      setOk(`¡Listo! Reservaste ${cfg.name} ${dayLong(days[dayIdx], dayIdx)} de ${hhmm(start)} a ${hhmm(end)}.`)
      setHour(null)
      setTimeout(() => setOk(''), 6000)
    } catch {
      setError('No se pudo guardar. Probá de nuevo.')
    }
  }

  return (
    <>
      <h1>Reservar</h1>

      {ok && <p className="ok-box" role="status">{ok}</p>}

      <section className="card form">
        <p className="lbl">Máquina</p>
        <div className="machine-row">
          {MACHINES.map((m) => (
            <button key={m.id} className={`pick ${machine === m.id ? 'on' : ''}`} onClick={() => setMachine(m.id)}>
              <span>{SHORT[m.id]}</span>
              <small>{m.defaultMinutes / 60} h</small>
            </button>
          ))}
        </div>

        <p className="lbl">Día</p>
        <div className="day-grid">
          {days.map((t, i) => (
            <button key={i} className={`pick ${dayIdx === i ? 'on' : ''}`} onClick={() => setDayIdx(i)}>
              <small>{dayLabel(t, i)}</small>
              <b>{new Date(t).getDate()}</b>
            </button>
          ))}
        </div>

        <p className="lbl">Hora de inicio <span>(tachada = ocupada)</span></p>
        <div className="hour-grid">
          {HOURS.map((h) => {
            const st = slotState(h)
            return (
              <button
                key={h}
                className={`pick hour ${hour === h ? 'on' : ''} ${st !== 'free' ? 'off' : ''}`}
                disabled={st !== 'free'}
                onClick={() => setHour(h)}
                aria-label={`${h} horas${st === 'busy' ? ', ocupado' : st === 'past' ? ', ya pasó' : ''}`}
              >
                {h}:00
              </button>
            )
          })}
        </div>

        <div className="finish">
          <p className="what">
            {start !== null && end !== null
              ? <>{cfg.name}, {dayLong(days[dayIdx], dayIdx)}<br /><b>{hhmm(start)} a {hhmm(end)}</b></>
              : 'Elegí máquina, día y hora.'}
          </p>
          <input value={floor} placeholder="Tu piso (opcional) Ej: 5B" maxLength={12} onChange={(e) => setFloor(e.target.value)} aria-label="Tu piso o depto, opcional" />
          {error && <p className="error">{error}</p>}
          <button className="big primary" disabled={start === null} onClick={submit}>
            {start === null ? 'Falta elegir la hora' : 'Reservar'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Ya reservado {dayLong(days[dayIdx], dayIdx)}</h2>
        {dayReservations.length === 0 && <p className="sub">Nadie reservó todavía. ¡Está libre!</p>}
        <ul className="list">
          {dayReservations.map((r) => (
            <li key={r.id}>
              <div>
                <b>{hhmm(r.start)} a {hhmm(r.end)}</b>
                <span>{machineById(r.machine).name} · {r.floor}</span>
              </div>
              <button className="btn small-del" onClick={() => confirm('¿Cancelar esta reserva?') && store.removeReservation(r.id)}>
                Cancelar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
