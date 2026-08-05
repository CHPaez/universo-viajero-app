import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { UniverseState } from '../state/universeReducer';
import type { AmbientTrackData, SolarSystemData } from '../types';

const GENERAL_VOLUME = 0.35;
const GENERAL_DUCKED_VOLUME = 0.08;
const SUN_VOLUME = 0.55;
const SUN_DUCKED_VOLUME = 0.12;
const PLANET_VOLUME = 0.85;
const FADE_MS = 700;

export interface AmbientPlayerControls {
  tracks: AmbientTrackData[];
  currentTrack: AmbientTrackData | null;
  isPlaying: boolean;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  stopSun: () => void;
}

function fadeVolume(audio: HTMLAudioElement, target: number, ms: number) {
  const start = audio.volume;
  const startTime = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - startTime) / ms);
    audio.volume = Math.min(1, Math.max(0, start + (target - start) * p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function useTrack(onEnded?: () => void) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const currentSrc = useRef<string | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0;
    const handleEnded = () => onEndedRef.current?.();
    audio.addEventListener('ended', handleEnded);
    ref.current = audio;
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      ref.current = null;
    };
  }, []);

  const setSrc = useCallback((src: string, volume: number, force = false) => {
    const audio = ref.current;
    if (!audio) return;
    if (!force && currentSrc.current === src) return;
    currentSrc.current = src;
    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    audio.volume = 0;
    audio.play().catch(() => {});
    fadeVolume(audio, volume, FADE_MS);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = ref.current;
    if (audio && currentSrc.current) fadeVolume(audio, volume, FADE_MS);
  }, []);

  const stop = useCallback(() => {
    const audio = ref.current;
    if (!audio || !currentSrc.current) return;
    currentSrc.current = null;
    fadeVolume(audio, 0, FADE_MS);
    window.setTimeout(() => audio.pause(), FADE_MS + 50);
  }, []);

  return { ref, setSrc, setVolume, stop };
}

/**
 * Three-layer audio: general ambient playlist (always on once unlocked, one-shot-per-track
 * then auto-advances), per-sun (plays once while browsing that system), per-planet (plays
 * once while "arrived" at a zoomed planet). A one-shot track finishing naturally — not just
 * leaving the scene — restores the general track to full volume even if you stay put.
 */
export function useAudioManager(
  state: UniverseState,
  systemsRef: MutableRefObject<SolarSystemData[]>,
  generalTracks: AmbientTrackData[],
): AmbientPlayerControls {
  const [oneShotEnded, setOneShotEnded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const generalTracksRef = useRef(generalTracks);
  generalTracksRef.current = generalTracks;
  const duckedRef = useRef(false);
  const sunSilencedSrc = useRef<string | null>(null);

  const next = useCallback(() => {
    setTrackIndex((i) => {
      const len = generalTracksRef.current.length;
      return len ? (i + 1) % len : 0;
    });
  }, []);

  const prev = useCallback(() => {
    setTrackIndex((i) => {
      const len = generalTracksRef.current.length;
      return len ? (i - 1 + len) % len : 0;
    });
  }, []);

  const general = useTrack(next);
  const sun = useTrack(() => setOneShotEnded(true));
  const planet = useTrack(() => setOneShotEnded(true));

  // Sun/planet one-shot selection + ducking, driven by navigation state.
  useEffect(() => {
    const atPlanet = state.zoomed && state.arrived && !!state.activeId;
    let planetSrc: string | null = null;
    if (atPlanet) {
      for (const sys of systemsRef.current) {
        const p = sys.planets.find((pl) => pl.id === state.activeId);
        if (p) {
          planetSrc = p.audioSrc;
          break;
        }
      }
    }

    const sunSrc = state.view === 'system' ? (systemsRef.current[state.systemIndex]?.sun.audioSrc ?? null) : null;

    if (planetSrc) {
      setOneShotEnded(false);
      planet.setSrc(planetSrc, PLANET_VOLUME);
      // Duck (don't stop) — stopping would reset playback position and replay the sun's
      // one-shot from the start every time you look at a planet and come back.
      sun.setVolume(SUN_DUCKED_VOLUME);
    } else {
      planet.stop();
      if (sunSrc && sunSrc !== sunSilencedSrc.current) {
        setOneShotEnded(false);
        sun.setSrc(sunSrc, SUN_VOLUME);
      } else if (!sunSrc) {
        sun.stop();
        sunSilencedSrc.current = null;
      }
    }

    duckedRef.current = !!(planetSrc || sunSrc);
    general.setVolume(duckedRef.current ? GENERAL_DUCKED_VOLUME : GENERAL_VOLUME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.zoomed, state.arrived, state.activeId, state.view, state.systemIndex, systemsRef]);

  // A one-shot finishing on its own (without leaving the scene) restores general volume.
  useEffect(() => {
    if (oneShotEnded) {
      duckedRef.current = false;
      general.setVolume(GENERAL_VOLUME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneShotEnded]);

  // Plays the selected playlist track (on unlock, on manual next/prev, or on auto-advance).
  // With a single track, loop it natively — the "advance to next" path never fires
  // because the index doesn't change, so a gapless native loop is what actually repeats it.
  useEffect(() => {
    if (!unlocked) return;
    const track = generalTracksRef.current[trackIndex];
    if (!track) return;
    if (general.ref.current) general.ref.current.loop = generalTracksRef.current.length <= 1;
    general.setSrc(track.src, duckedRef.current ? GENERAL_DUCKED_VOLUME : GENERAL_VOLUME, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, trackIndex]);

  const unlockAudio = useCallback(() => setUnlocked(true), []);
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio);
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, [unlockAudio]);

  useEffect(() => {
    const audio = general.ref.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = useCallback(() => {
    const audio = general.ref.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopSun = useCallback(() => {
    sunSilencedSrc.current = sun.ref.current?.src ?? null;
    sun.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tracks: generalTracks,
    currentTrack: generalTracks[trackIndex] ?? null,
    isPlaying,
    next,
    prev,
    togglePlay,
    stopSun,
  };
}
