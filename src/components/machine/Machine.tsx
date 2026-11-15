import { useRef, useState, type ReactNode } from 'react'
import { COLORS, DISPLAY, PORTHOLE, VIEW } from './constants'
import { useShake } from './useShake'
import './machine.css'

interface MachineProps {
  /** Color del vidrio de la puerta (el "fondo" del tambor) */
  glass: string
  /** Se dibuja dentro del vidrio, como parte del SVG (ej. la ropa del secarropas) */
  children?: ReactNode
  /** Capas extra encima del SVG, alineadas con el vidrio (ej. canvas de agua) */
  overlay?: ReactNode
  /** 0–100. Llena de verde la pantallita del panel, de izquierda a derecha */
  progress?: number
  /** Si es true, de vez en cuando la máquina tiembla (centrifugado) */
  shakes?: boolean
  /**
   * Equipos apilados (2 en 1): hay otro módulo pegado 'above' (arriba) o 'below' (abajo).
   * Se dibuja un pedazo del vecino, apagado, con una flechita que indica hacia dónde sigue.
   */
  connect?: 'above' | 'below'
  /** Contador de fichas: cada vez que sube, cae una ficha plateada a la ranura (estilo arcade) */
  coin?: number
  /** Tipo de panel: el lavarropas tiene cajón y perilla; el secarropas solo 3 botones de intensidad */
  variant?: 'washer' | 'dryer'
  /** Si es true, mientras la máquina tiembla sale vapor por el borde de la puerta */
  steamOnShake?: boolean
  /** Color de la barra de progreso de la pantallita (verde por defecto; naranja = calor en el secarropas) */
  progressColor?: string
}

/** Bocanada de vapor (3 circulitos) que sube y se desvanece */
function Puff({ x, y, delay, dx = 0 }: { x: number; y: number; delay: number; dx?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="puff" style={{ animationDelay: `${delay}s`, ['--dx' as string]: `${dx}px` }}>
        <circle cx="-5" cy="2" r="7" />
        <circle cx="4" cy="-2" r="9" />
        <circle cx="0" cy="-8" r="6" />
      </g>
    </g>
  )
}

const EXT = 48 // alto del pedazo de vecino que se asoma
const SEAM_BELOW = 306 // donde termina este módulo cuando el vecino está abajo
const SEAM_ABOVE = 12 // donde empieza este módulo cuando el vecino está arriba

