import { useUniverse } from '../../state/UniverseContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { FONT_SANS, FONT_SERIF } from '../../theme';

interface ContactSceneProps {
  visible: boolean;
}

const CONTACT_LINKS = [
  { href: 'mailto:cepb@hotmail.es', label: 'cepb@hotmail.es', color: 'rgba(160,220,255,0.8)' },
  { href: 'https://www.instagram.com/el_viajero_imaginario/', label: '@el_viajero_imaginario', color: 'rgba(255,150,190,0.8)' },
];

export function ContactScene({ visible }: ContactSceneProps) {
  const { state } = useUniverse();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 35,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '9vh',
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: 'border-box',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.8s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 55%, rgba(4,5,10,0.2) 0%, rgba(2,3,7,0.65) 60%, rgba(0,0,0,0.85) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: 560,
          width: '100%',
          boxSizing: 'border-box',
          padding: isMobile ? '30px 26px' : '44px 46px',
          background: 'rgba(6,8,14,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          backdropFilter: 'blur(6px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          opacity: state.contactRevealed ? 1 : 0,
          transform: `translateY(${state.contactRevealed ? 0 : 14}px)`,
          transition: 'opacity 1.1s ease, transform 1.1s ease',
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: isMobile ? 26 : 36,
            color: '#fff',
            textShadow: '0 0 16px rgba(255,255,255,0.7), 0 0 40px rgba(160,200,255,0.4)',
          }}
        >
          Envía una señal a través del universo
        </div>
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: FONT_SANS,
                fontSize: 16,
                letterSpacing: 0.5,
                color: '#e8e4d8',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  display: 'inline-block',
                  background: link.color,
                  boxShadow: `0 0 8px 3px ${link.color}`,
                }}
              />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
