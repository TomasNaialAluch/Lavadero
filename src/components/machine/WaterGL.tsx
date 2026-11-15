import { useEffect, useRef } from 'react'

/*
  Masa de agua con remolino, dibujada por la placa de video (WebGL) en colores planos.
  Cada píxel del círculo se gira según su distancia al centro y se corta en 4 tonos.
  Si WebGL falla o anda lento, llama a onFail y el padre usa la versión de olas.
*/
const VERT = `attribute vec2 a; varying vec2 uv; void main(){ uv = a; gl_Position = vec4(a, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
varying vec2 uv;
uniform float t;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ return 0.55 * noise(p) + 0.3 * noise(p * 2.03) + 0.15 * noise(p * 4.1); }
void main(){
  vec2 p = uv;
  float r = length(p);
  if (r > 1.0) discard;
  // remolino: el centro gira más rápido que el borde
  float sw = t * 0.9 + (1.0 - r) * 3.4;
  mat2 m = mat2(cos(sw), -sin(sw), sin(sw), cos(sw));
  vec2 q = m * p;
  q += 0.1 * vec2(fbm(q * 1.6 + t * 0.25), fbm(q * 1.6 + 7.0 - t * 0.3));
  float n = fbm(q * 1.8 + vec2(0.0, t * 0.2));
  float ang = atan(p.y, p.x);
  // 3 brazos que se enroscan hacia el centro y giran con el tiempo
  float arms = sin(ang * 3.0 - r * 9.0 + t * 1.8 + (n - 0.5) * 1.6) * 0.5 + 0.5;
  float v = arms * 0.8 + n * 0.25;
  vec3 deep = vec3(0.122, 0.435, 0.878);
  vec3 mid  = vec3(0.184, 0.545, 1.0);
  vec3 lite = vec3(0.353, 0.663, 1.0);
  vec3 foam = vec3(0.749, 0.890, 1.0);
  vec3 col = deep;
  if (v > 0.38) col = mid;
  if (v > 0.62) col = lite;
  if (v > 0.84) col = foam;
  // brillo blanco duro, fino, que se desliza con el giro
  float hl = smoothstep(0.012, 0.0, abs(v - 0.62) - 0.006) * step(0.35, r);
  col = mix(col, vec3(1.0), hl * 0.9);
  // borde del agua un poco más oscuro
  if (r > 0.93) col = deep;
  // transparente: se ve la ropa flotando detrás (más clara en las bandas altas)
  float a = 0.55;
  if (v > 0.38) a = 0.45;
  if (v > 0.62) a = 0.35;
  if (v > 0.84) a = 0.3;
  if (r > 0.93) a = 0.6;
  gl_FragColor = vec4(col * a, a);
}`

export default function WaterGL({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) { onFail(); return }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) { onFail(); return }
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { onFail(); return }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uT = gl.getUniformLocation(prog, 't')

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = canvas.width
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    fit()
    const draw = (t: number) => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uT, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const speed = reduce ? 5 : 5.5 // velocidad del remolino (con "reducir movimiento" un poco menos)
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    const lost = (e: Event) => { e.preventDefault(); onFail() }
    canvas.addEventListener('webglcontextlost', lost)

    let raf = 0
    {
      const t0 = performance.now()
      let prev = t0
      let frames = 0
      let slow = 0
      const loop = (now: number) => {
        draw(((now - t0) / 1000) * speed)
        // si anda por debajo de ~25 cuadros por segundo durante los primeros 3 s, se cambia al respaldo
        if (now - t0 < 3000) {
          frames++
          if (frames > 10 && now - prev > 45) slow++
          if (slow > 20) { onFail(); return }
        }
        prev = now
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.removeEventListener('webglcontextlost', lost) }
  }, [onFail])

  return <canvas ref={ref} className="water-canvas" aria-hidden="true" />
}
