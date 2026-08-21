import { useEffect, useRef } from "react";

// The page's light source: a full-viewport WebGL pass drawing one white beam
// into a glass prism and a seven-ray spectral fan out of it. The canvas sits
// fixed behind everything; scrolling widens the dispersion and dims the scene,
// and the pointer tilts the beam a little.
//
// The canvas carries a CSS gradient background, so a machine without WebGL
// still gets the dark ground. Under prefers-reduced-motion a single frame is
// drawn and the loop never starts.

const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }";

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;

float sdSeg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0., 1.);
  return length(pa - ba*h);
}
float sdTri(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r/k;
  if (p.x + k*p.y > 0.) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.;
  p.x -= clamp(p.x, -2.*r, 0.);
  return -length(p)*sign(p.y);
}
vec3 spectral(float x){
  return clamp(vec3(abs(x*6.-3.)-1., 2.-abs(x*6.-2.), 2.-abs(x*6.-4.)), 0., 1.);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*u_res)/u_res.y;
  uv -= (u_mouse - .5)*0.05;

  vec3 col = vec3(0.012, 0.014, 0.022);
  col *= 1.0 - 0.4*dot(uv*vec2(.6,1.), uv*vec2(.6,1.));

  vec2 pc = vec2(0.34, 0.10);
  float dt = sdTri(uv - pc, 0.15);
  float glass = smoothstep(0.004, -0.004, dt);
  col += glass * vec3(0.020, 0.028, 0.045);
  col += exp(-abs(dt)*140.) * vec3(0.25, 0.30, 0.40) * 0.7;

  vec2 entry = pc + vec2(-0.095, 0.045);
  float ang = 0.08 + (u_mouse.y - .5)*0.10;
  vec2 dir = vec2(cos(ang), -sin(ang));
  float db = sdSeg(uv, entry - dir*3.0, entry);
  float beam = exp(-db*db*12000.) + 0.30*exp(-db*db*700.);
  col += beam * vec3(1.0, 0.98, 0.90) * 0.85;
  float light = beam;

  vec2 exitp = pc + vec2(0.105, -0.02);
  float di = sdSeg(uv, entry, exitp);
  col += exp(-di*di*5000.) * glass * vec3(0.7, 0.8, 1.0) * 0.4;

  float spread = 0.34 + 0.25*u_scroll;
  for (int i = 0; i < 7; i++) {
    float f = float(i)/6.;
    float ra = -0.10 - spread*f
             + 0.018*sin(u_time*0.5 + f*7.0)
             + (u_mouse.y - .5)*0.10;
    vec2 rd = vec2(cos(ra), sin(ra));
    float d = sdSeg(uv, exitp, exitp + rd*3.0);
    float g = exp(-d*d*9000.) + 0.25*exp(-d*d*600.);
    col += g * spectral(1.0 - f) * 0.50;
    light += g;
  }

  // dust motes, visible only where a beam lights them
  vec2 cell = floor(uv*90.);
  float tw = 0.5 + 0.5*sin(u_time*2.0 + hash(cell)*40.);
  col += step(0.985, hash(cell)) * tw * 0.12 * clamp(light*2.5, 0., 1.);

  col += (hash(gl_FragCoord.xy + fract(u_time)*61.7) - .5) * 0.035;

  col *= 1.0 - 0.8*u_scroll;
  gl_FragColor = vec4(pow(max(col, vec3(0.)), vec3(0.4545)), 1.0);
}`;

export function PrismCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl || gl.isContextLost()) return; // the CSS gradient on the canvas stays

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");

    let mx = 0.5;
    let my = 0.5;
    let tmx = 0.5;
    let tmy = 0.5;
    const onMove = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = (t: number) => {
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uScroll, Math.min(1, window.scrollY / window.innerHeight));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduced) {
      draw(0);
    } else {
      const loop = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // The context is left alive on purpose: getContext returns the same one
    // on a remount (StrictMode does this in dev), and a context released with
    // WEBGL_lose_context comes back as lost, which Chrome paints solid white.
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="prism" ref={ref} aria-hidden="true" />;
}
