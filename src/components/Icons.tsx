// Ícono de parrilla (botoncito del SUM): cajón, rejilla, patas y una llama.
export const GrillIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2c1 2.4-1.4 3.2-.4 5.2c.7 1.4 2.6.6 2.4-1.2c1.6 1.2 2.6 3.2 1.4 5.2" stroke="#ffd23f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12h18l-2.5 6h-13Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 18l-1 4M17 18l1 4" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

// Ícono de lavarropas (botoncito para volver al lavadero): cuerpo, panel y puerta redonda.
export const WasherMiniIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="2.5" width="17" height="19" rx="2" fill="#fff" stroke="#111" strokeWidth="1.6" />
    <path d="M3.5 7.5h17" stroke="#111" strokeWidth="1.6" />
    <circle cx="7" cy="5" r="1" fill="#111" /><circle cx="10" cy="5" r="1" fill="#111" />
    <circle cx="12" cy="14.5" r="4.6" fill="#bfe3ff" stroke="#111" strokeWidth="1.6" />
    <path d="M9.6 14.8c1.2-1 2.4 1 4.8 0" stroke="#2f8bff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// Íconos de la barra inferior del SUM (Lavadero / Reservar / Reservas del SUM).
const tabSum = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinejoin: 'miter' as const }
export const WasherTab = () => (<svg {...tabSum}><rect x="4" y="2.5" width="16" height="19" /><path d="M4 7.5h16" /><circle cx="12" cy="14.5" r="4.2" /></svg>)
export const ListTab = () => (<svg {...tabSum}><path d="M8 6h13M8 12h13M8 18h13M3 6h.5M3 12h.5M3 18h.5" /></svg>)

// Íconos de la barra inferior (Inicio / Horarios / Reservas).
const tab = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinejoin: 'miter' as const }
export const HomeTab = () => (<svg {...tab}><path d="M3 11l9-8 9 8v10H3z" /></svg>)
export const ChartTab = () => (<svg {...tab}><path d="M4 20V11M10 20V4M16 20v-6M22 20H2" /></svg>)
export const CalTab = () => (<svg {...tab}><rect x="3" y="5" width="18" height="16" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>)
