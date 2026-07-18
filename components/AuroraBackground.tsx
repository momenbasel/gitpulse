"use client";

/**
 * Fixed instrument backdrop: a slow-panning engineering grid sheet with one
 * restrained signal-blue glow and a bottom vignette. Pure CSS keyframes,
 * GPU-cheap, respects prefers-reduced-motion (globals.css kills durations).
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* engineering grid sheet, slowly panning */}
      <div className="instrument-grid absolute inset-0 opacity-70 [animation:var(--animate-grid-pan)]" />

      {/* single signal glow, top-left */}
      <div
        className="absolute -left-48 -top-48 h-[46rem] w-[46rem] rounded-full opacity-[0.13] blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 62%)",
        }}
      />
      {/* faint secondary signal, bottom-right — same hue family */}
      <div
        className="absolute -bottom-56 -right-40 h-[40rem] w-[40rem] rounded-full opacity-[0.07] blur-[150px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-emphasis) 0%, transparent 60%)",
        }}
      />

      {/* vignette to seat content into the canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas-inset" />
    </div>
  );
}
