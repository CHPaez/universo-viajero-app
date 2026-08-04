export type ViewName = 'ship' | 'system' | 'about' | 'contact';

export interface PlanetData {
  id: string;
  /** Fixed screen-space Y lane the orbit oscillates around. */
  yLane: number;
  /** Orbit amplitude (world units). */
  ampl: number;
  /** Initial angle (radians). */
  a0: number;
  /** Parallax depth, 0..1 — closer planets move more per camera unit. */
  depth: number;
  /** Sphere diameter in world units. */
  size: number;
  /** Image src, empty string for "aún por definir" placeholders. */
  src: string;
  title: string;
  text: string;
  /** Per-planet audio, null when none was uploaded. */
  audioSrc: string | null;
}

export interface SunData {
  src: string;
  bgPos: string;
  /** Inner halo color. */
  c1: string;
  /** Outer halo color. */
  c2: string;
  /** Plays while browsing this system, null when none was uploaded. */
  audioSrc: string | null;
}

export interface SolarSystemData {
  id: string;
  label: string;
  offsetX: number;
  sun: SunData;
  planets: PlanetData[];
}

export interface AboutLine {
  text: string;
  size: number;
  italic?: boolean;
  upper?: boolean;
  color: string;
}

export interface AboutSlide {
  glow: string;
  lines: AboutLine[];
}

export interface AmbientTrackData {
  id: string;
  title: string | null;
  src: string;
}
