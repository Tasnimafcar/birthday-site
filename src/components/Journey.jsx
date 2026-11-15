import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import Lenis from 'lenis'
import moonImg from '../assets/moon.webp'
import { CONFIG } from '../config'
import { warp } from '../lib/warp'
import Scene from './Scene'
import StarField from './StarField'
import HeroFX from './HeroFX'
import HeroText from './HeroText'

// Megh er stor: scroll korle kache ashe, boro hoy, tarpor mishe jay
const CLOUDS = [
  { win: [0.08, 0.2, 0.34, 0.46], blobs: [[8, 62, 70, 36], [55, 70, 80, 40], [30, 40, 60, 30], [70, 48, 64, 34]] },
  { win: [0.22, 0.34, 0.48, 0.6], blobs: [[-5, 50, 80, 40], [40, 58, 90, 42], [72, 36, 60, 30], [20, 72, 70, 34]] },
  { win: [0.38, 0.5, 0.62, 0.74], blobs: [[10, 44, 75, 38], [52, 52, 85, 40], [78, 66, 64, 32], [25, 28, 60, 30]] },
]

function CloudGroup({ p, win, blobs }) {
  const opacity = useTransform(p, win, [0, 0.9, 0.9, 0])
  const scale = useTransform(p, [win[0], win[3]], [1, 3.4])
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ opacity, scale, transformOrigin: '50% 40%' }}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${b[0]}%`,
            top: `${b[1]}%`,
            width: `${b[2]}vmin`,
            height: `${b[3]}vmin`,
            background: 'radial-gradient(closest-side, rgba(175,186,235,.34), rgba(175,186,235,0))',
          }}
        />
      ))}
    </motion.div>
  )
}

export default function Journey({ onDone }) {
  const box = useRef(null)
  const done = useRef(false)
  const timer = useRef(null)
  const lenisRef = useRef(null)
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const [introDone, setIntroDone] = useState(reduce)

  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })

  const kmax = useMemo(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    return (2.6 * Math.max(w, h)) / (0.3 * Math.min(w, h))
  }, [])

  const scale = useTransform(p, (v) => Math.exp(Math.log(kmax) * Math.pow(Math.max(0, v), 1.25)))
  const top = useTransform(p, (v) => `${27 + 23 * v}%`)
  const groundY = useTransform(p, [0, 0.22], ['0%', '112%'])
  const groundOp = useTransform(p, [0.15, 0.22], [1, 0])
  const fxOp = useTransform(p, [0, 0.18], [1, 0])
  const titleOp = useTransform(p, [0, 0.08], [1, 0])
  const hintOp = useTransform(p, [0, 0.05], [1, 0])
  const t2Op = useTransform(p, [0.22, 0.3, 0.42, 0.5], [0, 1, 1, 0])
  const t3Op = useTransform(p, [0.62, 0.7, 0.82, 0.9], [0, 1, 1, 0])
  const veilOp = useTransform(p, [0.9, 1], [0, 1])

  useMotionValueEvent(p, 'change', (v) => {
    warp.p = v
    if (v >= 0.995 && !done.current) {
      done.current = true
      timer.current = setTimeout(onDone, 900)
    }
  })

  // Lenis: makhon moto smooth scroll
  useEffect(() => {
    window.scrollTo(0, 0)
    warp.p = 0
    const lenis = new Lenis({ lerp: 0.08 })
    lenisRef.current = lenis
    let raf
    const loop = (t) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
      document.documentElement.style.overflow = ''
      warp.p = 0
      clearTimeout(timer.current)
    }
  }, [])

  // Lekha ashar age scroll lock
  useEffect(() => {
    const l = lenisRef.current
    if (!introDone) {
      document.documentElement.style.overflow = 'hidden'
      l && l.stop()
    } else {
      document.documentElement.style.overflow = ''
      l && l.start()
    }
  }, [introDone])

  return (
    <div ref={box} className="relative" style={{ height: '600vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 45% at 50% 25%, rgba(120,140,230,.22), transparent 70%)' }}
        />

        {/* Chad */}
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2"
          style={{ top, x: '-50%', y: '-50%', scale, width: '30vmin', height: '30vmin', willChange: 'transform' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              inset: '-70%',
              background:
                'radial-gradient(circle,rgba(225,232,255,.35) 0%,rgba(225,232,255,.12) 35%,transparent 62%)',
              animation: 'glow 5s infinite',
            }}
          />
          <img
            src={moonImg}
            alt=""
            draggable={false}
            decoding="async"
            className="absolute inset-0 h-full w-full rounded-full"
            style={{ filter: 'drop-shadow(0 0 2.5vmin rgba(235,240,255,.35))' }}
          />
        </motion.div>

        {CLOUDS.map((c, i) => (
          <CloudGroup key={i} p={p} win={c.win} blobs={c.blobs} />
        ))}

        {/* Meye, balcony, gach, lantern */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ y: groundY, opacity: groundOp }}>
          <Scene />
        </motion.div>

        {/* Chobi er akashe jolojole tara (meyer opor e na) */}
        <StarField
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom,#000 0%,#000 50%,transparent 64%)',
            maskImage: 'linear-gradient(to bottom,#000 0%,#000 50%,transparent 64%)',
          }}
        />

        {/* Tara uRe jay, lekha ashe, ful pORe */}
        <HeroFX skip={reduce} style={{ opacity: fxOp }} onFinish={() => setIntroDone(true)} />

        <motion.div className="absolute inset-x-0" style={{ top: 'max(40%, calc(27% + 17vmin))', opacity: titleOp }}>
          <HeroText name={CONFIG.name} />
        </motion.div>

        <motion.div className="absolute inset-x-0 text-center" style={{ bottom: '4%', opacity: hintOp, color: 'var(--gold)' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ duration: 0.8 }}>
            <p className="text-lg">Nice kore scroll koro</p>
            <motion.svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mt-1"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </motion.div>
        </motion.div>

        <motion.div className="absolute inset-x-0 px-6 text-center" style={{ top: '72%', opacity: t2Op }}>
          <p className="font-display mx-auto max-w-md text-3xl leading-snug sm:text-4xl">Chad ta kache ashche...</p>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 px-6 text-center"
          style={{ top: '48%', y: '-50%', opacity: t3Op, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,.8)' }}
        >
          <p className="font-display mx-auto max-w-md text-3xl leading-snug sm:text-5xl">Prai pouchhe gelam</p>
        </motion.div>

        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: veilOp, background: '#a9a9ad' }} />
      </div>
    </div>
  )
}
