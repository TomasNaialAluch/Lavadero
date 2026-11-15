import Machine from './machine/Machine'
import { COLORS, PORTHOLE } from './machine/constants'

// nubes de vapor dentro del tambor: posición, tamaño, desfase y deriva horizontal
const STEAM = [
  { cx: 128, cy: 232, rx: 26, ry: 11, delay: 0, sx: 8 },
  { cx: 176, cy: 238, rx: 22, ry: 9, delay: 1.2, sx: -10 },
  { cx: 150, cy: 226, rx: 30, ry: 12, delay: 2.4, sx: 6 },
  { cx: 112, cy: 214, rx: 18, ry: 8, delay: 3.4, sx: 10 },
  { cx: 188, cy: 220, rx: 20, ry: 9, delay: 0.6, sx: -6 },
]

/**
 * Secarropas: la carcasa común + fondo claro con vapor + ropa que gira dentro del vidrio.
 * El del edificio es un 2 en 1 (uno arriba y otro abajo, pegados): `position` dice cuál de los dos es,
 * y se dibuja una flechita hacia el otro. Cuando tiembla, sale vapor por la puerta.
 */
export default function Dryer({ running, progress, position, coin }: { running: boolean; progress?: number; position?: 'top' | 'bottom'; coin?: number }) {
  const connect = position === 'top' ? 'below' : position === 'bottom' ? 'above' : undefined
  return (
    <Machine glass="#b9d9ee" progress={progress} connect={connect} coin={coin} variant="dryer" shakes={running} steamOnShake progressColor={COLORS.heat}>
      <defs>
        <clipPath id="vapor-clip"><circle cx={PORTHOLE.cx} cy={PORTHOLE.cy} r={PORTHOLE.r} /></clipPath>
        <filter id="vapor-blur" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      <circle id="vidrio" cx={PORTHOLE.cx} cy={PORTHOLE.cy} r={PORTHOLE.r} fill="#cfe7f5" />
      {running && (
        <g clipPath="url(#vapor-clip)">
          <g id="ropa" className="tumble">
            <path d="M-18-14L-8-20Q0-13 8-20L18-14L25-2L15 3V24H-15V3L-25-2Z" fill={COLORS.orange} transform="translate(130 192)" />
            <g transform="translate(176 184) rotate(25)">
              <rect x="-7" y="-16" width="14" height="24" rx="3" fill={COLORS.blue} />
              <path d="M-7 4h14v6a7 7 0 0 1-14 0z" fill={COLORS.blueDeep} />
            </g>
            <rect x="-16" y="-10" width="34" height="22" rx="4" fill={COLORS.sky} transform="translate(158 232) rotate(-18)" />
            <rect x="-16" y="-10" width="34" height="5" rx="2" fill="#fff" transform="translate(158 232) rotate(-18)" />
          </g>
          {/* vapor suave por delante de la ropa */}
          <g filter="url(#vapor-blur)">
            {STEAM.map((s, i) => (
              <ellipse
                key={i}
                className="steam"
                cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
                fill="#fff"
                style={{ animationDelay: `${s.delay}s`, ['--sx' as string]: `${s.sx}px`, opacity: 0 }}
              />
            ))}
          </g>
        </g>
      )}
    </Machine>
  )
}
