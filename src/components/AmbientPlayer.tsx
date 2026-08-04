import type { CSSProperties } from 'react';
import { useUniverse } from '../state/UniverseContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { COLORS, FONT_SANS } from '../theme';

interface StarDef {
  size: number;
  dx: number;
  dy: number;
}

// Three stars on a tilted diagonal, like Mintaka–Alnilam–Alnitak.
const STARS: StarDef[] = [
  { size: 8, dx: 0, dy: 30 },
  { size: 11, dx: 26, dy: 15 },
  { size: 8, dx: 52, dy: 0 },
];

function starStyle(star: StarDef, lit: boolean): CSSProperties {
  return {
    position: 'absolute',
    left: star.dx,
    top: star.dy,
    width: star.size,
    height: star.size,
    borderRadius: '50%',
    background: lit ? '#fff' : 'rgba(255,255,255,0.55)',
    boxShadow: lit
      ? '0 0 6px rgba(255,255,255,0.95), 0 0 16px rgba(180,220,255,0.7)'
      : '0 0 4px rgba(255,255,255,0.5), 0 0 9px rgba(180,220,255,0.35)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'box-shadow 0.25s ease, background 0.25s ease',
  };
}

export function AmbientPlayer() {
  const { player } = useUniverse();
  const isMobile = useIsMobile();
  const scale = isMobile ? 0.8 : 1;

  if (player.tracks.length === 0) return null;

  const hasPlaylist = player.tracks.length > 1;

  return (
    <div
      style={{
        position: 'fixed',
        right: isMobile ? 20 : 34,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 60 * scale,
          height: 30 * scale,
          transform: `scale(${scale})`,
          transformOrigin: 'top right',
        }}
      >
        {hasPlaylist && (
          <button
            style={starStyle(STARS[0], false)}
            onClick={player.prev}
            aria-label="Canción anterior"
          />
        )}
        <button
          style={starStyle(STARS[1], player.isPlaying)}
          onClick={player.togglePlay}
          aria-label={player.isPlaying ? 'Pausar' : 'Reproducir'}
        />
        {hasPlaylist && (
          <button
            style={starStyle(STARS[2], false)}
            onClick={player.next}
            aria-label="Siguiente canción"
          />
        )}
      </div>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10.5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: COLORS.menuInactive,
          whiteSpace: 'nowrap',
        }}
      >
        {player.currentTrack?.title || 'Ambiente'}
      </span>
    </div>
  );
}
