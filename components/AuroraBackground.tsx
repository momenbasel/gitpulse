"use client";

/**
 * Fixed, GPU-cheap animated backdrop: three slow-drifting color blobs over the
 * dotted grid defined in globals.css. Pure CSS keyframes (animate-aurora,
 * animate-float) - no JS, respects prefers-reduced-motion.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full opacity-[0.22] blur-[120px] [animation:var(--animate-aurora)]"
        style={{ background: "radial-gradient(circle, #1f6feb 0%, transparent 60%)" }}
      />
      <div
        className="absolute -right-40 top-20 h-[38rem] w-[38rem] rounded-full opacity-[0.18] blur-[130px] [animation:var(--animate-aurora)] [animation-delay:-6s]"
        style={{ background: "radial-gradient(circle, #a371f7 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full opacity-[0.14] blur-[130px] [animation:var(--animate-aurora)] [animation-delay:-12s]"
        style={{ background: "radial-gradient(circle, #3fb950 0%, transparent 60%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#010409]" />
    </div>
  );
}
