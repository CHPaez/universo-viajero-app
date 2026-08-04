import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Drives a CSS custom property + box-shadow on `ref`'s element directly (no React
 * re-renders) based on 0..1 closeness of the cursor to its on-screen center. Polls every
 * animation frame — not just on pointermove — so it still reacts when the target itself
 * drifts near a stationary cursor (e.g. orbiting planets in the panoramic view).
 */
export function useCursorProximityGlow(
  ref: RefObject<HTMLElement | null>,
  radius: number,
  glow: (closeness: number) => { pulseAmt: number; boxShadow: string },
): void {
  const latest = useRef({ x: -9999, y: -9999 });
  const glowRef = useRef(glow);
  glowRef.current = glow;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      latest.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onMove);

    let rafId = requestAnimationFrame(function tick() {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(latest.current.x - cx, latest.current.y - cy);
        const linear = Math.max(0, 1 - dist / radius);
        // Eased so it stays near-zero until the cursor is genuinely close, then ramps up fast.
        const closeness = linear * linear * linear;
        const { pulseAmt, boxShadow } = glowRef.current(closeness);
        el.style.setProperty('--pulse-amt', String(pulseAmt));
        el.style.boxShadow = boxShadow;
      }
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [ref, radius]);
}
