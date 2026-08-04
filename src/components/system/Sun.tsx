import { motion } from 'motion/react';
import type { PointerEvent } from 'react';
import { EASE_CAMERA } from '../../theme';
import type { SunView } from '../../hooks/useCamera';

interface SunProps {
  sun: SunView;
  flying: boolean;
  flightDuration: number;
  onDown: (e: PointerEvent<HTMLDivElement>) => void;
}

export function Sun({ sun, flying, flightDuration, onDown }: SunProps) {
  const { c1, c2, src, bgPos } = sun.sun;
  return (
    <motion.div
      onPointerDown={onDown}
      animate={{
        left: sun.x,
        top: sun.y,
        marginLeft: -sun.hitSize / 2,
        marginTop: -sun.hitSize / 2,
        width: sun.hitSize,
        height: sun.hitSize,
      }}
      transition={flying ? { duration: flightDuration / 1000, ease: EASE_CAMERA } : { duration: 0 }}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        cursor: sun.clickable ? 'pointer' : 'default',
        pointerEvents: sun.clickable ? 'auto' : 'none',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={{
          width: sun.dispSize,
          height: sun.dispSize,
          boxShadow: `0 0 ${90 * sun.glowBoost}px ${30 * sun.glowBoost}px ${c1}, 0 0 ${220 * sun.glowBoost}px ${90 * sun.glowBoost}px ${c2}`,
          opacity: sun.showTexture ? sun.textureOpacity : 1,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          borderRadius: '50%',
          backgroundImage: sun.showTexture && src ? `url(${src})` : 'none',
          backgroundSize: '105% 105%',
          backgroundPosition: bgPos,
          backgroundColor: sun.showTexture ? undefined : c1,
        }}
      />
    </motion.div>
  );
}
