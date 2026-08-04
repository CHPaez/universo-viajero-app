import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { initialUniverseState, universeReducer } from './universeReducer';
import type { UniverseState } from './universeReducer';
import { fetchSystems } from '../lib/api';
import { planetPos } from '../lib/orbit';
import { useOrbitClock } from '../hooks/useOrbitClock';
import { useAudioManager } from '../hooks/useAudioManager';
import type { AmbientPlayerControls } from '../hooks/useAudioManager';
import type { AmbientTrackData, PlanetData, SolarSystemData } from '../types';

export interface UniverseActions {
  goHome: () => void;
  goViajes: () => void;
  goSobreMi: () => void;
  goContacto: () => void;
  goToSun: (systemIndex: number) => void;
  goToPlanet: (planet: PlanetData, originX: number, systemIndex: number) => void;
  leaveScene: () => void;
  panCamera: (camX: number, camY: number) => void;
  clearActive: () => void;
  stopFlying: () => void;
  setSystemIndex: (systemIndex: number) => void;
  advanceAboutSlide: () => void;
  handleUserActivity: () => void;
}

interface UniverseContextValue {
  state: UniverseState;
  elapsed: number;
  systems: SolarSystemData[];
  player: AmbientPlayerControls;
  loading: boolean;
  loadError: boolean;
  actions: UniverseActions;
}

