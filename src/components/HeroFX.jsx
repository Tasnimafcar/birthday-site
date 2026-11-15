import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

// Tara ta kon path e uRbe (screen er fraction)
const PTS = [
  [0.5, 0.7], [0.34, 0.64], [0.1, 0.57], [0.3, 0.505],
  [0.55, 0.495], [0.8, 0.505], [0.95, 0.47], [1.08, 0.28],
]
const D = 4.2 // tara uRar shomoy (second)
const T_NAME = 3.3 // naam ashar shomoy, ful pORa shuru
const SPARK = ['#ffd98a', '#fff3c4', '#ffffff', '#ffb8d1']
const PETAL = ['#ffb8d1', '#ff9bbd', '#ffffff', '#ffd6e4', '#ff7aa8']

const cr = (a, b, c, d, t) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)

const at = (u) => {
  const n = PTS.length - 1
  const f = Math.min(0.9999, u) * n
  const i = Math.floor(f)
  const t = f - i
  const p0 = PTS[Math.max(0, i - 1)]
  const p1 = PTS[i]
  const p2 = PTS[i + 1]
  const p3 = PTS[Math.min(n, i + 2)]
  return [cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]
}

export default function HeroFX({ onFinish, skip, style }) {
  const ref = useRef(null)
  const fin = useRef(onFinish)

  useEffect(() => {
    fin.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (skip) {
      fin.current && fin.current()
      return
    }
    const cv = ref.current
    const c = cv.getContext('2d')
    let W = 0
    let H = 0
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = W * dpr
      cv.height = H * dpr
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const parts = []
    const petals = []
    const t0 = performance.now()
    let last = t0
    let raf
    let finished = false
    let burstDone = false

    const mkPetal = () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.25,
      vy: 18 + Math.random() * 26,
      sw: Math.random() * 6,
      swa: 12 + Math.random() * 22,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 2.2,
      s: 5 + Math.random() * 5,
      flower: Math.random() < 0.28,
      col: PETAL[Math.floor(Math.random() * PETAL.length)],
    })

    const drawPetal = (p) => {
      c.save()
      c.translate(p.x, p.y)
      c.rotate(p.rot)
      c.fillStyle = p.col
      c.globalAlpha = 0.92
      if (p.flower) {
        const s = p.s * 1.5
        for (let k = 0; k < 5; k++) {
          c.rotate(1.2566)
          c.beginPath()
          c.ellipse(0, -s * 0.6, s * 0.38, s * 0.62, 0, 0, 7)
          c.fill()
        }
        c.fillStyle = '#ffd98a'
        c.beginPath()
        c.arc(0, 0, s * 0.22, 0, 7)
        c.fill()
      } else {
        const s = p.s
        c.beginPath()
        c.moveTo(0, -s)
        c.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.7, s * 0.7, 0, s)
        c.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.5, 0, -s)
        c.fill()
      }
      c.restore()
    }

    const head = (x, y) => {
      const g = c.createRadialGradient(x, y, 0, x, y, 26)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.25, 'rgba(255,230,160,.8)')
      g.addColorStop(1, 'rgba(255,200,100,0)')
      c.fillStyle = g
      c.beginPath()
      c.arc(x, y, 26, 0, 7)
      c.fill()
      c.strokeStyle = 'rgba(255,255,255,.9)'
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(x - 16, y)
      c.lineTo(x + 16, y)
      c.moveTo(x, y - 16)
      c.lineTo(x, y + 16)
      c.stroke()
    }

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - t0) / 1000
      c.clearRect(0, 0, W, H)
      c.globalAlpha = 1

      if (t < D) {
        const tt = t / D
        const u = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2
        const [fx, fy] = at(u)
        const x = fx * W
        const y = fy * H
        for (let k = 0; k < 3; k++) {
          parts.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 22,
            vy: (Math.random() - 0.2) * 22 + 8,
            l: 1,
            r: 1 + Math.random() * 2.2,
            c: SPARK[(Math.random() * 4) | 0],
          })
        }
        head(x, y)
      }

      if (t >= T_NAME && !burstDone) {
        burstDone = true
        for (let k = 0; k < 70; k++) {
          const a = Math.random() * 6.283
          const sp = 40 + Math.random() * 160
          parts.push({
            x: W / 2,
            y: H * 0.57,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            l: 1,
            r: 1.5 + Math.random() * 2.5,
            c: SPARK[(Math.random() * 4) | 0],
          })
        }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]
        q.x += q.vx * dt
        q.y += q.vy * dt
        q.vy += 30 * dt
        q.l -= dt * 1.1
        if (q.l <= 0) {
          parts.splice(i, 1)
          continue
        }
        c.globalAlpha = q.l
        c.fillStyle = q.c
        c.beginPath()
        c.arc(q.x, q.y, q.r, 0, 7)
        c.fill()
      }
      c.globalAlpha = 1

      if (t >= T_NAME) {
        if (petals.length < 38 && Math.random() < dt * 9) petals.push(mkPetal())
        petals.forEach((p) => {
          p.y += p.vy * dt
          p.x += Math.sin(t * 1.3 + p.sw) * p.swa * dt
          p.rot += p.vr * dt
          if (p.y > H + 20) Object.assign(p, mkPetal())
          drawPetal(p)
        })
      }

      if (!finished && t > D + 0.5) {
        finished = true
        fin.current && fin.current()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [skip])

  return (
    <motion.canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={style}
    />
  )
}
