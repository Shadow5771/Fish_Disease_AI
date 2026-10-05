import {
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useFinePointer, usePrefersReducedMotion } from "../hooks/useMedia";

interface Props {
  children: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

export function InteractiveCard({
  children,
  selected = false,
  onSelect,
  disabled,
  className = "",
  ariaLabel,
}: Props) {
  const rootRef = useRef<HTMLButtonElement>(null);

  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  const live = fine && !reduced && !disabled;

  /* --------------------------------------------------
     Pointer position
  -------------------------------------------------- */

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const pointerXS = useSpring(pointerX, {
    stiffness: 170,
    damping: 20,
    mass: 0.42,
  });

  const pointerYS = useSpring(pointerY, {
    stiffness: 170,
    damping: 20,
    mass: 0.42,
  });

  /* --------------------------------------------------
     Hover intensity
  -------------------------------------------------- */

  const hover = useMotionValue(0);

  const hoverS = useSpring(hover, {
    stiffness: 260,
    damping: 22,
    mass: 0.45,
  });

  /* --------------------------------------------------
     3D rotation
  -------------------------------------------------- */

  const rotateY = useTransform(
    pointerXS,
    [0, 1],
    [-9, 9],
  );

  const rotateX = useTransform(
    pointerYS,
    [0, 1],
    [8, -8],
  );

  /* --------------------------------------------------
     Depth / scale
  -------------------------------------------------- */

  const scale = useTransform(
    hoverS,
    [0, 1],
    [1, 1.018],
  );

  const translateZ = useTransform(
    hoverS,
    [0, 1],
    [0, 8],
  );

  /* --------------------------------------------------
     Cursor light position
  -------------------------------------------------- */

  const lightX = useTransform(
    pointerXS,
    (value) => `${value * 100}%`,
  );

  const lightY = useTransform(
    pointerYS,
    (value) => `${value * 100}%`,
  );

  /* --------------------------------------------------
     Light intensity
  -------------------------------------------------- */

  const lightOpacity = useTransform(
    hoverS,
    [0, 1],
    [0, 1],
  );

  /* --------------------------------------------------
     Subtle glare movement
  -------------------------------------------------- */

  const glareX = useTransform(
    pointerXS,
    [0, 1],
    ["-35%", "35%"],
  );

  const glareY = useTransform(
    pointerYS,
    [0, 1],
    ["-25%", "25%"],
  );

  /* --------------------------------------------------
     Reset
  -------------------------------------------------- */

  const reset = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
    hover.set(0);
  }, [hover, pointerX, pointerY]);

  /* --------------------------------------------------
     Pointer tracking
  -------------------------------------------------- */

  function handlePointerMove(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (!live) return;

    const element = rootRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = Math.min(
      1,
      Math.max(
        0,
        (event.clientX - rect.left) / rect.width,
      ),
    );

    const y = Math.min(
      1,
      Math.max(
        0,
        (event.clientY - rect.top) / rect.height,
      ),
    );

    pointerX.set(x);
    pointerY.set(y);
    hover.set(1);
  }

  return (
    <motion.button
      ref={rootRef}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{
        rotateX: live ? rotateX : 0,
        rotateY: live ? rotateY : 0,
        scale: live ? scale : 1,
        translateZ: live ? translateZ : 0,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      className={`interactive-card group relative w-full min-w-0 overflow-hidden rounded-xl border text-left ${
        selected
          ? "border-accent/55 bg-accent/[0.075] shadow-[0_24px_60px_-30px_rgba(92,200,232,0.55)]"
          : "border-line bg-ink-900/45"
      } ${className}`}
    >
      {/* Cursor-following light */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(92_200_232_/_0.20),rgb(92_200_232_/_0.06)_35%,transparent_72%)] blur-[1px] mix-blend-screen"
        style={{
          left: lightX,
          top: lightY,
          opacity: live ? lightOpacity : 0,
        }}
      />

      {/* Moving glass glare */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-35%] z-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255_/_0.055)_48%,transparent_58%)]"
        style={{
          x: live ? glareX : 0,
          y: live ? glareY : 0,
          opacity: live ? lightOpacity : 0,
        }}
      />

      {/* Top edge highlight */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-px ${
          selected
            ? "bg-accent/45"
            : "bg-white/[0.07]"
        }`}
      />

      {/* Content */}
      <span
        className="relative z-10 block"
        style={{
          transform: live ? "translateZ(14px)" : undefined,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </span>
    </motion.button>
  );
}