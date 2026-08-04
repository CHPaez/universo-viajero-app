import { useUniverse } from '../state/UniverseContext';
import { useIsMobile } from '../hooks/useIsMobile';

/** Spontaneous UFO "thought" that appears after idle time on Home, then flashes away. */
export function ThoughtBubble() {
  const { state } = useUniverse();
  const isMobile = useIsMobile();
  const size = isMobile ? 96 : 180;
  const right = isMobile ? 14 : 34;
  const top = isMobile ? 118 : 70;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          right,
          top,
          width: size,
          height: size,
          zIndex: 65,
          pointerEvents: 'none',
          opacity: state.thoughtPhase === 'show' ? 1 : 0,
          transform: `scale(${state.thoughtPhase === 'show' ? 1 : 0.85})`,
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <img
          src="/uploads/c0w.gif"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter: 'url(#keyBlack)' }}
        />
      </div>
      <div
        style={{
          position: 'fixed',
          right,
          top,
          width: size,
          height: size,
          zIndex: 66,
          pointerEvents: 'none',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
          opacity: state.thoughtPhase === 'flash' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </>
  );
}
