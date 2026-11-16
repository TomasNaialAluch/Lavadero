import { Link } from 'react-router-dom'
import MachineCard from '../components/MachineCard'
import { GrillIcon } from '../components/Icons'
import '../pages/sum.css'
import { useMachines } from '../hooks'
import { MACHINES } from '../types'

export default function Home() {
  const state = useMachines()
  return (
    <>
      {/* botoncito hacia el SUM (salón con parrilla) */}
      <div className="home-top">
        <Link className="sum-link" to="/sum" aria-label="Ir al SUM, salón con parrilla">
          <GrillIcon />
          <span className="txt">SUM<small>Salón con parrilla</small></span>
        </Link>
      </div>
      {MACHINES.map((m) => (
        <MachineCard key={m.id} machine={m} use={state[m.id]} />
      ))}
    </>
  )
}
