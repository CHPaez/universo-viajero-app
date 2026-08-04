// Camera easing: symmetric, mirrors a real travel feel (not linear, not abrupt).
export const EASE_CAMERA = [0.65, 0, 0.35, 1] as const;
// "Pop"/elastic entrance easing, used for the About text crumble-in.
export const EASE_POP = [0.34, 1.2, 0.64, 1] as const;

export const MENU_OFFSET = 120;
export const OVERVIEW_ZOOM = 0.26;

// Screen-space orbit ring radii (px) in panoramic view, one per planet index.
export const RING_SCREEN_PX = [130, 160, 190, 220, 250, 280, 310, 340, 370, 400];

export const SUN_DEPTH = 0.7;
export const SUN_SIZE = 460;

export const COLORS = {
  bg: 'radial-gradient(ellipse at 50% 30%, #07080e 0%, #020208 60%, #000000 100%)',
  textPrimary: '#fff',
  textPrimaryAlt: '#f4efe4',
  textSecondarySubtitle: '#a9c4e6',
  textSecondaryBody: '#d9d6cc',
  menuInactive: 'rgba(255,255,255,0.55)',
  activeGlow: '0 0 10px rgba(255,255,255,0.9), 0 0 22px rgba(180,220,255,0.6)',
} as const;

export const FONT_SERIF = "'Instrument Serif',serif";
export const FONT_SANS = "'Space Grotesk',sans-serif";
