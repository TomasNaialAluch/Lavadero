import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useLogs } from '../hooks'
import type { MachineId } from '../types'

type Filter = 'all' | 'wash' | 'dry'
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function Stats() {
  const logs = useLogs()
  const [filter, setFilter] = useState<Filter>('all')

  const { byHour, byDay, quiet, total } = useMemo(() => {
    const isWash = (m: MachineId) => m === 'lavarropas'
    const rows = logs.filter((l) => filter === 'all' || (filter === 'wash') === isWash(l.machine))
    const byHour = Array.from({ length: 24 }, (_, h) => ({ label: `${h}h`, n: 0 }))
    const byDay = DAYS.map((d) => ({ label: d, n: 0 }))
    rows.forEach((l) => {
      const d = new Date(l.startedAt)
      byHour[d.getHours()].n++
      byDay[d.getDay()].n++
    })
    // Horarios "razonables" (8 a 22) con menos uso.
    const quiet = byHour
      .slice(8, 23)
      .sort((a, b) => a.n - b.n)
      .slice(0, 3)
      .sort((a, b) => parseInt(a.label) - parseInt(b.label))
      .map((h) => h.label)
    return { byHour, byDay, quiet, total: rows.length }
  }, [logs, filter])

  const maxH = Math.max(...byHour.map((h) => h.n))
  const maxD = Math.max(...byDay.map((h) => h.n))

  return (
    <>
      <h1>¿Cuándo<br />conviene lavar?</h1>
      <p className="sub">Uso anónimo de los últimos 60 días ({total} usos).</p>

      <div className="seg">
        {([['all', 'Todo'], ['wash', 'Lavarropas'], ['dry', 'Secarropas']] as const).map(([k, t]) => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{t}</button>
        ))}
      </div>

      <section className="card">
        <h2>Mejores horarios</h2>
        <p className="best">{total ? quiet.join(' · ') : 'Todavía no hay datos'}</p>
        <p className="sub">Los horarios con menos gente (entre las 8 y las 22).</p>
      </section>

      <section className="card">
        <h2>Por hora del día</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byHour} margin={{ left: -24, right: 4 }}>
            <CartesianGrid vertical={false} stroke="#111" strokeOpacity={0.15} />
            <XAxis dataKey="label" interval={2} tick={{ fontSize: 13, fill: '#111' }} stroke="#111" />
            <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#111' }} stroke="#111" />
            <Tooltip cursor={{ fill: '#bfe3ff' }} contentStyle={{ borderRadius: 6, border: '2px solid #111', fontFamily: 'Space Grotesk', boxShadow: '3px 3px 0 #111' }} formatter={(v) => [`${v} usos`, '']} />
            <Bar dataKey="n" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out">
              {byHour.map((h, i) => (
                <Cell key={i} stroke="#111" strokeWidth={2} fill={h.n === maxH && maxH > 0 ? '#ff8a3d' : '#2f8bff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="sub">En naranja, la hora más concurrida.</p>
      </section>

      <section className="card">
        <h2>Por día de la semana</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDay} margin={{ left: -24, right: 4 }}>
            <CartesianGrid vertical={false} stroke="#111" strokeOpacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#111' }} stroke="#111" />
            <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#111' }} stroke="#111" />
            <Tooltip cursor={{ fill: '#bfe3ff' }} contentStyle={{ borderRadius: 6, border: '2px solid #111', fontFamily: 'Space Grotesk', boxShadow: '3px 3px 0 #111' }} formatter={(v) => [`${v} usos`, '']} />
            <Bar dataKey="n" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out">
              {byDay.map((h, i) => (
                <Cell key={i} stroke="#111" strokeWidth={2} fill={h.n === maxD && maxD > 0 ? '#ff8a3d' : '#2f8bff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>
    </>
  )
}
