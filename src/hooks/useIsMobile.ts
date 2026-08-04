import { useViewportSize } from './useViewportSize';

export const MOBILE_BREAKPOINT = 640;

export function useIsMobile(): boolean {
  const { width } = useViewportSize();
  return width < MOBILE_BREAKPOINT;
}
