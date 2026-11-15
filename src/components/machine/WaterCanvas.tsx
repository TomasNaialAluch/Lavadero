import { useEffect, useRef } from 'react'

/*
  Agua 2D del lavarropas (olas con física + burbujas), en colores planos.
  Unidades: el vidrio es un círculo de radio 56 centrado en (0,0).
  mode 'full'    = olas + burbujas (respaldo cuando no hay WebGL)
  mode 'bubbles' = solo burbujas, por delante del agua WebGL
  La ropa flotante está en FloatingClothes.tsx.
*/
const R = 54
const N = 56
const LEVEL = 6 // nivel de reposo (y positivo = hacia abajo)

type Bubble = { x: number; y: number; r: number; vy: number; ph: number }

export default function WaterCanvas({ running, mode = 'full' }: { running: boolean; mode?: 'full' | 'bubbles' }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !running) return
    const ctx = canvas.getContext('2d')!

    const h = new Float32Array(N)
    const v = new Float32Array(N)
    const ld = new Float32Array(N)
    const rd = new Float32Array(N)
    const bubbles: Bubble[] = []
    let t = 0
    let acc = 0
    let last = performance.now()
    let nextBubble = 0.3
    let raf = 0

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(w * dpr)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    const colX = (i: number) => -R + (2 * R * i) / (N - 1)
    const surfaceAt = (x: number) => {
      if (mode !== 'full') return -46 // agua WebGL llena el tambor: las burbujas suben hasta arriba
      const f = ((x + R) / (2 * R)) * (N - 1)
      const i = Math.max(0, Math.min(N - 2, Math.floor(f)))
      const k = f - i
      return LEVEL - (h[i] * (1 - k) + h[i + 1] * k)
    }

    const step = () => {
      t += 1 / 60
      if (mode === 'full') {
        // el tambor se mece de lado a lado: empuja el agua
        const tilt = 0.5 * Math.sin(t * 1.7) + 0.25 * Math.sin(t * 0.9 + 1)
        for (let i = 0; i < N; i++) {
          v[i] += tilt * 0.36 * ((i - (N - 1) / 2) / (N / 2)) - 0.03 * h[i] - 0.018 * v[i]
          h[i] += v[i]
          if (h[i] > 14) h[i] = 14
          if (h[i] < -14) h[i] = -14
        }
        for (let p = 0; p < 3; p++) {
          for (let i = 0; i < N; i++) {
            if (i > 0) { ld[i] = 0.2 * (h[i] - h[i - 1]); v[i - 1] += ld[i] }
            if (i < N - 1) { rd[i] = 0.2 * (h[i] - h[i + 1]); v[i + 1] += rd[i] }
          }
          for (let i = 0; i < N; i++) {
            if (i > 0) h[i - 1] += ld[i]
            if (i < N - 1) h[i + 1] += rd[i]
          }
        }
        // gotitas al azar que generan ondas
        if (Math.random() < 0.02) v[Math.floor(Math.random() * N)] += (Math.random() - 0.3) * 2.4
      }

      nextBubble -= 1 / 60
      if (nextBubble <= 0) {
        nextBubble = 0.4 + Math.random() * 1.6
        const bx = -30 + Math.random() * 60
        bubbles.push({ x: bx, y: Math.min(44, Math.sqrt(R * R - bx * bx) - 4), r: 1.6 + Math.random() * 3, vy: 12 + Math.random() * 14, ph: Math.random() * 6 })
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.y -= b.vy / 60
        b.x += Math.sin(t * 3 + b.ph) * 0.12
        if (b.y < surfaceAt(b.x) + 1) bubbles.splice(i, 1)
      }
    }

    const wave = (offset: number, lag: number) => {
      const p = new Path2D()
      for (let i = 0; i < N; i++) {
        const j = Math.max(0, Math.min(N - 1, i + lag))
        const y = LEVEL + offset - h[j]
        i === 0 ? p.moveTo(colX(i), y) : p.lineTo(colX(i), y)
      }
      p.lineTo(R, 70); p.lineTo(-R, 70); p.closePath()
      return p
    }

    const drawWater = () => {
      // capa de atrás (más clara) y de adelante, algo transparentes para ver la ropa
      ctx.globalAlpha = 0.85
      ctx.fillStyle = '#5aa9ff'; ctx.fill(wave(-3.5, -6))
      ctx.globalAlpha = 0.9
      const front = wave(0, 0)
      ctx.fillStyle = '#2f8bff'; ctx.fill(front)
      ctx.globalAlpha = 1

      // remolino: corrientes girando dentro del agua
      ctx.save()
      ctx.clip(front)
      ctx.rotate(t * 0.8)
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'rgba(255,255,255,.28)'
      ;[[18, 0, 1.3], [30, 2.2, 1.0], [43, 4.1, 0.9], [24, 3.4, 0.8]].forEach(([r, a0, len], k) => {
        ctx.lineWidth = 3 - k * 0.4
        ctx.beginPath(); ctx.arc(0, 0, r, a0, a0 + len); ctx.stroke()
      })
      ctx.rotate(-t * 1.9)
      ctx.strokeStyle = 'rgba(31,111,224,.55)'
      ctx.lineWidth = 3
      ;[[36, 0.6, 0.9], [22, 3.5, 1.1]].forEach(([r, a0, len]) => { ctx.beginPath(); ctx.arc(0, 0, r, a0, a0 + len); ctx.stroke() })
      ctx.restore()

      // espuma en la superficie
      ctx.strokeStyle = '#bfe3ff'; ctx.lineWidth = 1.4; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let i = 0; i < N; i++) { const y = LEVEL - h[i]; i === 0 ? ctx.moveTo(colX(i), y) : ctx.lineTo(colX(i), y) }
      ctx.stroke()
    }

    const draw = () => {
      const S = canvas.width
      ctx.setTransform(S / 112, 0, 0, S / 112, S / 2, S / 2)
      ctx.clearRect(-56, -56, 112, 112)
      ctx.save()
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip()
      if (mode === 'full') drawWater()
      ctx.fillStyle = 'rgba(255,255,255,.9)'
      for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }

    const loop = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000)
      last = now
      while (acc >= 1 / 60) { step(); acc -= 1 / 60 }
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [running, mode])

  return <canvas ref={ref} className="water-canvas" aria-hidden="true" />
}
