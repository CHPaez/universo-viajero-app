/**
 * Turns the black background baked into the GIF/JPG assets transparent.
 * Weighs R/G more than B so the result doesn't pick up a blue tint when lifted.
 * Production alternative: pre-process assets with real alpha (PNG/WebP) instead.
 */
export function KeyBlackFilter() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <filter id="keyBlack" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  4.2 4.2 0.15 0 -0.06" />
      </filter>
    </svg>
  );
}
