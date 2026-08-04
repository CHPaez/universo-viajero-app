import { useUniverse } from '../state/UniverseContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { COLORS, FONT_SANS, FONT_SERIF } from '../theme';
import type { ViewName } from '../types';

interface MenuItemDef {
  id: string;
  label: string;
  view: ViewName;
  onClick: () => void;
}

export function Menu() {
  const { state, actions } = useUniverse();
  const isMobile = useIsMobile();

  const items: MenuItemDef[] = [
    { id: 'home', label: 'Home', view: 'ship', onClick: actions.goHome },
    { id: 'viajes', label: 'Viajes', view: 'system', onClick: actions.goViajes },
    { id: 'sobre', label: 'Sobre mí', view: 'about', onClick: actions.goSobreMi },
    { id: 'contacto', label: 'Contacto', view: 'contact', onClick: actions.goContacto },
  ];

  return (
    <div style={{ position: 'fixed', left: '50%', top: 10, transform: 'translateX(-50%)', zIndex: 80, textAlign: 'center' }}>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
          fontSize: isMobile ? 24 : 32,
          color: COLORS.textPrimary,
          letterSpacing: 0.3,
          textShadow: '0 0 12px rgba(255,255,255,0.85), 0 0 30px rgba(180,220,255,0.5)',
        }}
      >
        Universos
      </div>
      <div style={{ display: 'flex', gap: isMobile ? 12 : 24, justifyContent: 'center', marginTop: isMobile ? 10 : 14 }}>
        {items.map((item) => {
          const active = item.view === state.view;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: FONT_SANS,
                fontSize: isMobile ? 10.5 : 13,
                letterSpacing: isMobile ? 0.4 : 1,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                color: active ? COLORS.textPrimary : COLORS.menuInactive,
                textShadow: active ? COLORS.activeGlow : 'none',
                cursor: 'pointer',
                padding: '6px 2px',
                borderBottom: `1.5px solid ${active ? '#fff' : 'transparent'}`,
                transition: 'color 0.25s ease, text-shadow 0.25s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
