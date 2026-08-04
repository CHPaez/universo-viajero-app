import { FONT_SERIF, MENU_OFFSET } from '../../theme';

interface PlanetTitleProps {
  text: string | null;
  arrived: boolean;
}

export function PlanetTitle({ text, arrived }: PlanetTitleProps) {
  if (!text) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: MENU_OFFSET + 24,
        transform: 'translateX(-50%)',
        fontFamily: FONT_SERIF,
        fontStyle: 'italic',
        fontSize: 30,
        color: '#f4efe4',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        opacity: arrived ? 1 : 0,
        transition: 'opacity 0.5s ease',
        zIndex: 30,
      }}
    >
      {text}
    </div>
  );
}
