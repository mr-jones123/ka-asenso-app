import Image from "next/image";

/**
 * Asymmetric hero collage:
 *  - Big portrait card with a real human placeholder.
 *  - Floating "live call" stat card with animated waveform.
 *  - Floating ratings/trust chip.
 *  - Backdrop blob.
 *
 * Uses picsum.photos seeded for stability (skill requires no Unsplash).
 */

export default function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-blob" />

      <div className="hero-photo hero-photo-primary">
        <Image
          src="https://picsum.photos/seed/ka-asenso-call-1/640/780"
          alt=""
          width={640}
          height={780}
          unoptimized
          priority
        />
        <div className="hero-photo-frame" />
      </div>

      <div className="hero-photo hero-photo-secondary">
        <Image
          src="https://picsum.photos/seed/ka-asenso-store-2/360/240"
          alt=""
          width={360}
          height={240}
          unoptimized
        />
      </div>

      <div className="hero-floating hero-floating-call">
        <div className="hero-floating-head">
          <span className="hero-live-dot" />
          <span>Live call · 02:47</span>
        </div>
        <p className="hero-floating-quote">
          “My budget is around five hundred thousand and I’m targeting Pampanga.”
        </p>
        <svg viewBox="0 0 200 32" className="hero-floating-wave" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => {
            const dur = 0.7 + (i % 5) * 0.18;
            const base = 6 + (i % 7) * 1.4;
            const peak = 20 + (i % 11) * 0.8;
            return (
              <rect
                key={i}
                x={i * 5}
                y={16 - base / 2}
                width="2.4"
                height={base}
                rx="1.2"
                fill="var(--raw-leaf-500)"
              >
                <animate
                  attributeName="height"
                  values={`${base};${peak};${base}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  values={`${16 - base / 2};${16 - peak / 2};${16 - base / 2}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
              </rect>
            );
          })}
        </svg>
      </div>

      <div className="hero-floating hero-floating-score">
        <div className="hero-score-num">94</div>
        <div className="hero-score-meta">
          <span className="hero-score-label">AI fit score</span>
          <span className="hero-score-sub">BrewBay · Pampanga</span>
        </div>
        <svg viewBox="0 0 36 36" className="hero-score-ring" aria-hidden="true">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--raw-ink-200)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="var(--raw-leaf-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="94 100"
            pathLength="100"
            transform="rotate(-90 18 18)"
          />
        </svg>
      </div>
    </div>
  );
}
