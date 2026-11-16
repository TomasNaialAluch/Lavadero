import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GrillArt from '../components/GrillArt'
import { WasherMiniIcon } from '../components/Icons'
import { store } from '../store'
import { useSum } from '../hooks'
import { useUid } from '../identity'
import { SUM_TURNS, type SumTurn } from '../types'
import './sum.css'

/*
  SUM (salón de usos múltiples) con la parrilla incluida. Se reserva por día y turno,
  con hasta ~6 meses de anticipación. Se elige por semana: cada día es una fila grande con
  sus dos botones (Día / Noche), así se toca fácil y se ve de un vistazo qué está libre.
  Mismo estilo que las máquinas pero con otra paleta (brasa y dorado) y marcas propias.
*/
const WEEKS_AHEAD = 104 // las flechas llegan a 2 años; para ir más rápido está el botón "otra fecha"
const DAY_MS = 86400000
const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const turnName = (t: SumTurn) => SUM_TURNS.find((x) => x.id === t)!.name
const SHORT: Record<SumTurn, string> = { dia: 'Día', noche: 'Noche' }
const MONTH_NAME = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/**
 * Ventana (modal) para reservar con mucha anticipación: mes → día → turno, un paso por pantalla,
 * todo con botones grandes. Llega hasta 24 meses adelante.
 */
