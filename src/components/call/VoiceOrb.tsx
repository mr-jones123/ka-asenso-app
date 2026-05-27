"use client";

import { memo, useId } from "react";

interface VoiceOrbProps {
  /** 0..1 — drives petal expansion, rotation speed and glow. */
  energy: number;
  state: "idle" | "connecting" | "live" | "ending";
}

/**
 * ElevenLabs-style conic-petal orb (SVG approximation of the Three.js Orb).
 *
 * Visuals:
 *   - 8 conic petals as wedges drawn with arc-paths from the center.
 *   - The whole assembly rotates slowly when idle, faster when energy is high.
 *   - Each petal scales its radius slightly with energy → "blooming" effect.
 *   - A soft inner highlight + an outer rim shadow sells the sphere.
 *
 * No Three.js, no GPU shaders. Pure SVG, fully isolated client component.
 */
function VoiceOrbInner({ energy, state }: VoiceOrbProps) {
  const gradId = useId();
  const highlightId = useId();

  // Petal layout: 8 wedges around the circle, gap between them.
  const PETALS = 8;
  const ARC_GAP = 6; // degrees of gap between petals
  const arc = 360 / PETALS - ARC_GAP;
  // The petal "bloom" — radius scales between 78 and 98 with energy.
  const radius = 78 + energy * 20;
  // Idle rotation is 60s, live rotation accelerates with energy.
  const rotateDur = state === "idle" ? 60 : Math.max(8, 28 - energy * 22);

  const petals = Array.from({ length: PETALS }).map((_, i) => {
    const startAngle = (i * 360) / PETALS - 90 + ARC_GAP / 2;
    const endAngle = startAngle + arc;
    return wedgePath(100, 100, radius, startAngle, endAngle);
  });

  return (
    <div
      className="voice-orb"
      data-state={state}
      style={{ "--orb-energy": energy } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Outer halo ring */}
      <div className="voice-orb-halo" />

      <svg viewBox="0 0 200 200" className="voice-orb-svg">
        <defs>
          {/* Conic-like radial gradient: bright core to navy edge. */}
          <radialGradient id={gradId} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#cfe1ff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#7ba2ff" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#2b4d92" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0a1430" stopOpacity="0.9" />
          </radialGradient>
          {/* Specular highlight near the top of the sphere */}
          <radialGradient id={highlightId} cx="38%" cy="28%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer soft shadow ring */}
        <circle cx="100" cy="100" r="94" fill="rgba(10, 20, 48, 0.6)" />

        {/* Rotating petal group */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: `voice-orb-spin ${rotateDur}s linear infinite`,
          }}
        >
          {petals.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={`url(#${gradId})`}
              style={{
                transformOrigin: "100px 100px",
                animation: `voice-orb-petal 4.2s ease-in-out infinite`,
                animationDelay: `${(i * 0.18).toFixed(2)}s`,
              }}
            />
          ))}
        </g>

        {/* Sphere shading */}
        <circle cx="100" cy="100" r={radius - 2} fill={`url(#${highlightId})`} pointerEvents="none" />
        {/* Rim line */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="0.6"
        />
      </svg>
    </div>
  );
}

/** Build a SVG path for a circular wedge (pie slice) between two angles. */
function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default memo(VoiceOrbInner);
