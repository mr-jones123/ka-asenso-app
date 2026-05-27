"use client";

import { memo } from "react";

interface LiveWaveformProps {
  bars: number[];
  active: boolean;
}

/**
 * Compact ElevenLabs-style live waveform strip.
 * Renders pre-computed `bars` (heights 0..1) as fixed-position rounded rects.
 * Memoized so it never re-renders the parent.
 */
function LiveWaveformInner({ bars, active }: LiveWaveformProps) {
  return (
    <div className={`live-wave${active ? " is-active" : ""}`} aria-hidden="true">
      <svg viewBox={`0 0 ${bars.length * 6} 56`} preserveAspectRatio="none" className="live-wave-svg">
        {bars.map((h, i) => {
          const height = Math.max(2, Math.round(h * 52));
          const y = (56 - height) / 2;
          return (
            <rect
              key={i}
              x={i * 6}
              y={y}
              width={3}
              height={height}
              rx={1.5}
              fill="currentColor"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default memo(LiveWaveformInner);
