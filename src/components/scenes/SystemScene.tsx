import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';
import { motion } from 'motion/react';
import { useUniverse } from '../../state/UniverseContext';
import { useViewportSize } from '../../hooks/useViewportSize';
import { useCamera } from '../../hooks/useCamera';
import { StarField } from '../StarField';
import { Sun } from '../system/Sun';
import { Planet } from '../system/Planet';
import { PlanetTitle } from '../system/PlanetTitle';
import { COLORS, EASE_CAMERA } from '../../theme';

interface SystemSceneProps {
  interactive: boolean;
}

export function SystemScene({ interactive }: SystemSceneProps) {
  const { state, elapsed, systems, player, actions } = useUniverse();
  const viewport = useViewportSize();
  const camera = useCamera(state, elapsed, viewport, systems);

  const dragging = useRef(false);
  const moved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const camStart = useRef({ x: 0, y: 0 });

  const handleBgDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      moved.current = false;
      if (state.zoomed) {
        actions.leaveScene();
        return;
      }
      if (state.flying) actions.stopFlying();
      dragStart.current = { x: e.clientX, y: e.clientY };
      camStart.current = { x: state.camX, y: state.camY };
    },
    [state.zoomed, state.flying, state.camX, state.camY, actions],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 6) moved.current = true;
      actions.panCamera(camStart.current.x - dx, camStart.current.y - dy);
    },
    [actions],
  );

  const handlePointerUp = useCallback(() => {
    if (dragging.current && !moved.current) actions.clearActive();
    dragging.current = false;
  }, [actions]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: COLORS.bg,
        cursor: 'grab',
        pointerEvents: interactive ? 'auto' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'none',
      }}
      onPointerDown={handleBgDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onMouseMove={actions.handleUserActivity}
    >
      <StarField camX={state.camX} camY={state.camY} dimmed={state.zoomed} flying={state.flying} flightDuration={state.flightDuration} />

      <motion.div
        animate={{ y: camera.worldTranslateY, scale: camera.worldScale }}
        transition={state.flying ? { duration: state.flightDuration / 1000, ease: EASE_CAMERA } : { duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, transformOrigin: `${camera.vw / 2}px ${camera.vhFixed}px` }}
      >
        {camera.suns.map((sun) => (
          <Sun
            key={sun.id}
            sun={sun}
            flying={state.flying}
            flightDuration={state.flightDuration}
            onDown={(e) => {
              e.stopPropagation();
              player.stopSun();
              if (sun.clickable) actions.goToSun(sun.systemIndex);
            }}
          />
        ))}
        {camera.planets.map((planet) => (
          <Planet
            key={planet.id}
            planet={planet}
            flying={state.flying}
            flightDuration={state.flightDuration}
            onDown={(e) => {
              e.stopPropagation();
              if (!planet.clickable) return;
              if (planet.systemIndex !== state.systemIndex) actions.setSystemIndex(planet.systemIndex);
              actions.goToPlanet(planet.data, planet.originX, planet.systemIndex);
            }}
          />
        ))}
      </motion.div>

      <PlanetTitle text={camera.activePlanet?.title ?? null} arrived={state.arrived} />
    </div>
  );
}
