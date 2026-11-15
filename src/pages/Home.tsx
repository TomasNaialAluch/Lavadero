import MachineCard from '../components/MachineCard'
import { useMachines } from '../hooks'
import { MACHINES } from '../types'

export default function Home() {
  const state = useMachines()
  return (
    <>
      {MACHINES.map((m) => (
        <MachineCard key={m.id} machine={m} use={state[m.id]} />
      ))}
    </>
  )
}