/** Flechita que apunta hacia donde sigue el equipo */
function Arrow({ y, dir }: { y: number; dir: 'up' | 'down' }) {
  const d = dir === 'down' ? 'M-13 -5L0 8L13 -5' : 'M-13 5L0 -8L13 5'
  return (
    <g transform={`translate(150 ${y})`}>
      <path d={d} fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

/**
 * Carcasa común de todas las máquinas: cuerpo, panel con barra de progreso, puerta y reflejo.
 * Lavarropas y secarropas la reutilizan y solo cambian lo que va dentro del vidrio.
 */
export default function Machine({ glass, children, overlay, progress = 0, shakes = false, connect, coin = 0, variant = 'washer', steamOnShake = false, progressColor = COLORS.progress }: MachineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shaking, setShaking] = useState(false)
  useShake(ref, shakes, setShaking)
  const pct = Math.max(0, Math.min(100, progress))
  const { x, y, w, h } = DISPLAY

  // el dibujo crece hacia donde se asoma el vecino
  const top = connect === 'above' ? -EXT + 16 : 0
  const bottom = connect === 'below' ? SEAM_BELOW + EXT : VIEW.h
  const viewBox = `0 ${top} ${VIEW.w} ${bottom - top}`

  return (
    <div className="art-wrap" ref={ref}>
      <svg className="art-svg" viewBox={viewBox} role="img" aria-hidden="true">
        {connect !== 'below' && <ellipse id="sombra" cx="150" cy="324" rx="124" ry="11" fill="#111" opacity=".12" />}

        {/* módulo vecino (apagado) */}
        {connect === 'above' && (
          <g id="vecino-arriba" opacity=".6">
            <rect x="24" y={top} width="252" height={SEAM_ABOVE - top} fill={COLORS.body} />
            <rect x="244" y={top} width="32" height={SEAM_ABOVE - top} fill={COLORS.bodyShade} />
            <rect x="24" y={SEAM_ABOVE - 14} width="252" height="14" fill={COLORS.bodyShade} />
          </g>
        )}

        <g id="cuerpo">
          <rect x="24" y="16" width="252" height="300" rx="16" fill={COLORS.body} />
          <rect x="244" y="16" width="32" height="300" rx="16" fill={COLORS.bodyShade} />
          {connect !== 'above' && <rect x="24" y="16" width="252" height="6" rx="3" fill="#fff" />}
          {connect !== 'below' && (
            <>
              <rect x="24" y="294" width="252" height="22" rx="10" fill={COLORS.bodyShade} />
              <rect x="24" y="294" width="252" height="2" fill={COLORS.line} />
            </>
          )}
          {/* esquinas rectas del lado donde está pegado el vecino */}
          {connect === 'above' && (
            <>
              <rect x="24" y={SEAM_ABOVE} width="252" height="20" fill={COLORS.body} />
              <rect x="244" y={SEAM_ABOVE} width="32" height="20" fill={COLORS.bodyShade} />
            </>
          )}
        </g>

        <g id="panel">
          <rect x="24" y="22" width="252" height="52" fill={COLORS.panel} />
          <rect x="24" y="72" width="252" height="2.5" fill={COLORS.line} />
          {/* ranura de fichas (en el lavarropas sobre el cajón; en el secarropas, una plaquita de monedero) */}
          {variant === 'dryer'
            ? <rect x="52" y="35" width="34" height="20" rx="4" fill="#bdbdba" />
            : <rect x="46" y="38" width="46" height="14" rx="5" fill="#cfcfcc" />}
          <rect id="ranura" x="57" y="43.5" width="24" height="4" rx="2" fill="#2b2b2b" />
          {/* pantallita = barra de progreso */}
          <clipPath id="pantalla"><rect x={x} y={y} width={w} height={h} rx="3" /></clipPath>
          <rect x={x} y={y} width={w} height={h} rx="3" fill="#6bb0e0" />
          <g clipPath="url(#pantalla)">
            <rect className="progress-fill" x={x} y={y} height={h} fill={progressColor} style={{ width: `${(w * pct) / 100}px` }} />
          </g>
          <rect x="110" y="40" width="40" height="5" rx="2" fill="#fff" opacity=".55" />
          {variant === 'dryer' ? (
            // 3 botones de intensidad (1, 2 y 3 puntitos)
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${210 + i * 26} 46)`}>
                <circle r="9" fill={i === 1 ? COLORS.sky : '#fff'} stroke={COLORS.line} strokeWidth="2" />
                {Array.from({ length: i + 1 }, (_, d) => (
                  <circle key={d} cx={(d - i / 2) * 4.6} cy="0" r="1.7" fill="#6f6f6b" />
                ))}
              </g>
            ))
          ) : (
            <>
              <circle cx="236" cy="46" r="15" fill="#fff" stroke={COLORS.line} strokeWidth="2" />
              <rect x="234.5" y="34" width="3" height="11" rx="1.5" fill="#8a8a86" />
            </>
          )}
        </g>
        <g id="puerta">
          <circle cx={PORTHOLE.cx} cy="210" r="94" fill="#dededb" />
          <circle cx={PORTHOLE.cx} cy={PORTHOLE.cy} r="94" fill={COLORS.door} />
          <circle cx={PORTHOLE.cx} cy={PORTHOLE.cy} r="72" fill={COLORS.doorRing} />
          <circle cx={PORTHOLE.cx} cy={PORTHOLE.cy} r="62" fill={glass} />
        </g>
        {children}

        {/* módulo vecino de abajo: la parte de arriba del otro secarropas */}
        {connect === 'below' && (
          <g id="vecino-abajo">
            <g opacity=".6">
              <rect x="24" y={SEAM_BELOW} width="252" height={EXT} fill={COLORS.panel} />
              <rect x="244" y={SEAM_BELOW} width="32" height={EXT} fill={COLORS.bodyShade} />
            </g>
            <rect x="24" y={SEAM_BELOW - 2} width="252" height="4" fill={COLORS.line} />
          </g>
        )}
        {connect === 'above' && <rect x="24" y={SEAM_ABOVE - 2} width="252" height="4" fill={COLORS.line} />}
        {connect === 'below' && <Arrow y={SEAM_BELOW + EXT / 2 + 2} dir="down" />}
        {connect === 'above' && <Arrow y={top + (SEAM_ABOVE - top) / 2 - 2} dir="up" />}

        {/* vapor que escapa por el borde de la puerta mientras tiembla */}
        {steamOnShake && shaking && (
          <g id="vapor">
            <Puff x={62} y={196} delay={0} dx={-14} />
            <Puff x={72} y={140} delay={0.5} dx={-10} />
            <Puff x={238} y={196} delay={0.2} dx={14} />
            <Puff x={228} y={140} delay={0.7} dx={10} />
            <Puff x={118} y={112} delay={0.35} dx={-4} />
            <Puff x={182} y={112} delay={0.9} dx={4} />
            <Puff x={96} y={294} delay={0.6} dx={-10} />
            <Puff x={204} y={294} delay={0.1} dx={10} />
          </g>
        )}

        {/* ficha plateada que cae y entra en la ranura (se repite cada vez que cambia `coin`) */}
        {coin > 0 && (
          <g key={coin} id="ficha">
            <rect className="coin-flash" x="55" y="42" width="28" height="7" rx="3.5" fill="#ffd23f" />
            <g className="coin-drop" transform="translate(69 45)">
              <g className="coin-spin">
                <circle r="10" fill="#d9dde3" stroke="#7d848e" strokeWidth="2" />
                <circle r="6.5" fill="none" stroke="#aab1bb" strokeWidth="1.5" />
                <path d="M-6-3.5A7 7 0 0 1 2-6.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <rect x="-1.2" y="-3.5" width="2.4" height="7" rx="1" fill="#aab1bb" />
              </g>
            </g>
          </g>
        )}
      </svg>
      {overlay}
      {/* reflejo del vidrio, por encima de todo */}
      <svg className="art-svg art-over" viewBox={viewBox} aria-hidden="true">
        <g id="reflejo">
          <path d="M112 182c4-14 18-22 32-22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".6" />
          <circle cx="106" cy="198" r="3.5" fill="#fff" opacity=".5" />
        </g>
      </svg>
    </div>
  )
}
