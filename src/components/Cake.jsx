import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'
import { burst } from '../lib/confetti'

const W = 460
const H = 500
const CX = W / 2
const NEED = [0.65, 0.3, 0.95, 0.45, 0.8, 0.55] // protiti mombati nibhte koto fu lage

function MicIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  )
}

export default function Cake({ onDone }) {
  const cvr = useRef(null)
  const manual = useRef(0)
  const au = useRef({})
  const doneRef = useRef(onDone)
  const [mic, setMic] = useState('idle')
  const [err, setErr] = useState('')
  const [out, setOut] = useState(false)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  const startMic = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unsupported')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const AC = window.AudioContext || window.webkitAudioContext
      const ac = new AC()
      if (ac.state === 'suspended') await ac.resume()
      const an = ac.createAnalyser()
      an.fftSize = 1024
      an.smoothingTimeConstant = 0.4
      ac.createMediaStreamSource(stream).connect(an)
      au.current = { stream, ac, an, buf: new Uint8Array(an.frequencyBinCount), base: null, cal: [] }
      setMic('on')
    } catch (e) {
      setErr((e && (e.name || e.message)) || 'unsupported')
      setMic('denied')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    let raf
    let tm
    const cv = cvr.current
    const c = cv.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = W * dpr
    cv.height = H * dpr
    c.setTransform(dpr, 0, 0, dpr, 0, 0)

    const run = async () => {
      try {
        await document.fonts.load('96px Gloock')
      } catch (e) {
        /* font na pele-o cholbe */
      }
      if (cancelled) return

      // ---------- helpers ----------
      const edgeY = (cx, y0, rx, ry, x) => y0 + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2))

      const cylinder = (cx, y0, y1, rx, ry, cols) => {
        const g = c.createLinearGradient(cx - rx, 0, cx + rx, 0)
        cols.forEach(([o, col]) => g.addColorStop(o, col))
        c.fillStyle = g
        c.beginPath()
        c.moveTo(cx - rx, y0)
        c.lineTo(cx - rx, y1)
        c.ellipse(cx, y1, rx, ry, 0, Math.PI, 0, true)
        c.lineTo(cx + rx, y0)
        c.ellipse(cx, y0, rx, ry, 0, 0, Math.PI, false)
        c.closePath()
        c.fill()
      }

      const berry = (x, y, r) => {
        const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.2)
        g.addColorStop(0, '#ff6b6b')
        g.addColorStop(1, '#c4162a')
        c.fillStyle = g
        c.beginPath()
        c.moveTo(x, y + r * 1.05)
        c.bezierCurveTo(x + r * 1.25, y + r * 0.2, x + r * 0.95, y - r * 0.95, x, y - r * 0.7)
        c.bezierCurveTo(x - r * 0.95, y - r * 0.95, x - r * 1.25, y + r * 0.2, x, y + r * 1.05)
        c.fill()
        c.fillStyle = 'rgba(255,236,200,.9)'
        ;[[-0.4, -0.1], [0.4, -0.1], [0, 0.2], [-0.25, 0.5], [0.25, 0.5]].forEach(([a, b]) => {
          c.beginPath()
          c.ellipse(x + a * r, y + b * r, r * 0.07, r * 0.1, 0, 0, 7)
          c.fill()
        })
        c.fillStyle = '#3f9b4d'
        ;[-1, 0, 1].forEach((k) => {
          c.save()
          c.translate(x, y - r * 0.75)
          c.rotate(k * 0.7)
          c.beginPath()
          c.ellipse(0, -r * 0.28, r * 0.22, r * 0.45, 0, 0, 7)
          c.fill()
          c.restore()
        })
      }

      const rosette = (x, y, r) => {
        c.fillStyle = '#ffc9d8'
        c.beginPath()
        c.arc(x, y, r, 0, 7)
        c.fill()
        c.strokeStyle = '#ff9fb9'
        c.lineWidth = 1.2
        for (let k = 1; k <= 3; k++) {
          c.beginPath()
          c.arc(x, y, (r * k) / 3.4, k, k + 4.4)
          c.stroke()
        }
      }

      const pearl = (x, y, r) => {
        const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(1, '#e6d4e3')
        c.fillStyle = g
        c.beginPath()
        c.arc(x, y, r, 0, 7)
        c.fill()
      }

      const DRIP = [18, 30, 14, 38, 22, 12, 34, 20, 28, 16, 32]
      const drips = (cx, y0, rx, ry) => {
        c.strokeStyle = '#4b2a20'
        c.lineWidth = 12
        c.lineCap = 'round'
        c.beginPath()
        c.ellipse(cx, y0, rx - 4, ry - 1, 0, 0, Math.PI, false)
        c.stroke()
        const n = DRIP.length
        for (let i = 0; i < n; i++) {
          const x = cx - rx + 16 + (i * (2 * rx - 32)) / (n - 1)
          const w = 13
          const l = DRIP[i]
          const ey = edgeY(cx, y0, rx, ry, x)
          const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
          g.addColorStop(0, '#3a1f17')
          g.addColorStop(0.4, '#6b3b2c')
          g.addColorStop(1, '#3a1f17')
          c.fillStyle = g
          c.beginPath()
          c.moveTo(x - w / 2, ey - 2)
          c.lineTo(x - w / 2, ey + l)
          c.arc(x, ey + l, w / 2, Math.PI, 0, true)
          c.lineTo(x + w / 2, ey - 2)
          c.closePath()
          c.fill()
          c.strokeStyle = 'rgba(255,255,255,.25)'
          c.lineWidth = 1.5
          c.beginPath()
          c.moveTo(x - w / 4, ey + 2)
          c.lineTo(x - w / 4, ey + l - 2)
          c.stroke()
        }
      }

      // ---------- number mombati ("18") ----------
      const digits = String(CONFIG.age).split('')
      const FS = 100
      const m = document.createElement('canvas').getContext('2d')
      m.font = `${FS}px Gloock, Georgia, serif`
      const widths = digits.map((d) => m.measureText(d).width)
      const asc = Math.max(...digits.map((d) => m.measureText(d).actualBoundingBoxAscent))
      const gap = 10
      const totalW = widths.reduce((a, b) => a + b, 0) + gap * (digits.length - 1)
      const nc = document.createElement('canvas')
      nc.width = Math.ceil(totalW + 28)
      nc.height = Math.ceil(asc + 26)
      const n = nc.getContext('2d')
      n.font = `${FS}px Gloock, Georgia, serif`
      n.textBaseline = 'alphabetic'
      n.lineJoin = 'round'
      const NB = 234 // number mombati cake er upor kothay daNriye
      const left = CX - nc.width / 2
      const numFlames = []
      let ox = 14
      digits.forEach((d, i) => {
        const base = asc + 13
        n.lineWidth = 8
        n.strokeStyle = '#d9668a'
        n.strokeText(d, ox, base)
        const g = n.createLinearGradient(0, 0, 0, nc.height)
        g.addColorStop(0, '#ffd9e3')
        g.addColorStop(1, '#ff8fb0')
        n.fillStyle = g
        n.fillText(d, ox, base)
        numFlames.push({ x: left + ox + widths[i] / 2, y: NB - asc - 14 })
        ox += widths[i] + gap
      })
      n.globalCompositeOperation = 'source-atop'
      n.strokeStyle = 'rgba(255,255,255,.45)'
      n.lineWidth = 7
      for (let x = -nc.height; x < nc.width + nc.height; x += 24) {
        n.beginPath()
        n.moveTo(x, 0)
        n.lineTo(x + nc.height, nc.height)
        n.stroke()
      }
      const sh = n.createLinearGradient(0, 0, nc.width, 0)
      sh.addColorStop(0, 'rgba(255,255,255,.35)')
      sh.addColorStop(0.5, 'rgba(255,255,255,0)')
      sh.addColorStop(1, 'rgba(120,20,60,.22)')
      n.fillStyle = sh
      n.fillRect(0, 0, nc.width, nc.height)
      n.globalCompositeOperation = 'source-over'

      // ---------- mombati list ----------
      const THIN = [[138, 238], [166, 244], [294, 244], [322, 238]]
      const THIN_H = 56
      const flames = [
        ...THIN.map(([x, yb]) => ({ x, y: yb - THIN_H - 7, sz: 1 })),
        ...numFlames.map((f) => ({ x: f.x, y: f.y, sz: 1.25 })),
      ].map((f, i) => ({ ...f, i, I: 1, ph: Math.random() * 6, dying: false, gone: false }))

      const thinCandle = (x, yb) => {
        const w = 8
        const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
        g.addColorStop(0, '#ffd6e4')
        g.addColorStop(0.5, '#ffffff')
        g.addColorStop(1, '#ff9bbd')
        c.fillStyle = g
        c.beginPath()
        c.roundRect(x - w / 2, yb - THIN_H, w, THIN_H, 3)
        c.fill()
        c.save()
        c.beginPath()
        c.roundRect(x - w / 2, yb - THIN_H, w, THIN_H, 3)
        c.clip()
        c.strokeStyle = 'rgba(255,100,150,.75)'
        c.lineWidth = 3
        for (let k = -w; k < THIN_H + w; k += 13) {
          c.beginPath()
          c.moveTo(x - w, yb - THIN_H + k)
          c.lineTo(x + w, yb - THIN_H + k + w * 2)
          c.stroke()
        }
        c.restore()
        c.strokeStyle = '#3a2a2a'
        c.lineWidth = 1.5
        c.beginPath()
        c.moveTo(x, yb - THIN_H)
        c.lineTo(x, yb - THIN_H - 6)
        c.stroke()
      }

      // ---------- state ----------
      const smoke = []
      const sparks = Array.from({ length: 16 }, (_, i) => ({
        x: 60 + Math.random() * 340,
        y: 70 + Math.random() * 190,
        ph: Math.random() * 6,
        s: 1.5 + Math.random() * 2,
        i,
      }))
      let e = 0
      let w = 0
      let last = performance.now()
      let finished = false
      let ready = false

      const readMic = () => {
        const a = au.current
        if (!a.an) return 0
        a.an.getByteFrequencyData(a.buf)
        let sum = 0
        let lg = 0
        const nb = 40
        for (let i = 2; i < nb; i++) {
          const v = a.buf[i] / 255 + 0.003
          sum += v
          lg += Math.log(v)
        }
        const k = nb - 2
        const A = sum / k
        const flat = Math.exp(lg / k) / A
        if (a.base == null) {
          a.cal.push(A)
          if (a.cal.length >= 40) a.base = a.cal.reduce((x, y) => x + y, 0) / 40
          return 0
        }
        const lvl = Math.min(1, Math.max(0, (A - a.base - 0.04) / 0.25))
        return lvl * (0.5 + 0.5 * Math.min(1, Math.max(0, (flat - 0.35) / 0.35)))
      }

      const flame = (f, t) => {
        const s = f.I * f.sz
        if (f.I <= 0.02) return
        const lean = w * 20
        const sw = Math.sin(t * 5 + f.ph) * (1.2 + w * 5) + Math.sin(t * 9 + f.ph * 2) * 0.8
        const tx = f.x + (lean + sw) * s
        const ty = f.y - 6 - 30 * s * (1 - 0.3 * w) + Math.sin(t * 7 + f.ph) * 1.5
        const x = f.x
        const b = f.y
        let g = c.createRadialGradient(x, b - 12, 2, x, b - 12, 40 * s)
        g.addColorStop(0, `rgba(255,200,100,${0.4 * f.I})`)
        g.addColorStop(1, 'rgba(255,200,100,0)')
        c.fillStyle = g
        c.beginPath()
        c.arc(x, b - 12, 40 * s, 0, 7)
        c.fill()
        c.beginPath()
        c.moveTo(x, b + 3)
        c.bezierCurveTo(x - 8 * s, b - 5 * s, x - 5 * s + lean * 0.35 * s, b - 18 * s, tx, ty)
        c.bezierCurveTo(x + 5 * s + lean * 0.35 * s, b - 18 * s, x + 8 * s, b - 5 * s, x, b + 3)
        g = c.createRadialGradient(x, b - 4, 1, x, b - 8, 20 * s)
        g.addColorStop(0, '#fff8d6')
        g.addColorStop(0.45, '#ffc24d')
        g.addColorStop(1, 'rgba(255,110,30,.2)')
        c.fillStyle = g
        c.fill()
        // flame er bhetor er neel ongsho
        c.fillStyle = 'rgba(120,170,255,.55)'
        c.beginPath()
        c.ellipse(x, b - 2, 2 * s, 4 * s, 0, 0, 7)
        c.fill()
      }

      // ---------- draw ----------
      const drawCake = () => {
        // plate
        let g = c.createRadialGradient(CX, 468, 10, CX, 468, 240)
        g.addColorStop(0, 'rgba(0,0,0,.4)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        c.fillStyle = g
        c.beginPath()
        c.ellipse(CX, 468, 240, 36, 0, 0, 7)
        c.fill()
        g = c.createLinearGradient(0, 420, 0, 480)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(1, '#cfc9ea')
        c.fillStyle = g
        c.beginPath()
        c.ellipse(CX, 450, 205, 30, 0, 0, 7)
        c.fill()
        c.fillStyle = '#f4f0ff'
        c.beginPath()
        c.ellipse(CX, 446, 196, 25, 0, 0, 7)
        c.fill()
        c.strokeStyle = 'rgba(255,255,255,.8)'
        c.lineWidth = 1.5
        c.beginPath()
        c.ellipse(CX, 446, 196, 25, 0, Math.PI * 1.05, Math.PI * 1.95)
        c.stroke()

        // niche tier
        cylinder(CX, 322, 440, 150, 28, [
          [0, '#e2aebb'], [0.16, '#ffd9e1'], [0.42, '#fff3f1'], [0.78, '#f3c6d0'], [1, '#cf94a5'],
        ])
        g = c.createRadialGradient(CX, 322, 10, CX, 322, 150)
        g.addColorStop(0, '#fff8f3')
        g.addColorStop(1, '#f6d6d9')
        c.fillStyle = g
        c.beginPath()
        c.ellipse(CX, 322, 150, 28, 0, 0, 7)
        c.fill()
        for (let a = 0.1; a < Math.PI; a += 0.26) {
          rosette(CX + 128 * Math.cos(a), 322 + 24 * Math.sin(a), 8.5)
        }
        for (let a = 0.07 * Math.PI; a < 0.94 * Math.PI; a += 0.058 * Math.PI) {
          pearl(CX + 150 * Math.cos(a), 440 + 28 * Math.sin(a) - 4, 5)
        }
        c.fillStyle = '#ffd98a'
        for (let i = 0; i < 26; i++) {
          const x = 90 + ((i * 53) % 280)
          const y = 350 + ((i * 37) % 68)
          c.beginPath()
          c.arc(x, y, 1.7, 0, 7)
          c.fill()
        }

        // upor tier
        cylinder(CX, 235, 322, 105, 20, [
          [0, '#e3cdbb'], [0.16, '#fff0e2'], [0.42, '#fffaf4'], [0.78, '#f1dccb'], [1, '#c9ab94'],
        ])
        g = c.createRadialGradient(CX - 25, 230, 4, CX, 235, 105)
        g.addColorStop(0, '#7a4636')
        g.addColorStop(1, '#3b2018')
        c.fillStyle = g
        c.beginPath()
        c.ellipse(CX, 235, 105, 20, 0, 0, 7)
        c.fill()
        c.fillStyle = 'rgba(255,255,255,.22)'
        c.beginPath()
        c.ellipse(CX - 38, 229, 30, 5, -0.1, 0, 7)
        c.fill()
        drips(CX, 235, 105, 20)

        // strawberry ring
        const ring = []
        for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 9) {
          ring.push([CX + 90 * Math.cos(a + 0.3), 235 + 13 * Math.sin(a + 0.3)])
        }
        ring.sort((p, q) => p[1] - q[1]).forEach(([x, y]) => berry(x, y - 3, 9))
      }

      // ---------- loop ----------
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const t = now / 1000
        if (au.current.an && !ready && au.current.base != null) {
          ready = true
          setMic('ready')
        }
        const target = Math.max(readMic(), manual.current)
        w += (target - w) * Math.min(1, dt * 10)
        if (w > 0.18) e += w * dt
        else e = Math.max(0, e - dt * 0.6)

        c.clearRect(0, 0, W, H)
        const lit = flames.reduce((a, f) => a + f.I, 0) / flames.length
        const g = c.createRadialGradient(CX, 230, 10, CX, 260, 300)
        g.addColorStop(0, `rgba(255,190,90,${0.26 * lit})`)
        g.addColorStop(1, 'rgba(255,190,90,0)')
        c.fillStyle = g
        c.fillRect(0, 0, W, H)

        drawCake()
        THIN.forEach(([x, yb]) => thinCandle(x, yb))
        c.drawImage(nc, left, NB - nc.height + 13)
        numFlames.forEach((f) => {
          c.strokeStyle = '#3a2a2a'
          c.lineWidth = 2
          c.beginPath()
          c.moveTo(f.x, f.y + 6)
          c.lineTo(f.x, f.y + 14)
          c.stroke()
        })

        flames.forEach((f) => {
          if (!f.dying && e > NEED[f.i % NEED.length]) f.dying = true
          if (f.dying && !f.gone) {
            f.I -= dt * 2.6
            if (f.I <= 0) {
              f.I = 0
              f.gone = true
              for (let k = 0; k < 8; k++) {
                smoke.push({
                  x: f.x + (Math.random() - 0.5) * 4,
                  y: f.y - 8,
                  vx: (Math.random() - 0.2) * 14,
                  vy: -(18 + Math.random() * 22),
                  a: 0.5,
                  r: 2 + Math.random() * 3,
                })
              }
            }
          }
          flame(f, t)
        })

        for (let i = smoke.length - 1; i >= 0; i--) {
          const q = smoke[i]
          q.x += q.vx * dt
          q.y += q.vy * dt
          q.r += dt * 6
          q.a -= dt * 0.35
          if (q.a <= 0) {
            smoke.splice(i, 1)
            continue
          }
          c.fillStyle = `rgba(210,210,225,${q.a})`
          c.beginPath()
          c.arc(q.x, q.y, q.r, 0, 7)
          c.fill()
        }

        // jhilmil
        if (lit > 0.3) {
          sparks.forEach((s) => {
            const al = Math.max(0, Math.sin(t * 2 + s.ph)) * lit
            if (al < 0.05) return
            c.fillStyle = `rgba(255,236,170,${al})`
            c.beginPath()
            c.moveTo(s.x, s.y - s.s * 2)
            c.lineTo(s.x + s.s * 0.5, s.y - s.s * 0.5)
            c.lineTo(s.x + s.s * 2, s.y)
            c.lineTo(s.x + s.s * 0.5, s.y + s.s * 0.5)
            c.lineTo(s.x, s.y + s.s * 2)
            c.lineTo(s.x - s.s * 0.5, s.y + s.s * 0.5)
            c.lineTo(s.x - s.s * 2, s.y)
            c.lineTo(s.x - s.s * 0.5, s.y - s.s * 0.5)
            c.closePath()
            c.fill()
          })
        }

        if (!finished && flames.every((f) => f.gone)) {
          finished = true
          setOut(true)
          burst()
          tm = setTimeout(() => doneRef.current(), 3000)
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    run()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(tm)
      const a = au.current
      if (a.stream) a.stream.getTracks().forEach((tr) => tr.stop())
      if (a.ac) a.ac.close().catch(() => {})
      au.current = {}
    }
  }, [])

  const hold = (v) => () => {
    manual.current = v
  }

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-5 py-6 text-center">
      <h2 className="font-display text-3xl">{out ? 'Shubho janmodin!' : 'Ichchha koro, tarpor fu dao'}</h2>
      <div className="mt-2" style={{ width: 'min(92vw,440px)', aspectRatio: `${W}/${H}` }}>
        <canvas
          ref={cvr}
          aria-label="Janmodiner cake, upore mombati"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {!out && (
        <div className="mt-2 flex flex-col items-center gap-3" aria-live="polite">
          {mic === 'idle' && (
            <button type="button" className="btn inline-flex items-center gap-2" onClick={startMic}>
              <MicIcon size={20} />
              Mic chalu koro
            </button>
          )}
          {mic === 'on' && <p className="opacity-80">Ektu shanto thako, mic thik hocche...</p>}
          {mic === 'ready' && (
            <p className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <motion.span
                className="inline-flex"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              >
                <MicIcon size={20} />
              </motion.span>
              Ekhon mic er kache jore fu dao!
            </p>
          )}
          {mic === 'denied' && (
            <p className="max-w-xs opacity-80">Mic paoa jay ni ({err}). Niche er button ta dhore rakho.</p>
          )}
          <button
            type="button"
            className="rounded-full px-5 py-2 text-sm"
            style={{
              border: '1px solid rgba(232,228,255,.4)',
              background: 'transparent',
              color: 'var(--mist)',
              touchAction: 'none',
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onPointerDown={hold(1)}
            onPointerUp={hold(0)}
            onPointerLeave={hold(0)}
            onPointerCancel={hold(0)}
          >
            Ba, ekhane dhore rakho (fu er moto)
          </button>
        </div>
      )}
    </section>
  )
}
