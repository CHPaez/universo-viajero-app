import type { PointerEvent } from 'react';
import { useUniverse } from '../../state/UniverseContext';
import { FONT_SANS } from '../../theme';

interface HomeSceneProps {
  visible: boolean;
}

const STATIC_STAR_LAYERS = [0.03, 0.08, 0.16].map((_, i) => ({
  size: 70 - i * 10,
  opacity: 0.09 + i * 0.06,
}));

export function HomeScene({ visible }: HomeSceneProps) {
  const { state, actions } = useUniverse();
  const traveling = state.astronautAnim === 'traveling';

  const handleAstronautDown = (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation();
    actions.handleUserActivity();
    if (state.view !== 'system') actions.goViajes();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 1s ease',
      }}
      onMouseMove={actions.handleUserActivity}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,5,10,0.72)' }} />
      {STATIC_STAR_LAYERS.map((layer, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,${layer.opacity}) 1px, transparent 1.5px)`,
            backgroundSize: `${layer.size}px ${layer.size}px`,
          }}
        />
      ))}

      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: 320,
          height: 179.9,
          transform: 'translate(-50%,-50%)',
          zIndex: 2,
        }}
        onPointerDown={handleAstronautDown}
      >
        <img
          src="/uploads/Astronauta.gif"
          draggable={false}
          onPointerDown={handleAstronautDown}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 320,
            height: 179.9,
            objectFit: 'contain',
            display: 'block',
            filter: 'url(#keyBlack) saturate(0.5) brightness(1.0) hue-rotate(-8deg)',
            WebkitMaskImage: 'radial-gradient(circle at 90% 9%, transparent 0 13%, black 26%, black 100%)',
            maskImage: 'radial-gradient(circle at 90% 9%, transparent 0 13%, black 26%, black 100%)',
            opacity: traveling ? 0 : 0.9,
            transition: 'opacity 1.1s ease',
          }}
        />
        <img
          src={`/uploads/Astronauta yendo al sismtema planetario.gif?r=${state.travelRunId}`}
          draggable={false}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 504,
            height: 420.4,
            objectFit: 'contain',
            display: 'block',
            filter: 'url(#keyBlack) grayscale(1) brightness(0.45) contrast(1.1)',
            opacity: traveling ? 0.62 : 0,
            transition: 'opacity 1.1s ease',
          }}
        />
      </div>

      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: 'calc(50% + 130px)',
          transform: 'translateX(-50%)',
          zIndex: 3,
          fontFamily: FONT_SANS,
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#dfe6ee',
          textShadow: '0 0 10px rgba(180,220,255,0.5)',
          animation: 'hintPulse 2.6s ease-in-out infinite',
          opacity: traveling ? 0 : 1,
          pointerEvents: 'none',
          transition: 'opacity 0.4s ease',
        }}
      >
        Toca tu imaginación
      </div>
    </div>
  );
}
