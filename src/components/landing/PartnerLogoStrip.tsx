/**
 * Partner / "trusted by" logo strip.
 * All marks are inline SVG so they pick up CSS color and stay sharp on retina.
 * Brand names are intentionally PH-flavored and fictional.
 */

interface LogoProps {
  className?: string;
}

function KargaBites({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 32" className={className} role="img" aria-label="KargaBites">
      <g fill="currentColor">
        <path d="M6 5h3v22H6zM9 16l9-11h4l-9 11 9 11h-4z" />
        <text x="26" y="22" fontFamily="var(--font-display), serif" fontWeight="900" fontSize="14" letterSpacing="-0.02em">
          KARGA<tspan fill="var(--raw-gold-500)">BITES</tspan>
        </text>
      </g>
    </svg>
  );
}

function BrewBay({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 32" className={className} role="img" aria-label="BrewBay">
      <g fill="currentColor">
        <path d="M6 8h12a6 6 0 0 1 0 12h-2v4H6zm4 4v8h6a2 2 0 0 0 0-4h-2v-4z" />
        <circle cx="22" cy="22" r="2.5" fill="var(--raw-leaf-500)" />
        <text x="32" y="22" fontFamily="var(--font-display), serif" fontWeight="800" fontSize="14" letterSpacing="-0.02em">
          BrewBay<tspan fill="var(--raw-leaf-600)">.</tspan>
        </text>
      </g>
    </svg>
  );
}

function LabaGo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 160 32" className={className} role="img" aria-label="LabaGo">
      <g fill="currentColor">
        <circle cx="14" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="14" cy="16" r="4" fill="var(--raw-navy-700)" />
        <text x="30" y="22" fontFamily="var(--font-display), serif" fontWeight="800" fontSize="14" letterSpacing="-0.02em">
          Laba<tspan fill="var(--raw-navy-700)">Go</tspan>
        </text>
      </g>
    </svg>
  );
}

function AsensaPharma({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 180 32" className={className} role="img" aria-label="Asensa Pharma">
      <g fill="currentColor">
        <path d="M6 14h6V8h6v6h6v6h-6v6h-6v-6H6z" fill="var(--raw-leaf-600)" />
        <text x="30" y="22" fontFamily="var(--font-display), serif" fontWeight="800" fontSize="14" letterSpacing="-0.02em">
          Asensa <tspan fill="var(--raw-ink-500)">Pharma</tspan>
        </text>
      </g>
    </svg>
  );
}

function TindaTrike({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 180 32" className={className} role="img" aria-label="TindaTrike">
      <g fill="currentColor">
        <circle cx="9" cy="22" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="22" cy="22" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M5 22 L18 6 L26 6 L22 22Z" fill="var(--raw-gold-500)" stroke="currentColor" strokeWidth="1.5" />
        <text x="34" y="22" fontFamily="var(--font-display), serif" fontWeight="800" fontSize="14" letterSpacing="-0.02em">
          Tinda<tspan fill="var(--raw-gold-500)">Trike</tspan>
        </text>
      </g>
    </svg>
  );
}

function AgriGrow({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 170 32" className={className} role="img" aria-label="AgriGrow">
      <g fill="currentColor">
        <path d="M14 6c-4 4-6 9-3 13-3-1-6 1-7 4 0 0 5 4 11 0 4-3 5-7 5-10 0-3-2-5-6-7z" fill="var(--raw-leaf-600)" />
        <text x="28" y="22" fontFamily="var(--font-display), serif" fontWeight="800" fontSize="14" letterSpacing="-0.02em">
          Agri<tspan fill="var(--raw-leaf-700)">Grow</tspan>
        </text>
      </g>
    </svg>
  );
}

const LOGOS = [KargaBites, BrewBay, LabaGo, AsensaPharma, TindaTrike, AgriGrow];

export default function PartnerLogoStrip() {
  return (
    <section className="partner-strip" aria-label="Trusted by emerging Philippine franchises">
      <p className="partner-eyebrow">Trusted by emerging Philippine franchisors</p>
      <div className="partner-marquee" aria-hidden="true">
        <div className="partner-track">
          {[...LOGOS, ...LOGOS].map((Logo, i) => (
            <span key={i} className="partner-logo">
              <Logo className="partner-logo-svg" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
