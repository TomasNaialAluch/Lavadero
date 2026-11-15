import { useCallback, useState } from 'react'
import FloatingClothes from './FloatingClothes'
import WaterCanvas from './WaterCanvas'
import WaterGL from './WaterGL'

// Si ya falló WebGL una vez en este dispositivo, no se vuelve a intentar.
let glBroken = false

/**
 * Interior del tambor. La ropa va detrás del agua (semitransparente) y las burbujas por delante.
 * Agua = remolino WebGL; si WebGL no existe o va lento, cambia sola a la versión 2D de olas.
 */
export default function Water() {
  const [fail, setFail] = useState(glBroken)
  const onFail = useCallback(() => { glBroken = true; setFail(true) }, [])
  if (fail) return (<><FloatingClothes /><WaterCanvas running mode="full" /></>)
  return (
    <>
      <FloatingClothes />
      <WaterGL onFail={onFail} />
      <WaterCanvas running mode="bubbles" />
    </>
  )
}
