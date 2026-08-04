import type { PlanetData } from '../types';

export interface PlanetPosition {
  x: number;
  y: number;
  localX: number;
  angle: number;
  behindSun: boolean;
}

/**
 * World-space position of a planet at a given elapsed time (seconds).
 * Slower amplitude orbits move slower too, so wide orbits never look frantic.
 */
export function planetPos(p: PlanetData, elapsed: number, originX: number): PlanetPosition {
  const speed = 0.07 / Math.sqrt(p.ampl / 700);
  const angle = p.a0 + elapsed * speed;
  const localX = p.ampl * Math.sin(angle);
  return {
    x: originX + localX,
    localX,
    y: p.yLane,
    angle,
    // The 'inicio' planet never goes behind the sun sprite (it IS the sun's companion).
    behindSun: p.id !== 'inicio' && Math.cos(angle) < 0,
  };
}