const UniverseContext = createContext<UniverseContextValue | null>(null);

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(universeReducer, initialUniverseState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [systems, setSystems] = useState<SolarSystemData[]>([]);
  const [generalTracks, setGeneralTracks] = useState<AmbientTrackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const systemsRef = useRef<SolarSystemData[]>([]);
  systemsRef.current = systems;

  useEffect(() => {
    let cancelled = false;
    fetchSystems()
      .then((payload) => {
        if (cancelled) return;
        setSystems(payload.systems);
        setGeneralTracks(payload.generalTracks);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { elapsed, getElapsed } = useOrbitClock(state.zoomed);

  const player = useAudioManager(state, systemsRef, generalTracks);

  const arriveTimer = useRef<number | undefined>(undefined);
  const shipTimer = useRef<number | undefined>(undefined);
  const viewTimer = useRef<number | undefined>(undefined);
  const idleTimer = useRef<number | undefined>(undefined);
  const thoughtTimer = useRef<number | undefined>(undefined);
  const aboutRevealTimer = useRef<number | undefined>(undefined);
  const aboutAutoTimer = useRef<number | undefined>(undefined);
  const contactRevealTimer = useRef<number | undefined>(undefined);
  const crumbleTimer = useRef<number | undefined>(undefined);

  // Latest-callback ref so resetIdleTimer/resetAboutAutoTimer can call functions
  // defined further down without becoming stale closures across renders.
  const advanceAboutSlideRef = useRef<() => void>(() => {});

  const goHome = useCallback(() => {
    clearTimeout(shipTimer.current);
    const panDuration = 1300;
    dispatch({ type: 'GO_HOME_START', camX: 1100, flightDuration: panDuration });
    shipTimer.current = window.setTimeout(() => dispatch({ type: 'GO_HOME_FINISH' }), panDuration);
  }, []);

  const goViajes = useCallback(() => {
    clearTimeout(shipTimer.current);
    const panDuration = 1100;
    const travelPlayMs = 2400;
    dispatch({ type: 'GO_VIAJES_START', flightDuration: panDuration });
    shipTimer.current = window.setTimeout(() => dispatch({ type: 'STOP_FLYING' }), panDuration);
    viewTimer.current = window.setTimeout(() => dispatch({ type: 'VIEW_SYSTEM' }), Math.max(panDuration, travelPlayMs));
  }, []);

  const resetAboutAutoTimer = useCallback(() => {
    clearTimeout(aboutAutoTimer.current);
    if (stateRef.current.view === 'about') {
      aboutAutoTimer.current = window.setTimeout(() => advanceAboutSlideRef.current(), 6000);
    }
  }, []);

  const advanceAboutSlide = useCallback(() => {
    if (stateRef.current.aboutPhase !== 'idle') return;
    resetAboutAutoTimer();
    dispatch({ type: 'ABOUT_ADVANCE_OUT' });
    clearTimeout(crumbleTimer.current);
    crumbleTimer.current = window.setTimeout(() => {
      dispatch({ type: 'ABOUT_ADVANCE_IN' });
      window.setTimeout(() => dispatch({ type: 'ABOUT_ADVANCE_IDLE' }), 60);
    }, 650);
  }, [resetAboutAutoTimer]);

  useEffect(() => {
    advanceAboutSlideRef.current = advanceAboutSlide;
  }, [advanceAboutSlide]);

  const goSobreMi = useCallback(() => {
    clearTimeout(shipTimer.current);
    clearTimeout(idleTimer.current);
    clearTimeout(thoughtTimer.current);
    dispatch({ type: 'GO_SOBRE_MI' });
    clearTimeout(aboutRevealTimer.current);
    aboutRevealTimer.current = window.setTimeout(() => dispatch({ type: 'ABOUT_REVEAL' }), 1400);
    thoughtTimer.current = window.setTimeout(() => {
      dispatch({ type: 'THOUGHT_FLASH' });
      window.setTimeout(() => dispatch({ type: 'THOUGHT_HIDDEN' }), 500);
    }, 2600);
    resetAboutAutoTimer();
  }, [resetAboutAutoTimer]);

  const goContacto = useCallback(() => {
    clearTimeout(shipTimer.current);
    clearTimeout(aboutAutoTimer.current);
    dispatch({ type: 'GO_CONTACTO' });
    clearTimeout(contactRevealTimer.current);
    contactRevealTimer.current = window.setTimeout(() => dispatch({ type: 'CONTACT_REVEAL' }), 900);
  }, []);

  const goToSun = useCallback((systemIndex: number) => {
    if (stateRef.current.zoomed) return;
    const target = systemsRef.current[systemIndex];
    if (!target) return;
    const dist = Math.abs(target.offsetX - stateRef.current.camX);
    const duration = Math.max(900, Math.min(3600, 700 + dist * 0.6));
    clearTimeout(arriveTimer.current);
    dispatch({ type: 'GO_TO_SUN', systemIndex, camX: target.offsetX, flightDuration: duration });
    arriveTimer.current = window.setTimeout(() => dispatch({ type: 'STOP_FLYING' }), duration);
  }, []);

  const goToPlanet = useCallback((planet: PlanetData, originX: number, systemIndex: number) => {
    const elapsedNow = getElapsed();
    const pos = planetPos(planet, elapsedNow, originX);
    const dist = Math.hypot(pos.x - stateRef.current.camX, pos.y - stateRef.current.camY);
    const duration = Math.max(900, Math.min(4200, 700 + dist * 1.4));
    clearTimeout(arriveTimer.current);
    dispatch({ type: 'GO_TO_PLANET', camX: pos.x, camY: pos.y, activeId: planet.id, systemIndex, flightDuration: duration });
    arriveTimer.current = window.setTimeout(() => dispatch({ type: 'ARRIVE' }), duration);
  }, [getElapsed]);

  const leaveScene = useCallback(() => {
    clearTimeout(arriveTimer.current);
    const sys = systemsRef.current[stateRef.current.systemIndex];
    if (!sys) return;
    dispatch({ type: 'LEAVE_SCENE', camX: sys.offsetX, camY: 0 });
    arriveTimer.current = window.setTimeout(() => dispatch({ type: 'STOP_FLYING' }), 900);
  }, []);

  const panCamera = useCallback((camX: number, camY: number) => {
    dispatch({ type: 'PAN_CAMERA', camX, camY });
  }, []);

  const clearActive = useCallback(() => dispatch({ type: 'CLEAR_ACTIVE' }), []);
  const stopFlying = useCallback(() => dispatch({ type: 'STOP_FLYING' }), []);
  const setSystemIndex = useCallback((systemIndex: number) => dispatch({ type: 'SET_SYSTEM_INDEX', systemIndex }), []);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (stateRef.current.thoughtPhase !== 'hidden') dispatch({ type: 'THOUGHT_HIDDEN' });
    idleTimer.current = window.setTimeout(() => {
      if (stateRef.current.view === 'ship' && stateRef.current.astronautAnim === 'idle') {
        dispatch({ type: 'THOUGHT_SHOW' });
        clearTimeout(thoughtTimer.current);
        thoughtTimer.current = window.setTimeout(() => {
          dispatch({ type: 'THOUGHT_FLASH' });
          window.setTimeout(() => dispatch({ type: 'THOUGHT_HIDDEN' }), 500);
        }, 2600);
      }
    }, 5000);
  }, []);

  const handleUserActivity = useCallback(() => resetIdleTimer(), [resetIdleTimer]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      clearTimeout(arriveTimer.current);
      clearTimeout(shipTimer.current);
      clearTimeout(viewTimer.current);
      clearTimeout(idleTimer.current);
      clearTimeout(thoughtTimer.current);
      clearTimeout(aboutRevealTimer.current);
      clearTimeout(aboutAutoTimer.current);
      clearTimeout(contactRevealTimer.current);
      clearTimeout(crumbleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: UniverseContextValue = {
    state,
    elapsed,
    systems,
    player,
    loading,
    loadError,
    actions: {
      goHome, goViajes, goSobreMi, goContacto, goToSun, goToPlanet, leaveScene,
      panCamera, clearActive, stopFlying, setSystemIndex, advanceAboutSlide, handleUserActivity,
    },
  };

  return <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>;
}

export function useUniverse(): UniverseContextValue {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error('useUniverse must be used within a UniverseProvider');
  return ctx;
}
