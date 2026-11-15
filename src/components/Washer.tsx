import Machine from './machine/Machine'
import Water from './machine/Water'
import { PORTHOLE } from './machine/constants'

/** Lavarropas: la carcasa común + el agua en remolino dentro del vidrio. */
export default function Washer({ running, progress, coin }: { running: boolean; progress?: number; coin?: number }) {
  return (
    <Machine glass="#7fbbe6" progress={progress} coin={coin} shakes={running} overlay={running ? <Water /> : null}>
      <circle id="vidrio" cx={PORTHOLE.cx} cy={PORTHOLE.cy} r={PORTHOLE.r} fill="#8cc4ea" />
    </Machine>
  )
}
