// Íconos de la barra inferior (Inicio / Horarios / Reservas).
const tab = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinejoin: 'miter' as const }
export const HomeTab = () => (<svg {...tab}><path d="M3 11l9-8 9 8v10H3z" /></svg>)
export const ChartTab = () => (<svg {...tab}><path d="M4 20V11M10 20V4M16 20v-6M22 20H2" /></svg>)
export const CalTab = () => (<svg {...tab}><rect x="3" y="5" width="18" height="16" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>)
