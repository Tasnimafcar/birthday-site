import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { T } from '../lib/timing'

// Tara ta kon path e uRbe (screen er fraction)
const PTS = [
  [0.5, 0.6], [0.37, 0.48], [0.14, 0.36], [0.22, 0.29],
  [0.46, 0.262], [0.7, 0.262], [0.88, 0.235], [0.78, 0.12], [0.76, 0.1],
]
const D = T.D
const SPARK = ['#ffd98a', '#fff3c4', '#ffffff', '#ffb8d1']
const ROSE = [
  ['#ff4d6d', '#d62f55', '#a8183f'],
  ['#ff6b8a', '#e04468', '#b02a50'],
  ['#e63950', '#c01f3c', '#8e1230'],
  ['#ff8fa3', '#f0627f', '#c23858'],
]

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

    const mkPetal = () => {
      const rose = Math.random() < 0.32
      return {
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.25,
        vy: rose ? 45 + Math.random() * 40 : 55 + Math.random() * 55,
        sw: Math.random() * 6,
        swa: 12 + Math.random() * 24,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 2.4,
        s: rose ? 9 + Math.random() * 8 : 5 + Math.random() * 5,
        rose,
        col: ROSE[Math.floor(Math.random() * ROSE.length)],
      }
    }

    const drawRose = (s, cols) => {
      c.fillStyle = cols[2]
      for (let k = 0; k < 6; k++) {
        c.rotate(1.0472)
        c.beginPath()
        c.ellipse(0, -s * 0.5, s * 0.5, s * 0.62, 0, 0, 7)
        c.fill()
      }
      c.fillStyle = cols[1]
      for (let k = 0; k < 5; k++) {
        c.rotate(1.2566)
        c.beginPath()
        c.ellipse(0, -s * 0.34, s * 0.38, s * 0.46, 0, 0, 7)
        c.fill()
      }
      c.fillStyle = cols[0]
      c.beginPath()
      c.arc(0, 0, s * 0.3, 0, 7)
      c.fill()
      c.strokeStyle = cols[2]
      c.lineWidth = Math.max(1, s * 0.07)
      c.beginPath()
      c.arc(0, 0, s * 0.18, 0.3, 4.6)
      c.stroke()
      c.beginPath()
      c.arc(s * 0.04, 0, s * 0.08, 0.2, 4.2)
      c.stroke()
    }

    const drawPetal = (p) => {
      c.save()
      c.translate(p.x, p.y)
      c.rotate(p.rot)
      c.globalAlpha = 0.95
      if (p.rose) {
        drawRose(p.s, p.col)
      } else {
        const s = p.s
        c.fillStyle = p.col[0]
        c.beginPath()
        c.moveTo(0, -s)
        c.bezierCurveTo(s * 0.95, -s * 0.5, s * 0.75, s * 0.75, 0, s)
        c.bezierCurveTo(-s * 0.75, s * 0.75, -s * 0.95, -s * 0.5, 0, -s)
        c.fill()
        c.fillStyle = p.col[1]
        c.globalAlpha = 0.5
        c.beginPath()
        c.ellipse(0, s * 0.2, s * 0.35, s * 0.6, 0, 0, 7)
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

      if (t >= T.BURST && !burstDone) {
        burstDone = true
        for (let k = 0; k < 70; k++) {
          const a = Math.random() * 6.283
          const sp = 40 + Math.random() * 160
          parts.push({
            x: W / 2,
            y: H * 0.3,
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

      if (t >= T.PETAL) {
        if (petals.length < 46 && Math.random() < dt * 14) petals.push(mkPetal())
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
