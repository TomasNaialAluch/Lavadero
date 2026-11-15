import { useEffect, useRef, useState } from 'react'
import { CLOTH_COLORS, GARMENTS } from './garments'

/*
  Ropa flotando dentro del tambor, con perspectiva:
  - z = 0 es el fondo (chica, cerca del centro, más transparente)
  - z = 1 es el frente (grande, más hacia el borde, opaca)
  Cada prenda viene del fondo y se acerca, o se va hacia el fondo, o hace las dos cosas.
  Va detrás del agua (que es semitransparente).
*/
const MAX_ITEMS = 4
const R = 54

type Path = 'approach' | 'retreat' | 'pass'
interface Item {
  id: number
  garment: number
  color: string
  path: Path
  life: number
  born: number
  angle0: number
  spin: number // vueltas alrededor del centro (rad/s)
  orbit: number // radio máximo de la órbita
  rot0: number
  vr: number // giro propio (rad/s)
  phase: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const ease = (p: number) => p * p * (3 - 2 * p)

function zAt(path: Path, p: number) {
  if (path === 'approach') return 0.08 + 0.85 * ease(p)
  if (path === 'retreat') return 0.93 - 0.85 * ease(p)
  return 0.08 + 0.85 * Math.sin(Math.PI * p) // viene, llega al frente y vuelve al fondo
}

let nextId = 1
function makeItem(now: number, lastGarment: number): Item {
  let garment = Math.floor(Math.random() * GARMENTS.length)
  if (garment === lastGarment) garment = (garment + 1) % GARMENTS.length
  const paths: Path[] = ['approach', 'retreat', 'pass', 'pass']
  return {
    id: nextId++, garment,
    color: CLOTH_COLORS[Math.floor(Math.random() * CLOTH_COLORS.length)],
    path: paths[Math.floor(Math.random() * paths.length)],
    life: rand(5, 9), born: now,
    angle0: rand(0, Math.PI * 2),
    spin: rand(0.25, 0.6) * (Math.random() < 0.5 ? -1 : 1),
    orbit: rand(24, 42),
    rot0: rand(0, Math.PI * 2),
    vr: rand(-1.2, 1.2),
    phase: rand(0, 6),
  }
}

export default function FloatingClothes() {
  const [items, setItems] = useState<Item[]>([])
  const nodes = useRef(new Map<number, SVGGElement>())
  const layer = useRef<SVGGElement>(null)
  const itemsRef = useRef<Item[]>([])
  itemsRef.current = items

  useEffect(() => {
    let raf = 0
    let nextSpawn = performance.now() + 300
    let lastGarment = -1
    const t0 = performance.now()

    const spawn = (now: number) => {
      const it = makeItem(now, lastGarment)
      lastGarment = it.garment
      setItems((prev) => [...prev, it])
    }

    const loop = (now: number) => {
      const current = itemsRef.current
      if (now >= nextSpawn && current.length < MAX_ITEMS) {
        spawn(now)
        nextSpawn = now + rand(1200, 2800)
      }
      const alive: Item[] = []
      const frame: { el: SVGGElement; z: number }[] = []
      for (const it of current) {
        const age = (now - it.born) / 1000
        if (age >= it.life) continue
        alive.push(it)
        const el = nodes.current.get(it.id)
        if (!el) continue
        const p = age / it.life
        const z = zAt(it.path, p)
        const ang = it.angle0 + it.spin * age
        const radius = it.orbit * (0.2 + 0.8 * z) // lejos = cerca del centro, cerca = hacia el borde
        const bob = Math.sin((now - t0) / 700 + it.phase) * 2.5
        const x = Math.cos(ang) * radius
        const y = Math.sin(ang) * radius + bob
        const scale = 0.3 + z * 0.95
        const fade = Math.min(1, age / 0.8, (it.life - age) / 0.8)
        const alpha = Math.max(0, fade) * (0.45 + 0.55 * z)
        const rot = ((it.rot0 + it.vr * age) * 180) / Math.PI
        el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(3)})`)
        el.setAttribute('opacity', alpha.toFixed(3))
        frame.push({ el, z })
      }
      // las prendas del fondo se dibujan detrás de las del frente
      frame.sort((a, b) => a.z - b.z)
      const parent = layer.current
      if (parent) frame.forEach(({ el }, i) => { if (parent.children[i] !== el) parent.appendChild(el) })
      if (alive.length !== current.length) setItems(alive)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg className="porthole-layer" viewBox="-56 -56 112 112" aria-hidden="true">
      <defs><clipPath id="clothes-clip"><circle r={R} /></clipPath></defs>
      <g clipPath="url(#clothes-clip)" ref={layer}>
        {items.map((it) => (
          <g
            key={it.id}
            opacity="0"
            ref={(el) => { if (el) nodes.current.set(it.id, el); else nodes.current.delete(it.id) }}
          >
            {GARMENTS[it.garment].render(it.color)}
          </g>
        ))}
      </g>
    </svg>
  )
}
