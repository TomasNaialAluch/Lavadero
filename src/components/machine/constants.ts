/* Valores compartidos por las máquinas (lavarropas, secarropas, y las que vengan). */

/** Tamaño del dibujo (viewBox) */
export const VIEW = { w: 300, h: 340 }

/** Vidrio de la puerta, en coordenadas del viewBox */
export const PORTHOLE = { cx: 150, cy: 205, r: 56 }

/** Pantallita del panel (se usa como barra de progreso) */
export const DISPLAY = { x: 104, y: 34, w: 84, h: 22 }

export const COLORS = {
  body: '#f3f3f1',
  bodyShade: '#e4e4e1',
  panel: '#ececea',
  line: '#d2d2cf',
  door: '#fff',
  doorRing: '#d9d9d6',
  sky: '#bfe3ff',
  blue: '#2f8bff',
  blueDeep: '#1f6fe0',
  orange: '#ff8a3d',
  progress: '#3ddc84',
  heat: '#ff6a2b', // barra de progreso del secarropas (calor)
}
