/* Parrilla ilustrada (plana, como las máquinas): llamas que titilan y humo que sube. */
export default function GrillArt() {
  return (
    <svg className="grill-art" viewBox="0 0 300 230" role="img" aria-label="Parrilla" >
      <ellipse cx="150" cy="218" rx="112" ry="9" fill="#000" opacity=".14" />

      {/* humo */}
      <g id="humo" className="smoke" fill="#fff" stroke="#e7c9a0" strokeWidth="2">
        <circle className="s1" cx="120" cy="40" r="11" />
        <circle className="s2" cx="156" cy="34" r="14" />
        <circle className="s3" cx="190" cy="42" r="10" />
      </g>

      {/* patas y ruedita */}
      <g id="patas">
        <rect x="74" y="150" width="11" height="58" fill="#2b2623" />
        <rect x="215" y="150" width="11" height="58" fill="#2b2623" />
        <circle cx="224" cy="208" r="8" fill="#2b2623" /><circle cx="224" cy="208" r="3" fill="#8a817c" />
        <rect x="64" y="204" width="32" height="6" rx="3" fill="#2b2623" />
      </g>

      {/* llamas (detrás de la comida) */}
      <g id="llamas">
        <path className="flame f1" d="M70 100C62 86 74 78 72 62C84 72 92 86 86 100Z" fill="#ff7a1a" />
        <path className="flame f2" d="M104 100C92 84 110 74 106 54C122 66 128 84 120 100Z" fill="#ff7a1a" />
        <path className="flame f3" d="M146 100C134 82 154 70 148 48C168 62 172 84 162 100Z" fill="#ff7a1a" />
        <path className="flame f4" d="M190 100C180 86 196 76 192 58C206 70 212 86 204 100Z" fill="#ff7a1a" />
        <path className="flame f5" d="M222 100C216 88 226 82 224 68C234 76 238 90 232 100Z" fill="#ff7a1a" />
        <path className="flame f2" d="M112 100C106 90 116 84 114 72C122 80 126 92 120 100Z" fill="#ffd23f" />
        <path className="flame f3" d="M153 100C147 88 157 80 155 64C164 74 166 88 160 100Z" fill="#ffd23f" />
        <path className="flame f4" d="M193 100C188 92 196 86 194 76C200 82 202 92 198 100Z" fill="#ffd23f" />
      </g>

      {/* cajón de la parrilla */}
      <g id="cajon">
        <path d="M38 100H262L240 168H60Z" fill="#2b2623" />
        <path d="M38 100H262L258 112H42Z" fill="#46403c" />
        <rect x="104" y="124" width="92" height="28" rx="5" fill="#46403c" />
        <circle cx="150" cy="138" r="5" fill="#8a817c" />
        {/* brasas */}
        <circle cx="76" cy="132" r="3" fill="#ff7a1a" className="ember e1" />
        <circle cx="228" cy="140" r="3" fill="#ffd23f" className="ember e2" />
        <circle cx="96" cy="154" r="2.5" fill="#ffd23f" className="ember e3" />
      </g>

      {/* parrilla (rejilla) */}
      <g id="rejilla">
        <rect x="32" y="94" width="236" height="9" rx="3" fill="#8a817c" />
        <rect x="32" y="94" width="236" height="3" rx="1.5" fill="#bdb4ae" />
      </g>

      {/* comida: chorizos y un bife */}
      <g id="comida">
        <rect x="62" y="76" width="74" height="19" rx="9.5" fill="#b5482a" transform="rotate(-4 99 85)" />
        <path d="M76 80l8 12M92 78l8 14M108 77l8 14" stroke="#7a2c16" strokeWidth="3" strokeLinecap="round" transform="rotate(-4 99 85)" />
        <rect x="156" y="78" width="70" height="17" rx="8.5" fill="#b5482a" transform="rotate(5 191 86)" />
        <path d="M170 82l7 11M186 83l7 11M202 84l7 11" stroke="#7a2c16" strokeWidth="3" strokeLinecap="round" transform="rotate(5 191 86)" />
        <path d="M128 72c10-8 34-8 42 2c6 8-2 20-20 20c-18 0-30-8-22-22Z" fill="#c0392b" transform="translate(-8 -2)" />
        <path d="M130 76c8-4 22-4 28 2" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".5" fill="none" transform="translate(-8 -2)" />
      </g>
    </svg>
  )
}