function FarDateModal({ today, bookingOf, onPick, onClose }: {
  today: Date
  bookingOf: (d: string, t: SumTurn) => unknown
  onPick: (day: string, turn: SumTurn) => void
  onClose: () => void
}) {
  const [month, setMonth] = useState<Date | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const todayKey = keyOf(today)

  // se cierra con la tecla Esc y la página de atrás no se desplaza
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const months = Array.from({ length: 24 }, (_, k) => new Date(today.getFullYear(), today.getMonth() + k, 1))
  const step = !month ? 1 : !day ? 2 : 3
  const daysInMonth = month ? new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() : 0

  return (
    <div className="sum-modal-bg" role="dialog" aria-modal="true" aria-label="Elegir una fecha más adelante" onClick={onClose}>
      <section className="card sum-modal" onClick={(e) => e.stopPropagation()}>
        <header className="titlebar">
          <span>Elegir fecha · paso {step} de 3</span>
        </header>
        <div className="body">
          {step === 1 && (
            <>
              <p className="lbl">¿En qué mes?</p>
              <div className="modal-grid two">
                {months.map((d) => (
                  <button key={keyOf(d)} className="sum-pick" onClick={() => setMonth(d)}>
                    <span>{MONTH_NAME[d.getMonth()]}</span>
                    <small>{d.getFullYear()}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && month && (
            <>
              <button className="sum-pick modal-back" onClick={() => setMonth(null)}>← Cambiar el mes</button>
              <p className="lbl">{MONTH_NAME[month.getMonth()]} {month.getFullYear()} · ¿Qué día?</p>
              <div className="modal-grid four">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = new Date(month.getFullYear(), month.getMonth(), i + 1)
                  const k = keyOf(date)
                  const full = bookingOf(k, 'dia') && bookingOf(k, 'noche')
                  return (
                    <button key={k} className="sum-pick" disabled={k < todayKey || !!full} onClick={() => setDay(k)}>
                      <small>{date.toLocaleDateString('es-AR', { weekday: 'short' })}</small>
                      <b>{i + 1}</b>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 3 && day && (
            <>
              <button className="sum-pick modal-back" onClick={() => setDay(null)}>← Cambiar el día</button>
              <p className="lbl">{parseKey(day).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ¿Qué turno?</p>
              <div className="sum-turns">
                {SUM_TURNS.map((tr) => {
                  const taken = !!bookingOf(day, tr.id)
                  return (
                    <button key={tr.id} className="sum-pick" disabled={taken} onClick={() => onPick(day, tr.id)}>
                      <span>{tr.name}</span>
                      <small>{taken ? 'Ya reservado' : tr.hours}</small>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <button className="big modal-close" onClick={onClose}>Cerrar sin elegir</button>
        </div>
      </section>
    </div>
  )
}

/** Ventana con botoncitos de Windows 98 en la barra de título */
function Win({ title, children, className = '', id }: { title: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card ${className}`}>
      <header className="titlebar">
        <span>{title}</span>
      </header>
      {children}
    </section>
  )
}

export default function Sum() {
  const all = useSum()
  const uid = useUid()
  const today = useMemo(() => {
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])
  const todayKey = keyOf(today)
  const tomorrowKey = keyOf(new Date(today.getTime() + DAY_MS))

  const [week, setWeek] = useState(0)
  const [far, setFar] = useState(false) // ventana para fechas lejanas
  const [sel, setSel] = useState<{ day: string; turn: SumTurn } | null>(null)
  const [floor, setFloor] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  // tema propio de esta sección (colores distintos al lavadero)
  useEffect(() => {
    document.documentElement.dataset.theme = 'sum'
    return () => { delete document.documentElement.dataset.theme }
  }, [])

  // los 7 días de la semana que se está mirando (la primera empieza hoy)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + week * 7)
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const mon = (d: Date) => d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  // "15 al 21 nov" cuando es el mismo mes; "29 nov al 5 dic" cuando cambia
  const range = days[0].getMonth() === days[6].getMonth()
    ? `${days[0].getDate()} al ${days[6].getDate()} ${mon(days[6])}`
    : `${days[0].getDate()}/${days[0].getMonth() + 1} al ${days[6].getDate()}/${days[6].getMonth() + 1}`

  // meses para saltar directo (el actual y los 5 siguientes), así no hay que tocar la flecha decenas de veces
  const months = Array.from({ length: 6 }, (_, k) => ({ k, date: new Date(today.getFullYear(), today.getMonth() + k, 1) }))
  const shown = days[3] // el mes de la mitad de la semana que se está mirando
  const goToMonth = (k: number) => {
    const first = new Date(today.getFullYear(), today.getMonth() + k, 1)
    setWeek(k === 0 ? 0 : Math.min(WEEKS_AHEAD, Math.max(0, Math.floor((first.getTime() - today.getTime()) / (7 * DAY_MS)))))
  }

  const bookingOf = (d: string, t: SumTurn) => all.find((b) => b.day === d && b.turn === t)

  // si alguien reserva justo lo que elegiste, se des-selecciona
  useEffect(() => {
    if (sel && bookingOf(sel.day, sel.turn)) setSel(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all])

  const dayWord = (k: string) =>
    k === todayKey ? 'hoy' : k === tomorrowKey ? 'mañana' : parseKey(k).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  const submit = async () => {
    if (!sel) return
    if (!floor.trim()) return setError('Falta poner tu piso o depto (es obligatorio para reservar el SUM).')
    setError('')
    try {
      await store.addSum({ day: sel.day, turn: sel.turn, floor: floor.trim() })
      setOk(`¡Listo! Reservaste el SUM con la parrilla ${dayWord(sel.day)}, ${turnName(sel.turn).toLowerCase()}. Recordá entregarlo ordenado y limpio.`)
      setSel(null)
      setTimeout(() => setOk(''), 7000)
    } catch {
      setError('No se pudo reservar: puede que otro vecino lo haya tomado justo antes. Probá con otro turno.')
    }
  }

  const upcoming = [...all].sort((a, b) => (a.day + a.turn).localeCompare(b.day + b.turn))
  const fmtDay = (d: string) => parseKey(d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <>
      <div className="sum-banner">Estás en el SUM · salón con parrilla</div>
      {/* botón para volver al lavadero: mismo estilo que el del SUM pero azul y con un lavarropas */}
      <div className="home-top left">
        <Link className="sum-link to-lav" to="/" aria-label="Volver al lavadero, lavarropas y secarropas">
          <WasherMiniIcon />
          <span className="txt">Lavadero<small>Lavarropas y secarropas</small></span>
        </Link>
      </div>

      <Win title="SUM.exe" className="sum-hero">
        <div className="body">
          <div className="art"><GrillArt /></div>
          <h1>SUM</h1>
          <p className="sub">Salón de usos múltiples con la parrilla incluida: se reserva todo junto, de día o de noche.</p>
        </div>
      </Win>

      {ok && <p className="ok-box" role="status">{ok}</p>}

      {far && (
        <FarDateModal
          today={today}
          bookingOf={bookingOf}
          onClose={() => setFar(false)}
          onPick={(d, t) => {
            // elige ese día y turno y muestra su semana, para que se vea en la lista
            setSel({ day: d, turn: t })
            setWeek(Math.max(0, Math.floor((parseKey(d).getTime() - today.getTime()) / (7 * DAY_MS))))
            setFar(false)
          }}
        />
      )}

      <Win title="Reservar el SUM" className="sum-form" id="sum-reservar">
        <div className="body">
          <p className="lbl">1 · Elegí el mes</p>
          <div className="sum-months">
            {months.map((mo) => {
              const on = mo.date.getMonth() === shown.getMonth() && mo.date.getFullYear() === shown.getFullYear()
              return (
                <button key={mo.k} className={`sum-pick ${on ? 'on' : ''}`} onClick={() => goToMonth(mo.k)}>
                  <span>{MONTH_NAME[mo.date.getMonth()]}</span>
                  {mo.date.getFullYear() !== today.getFullYear() && <small>{mo.date.getFullYear()}</small>}
                </button>
              )
            })}
          </div>

          <button className="sum-pick far-btn" onClick={() => setFar(true)}>Otra fecha, más adelante…</button>

          <p className="lbl">2 · Elegí la semana</p>
          <div className="sum-month-nav">
            <button className="sum-pick arrow" disabled={week === 0} onClick={() => setWeek(week - 1)} aria-label="Semana anterior">◀</button>
            <p className="month-name">{range}</p>
            <button className="sum-pick arrow" disabled={week >= WEEKS_AHEAD} onClick={() => setWeek(week + 1)} aria-label="Semana siguiente">▶</button>
          </div>

          <p className="lbl">3 · Tocá el día y el turno</p>
          <div className="sum-legend">
            <span><b>Día:</b> de la mañana hasta las 18 hs</span>
            <span><b>Noche:</b> desde las 20 hs hasta las 6 de la mañana</span>
          </div>
          <div className="sum-week">
            {days.map((d) => {
              const k = keyOf(d)
              return (
                <div key={k} className={`wk-row ${k === todayKey ? 'today' : ''}`}>
                  <div className="wk-day">
                    <small>{k === todayKey ? 'Hoy' : d.toLocaleDateString('es-AR', { weekday: 'short' })}</small>
                    <b>{d.getDate()}</b>
                  </div>
                  {SUM_TURNS.map((tr) => {
                    const b = bookingOf(k, tr.id)
                    const on = sel?.day === k && sel.turn === tr.id
                    return (
                      <button
                        key={tr.id}
                        className={`sum-pick wk-btn ${on ? 'on' : ''}`}
                        disabled={!!b}
                        onClick={() => setSel({ day: k, turn: tr.id })}
                        aria-label={`${dayWord(k)}, ${turnName(tr.id)}${b ? ', ya reservado' : ''}`}
                      >
                        <span>{SHORT[tr.id]}</span>
                        <small>{b ? 'Ocupado' : on ? 'Elegido' : 'Libre'}</small>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className="sum-finish">
            <p className="what">
              {sel ? <>SUM con parrilla, {dayWord(sel.day)}<br /><b>{turnName(sel.turn)}</b></> : 'Elegí el día y el turno.'}
            </p>
            <label className="floor-label" htmlFor="sum-floor">Tu piso o depto (obligatorio)</label>
            <input id="sum-floor" value={floor} placeholder="Ej: 5B" maxLength={12} required onChange={(e) => { setFloor(e.target.value); setError('') }} />
            <p className="sum-rule" role="note">
              <b>Importante:</b> al entregar el SUM, dejalo <b>ordenado y limpio</b>, incluida la parrilla. ¡Gracias por cuidarlo entre todos!
            </p>
            {error && <p className="error">{error}</p>}
            <button className="big" disabled={!sel || !floor.trim()} onClick={submit}>
              {!sel ? 'Falta elegir el día y turno' : !floor.trim() ? 'Falta poner tu piso' : 'Reservar'}
            </button>
          </div>
        </div>
      </Win>

      <Win title="Próximas reservas" className="sum-list-win" id="sum-lista">
        <div className="body">
          {upcoming.length === 0 && <p className="sub" style={{ margin: 0 }}>Todavía no hay reservas. ¡El SUM está libre!</p>}
          <ul className="list sum-list">
            {upcoming.map((b) => (
              <li key={b.id}>
                <div>
                  <b>{fmtDay(b.day)} · {turnName(b.turn)}</b>
                  <small>{b.floor}</small>
                </div>
                {uid !== null && b.owner === uid && (
                  <button className="btn small-del" onClick={() => confirm('¿Cancelar esta reserva del SUM?') && store.removeSum(b.id)}>Cancelar</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Win>
    </>
  )
}
