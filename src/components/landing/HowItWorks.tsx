/**
 * 3-step "How it works" visual section.
 * Pure CSS + inline SVG with animateMotion / dash drawing.
 * No client-side JS, no Framer Motion dependency.
 */

export default function HowItWorks() {
  return (
    <section className="how-section" aria-labelledby="how-title">
      <header className="how-head">
        <p className="customer-eyebrow">How Ka Asenso works</p>
        <h2 id="how-title" className="how-title">
          One voice call. One scored lead. Zero discovery friction.
        </h2>
        <p className="how-lede">
          Ara qualifies the buyer in plain Taglish, narrows the catalog to a single best-fit
          franchise, and ships a structured lead straight into the franchisor dashboard.
        </p>
      </header>

      <div className="how-track" role="list">
        <article className="how-step" role="listitem">
          <div className="how-visual">
            <svg viewBox="0 0 240 160" aria-hidden="true" className="how-svg">
              <defs>
                <linearGradient id="orb-1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--raw-navy-600)" />
                  <stop offset="100%" stopColor="var(--raw-navy-900)" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="80" r="44" fill="url(#orb-1)">
                <animate
                  attributeName="r"
                  values="42;46;42"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* concentric rings */}
              <circle
                cx="120"
                cy="80"
                r="58"
                fill="none"
                stroke="var(--raw-leaf-500)"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="50;72;50"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.55;0;0.55"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* waveform bars */}
              <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                {[100, 108, 116, 124, 132].map((x, i) => (
                  <line key={x} x1={x} y1="80" x2={x} y2="80">
                    <animate
                      attributeName="y1"
                      values={`${74 - i};${66 + i * 2};${74 - i}`}
                      dur={`${1 + i * 0.18}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values={`${86 + i};${94 - i * 2};${86 + i}`}
                      dur={`${1 + i * 0.18}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                ))}
              </g>
            </svg>
          </div>
          <div className="how-copy">
            <span className="how-step-num">01</span>
            <h3>Buyer dials in</h3>
            <p>
              Investor taps <em>Talk to Ara</em>. The call connects in under two seconds with
              live captions and Taglish-aware speech.
            </p>
          </div>
        </article>

        <div className="how-connector" aria-hidden="true">
          <svg viewBox="0 0 240 40" className="how-connector-svg">
            <path
              d="M4 20 C 80 4, 160 36, 236 20"
              fill="none"
              stroke="var(--raw-navy-200)"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
            <circle r="4" fill="var(--raw-gold-500)">
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path="M4 20 C 80 4, 160 36, 236 20"
              />
            </circle>
          </svg>
        </div>

        <article className="how-step" role="listitem">
          <div className="how-visual">
            <svg viewBox="0 0 240 160" aria-hidden="true" className="how-svg">
              {/* checklist card */}
              <rect
                x="36"
                y="24"
                width="168"
                height="112"
                rx="14"
                fill="#fff"
                stroke="var(--raw-navy-200)"
                strokeWidth="1.5"
              />
              {/* header bar */}
              <rect x="48" y="36" width="88" height="8" rx="4" fill="var(--raw-navy-900)" />
              <rect x="48" y="50" width="52" height="6" rx="3" fill="var(--raw-ink-300)" />

              {/* checklist rows */}
              {[72, 92, 112].map((y, i) => (
                <g key={y}>
                  <circle
                    cx="56"
                    cy={y}
                    r="6"
                    fill="none"
                    stroke="var(--raw-leaf-600)"
                    strokeWidth="1.8"
                  >
                    <animate
                      attributeName="fill"
                      values="transparent;var(--raw-leaf-600);var(--raw-leaf-600)"
                      keyTimes="0;0.5;1"
                      dur="2.4s"
                      begin={`${i * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <path
                    d={`M52 ${y} l3 3 l6 -6`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0;1;1;0"
                      keyTimes="0;0.45;0.55;0.95;1"
                      dur="2.4s"
                      begin={`${i * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                  <rect x="70" y={y - 4} width="110" height="8" rx="3" fill="var(--raw-ink-200)" />
                  <rect
                    x="70"
                    y={y - 4}
                    width="0"
                    height="8"
                    rx="3"
                    fill="var(--raw-leaf-500)"
                  >
                    <animate
                      attributeName="width"
                      values="0;110;110"
                      keyTimes="0;0.55;1"
                      dur="2.4s"
                      begin={`${i * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                </g>
              ))}
            </svg>
          </div>
          <div className="how-copy">
            <span className="how-step-num">02</span>
            <h3>Ara qualifies</h3>
            <p>
              Budget, province, management style, timeline, OFW status. Each answer collapses
              the catalog toward a single, defensible recommendation.
            </p>
          </div>
        </article>

        <div className="how-connector" aria-hidden="true">
          <svg viewBox="0 0 240 40" className="how-connector-svg">
            <path
              d="M4 20 C 80 36, 160 4, 236 20"
              fill="none"
              stroke="var(--raw-navy-200)"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
            <circle r="4" fill="var(--raw-leaf-500)">
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path="M4 20 C 80 36, 160 4, 236 20"
              />
            </circle>
          </svg>
        </div>

        <article className="how-step" role="listitem">
          <div className="how-visual">
            <svg viewBox="0 0 240 160" aria-hidden="true" className="how-svg">
              {/* dashboard card */}
              <rect
                x="28"
                y="20"
                width="184"
                height="120"
                rx="14"
                fill="var(--raw-navy-900)"
              />
              <rect x="40" y="32" width="60" height="6" rx="3" fill="var(--raw-navy-200)" opacity="0.6" />
              <rect x="40" y="44" width="34" height="10" rx="3" fill="#fff" />
              <text
                x="40"
                y="80"
                fontFamily="var(--font-display)"
                fontWeight="900"
                fontSize="28"
                fill="#fff"
                letterSpacing="-0.04em"
              >
                94
              </text>
              <text
                x="78"
                y="80"
                fontFamily="var(--font-sans)"
                fontWeight="700"
                fontSize="10"
                fill="var(--raw-gold-500)"
              >
                AI SCORE
              </text>

              {/* sparkline */}
              <path
                d="M40 116 L60 104 L80 110 L100 92 L120 96 L140 80 L160 84 L180 70 L200 76"
                fill="none"
                stroke="var(--raw-leaf-500)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="240"
                strokeDashoffset="240"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="240;0;0;240"
                  keyTimes="0;0.45;0.9;1"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
              <circle r="4" fill="var(--raw-gold-500)">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M40 116 L60 104 L80 110 L100 92 L120 96 L140 80 L160 84 L180 70 L200 76"
                />
              </circle>
            </svg>
          </div>
          <div className="how-copy">
            <span className="how-step-num">03</span>
            <h3>Lead lands scored</h3>
            <p>
              Structured payload (budget, province, brand fit, risk flags, transcript) lands on
              the franchisor dashboard with an AI score before the buyer hangs up.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
