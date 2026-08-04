import { aboutSlides } from '../data/aboutSlides';
import type { ViewName } from '../types';

export interface UniverseState {
  view: ViewName;
  systemIndex: number;
  camX: number;
  camY: number;
  zoomed: boolean;
  activeId: string | null;
  arrived: boolean;
  flying: boolean;
  flightDuration: number;
  astronautAnim: 'idle' | 'traveling';
  travelRunId: number;
  aboutTextShown: boolean;
  aboutTextRevealed: boolean;
  aboutSlideIndex: number;
  aboutPhase: 'idle' | 'out' | 'in';
  contactRevealed: boolean;
  thoughtPhase: 'hidden' | 'show' | 'flash';
}

export const initialUniverseState: UniverseState = {
  view: 'ship',
  systemIndex: 0,
  camX: 0,
  camY: 0,
  zoomed: false,
  activeId: null,
  arrived: true,
  flying: false,
  flightDuration: 1200,
  astronautAnim: 'idle',
  travelRunId: 0,
  aboutTextShown: false,
  aboutTextRevealed: false,
  aboutSlideIndex: 0,
  aboutPhase: 'idle',
  contactRevealed: false,
  thoughtPhase: 'hidden',
};

export type UniverseAction =
  | { type: 'GO_HOME_START'; camX: number; flightDuration: number }
  | { type: 'GO_HOME_FINISH' }
  | { type: 'GO_VIAJES_START'; flightDuration: number }
  | { type: 'VIEW_SYSTEM' }
  | { type: 'STOP_FLYING' }
  | { type: 'GO_SOBRE_MI' }
  | { type: 'ABOUT_REVEAL' }
  | { type: 'GO_CONTACTO' }
  | { type: 'CONTACT_REVEAL' }
  | { type: 'GO_TO_SUN'; systemIndex: number; camX: number; flightDuration: number }
  | { type: 'GO_TO_PLANET'; camX: number; camY: number; activeId: string; systemIndex: number; flightDuration: number }
  | { type: 'ARRIVE' }
  | { type: 'LEAVE_SCENE'; camX: number; camY: number }
  | { type: 'PAN_CAMERA'; camX: number; camY: number }
  | { type: 'CLEAR_ACTIVE' }
  | { type: 'SET_SYSTEM_INDEX'; systemIndex: number }
  | { type: 'ABOUT_ADVANCE_OUT' }
  | { type: 'ABOUT_ADVANCE_IN' }
  | { type: 'ABOUT_ADVANCE_IDLE' }
  | { type: 'THOUGHT_SHOW' }
  | { type: 'THOUGHT_FLASH' }
  | { type: 'THOUGHT_HIDDEN' };

export function universeReducer(state: UniverseState, action: UniverseAction): UniverseState {
  switch (action.type) {
    case 'GO_HOME_START':
      return { ...state, zoomed: false, activeId: null, arrived: false, flying: true, flightDuration: action.flightDuration, systemIndex: 0, camX: action.camX, camY: 0 };
    case 'GO_HOME_FINISH':
      return { ...state, view: 'ship', astronautAnim: 'idle', flying: false };
    case 'GO_VIAJES_START':
      return { ...state, astronautAnim: 'traveling', flying: true, flightDuration: action.flightDuration, systemIndex: 0, camX: 0, camY: 0, travelRunId: state.travelRunId + 1 };
    case 'VIEW_SYSTEM':
      return { ...state, view: 'system' };
    case 'STOP_FLYING':
      return { ...state, flying: false };
    case 'GO_SOBRE_MI':
      return { ...state, view: 'about', zoomed: false, activeId: null, arrived: false, systemIndex: 0, camX: 0, camY: 0, aboutTextShown: true, aboutTextRevealed: false, thoughtPhase: 'show' };
    case 'ABOUT_REVEAL':
      return { ...state, aboutTextRevealed: true };
    case 'GO_CONTACTO':
      return { ...state, view: 'contact', zoomed: false, activeId: null, arrived: false, systemIndex: 0, camX: 0, camY: 0, contactRevealed: false };
    case 'CONTACT_REVEAL':
      return { ...state, contactRevealed: true };
    case 'GO_TO_SUN':
      return { ...state, systemIndex: action.systemIndex, camX: action.camX, camY: 0, flying: true, flightDuration: action.flightDuration };
    case 'GO_TO_PLANET':
      return { ...state, systemIndex: action.systemIndex, camX: action.camX, camY: action.camY, activeId: action.activeId, flightDuration: action.flightDuration, arrived: false, flying: true, zoomed: true };
    case 'ARRIVE':
      return { ...state, arrived: true, flying: false };
    case 'LEAVE_SCENE':
      return { ...state, zoomed: false, arrived: false, flying: true, flightDuration: 900, activeId: null, camX: action.camX, camY: action.camY };
    case 'PAN_CAMERA':
      return { ...state, camX: action.camX, camY: action.camY };
    case 'CLEAR_ACTIVE':
      return { ...state, activeId: null };
    case 'SET_SYSTEM_INDEX':
      return { ...state, systemIndex: action.systemIndex };
    case 'ABOUT_ADVANCE_OUT':
      return { ...state, aboutPhase: 'out' };
    case 'ABOUT_ADVANCE_IN':
      return { ...state, aboutSlideIndex: (state.aboutSlideIndex + 1) % aboutSlides.length, aboutPhase: 'in' };
    case 'ABOUT_ADVANCE_IDLE':
      return { ...state, aboutPhase: 'idle' };
    case 'THOUGHT_SHOW':
      return { ...state, thoughtPhase: 'show' };
    case 'THOUGHT_FLASH':
      return { ...state, thoughtPhase: 'flash' };
    case 'THOUGHT_HIDDEN':
      return { ...state, thoughtPhase: 'hidden' };
    default:
      return state;
  }
}
