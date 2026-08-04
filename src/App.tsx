import { UniverseProvider, useUniverse } from './state/UniverseContext';
import { AmbientPlayer } from './components/AmbientPlayer';
import { KeyBlackFilter } from './components/KeyBlackFilter';
import { Menu } from './components/Menu';
import { ThoughtBubble } from './components/ThoughtBubble';
import { SystemScene } from './components/scenes/SystemScene';
import { HomeScene } from './components/scenes/HomeScene';
import { AboutScene } from './components/scenes/AboutScene';
import { ContactScene } from './components/scenes/ContactScene';

function Universe() {
  const { state, loading, loadError } = useUniverse();
  const inSystem = state.view === 'system' || state.view === 'about' || state.view === 'contact';

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#05060c' }}>
        <KeyBlackFilter />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#dfe6ee',
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Cargando el universo…
        </div>
        <img
          src="/uploads/Galaxia.gif"
          alt=""
          style={{
            position: 'absolute',
            top: 'calc(50% + 26px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            opacity: 0.55,
            filter: 'url(#keyBlack)',
          }}
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05060c',
          color: '#e8a0a0',
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        No se pudo cargar el universo. Verificá que la API esté corriendo.
      </div>
    );
  }

  return (
    <>
      <KeyBlackFilter />
      <SystemScene interactive={state.view === 'system'} />
      <HomeScene visible={!inSystem} />
      <AboutScene visible={state.view === 'about'} />
      <ContactScene visible={state.view === 'contact'} />
      <ThoughtBubble />
      <Menu />
      <AmbientPlayer />
      <a
        className="vi-link"
        href="https://www.instagram.com/el_viajero_imaginario/"
        target="_blank"
        rel="noopener"
        style={{
          position: 'fixed',
          left: 30,
          bottom: 26,
          zIndex: 70,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 12,
          letterSpacing: 0.5,
          textDecoration: 'none',
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x={2.5} y={2.5} width={19} height={19} rx={5} />
          <circle cx={12} cy={12} r={4.2} />
          <circle cx={17.2} cy={6.8} r={1.1} fill="currentColor" stroke="none" />
        </svg>
        @el_viajero_imaginario
      </a>
    </>
  );
}

export default function App() {
  return (
    <UniverseProvider>
      <Universe />
    </UniverseProvider>
  );
}
