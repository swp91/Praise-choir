export default function ChurchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── Cross Tower (far right) ── */}
      <rect x="196" y="32" width="20" height="140" strokeWidth="1.4" />
      {/* Cross */}
      <line x1="206" y1="10" x2="206" y2="32" strokeWidth="1.4" />
      <line x1="192" y1="20" x2="220" y2="20" strokeWidth="1.4" />

      {/* ── Upper glass building (curved facade) ── */}
      <path d="M38 92 Q42 68 92 60 Q142 53 196 62 L196 92 Z" strokeWidth="1.4" />
      {/* Horizontal glazing bars */}
      <line x1="44" y1="73" x2="194" y2="71" strokeWidth="0.8" />
      <line x1="42" y1="83" x2="194" y2="82" strokeWidth="0.8" />

      {/* ── Angular geometric facade (left — most distinctive) ── */}
      <path d="M14 112 L56 78 L74 78 L74 162 L14 162 Z" strokeWidth="1.4" />
      {/* Grid of square cutouts */}
      <rect x="30" y="98"  width="7" height="7" strokeWidth="0.9" />
      <rect x="41" y="98"  width="7" height="7" strokeWidth="0.9" />
      <rect x="52" y="98"  width="7" height="7" strokeWidth="0.9" />
      <rect x="30" y="110" width="7" height="7" strokeWidth="0.9" />
      <rect x="41" y="110" width="7" height="7" strokeWidth="0.9" />
      <rect x="52" y="110" width="7" height="7" strokeWidth="0.9" />
      <rect x="30" y="122" width="7" height="7" strokeWidth="0.9" />
      <rect x="41" y="122" width="7" height="7" strokeWidth="0.9" />
      <rect x="30" y="134" width="7" height="7" strokeWidth="0.9" />
      <rect x="41" y="134" width="7" height="7" strokeWidth="0.9" />
      <rect x="30" y="146" width="7" height="7" strokeWidth="0.9" />

      {/* ── Main building body ── */}
      <rect x="72" y="92" width="124" height="62" strokeWidth="1.4" />
      {/* Window strips */}
      <line x1="82"  y1="104" x2="82"  y2="148" strokeWidth="0.8" />
      <line x1="100" y1="104" x2="100" y2="148" strokeWidth="0.8" />
      <line x1="118" y1="104" x2="118" y2="148" strokeWidth="0.8" />
      <line x1="136" y1="104" x2="136" y2="148" strokeWidth="0.8" />
      <line x1="154" y1="104" x2="154" y2="148" strokeWidth="0.8" />

      {/* ── Lower section (brick / gold) ── */}
      <rect x="52" y="152" width="144" height="22" strokeWidth="1.4" />
      {/* Sword / cross motif */}
      <line x1="124" y1="156" x2="124" y2="170" strokeWidth="1.2" />
      <line x1="116" y1="161" x2="132" y2="161" strokeWidth="1.2" />
      <path d="M120 156 L124 151 L128 156" strokeWidth="1.2" />

      {/* ── Ground line ── */}
      <line x1="4" y1="174" x2="236" y2="174" strokeWidth="0.9" />

      {/* ── Trees (suggestion) ── */}
      <path d="M10 165 Q10 154 18 152 Q26 154 26 165" strokeWidth="0.9" />
      <line x1="18" y1="165" x2="18" y2="174" strokeWidth="0.9" />
      <path d="M222 165 Q222 156 229 154 Q236 156 236 165" strokeWidth="0.9" />
      <line x1="229" y1="165" x2="229" y2="174" strokeWidth="0.9" />
    </svg>
  );
}
