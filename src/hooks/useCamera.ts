import { useMemo } from 'react';
import { planetPos } from '../lib/orbit';
import { MENU_OFFSET, OVERVIEW_ZOOM, RING_SCREEN_PX, SUN_DEPTH, SUN_SIZE } from '../theme';
import type { UniverseState } from '../state/universeReducer';
import type { PlanetData, SolarSystemData, SunData } from '../types';
import type { ViewportSize } from './useViewportSize';

export interface SunView {
  id: string;
  systemIndex: number;
  x: number;
  y: number;
  dispSize: number;
  hitSize: number;
  glowBoost: number;
  showTexture: boolean;
  textureOpacity: number;
  clickable: boolean;
  sun: SunData;
}

export interface PlanetView {
  id: string;
  data: PlanetData;
  originX: number;
  systemIndex: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  sysScale: number;
  opacity: number;
  blur: number;
  arrived: boolean;
  isActive: boolean;
  clickable: boolean;
  zIndex: number;
}

export interface CameraView {
  vw: number;
  vh: number;
  vhFixed: number;
  worldTranslateY: number;
  worldScale: number;
  titleBlock: number;
  suns: SunView[];
  planets: PlanetView[];
  activePlanet: PlanetData | null;
}

// Sun/ring screen offsets are tuned in absolute px for a ~1280px desktop viewport.
// Narrower viewports need a smaller world scale (so distant suns still peek in at
// the edges) and a smaller ring radius (so orbiting planets don't swing off-screen).
const RESPONSIVE_MIN_WIDTH = 390;
const RESPONSIVE_MAX_WIDTH = 1280;
const MOBILE_OVERVIEW_ZOOM = 0.11;
const MOBILE_RING_SCALE = 0.42;

function responsiveT(vw: number): number {
  return Math.min(1, Math.max(0, (vw - RESPONSIVE_MIN_WIDTH) / (RESPONSIVE_MAX_WIDTH - RESPONSIVE_MIN_WIDTH)));
}

function computeOverviewZoom(vw: number): number {
  const t = responsiveT(vw);
  return MOBILE_OVERVIEW_ZOOM + (OVERVIEW_ZOOM - MOBILE_OVERVIEW_ZOOM) * t;
}

function computeRingScale(vw: number): number {
  const t = responsiveT(vw);
  return MOBILE_RING_SCALE + (1 - MOBILE_RING_SCALE) * t;
}

export function useCamera(
  state: UniverseState,
  elapsed: number,
  viewport: ViewportSize,
  systems: SolarSystemData[],
): CameraView {
  return useMemo(() => {
    const vw = viewport.width;
    const vh = viewport.height;
    const availableH = vh - MENU_OFFSET;
    const titleGap = 30;
    const titleHeight = 42;
    const titleBlock = titleGap + titleHeight;
    const bottomMargin = 40;
    const zoomedAvailH = availableH - titleBlock - bottomMargin;
    const vhFixed = vh / 2;
    const vhC = state.zoomed ? MENU_OFFSET + titleBlock + zoomedAvailH / 2 : (vh + MENU_OFFSET) / 2;
    const worldTranslateY = vhC - vhFixed;

    let activePlanet: PlanetData | null = null;
    if (state.zoomed) {
      for (const s of systems) {
        const found = s.planets.find((p) => p.id === state.activeId);
        if (found) {
          activePlanet = found;
          break;
        }
      }
    }

    let zoomedScale = 3.4;
    if (activePlanet) {
      const denom = 1.35 * (activePlanet.size / 2);
      zoomedScale = Math.max(0.5, Math.min(5, (zoomedAvailH * 0.92 / 2) / denom));
    }

    const camX = state.camX;
    const camY = state.camY;
    const overviewZoom = computeOverviewZoom(vw);
    const ringScale = computeRingScale(vw);
    const worldScale = state.zoomed ? zoomedScale : state.view === 'about' ? overviewZoom * 0.42 : overviewZoom;

    const sysFarT: Record<string, number> = {};
    systems.forEach((s, i) => {
      const isCurrentZoomed = state.zoomed && state.systemIndex === i;
      const dist = Math.abs(s.offsetX - camX);
      sysFarT[s.id] = isCurrentZoomed ? 1 : Math.min(1, Math.max(0, (dist - 300) / 1200));
    });

    const suns: SunView[] = systems.map((s, i) => {
      const x = vw / 2 + (s.offsetX - camX) * SUN_DEPTH;
      const y = vhFixed + (0 - camY) * SUN_DEPTH;
      const farT = sysFarT[s.id];
      const dispSize = SUN_SIZE * (1 - farT) + 22 * farT;
      const glowBoost = 1 + farT * 2.2;
      const showTexture = farT < 0.55 && !!s.sun.src;
      const clickable = !state.zoomed;
      const effScale = state.zoomed ? zoomedScale : overviewZoom;
      const hitSize = Math.max(dispSize, 90 / effScale);
      return { id: s.id, systemIndex: i, x, y, dispSize, hitSize, glowBoost, showTexture, textureOpacity: 1 - farT, clickable, sun: s.sun };
    });

    const planets: PlanetView[] = systems.flatMap((s, sysIdx) =>
      s.planets.map((p0, pIdx) => {
        const pos = planetPos(p0, elapsed, s.offsetX);
        const isActive = p0.id === state.activeId;
        const arrived = state.arrived && isActive;
        const sysFar = isActive ? 0 : sysFarT[s.id];
        const orbitCompress = 1 - sysFar * 0.55;
        const sunSX = vw / 2 + (s.offsetX - camX) * SUN_DEPTH;
        const sunSY = vhFixed + (0 - camY) * SUN_DEPTH;
        let sx = vw / 2 + (pos.x - camX) * p0.depth * orbitCompress;
        let sy = vhFixed + (pos.y - camY) * p0.depth * orbitCompress;
        if (!isActive && !state.zoomed) {
          const ringWorld = (RING_SCREEN_PX[pIdx % RING_SCREEN_PX.length] * ringScale) / worldScale;
          const ringSpeed = 0.06 / Math.sqrt(pIdx + 3);
          const ringAngle = p0.a0 + elapsed * ringSpeed;
          sx = sunSX + ringWorld * Math.cos(ringAngle);
          sy = sunSY + ringWorld * Math.sin(ringAngle) * 0.5;
        }
        const scale = arrived ? 1.35 : 1;
        const rotate = arrived ? 8 : 0;
        const fadedOut = state.zoomed && !isActive;
        const depthDim = isActive ? 1 : (0.45 + p0.depth * 0.6) * (1 - sysFar * 0.7);
        const depthBlur = isActive ? 0 : Math.max(0, (1 - p0.depth) * 2.2) + sysFar * 2.5;
        const sysScale = isActive ? 1 : 1 - sysFar * 0.72;
        const isOtherSystem = sysIdx !== state.systemIndex;
        const clickable = !fadedOut && !isOtherSystem;
        return {
          id: p0.id,
          data: p0,
          originX: s.offsetX,
          systemIndex: sysIdx,
          x: sx,
          y: sy,
          scale,
          rotate,
          sysScale,
          opacity: fadedOut ? 0 : depthDim,
          blur: depthBlur,
          arrived,
          isActive,
          clickable,
          zIndex: pos.behindSun && !isActive ? -1 : Math.round(p0.depth * 100) + 10,
        };
      }),
    );

    return { vw, vh, vhFixed, worldTranslateY, worldScale, titleBlock, suns, planets, activePlanet };
  }, [state, elapsed, viewport, systems]);
}
