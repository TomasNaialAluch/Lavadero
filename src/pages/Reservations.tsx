import { useMemo, useState } from 'react'
import { store } from '../store'
import { useReservations } from '../hooks'
import { MACHINES, machineById, type MachineId } from '../types'

const HOUR = 3600000
const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const hhmm = (t: number) => new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export default function Reservations() {
  const all = useReservations()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => Date.now() + i * 24 * HOUR), [])
  const [day, setDay] = useState(dayKey(days[0]))
  const [machine, setMachine] = useState<MachineId>('lavarropas')
  const [time, setTime] = useState('16:00')
  const [floor, setFloor] = useState('')
  const [error, setError] = useState('')

  const mine = all.filter((r) => dayKey(r.start) === day).sort((a, b) => a.start - b.start)

  const submit = async () => {
    const start = new Date(`${day}T${time}:00`).getTime()
    const end = start + machineById(machine).defaultMinutes * 60000
    if (Number.isNaN(start)) return setError('Elegí una hora válida.')
    if (end < Date.now()) return setError('Esa hora ya pasó.')
    const clash = all.find((r) => r.machine === machine && r.start < end && start < r.end)
    if (clash) return setError(`Se pisa con la reserva de ${hhmm(clash.start)} a ${hhmm(clash.end)}.`)
    setError('')
    await store.addReservation({ machine, floor: floor.trim() || 'anónimo', start, end })
  }

  return (
    <>
      <h1>Reservas</h1>
      <p className="sub">Opcional: avisale a los vecinos cuándo vas a usar las máquinas.</p>

      <div className="days">
        {days.map((t) => (
          <button key={dayKey(t)} className={dayKey(t) === day ? 'on' : ''} onClick={() => setDay(dayKey(t))}>
            <small>{new Date(t).toLocaleDateString('es-AR', { weekday: 'short' })}</small>
            <b>{new Date(t).getDate()}</b>
          </button>
        ))}
      </div>

      <section className="card">
        <h2>Reservas de este día</h2>
        {mine.length === 0 && <p className="sub">Nadie reservó todavía. ¡Está libre!</p>}
        <ul className="list">
          {mine.map((r) => (
            <li key={r.id}>
              <div>
                <b>{hhmm(r.start)} – {hhmm(r.end)}</b>
                <span>{machineById(r.machine).name} · {r.floor}</span>
              </div>
              <button className="ghost small" onClick={() => confirm('¿Borrar esta reserva?') && store.removeReservation(r.id)}>
                Borrar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Reservar</h2>
        <label>Máquina</label>
        <div className="seg">
          {MACHINES.map((m) => (
            <button key={m.id} className={machine === m.id ? 'on' : ''} onClick={() => setMachine(m.id)}>
              {m.name}
            </button>
          ))}
        </div>
        <label htmlFor="t">Hora de inicio</label>
        <input id="t" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <label htmlFor="fl">Tu piso / depto (opcional)</label>
        <input id="fl" value={floor} placeholder="Ej: 5B" maxLength={12} onChange={(e) => setFloor(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="big primary" onClick={submit}>Reservar</button>
      </section>
    </>
  )
}
