import { motion } from 'motion/react';
import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { EASE_CAMERA } from '../../theme';
import type { PlanetView } from '../../hooks/useCamera';
import { useCursorProximityGlow } from '../../hooks/useCursorProximity';
import { useIsMobile } from '../../hooks/useIsMobile';

interface PlanetProps {
  planet: PlanetView;
  flying: boolean;
  flightDuration: number;
  onDown: (e: PointerEvent<HTMLDivElement>) => void;
}

export function Planet({ planet, flying, flightDuration, onDown }: PlanetProps) {
  const { data, x, y, scale, rotate, sysScale, opacity, blur, clickable, zIndex } = planet;
  const size = data.size;
  const isMobile = useIsMobile();
  const proximityRef = useRef<HTMLDivElement>(null);
  const pulseScale = isMobile ? 0.6 : 1;
  useCursorProximityGlow(proximityRef, isMobile ? size * 0.35 + 15 : size * 0.5 + 30, (closeness) => ({
    scale: 1 + closeness * 0.04 * pulseScale,
    boxShadow: `0 0 ${closeness * 16 * pulseScale}px ${closeness * 4 * pulseScale}px rgba(127,107,242,${closeness * 0.4})`,
  }));

  return (
    <motion.div
      onPointerDown={clickable ? onDown : undefined}
      animate={{ left: x, top: y, scale: sysScale, opacity, filter: `blur(${blur}px)` }}
      transition={flying ? { duration: flightDuration / 1000, ease: EASE_CAMERA } : { duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        cursor: clickable ? 'pointer' : 'default',
        pointerEvents: clickable ? 'auto' : 'none',
        zIndex,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -size * 0.08,
          width: size * 0.75,
          height: size * 0.14,
          transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse, rgba(0,0,0,${0.55 * opacity}), transparent 70%)`,
          filter: `blur(${4 + blur}px)`,
        }}
      />
      <div
        ref={proximityRef}
        style={{
          borderRadius: '50%',
          transition: 'box-shadow 0.3s ease-out, transform 0.3s ease-out',
        }}
      >
        <motion.div
          animate={{ scale, rotate }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: `0 ${size * 0.08}px ${size * 0.25}px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)`,
          }}
        >
          {data.src ? (
            <img
              src={data.src}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'repeating-linear-gradient(135deg,#2a2d36,#2a2d36 8px,#33373f 8px 16px)',
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 50%), radial-gradient(circle at 72% 78%, rgba(0,0,0,0.55), transparent 55%)',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
