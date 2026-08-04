import type { AmbientTrackData, SolarSystemData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface ApiPlanet {
  id: string;
  yLane: number;
  ampl: number;
  a0: number;
  depth: number;
  size: number;
  src: string | null;
  title: string;
  text: string | null;
  audioSrc: string | null;
}

interface ApiSystem {
  id: string;
  label: string;
  offsetX: number;
  sun: { src: string | null; bgPos: string; c1: string; c2: string; audioSrc: string | null };
  planets: ApiPlanet[];
}

interface ApiResponse {
  systems: ApiSystem[];
  generalTracks: AmbientTrackData[];
}

export interface SystemsPayload {
  systems: SolarSystemData[];
  generalTracks: AmbientTrackData[];
}

export async function fetchSystems(): Promise<SystemsPayload> {
  const res = await fetch(`${API_BASE_URL}/api/systems`);
  if (!res.ok) throw new Error(`fetchSystems failed: ${res.status}`);
  const data: ApiResponse = await res.json();

  const systems: SolarSystemData[] = data.systems.map((s) => ({
    id: s.id,
    label: s.label,
    offsetX: s.offsetX,
    sun: { src: s.sun.src ?? '', bgPos: s.sun.bgPos, c1: s.sun.c1, c2: s.sun.c2, audioSrc: s.sun.audioSrc },
    planets: s.planets.map((p) => ({
      id: p.id,
      yLane: p.yLane,
      ampl: p.ampl,
      a0: p.a0,
      depth: p.depth,
      size: p.size,
      src: p.src ?? '',
      title: p.title,
      text: p.text ?? '',
      audioSrc: p.audioSrc,
    })),
  }));

  return { systems, generalTracks: data.generalTracks };
}
