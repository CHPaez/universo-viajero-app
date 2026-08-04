import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Elapsed-seconds clock driving planet orbits. While `frozen` is true the
 * clock stops advancing but remembers its value, so leaving a zoomed-in
 * planet resumes orbits from where they were instead of jumping/resetting —
 * that jump is what causes planets to visibly reorder on arrival.
 */
export function useOrbitClock(frozen: boolean) {
  const startTimeRef = useRef(Date.now());
  const frozenAtRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  const getElapsed = useCallback(() => {
    if (frozen) return frozenAtRef.current;
    return (Date.now() - startTimeRef.current) / 1000;
  }, [frozen]);

  useEffect(() => {
    if (frozen) {
      frozenAtRef.current = (Date.now() - startTimeRef.current) / 1000;
      return;
    }
    startTimeRef.current = Date.now() - frozenAtRef.current * 1000;
    let raf = 0;
    let lastTick = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - lastTick < 60) return;
      lastTick = t;
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frozen]);

  return { elapsed, getElapsed };
}
