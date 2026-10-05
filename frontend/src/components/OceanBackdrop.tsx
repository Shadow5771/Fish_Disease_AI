import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useFinePointer, usePrefersReducedMotion } from "../hooks/useMedia";

export function OceanBackdrop() {
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 45,
    damping: 24,
    mass: 0.7,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 45,
    damping: 24,
    mass: 0.7,
  });

  useEffect(() => {
    if (!finePointer || reducedMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [finePointer, reducedMotion, mouseX, mouseY]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base atmosphere */}
      <div className="absolute inset-0 bg-ink-950" />

      {/* Cursor-reactive ambient light */}
      <motion.div
        className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-accent/[0.055] blur-[100px]"
        style={{
          x: reducedMotion ? 0 : smoothX,
          y: reducedMotion ? 0 : smoothY,
        }}
      />

      <motion.div
        className="absolute -right-40 top-[18%] h-[460px] w-[460px] rounded-full bg-sky-500/[0.035] blur-[110px]"
        style={{
          x: reducedMotion ? 0 : smoothX,
          y: reducedMotion ? 0 : smoothY,
        }}
      />

      {/* Deep-ocean glow */}
      <motion.div
        className="absolute left-[35%] top-[45%] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.018] blur-[140px]"
        style={{
          x: reducedMotion ? 0 : smoothX,
          y: reducedMotion ? 0 : smoothY,
        }}
      />

      {/* Technical depth grid */}
      <div className="depth-grid absolute inset-0 opacity-30" />

      {/* Ocean rays */}
      <div className="ocean-rays absolute inset-0 opacity-25" />

      {/* Vignette */}
      <div className="ocean-vignette absolute inset-0" />
    </div>
  );
}