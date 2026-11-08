'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-bleed WebGL sea drawn like a manga page: concentration lines in the
 * sky, layered wave crests in broken ink strokes, and rotated screentone
 * dots that deepen with each swell. Reacts to the pointer and to scroll.
 */

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDpr;
uniform float uScroll;

const vec3 PAPER = vec3(0.949, 0.914, 0.847);
const vec3 INK = vec3(0.071, 0.067, 0.063);
const vec3 SEA = vec3(0.102, 0.369, 0.659);
const vec3 SEAL = vec3(0.353, 0.663, 0.851);

float hash(float n){ return fract(sin(n) * 43758.5453123); }
float noise(float x){ float i = floor(x); float f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }

float halftone(vec2 px, float v, float cell, float ang){
  float c = cos(ang), s = sin(ang);
  vec2 r = mat2(c, -s, s, c) * px;
  vec2 g = fract(r / cell) - 0.5;
  float d = length(g);
  float rad = sqrt(clamp(v, 0.0, 1.0)) * 0.64;
  float aa = 1.2 / cell;
  return 1.0 - smoothstep(rad - aa, rad + aa, d);
}

void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  vec3 col = PAPER;

  float horizon = 0.3 - uScroll * 0.10;

  // ── Sky: concentration lines converging on the title.
  vec2 focus = vec2(0.5 + (uMouse.x - 0.5) * 0.05, 0.6 + (uMouse.y - 0.5) * 0.04);
  vec2 d = (uv - focus) * vec2(aspect * 0.52, 1.0);
  float ang = atan(d.y, d.x);
  float rad = length(d);
  float rays = 170.0;
  float a = (ang / 6.2831853 + 0.5) * rays;
  float id = floor(a);
  float f = fract(a);
  float on = step(0.3, hash(id * 7.13 + 1.0));
  float inner = 0.4 + 0.24 * hash(id * 3.7) + 0.015 * sin(t * 0.9 + id);
  float cellPx = max(rad * uRes.y * 6.2831853 / rays, 0.001);
  float width = (0.06 + 0.42 * pow(hash(id * 1.37), 2.0)) * smoothstep(inner, inner + 0.45, rad);
  float aa = 1.3 / cellPx;
  float ray = on * (1.0 - smoothstep(width * 0.5 - aa, width * 0.5 + aa, abs(f - 0.5)));
  float sky = smoothstep(horizon + 0.01, horizon + 0.05, uv.y);
  col = mix(col, INK, ray * sky * 0.9);

  // Haze of screentone over the horizon.
  float haze = smoothstep(horizon + 0.22, horizon, uv.y) * sky * 0.22;
  col = mix(col, SEAL, halftone(px, haze, 6.0 * uDpr, 0.26) * 0.8);

  // ── Sea: seven swells, painted back to front.
  float x = uv.x * aspect;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float depth = fi / 6.0;
    float base = horizon - 0.004 - pow(depth, 1.3) * 0.37;
    float amp = 0.004 + depth * 0.024;
    float freq = 17.0 - depth * 11.5;
    float speed = 0.22 + depth * 0.5;
    float lift = exp(-pow((uv.x - uMouse.x) * aspect * 2.6, 2.0)) * 0.016 * depth;
    float y = base
      + amp * sin(x * freq + t * speed + fi * 2.1)
      + amp * 0.45 * sin(x * freq * 2.17 - t * speed * 1.3 + fi)
      + lift * (0.6 + 0.4 * sin(t * 1.7));
    float dist = uv.y - y;

    if (dist < 0.0) {
      float below = -dist;
      float shade = clamp(below * (7.0 - depth * 3.5), 0.0, 1.0);
      float v = mix(0.04, 0.6, shade) * (0.5 + depth * 0.62);
      float cell = (4.6 + depth * 4.2) * uDpr;
      float dots = halftone(px, v, cell, 0.785);
      vec3 dotCol = mix(SEA, INK, smoothstep(0.35, 1.0, depth));
      col = mix(PAPER, dotCol, dots);
      // speed hatching just under each crest
      float hatchBand = smoothstep(0.0, 0.004, below) * (1.0 - smoothstep(0.006, 0.02 + depth * 0.02, below));
      float hatch = step(0.62, fract((px.y + px.x * 0.05) / (3.2 * uDpr))) * hatchBand * step(0.45, noise(x * 9.0 + fi * 3.0 + t * 0.4));
      col = mix(col, INK, hatch * 0.85);
    }

    float lw = (0.9 + depth * 2.4) * uDpr / uRes.y;
    float line = 1.0 - smoothstep(lw * 0.5, lw * 0.5 + 1.2 / uRes.y, abs(dist));
    float foam = step(0.3, noise(x * (30.0 - depth * 16.0) + t * speed * 2.5 + fi * 13.0));
    col = mix(col, INK, line * foam);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function HalftoneSea({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) {
      canvas.dataset.fallback = 'true';
      return;
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs || gl.isContextLost()) {
      canvas.dataset.fallback = 'true';
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uDpr = gl.getUniformLocation(prog, 'uDpr');
    const uScroll = gl.getUniformLocation(prog, 'uScroll');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (now: number) => {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const rect = canvas.getBoundingClientRect();
      const scroll = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 4 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = 1 - (e.clientY - rect.top) / rect.height;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (reduced) {
      draw(start);
      canvas.dataset.ready = 'true';
      const onResize = () => draw(performance.now());
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        io.disconnect();
      };
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    canvas.dataset.ready = 'true';
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0 tone-dots tone-fade-b opacity-30" style={{ ['--tone' as string]: 'var(--sea)' }} />
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100" />
    </div>
  );
}
