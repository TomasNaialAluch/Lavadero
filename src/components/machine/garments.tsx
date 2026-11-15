import type { ReactNode } from 'react'

/*
  Prendas en SVG plano. Cada una está dibujada alrededor de (0,0), en una caja de ~50×44 unidades.
  Reciben el color principal; los detalles usan negro/blanco con transparencia, así sirven con cualquier color.
  Para sumar una prenda: agregala a GARMENTS. FloatingClothes la usa sola.
*/
const SHADE = { fill: '#000', opacity: 0.14 }
const LIGHT = { fill: '#fff', opacity: 0.45 }

export interface Garment {
  name: string
  render: (c: string) => ReactNode
}

export const GARMENTS: Garment[] = [
  {
    name: 'remera',
    render: (c) => (<>
      <path d="M-16-12L-7-18Q0-11 7-18L16-12L24-2L15 3V20H-15V3L-24-2Z" fill={c} />
      <path d="M-7-18Q0-11 7-18Q0-8 -7-18Z" {...SHADE} />
      <rect x="-15" y="14" width="30" height="3" {...SHADE} />
    </>),
  },
  {
    name: 'remera manga larga',
    render: (c) => (<>
      <path d="M-13-16L-6-20Q0-13 6-20L13-16L26 10L19 13L13-2V20H-13V-2L-19 13L-26 10Z" fill={c} />
      <path d="M-6-20Q0-13 6-20Q0-10 -6-20Z" {...SHADE} />
      <rect x="-26" y="8" width="9" height="3" transform="rotate(-24 -26 8)" {...SHADE} />
    </>),
  },
  {
    name: 'media',
    render: (c) => (<>
      <path d="M-7-20H7V3L19 9C24 12 22 20 15 20H-5C-9 20-7 14-7 10Z" fill={c} />
      <rect x="-7" y="-20" width="14" height="5" {...LIGHT} />
      <path d="M-7 12C-7 17-4 20-5 20H3L-1 12Z" {...SHADE} />
    </>),
  },
  {
    name: 'toalla',
    render: (c) => (<>
      <rect x="-19" y="-12" width="38" height="24" rx="3" fill={c} />
      <rect x="-19" y="-6" width="38" height="3" {...LIGHT} />
      <rect x="-19" y="3" width="38" height="3" {...LIGHT} />
      <rect x="-19" y="8" width="38" height="4" rx="2" {...SHADE} />
    </>),
  },
  {
    name: 'short',
    render: (c) => (<>
      <path d="M-16-14H16L18 6H4L0-2L-4 6H-18Z" fill={c} />
      <rect x="-16" y="-14" width="32" height="5" {...SHADE} />
      <path d="M0-2L4 6H0Z" {...SHADE} />
    </>),
  },
  {
    name: 'pantalón',
    render: (c) => (<>
      <path d="M-10-22H10L12 22H3L0-4L-3 22H-12Z" fill={c} />
      <rect x="-10" y="-22" width="20" height="5" {...SHADE} />
      <rect x="-12" y="17" width="9" height="5" {...LIGHT} />
      <rect x="3" y="17" width="9" height="5" {...LIGHT} />
    </>),
  },
  {
    name: 'buzo',
    render: (c) => (<>
      <path d="M-14-16L-6-20Q0-14 6-20L14-16L26 8L19 12L14 0V20H-14V0L-19 12L-26 8Z" fill={c} />
      <path d="M-6-20Q0-14 6-20L5-16Q0-11-5-16Z" {...SHADE} />
      <rect x="-14" y="15" width="28" height="5" {...SHADE} />
    </>),
  },
  {
    name: 'gorro',
    render: (c) => (<>
      <path d="M-14 8Q-14-16 0-16Q14-16 14 8Z" fill={c} />
      <rect x="-15" y="8" width="30" height="9" rx="3" fill={c} />
      <circle cx="0" cy="-18" r="5" fill="#fff" />
      <path d="M-8 8V17M0 8V17M8 8V17" stroke="#000" strokeOpacity=".15" strokeWidth="2" />
    </>),
  },
  {
    name: 'bufanda',
    render: (c) => (<>
      <rect x="-23" y="-6" width="46" height="12" rx="5" fill={c} />
      <rect x="-14" y="-6" width="5" height="12" {...LIGHT} />
      <rect x="2" y="-6" width="5" height="12" {...LIGHT} />
      <path d="M-22 6v8M-18 6v10M-14 6v8M14 6v8M18 6v10M22 6v8" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </>),
  },
  {
    name: 'guante',
    render: (c) => (<>
      <path d="M-8 20V-2Q-8-14 0-14Q8-14 8-2V20Z" fill={c} />
      <path d="M8 4Q18 0 16 10Q14 14 8 12Z" fill={c} />
      <rect x="-9" y="13" width="18" height="8" rx="2" {...SHADE} />
    </>),
  },
  {
    name: 'boxer',
    render: (c) => (<>
      <path d="M-16-10H16V-4L14 14H3L0 4L-3 14H-14L-16-4Z" fill={c} />
      <rect x="-16" y="-10" width="32" height="4" {...SHADE} />
    </>),
  },
  {
    name: 'vestido',
    render: (c) => (<>
      <path d="M-6-20H6L8-10L17 20H-17L-8-10Z" fill={c} />
      <rect x="-8" y="-11" width="16" height="3" {...SHADE} />
      <path d="M-17 20H17L16 16H-16Z" {...LIGHT} />
    </>),
  },
  {
    name: 'camisa',
    render: (c) => (<>
      <path d="M-16-12L-7-18L0-10L7-18L16-12L24-2L15 3V20H-15V3L-24-2Z" fill={c} />
      <path d="M-7-18L0-10L7-18L3-19L0-14L-3-19Z" fill="#fff" opacity=".9" />
      <path d="M0-10V20" stroke="#000" strokeOpacity=".16" strokeWidth="1.5" />
      <circle cx="0" cy="-3" r="1.3" fill="#fff" /><circle cx="0" cy="5" r="1.3" fill="#fff" /><circle cx="0" cy="13" r="1.3" fill="#fff" />
    </>),
  },
]

/** Colores de la paleta de la app para pintar las prendas */
export const CLOTH_COLORS = ['#ff8a3d', '#2f8bff', '#ffffff', '#bfe3ff', '#ffd23f', '#ff6b9a', '#3ddc84']
