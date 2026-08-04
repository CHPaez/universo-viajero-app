import { useEffect, useRef } from 'react';
import { createLiquidStarfield } from '../webgl/liquidStarfield';
import type { LiquidStarfieldHandle } from '../webgl/liquidStarfield';

interface StarFieldProps {
  camX: number;
  camY: number;
  dimmed?: boolean;
  flying: boolean;
  flightDuration: number;
}

/**
 * WebGL-rendered parallax starfield with a cursor-reactive liquid ripple warp.
 * Falls back to the plain dark background (already painted by the parent scene)
 * if WebGL is unavailable — no crash, just no stars/ripple.
 */
export function StarField({ camX, camY, dimmed = false, flying, flightDuration }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<LiquidStarfieldHandle | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    handleRef.current = createLiquidStarfield(canvasRef.current);
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    handleRef.current?.setCamera(camX, camY, flying, flightDuration);
  }, [camX, camY, flying, flightDuration]);

  useEffect(() => {
    handleRef.current?.setDimmed(dimmed);
  }, [dimmed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }}
    />
  );
}
