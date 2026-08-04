import { motion } from 'motion/react';
import { EASE_CAMERA } from '../theme';

interface StarFieldProps {
  camX: number;
  camY: number;
  dimmed?: boolean;
  flying: boolean;
  flightDuration: number;
}

const LAYER_FACTORS = [0.03, 0.08, 0.16];

/** Three parallax star layers; farther layers (lower factor) move less than the camera, giving depth. */
export function StarField({ camX, camY, dimmed = false, flying, flightDuration }: StarFieldProps) {
  return (
    <>
      {LAYER_FACTORS.map((factor, i) => {
        const size = 70 - i * 10;
        const baseOpacity = 0.09 + i * 0.06;
        const opacity = dimmed ? baseOpacity * 0.2 : baseOpacity;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 4000,
              height: 3000,
              pointerEvents: 'none',
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,${opacity}) 1px, transparent 1.5px)`,
              backgroundSize: `${size}px ${size}px`,
              transition: 'background-image 0.6s ease',
            }}
            animate={{ left: -camX * factor - 1500, top: -camY * factor - 1000 }}
            transition={flying ? { duration: flightDuration / 1000, ease: EASE_CAMERA } : { duration: 0 }}
          />
        );
      })}
    </>
  );
}
