import { animate } from 'motion';
import type { AnimationPlaybackControls } from 'motion';

export interface LiquidStarfieldHandle {
  setCamera(camX: number, camY: number, flying: boolean, flightDurationMs: number): void;
  setDimmed(dimmed: boolean): void;
  destroy(): void;
}

const MAX_RIPPLES = 16;
const RIPPLE_LIFETIME_MS = 2000;

interface RipplePoint {
  x: number;
  y: number;
  t: number;
}

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec2 u_cam;
uniform float u_dim;
uniform int u_rippleCount;
uniform vec2 u_ripplePos[${MAX_RIPPLES}];
uniform float u_rippleAge[${MAX_RIPPLES}];

vec2 hash2(vec2 p) {
  float n1 = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  float n2 = fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453);
  return vec2(n1, n2);
}

float starLayer(vec2 p, float cellSize) {
  vec2 cell = floor(p / cellSize);
  vec2 local = fract(p / cellSize) - 0.5;
  vec2 jitter = (hash2(cell) - 0.5) * 0.7;
  float d = length(local - jitter) * cellSize;
  return 1.0 - smoothstep(0.0, 1.6, d);
}

void main() {
  vec2 pixel = gl_FragCoord.xy / u_dpr;
  pixel.y = u_resolution.y - pixel.y;

  vec2 disp = vec2(0.0);
  float rippleGlow = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= u_rippleCount) break;
    vec2 toFrag = pixel - u_ripplePos[i];
    float dist = length(toFrag);
    float age = u_rippleAge[i];
    float decay = exp(-age * 1.6);
    float ring = smoothstep(150.0, 0.0, dist) * smoothstep(0.0, 25.0, dist);
    float wave = sin(dist * 0.045 - age * 7.0) * 14.0 * decay * ring;
    disp += (toFrag / max(dist, 0.001)) * wave;
    rippleGlow += abs(wave) * 0.025;
  }

  vec2 warped = pixel + disp;

  vec2 center = vec2(u_resolution.x * 0.5, u_resolution.y * 0.3);
  vec2 d = warped - center;
  d.x /= u_resolution.x * 0.62;
  d.y /= u_resolution.y * 0.62;
  float t = clamp(length(d), 0.0, 1.0);

  vec3 c0 = vec3(0.02745, 0.03137, 0.05490);
  vec3 c1 = vec3(0.00784, 0.00784, 0.03137);
  vec3 c2 = vec3(0.0, 0.0, 0.0);
  vec3 bg = t < 0.6 ? mix(c0, c1, t / 0.6) : mix(c1, c2, (t - 0.6) / 0.4);

  float sizes[3];
  sizes[0] = 70.0; sizes[1] = 60.0; sizes[2] = 50.0;
  float factors[3];
  factors[0] = 0.03; factors[1] = 0.08; factors[2] = 0.16;
  float baseOpacity[3];
  baseOpacity[0] = 0.09; baseOpacity[1] = 0.15; baseOpacity[2] = 0.21;

  float starAlpha = 0.0;
  for (int i = 0; i < 3; i++) {
    vec2 p = warped + vec2(u_cam.x * factors[i] + 1500.0, u_cam.y * factors[i] + 1000.0);
    starAlpha += starLayer(p, sizes[i]) * baseOpacity[i];
  }
  starAlpha = clamp(starAlpha * u_dim, 0.0, 1.0);

  vec3 color = mix(bg, vec3(1.0), starAlpha);

  vec3 rippleTint = vec3(0.5, 0.42, 0.95);
  color += rippleTint * clamp(rippleGlow, 0.0, 0.16);

  gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** WebGL-driven starfield: procedural layered dots + a cursor-reactive liquid ripple UV warp. */
export function createLiquidStarfield(canvas: HTMLCanvasElement): LiquidStarfieldHandle | null {
  const glCtx = (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ?? (canvas.getContext('webgl') as WebGLRenderingContext | null);
  if (!glCtx) return null;
  const gl: WebGLRenderingContext | WebGL2RenderingContext = glCtx;

  const program = createProgram(gl);
  if (!program) return null;

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_position');

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uDpr = gl.getUniformLocation(program, 'u_dpr');
  const uCam = gl.getUniformLocation(program, 'u_cam');
  const uDim = gl.getUniformLocation(program, 'u_dim');
  const uRippleCount = gl.getUniformLocation(program, 'u_rippleCount');
  const uRipplePos = gl.getUniformLocation(program, 'u_ripplePos[0]');
  const uRippleAge = gl.getUniformLocation(program, 'u_rippleAge[0]');

  let cssW = 0;
  let cssH = 0;
  let dpr = 1;

  const camState = { x: 0, y: 0 };
  const dimState = { value: 1 };
  let camAnim: AnimationPlaybackControls | null = null;
  let dimAnim: AnimationPlaybackControls | null = null;

  let ripples: RipplePoint[] = [];
  const ripplePosBuf = new Float32Array(MAX_RIPPLES * 2);
  const rippleAgeBuf = new Float32Array(MAX_RIPPLES);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  function onPointerMove(e: PointerEvent) {
    ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  }
  window.addEventListener('pointermove', onPointerMove);

  let rafId = 0;
  function frame() {
    const now = performance.now();
    ripples = ripples.filter((r) => now - r.t < RIPPLE_LIFETIME_MS);

    const count = Math.min(ripples.length, MAX_RIPPLES);
    for (let i = 0; i < count; i++) {
      const r = ripples[i];
      ripplePosBuf[i * 2] = r.x;
      ripplePosBuf[i * 2 + 1] = r.y;
      rippleAgeBuf[i] = (now - r.t) / 1000;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uResolution, cssW, cssH);
    gl.uniform1f(uDpr, dpr);
    gl.uniform2f(uCam, camState.x, camState.y);
    gl.uniform1f(uDim, dimState.value);
    gl.uniform1i(uRippleCount, count);
    gl.uniform2fv(uRipplePos, ripplePosBuf);
    gl.uniform1fv(uRippleAge, rippleAgeBuf);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  return {
    setCamera(camX, camY, flying, flightDurationMs) {
      camAnim?.stop();
      if (!flying) {
        camState.x = camX;
        camState.y = camY;
        return;
      }
      const fromX = camState.x;
      const fromY = camState.y;
      camAnim = animate(0, 1, {
        duration: flightDurationMs / 1000,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (t: number) => {
          camState.x = fromX + (camX - fromX) * t;
          camState.y = fromY + (camY - fromY) * t;
        },
      });
    },
    setDimmed(dimmed) {
      dimAnim?.stop();
      const target = dimmed ? 0.2 : 1;
      const from = dimState.value;
      dimAnim = animate(0, 1, {
        duration: 0.6,
        ease: 'easeInOut',
        onUpdate: (t: number) => {
          dimState.value = from + (target - from) * t;
        },
      });
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      camAnim?.stop();
      dimAnim?.stop();
      // Deliberately NOT calling WEBGL_lose_context here: a <canvas> can only ever
      // hold one real WebGL context for its lifetime. React StrictMode's dev-mode
      // mount→cleanup→mount double-invoke would force-lose the context on cleanup,
      // then the second mount's getContext() call returns that same now-dead
      // context forever (renders as a flat gray "context lost" placeholder). The
      // browser reclaims the context naturally once the canvas node itself is
      // actually removed/GC'd, so forcing it here isn't necessary.
    },
  };
}
