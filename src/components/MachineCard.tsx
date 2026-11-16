import { useState } from 'react'
import { motion } from 'framer-motion'
import { store } from '../store'
import { useNow } from '../hooks'
import { useUid } from '../identity'
import type { ActiveUse, MachineConfig } from '../types'
import Dryer from './Dryer'
import Washer from './Washer'

function fmt(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const clock = (t: number) => new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export default function MachineCard({ machine, use }: { machine: MachineConfig; use: ActiveUse | null }) {
  const now = useNow()
  const [asking, setAsking] = useState(false)
  const [floor, setFloor] = useState('')
  const Art = machine.kind === 'wash' ? Washer : Dryer
  const uid = useUid()
  const mine = use !== null && uid !== null && use.owner === uid // este celular inició el lavado

  const remaining = use ? use.endsAt - now : 0
  const done = use !== null && remaining <= 0
  const status = !use ? 'free' : done ? 'done' : 'busy'

  const [coin, setCoin] = useState(0) // cada ficha insertada hace caer una moneda en la máquina

  const start = async () => {
    setCoin((c) => c + 1)
    await store.startMachine(machine.id, floor.trim(), machine.defaultMinutes)
    setAsking(false)
    setFloor('')
  }

  // Cada ficha suma el tiempo completo de la máquina (2 h lavarropas, 1 h secarropas). No se puede restar.
  const addFicha = () => {
    if (!use) return
    setCoin((c) => c + 1)
    const base = Math.max(now, use.endsAt)
    return store.setEndsAt(machine.id, base + machine.defaultMinutes * 60000)
  }

  const progress = use ? Math.min(100, Math.max(0, ((now - use.startedAt) / (use.endsAt - use.startedAt)) * 100)) : 0
  const who = use ? (use.floor ? `Piso ${use.floor}` : 'Anónimo') : ''

  return (
    <motion.section
      layout
      className={`card ${status}`}
      initial={{ opacity: 0, y: 28, x: -6 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <header className="titlebar">
        <span>{machine.name}</span>
        <span className="who">{status === 'free' ? 'LIBRE' : status === 'done' ? 'TERMINÓ' : who}</span>
      </header>

      <div className="body">
        {/* .art = espacio de la ilustración. Reemplazá <Icon/> por tu ilustración animada. */}
        <div className="art">
          <Art running={status === 'busy'} progress={status === 'done' ? 100 : progress} position={machine.position} coin={coin} />
        </div>
        <div className="state">
          {status === 'free' && <b>Libre</b>}
          {status === 'busy' && <><small>Quedan</small><b className="time">{fmt(remaining)}</b></>}
          {status === 'done' && <><b>¡Listo!</b><small>Retirá la ropa</small></>}
        </div>

        {use && (
          <>
            <div className="bar"><motion.i animate={{ width: `${progress}%` }} transition={{ ease: 'linear', duration: 1 }} /></div>
            <p className="sub">Termina a las {clock(use.endsAt)}</p>
            {mine || done ? (
              <div className="row">
                {mine && <button className="btn" onClick={addFicha}>+ Ficha · {machine.defaultMinutes / 60} h</button>}
                <button className="btn dark" onClick={() => store.freeMachine(machine.id)}>
                  {done ? 'Retiré' : 'Terminé'}
                </button>
              </div>
            ) : (
              // Otro vecino la está usando: solo quien la inició puede sumar fichas o terminarla antes
              <p className="sub lock">La está usando {who}. Cuando termine el tiempo vas a poder usarla.</p>
            )}
          </>
        )}

        {status === 'free' && !asking && (
          <button className="btn dark wide" onClick={() => setAsking(true)}>
            Usar ahora → {machine.defaultMinutes / 60} h
          </button>
        )}

        {status === 'free' && asking && (
          <div className="ask">
            <label htmlFor={`f-${machine.id}`}>¿De qué piso / depto sos? (opcional)</label>
            <input
              id={`f-${machine.id}`}
              autoFocus
              value={floor}
              placeholder="Ej: 5B"
              maxLength={12}
              onChange={(e) => setFloor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && start()}
            />
            <div className="row">
              <button className="btn dark" onClick={start}>Empezar</button>
              <button className="btn" onClick={() => setAsking(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
