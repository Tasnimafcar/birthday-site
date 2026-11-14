import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { burst } from '../lib/confetti'

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
    const cv = cvr.current
    const c = cv.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = 420
    const H = 440
    cv.width = W * dpr
    cv.height = H * dpr
    c.scale(dpr, dpr)

    const need = [0.65, 0.3, 0.95, 0.45, 0.8]
    const BY = 162
    const fl = [-72, -36, 0, 36, 72].map((x, i) => ({
      x: W / 2 + x,
      i,
      I: 1,
      ph: Math.random() * 6,
      dying: false,
      gone: false,
    }))
    const smoke = []
    let e = 0
    let w = 0
    let last = performance.now()
    let raf
    let finished = false
    let ready = false
    let tm

    const readMic = () => {
      const a = au.current
      if (!a.an) return 0
      a.an.getByteFrequencyData(a.buf)
      let sum = 0
      let lg = 0
      const nb = 40
      for (let i = 2; i < nb; i++) {
        const m = a.buf[i] / 255 + 0.003
        sum += m
        lg += Math.log(m)
      }
      const n = nb - 2
      const A = sum / n
      const flat = Math.exp(lg / n) / A
      if (a.base == null) {
        a.cal.push(A)
        if (a.cal.length >= 40) a.base = a.cal.reduce((x, y) => x + y, 0) / 40
        return 0
      }
      const lvl = Math.min(1, Math.max(0, (A - a.base - 0.04) / 0.25))
      return lvl * (0.5 + 0.5 * Math.min(1, Math.max(0, (flat - 0.35) / 0.35)))
    }

    const drip = (x0, x1, y) => {
      c.fillStyle = '#fff2f7'
      c.fillRect(x0, y, x1 - x0, 12)
      for (let x = x0 + 10, k = 0; x < x1; x += 22, k++) {
        c.beginPath()
        c.arc(x, y + 12, 9, 0, 7)
        c.fill()
        if (k % 2) {
          c.beginPath()
          c.arc(x, y + 22, 7, 0, 7)
          c.fill()
        }
      }
    }

    const cake = () => {
      c.fillStyle = '#e8e4ff'
      c.beginPath()
      c.ellipse(W / 2, 398, 195, 22, 0, 0, 7)
      c.fill()
      let g = c.createLinearGradient(0, 292, 0, 398)
      g.addColorStop(0, '#ffd98a')
      g.addColorStop(1, '#e9b35a')
      c.fillStyle = g
      c.beginPath()
      c.roundRect(W / 2 - 150, 292, 300, 104, 14)
      c.fill()
      drip(W / 2 - 150, W / 2 + 150, 292)
      g = c.createLinearGradient(0, 202, 0, 292)
      g.addColorStop(0, '#ff9bbd')
      g.addColorStop(1, '#ff6f9f')
      c.fillStyle = g
      c.beginPath()
      c.roundRect(W / 2 - 110, 202, 220, 92, 12)
      c.fill()
      drip(W / 2 - 110, W / 2 + 110, 202)
      c.fillStyle = '#fff2f7'
      c.beginPath()
      c.ellipse(W / 2, 202, 110, 10, 0, 0, 7)
      c.fill()
      c.fillStyle = '#9a4a2a'
      c.textAlign = 'center'
      c.font = '44px Gloock, Georgia, serif'
      c.fillText(String(CONFIG.age), W / 2, 364)
    }

    const candle = (x) => {
      const g = c.createLinearGradient(x - 5, 0, x + 5, 0)
      g.addColorStop(0, '#ffd6e4')
      g.addColorStop(0.5, '#fff')
      g.addColorStop(1, '#ff9bbd')
      c.fillStyle = g
      c.beginPath()
      c.roundRect(x - 5, BY, 10, 40, 2)
      c.fill()
      c.strokeStyle = '#4a3a3a'
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(x, BY)
      c.lineTo(x, BY - 4)
      c.stroke()
    }

    const flame = (f, t) => {
      const s = f.I
      if (s <= 0.02) return
      const lean = w * 20
      const sw = Math.sin(t * 5 + f.ph) * (1.2 + w * 5) + Math.sin(t * 9 + f.ph * 2) * 0.8
      const tx = f.x + (lean + sw) * s
      const ty = BY - 6 - 30 * s * (1 - 0.3 * w) + Math.sin(t * 7 + f.ph) * 1.5
      const x = f.x
      const b = BY - 4
      let g = c.createRadialGradient(x, b - 12, 2, x, b - 12, 38 * s)
      g.addColorStop(0, `rgba(255,200,100,${0.38 * s})`)
      g.addColorStop(1, 'rgba(255,200,100,0)')
      c.fillStyle = g
      c.beginPath()
      c.arc(x, b - 12, 38 * s, 0, 7)
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
    }

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
      const lit = fl.reduce((a, f) => a + f.I, 0) / fl.length
      const g = c.createRadialGradient(W / 2, 200, 10, W / 2, 230, 280)
      g.addColorStop(0, `rgba(255,190,90,${0.22 * lit})`)
      g.addColorStop(1, 'rgba(255,190,90,0)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
      cake()

      fl.forEach((f) => {
        candle(f.x)
        if (!f.dying && e > need[f.i]) f.dying = true
        if (f.dying && !f.gone) {
          f.I -= dt * 2.6
          if (f.I <= 0) {
            f.I = 0
            f.gone = true
            for (let k = 0; k < 7; k++) {
              smoke.push({
                x: f.x + (Math.random() - 0.5) * 4,
                y: BY - 8,
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

      if (!finished && fl.every((f) => f.gone)) {
        finished = true
        setOut(true)
        burst()
        tm = setTimeout(() => doneRef.current(), 3000)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
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
    <section className="flex min-h-screen flex-col items-center justify-center px-5 py-6 text-center">
      <h2 className="font-display text-3xl">{out ? 'Shubho janmodin!' : 'Ichchha koro, tarpor fu dao'}</h2>
      <div className="mt-4" style={{ width: 'min(92vw,420px)', aspectRatio: '420/440' }}>
        <canvas
          ref={cvr}
          aria-label="Janmodiner cake, upore mombati"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {!out && (
        <div className="mt-3 flex flex-col items-center gap-3" aria-live="polite">
          {mic === 'idle' && (
            <button type="button" className="btn" onClick={startMic}>
              Mic chalu koro, tarpor fu dao
            </button>
          )}
          {mic === 'on' && <p className="opacity-80">Ektu shanto thako, mic thik hocche...</p>}
          {mic === 'ready' && <p style={{ color: 'var(--gold)' }}>Ekhon mic er kache jore fu dao!</p>}
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
