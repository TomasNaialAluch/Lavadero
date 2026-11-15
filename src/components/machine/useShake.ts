import { useEffect, type RefObject } from 'react'

/*
  Temblor ocasional de la máquina, como cuando centrifuga con la carga mal repartida:
  se mece pesada de lado a lado, se inclina sobre la base y pega saltitos.
  Es lento y exagerado a propósito (más cómico que "celular vibrando").
  Mientras `active` sea true, cada tanto hace una tanda. Mueve el elemento directo (sin re-renderizar React).
*/
const DURATION = 3400 // ms por tanda
const FREQ = 2.4 // balanceos por segundo (bajo = pesado)

export function useShake(ref: RefObject<HTMLElement | null>, active: boolean, onChange?: (shaking: boolean) => void) {
  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const k = reduce ? 0.5 : 1
    const SWAY = 9 * k // px de lado a lado
    const HOP = 7 * k // px de salto
    const TILT = 3.2 * k // grados de inclinación
    let timer = 0
    let raf = 0

    el.style.transformOrigin = '50% 92%' // se inclina apoyada en la base

    const burst = () => {
      const t0 = performance.now()
      onChange?.(true)
      // cada balanceo tiene una fuerza distinta, para que no parezca un motor
      const strength = Array.from({ length: 12 }, () => 0.6 + Math.random() * 0.7)
      const frame = (now: number) => {
        const t = (now - t0) / 1000
        const p = (now - t0) / DURATION
        if (p >= 1) {
          el.style.transform = ''
          onChange?.(false)
          schedule()
          return
        }
        // arranca de golpe, se mantiene y se apaga despacio
        const env = p < 0.12 ? p / 0.12 : Math.pow(1 - (p - 0.12) / 0.88, 1.4)
        const phase = 2 * Math.PI * FREQ * t
        const s = strength[Math.min(strength.length - 1, Math.floor(t * FREQ))]
        const x = Math.sin(phase) * SWAY * env * s
        const tilt = Math.sin(phase) * TILT * env * s
        const hop = Math.abs(Math.sin(phase)) * HOP * env * s // rebota en cada extremo
        const squash = 1 - Math.abs(Math.sin(phase)) * 0.025 * env * s
        el.style.transform = `translate(${x.toFixed(2)}px, ${(-hop).toFixed(2)}px) rotate(${tilt.toFixed(2)}deg) scaleY(${squash.toFixed(3)})`
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    const schedule = (first = false) => {
      timer = window.setTimeout(burst, first ? 3000 + Math.random() * 3000 : 8000 + Math.random() * 9000)
    }
    schedule(true)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      el.style.transform = ''
      onChange?.(false)
    }
    // onChange viene de un setState (estable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active])
}
