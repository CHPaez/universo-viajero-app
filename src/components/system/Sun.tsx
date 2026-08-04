import { motion } from 'motion/react';
import { useRef } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { EASE_CAMERA } from '../../theme';
import type { SunView } from '../../hooks/useCamera';
import { useCursorProximityGlow } from '../../hooks/useCursorProximity';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SunProps {
  sun: SunView;
  flying: boolean;
  flightDuration: number;
  onDown: (e: PointerEvent<HTMLDivElement>) => void;
}

export function Sun({ sun, flying, flightDuration, onDown }: SunProps) {
  const { c1, c2, src, bgPos } = sun.sun;
  const isMobile = useIsMobile();
  const proximityRef = useRef<HTMLDivElement>(null);
  const pulseScale = isMobile ? 0.6 : 1;
  useCursorProximityGlow(
    proximityRef,
    isMobile ? sun.dispSize * 0.25 + 20 : sun.dispSize * 0.35 + 40,
    (closeness) => ({
      pulseAmt: closeness * 0.02 * pulseScale,
      boxShadow: `0 0 ${closeness * 20 * pulseScale}px ${closeness * 6 * pulseScale}px rgba(127,107,242,${closeness * 0.4})`,
    }),
  );
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
      <div
        ref={proximityRef}
        style={
          {
            '--pulse-base': 1,
            '--pulse-amt': 0,
            animation: 'bodyPulse 0.8s ease-in-out infinite',
            borderRadius: '50%',
            transition: 'box-shadow 0.6s ease-out, --pulse-amt 0.6s ease-out',
          } as CSSProperties
        }
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
      </div>
    </motion.div>
  );
}
