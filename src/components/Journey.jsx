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

// Megh: chad kache ashar shomoy dui pashe soriye jay
function makeBlobs() {
  let sd = 7
  const r = () => {
    sd = (sd * 16807) % 2147483647
    return sd / 2147483647
  }
  return Array.from({ length: 18 }, () => ({
    x: 4 + r() * 92,
    y: 20 + r() * 42,
    w: 42 + r() * 34,
    h: 16 + r() * 14,
    a: 0.55 + r() * 0.4,
    mv: 70 + r() * 50,
  }))
}
const BLOBS = makeBlobs()

function Blob({ p, b }) {
  const side = b.x < 50 ? -1 : 1
  const x = useTransform(p, [0.08, 0.62], ['0vw', `${side * b.mv}vw`])
  const opacity = useTransform(p, [0.05, 0.14, 0.5, 0.66], [0, b.a, b.a, 0])
  const scale = useTransform(p, [0.08, 0.62], [1, 1.5])
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: `${b.x}%`,
        top: `${b.y}%`,
        width: `${b.w}vmin`,
        height: `${b.h}vmin`,
        marginLeft: `${-b.w / 2}vmin`,
        marginTop: `${-b.h / 2}vmin`,
        x,
        opacity,
        scale,
        background: 'radial-gradient(closest-side, rgba(190,200,245,.4), rgba(190,200,245,0))',
      }}
    />
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

  // Chad shuru te choto ar dure, shesh e pura screen bhore dey
  const kmax = useMemo(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const d0 = Math.max(52, Math.min(150, 0.12 * Math.min(w, h)))
    return (2.1 * Math.hypot(w / 2, h / 2)) / d0
  }, [])

  const moonScale = useTransform(p, (v) => Math.exp(Math.log(kmax) * Math.pow(v, 1.15)))
  const moonLeft = useTransform(p, [0, 0.85], ['76%', '50%'])
  const moonTop = useTransform(p, [0, 0.85], ['10%', '50%'])
  const sceneScale = useTransform(p, [0, 1], [1, 1.35])
  const sceneOp = useTransform(p, [0.6, 0.9], [1, 0])
  const fxOp = useTransform(p, [0, 0.2], [1, 0])
  const titleOp = useTransform(p, [0, 0.07], [1, 0])
  const hintOp = useTransform(p, [0, 0.04], [1, 0])
  const veilOp = useTransform(p, [0.93, 1], [0, 1])
  const starMask = useTransform(p, (v) => {
    const a = 42 + 70 * Math.min(1, v / 0.4)
    return `linear-gradient(to bottom,#000 0%,#000 ${a - 12}%,transparent ${a}%)`
  })

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

  // Animation shesh na hoa porjonto scroll lock
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
    <div ref={box} className="relative" style={{ height: '560vh' }}>
      <div className="sticky top-0 h-dvh overflow-hidden" style={{ background: '#070c1b' }}>
        {/* Chobi: pura screen. Meye jayga thekei thake, chad ta kache ashe */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ scale: sceneScale, opacity: sceneOp, transformOrigin: '76% 10%' }}
        >
          <Scene />
        </motion.div>

        {/* Chobir akashe jolojole tara (meyer opor e na) */}
        <StarField
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ WebkitMaskImage: starMask, maskImage: starMask }}
        />

        {/* Chad: dure, choto, upore dane */}
        <motion.div
          aria-hidden="true"
          className="absolute"
          style={{
            left: moonLeft,
            top: moonTop,
            x: '-50%',
            y: '-50%',
            scale: moonScale,
            width: 'clamp(52px, 12vmin, 150px)',
            height: 'clamp(52px, 12vmin, 150px)',
            willChange: 'transform',
          }}
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
            style={{ filter: 'drop-shadow(0 0 1.5vmin rgba(235,240,255,.35))' }}
          />
        </motion.div>

        {BLOBS.map((b, i) => (
          <Blob key={i} p={p} b={b} />
        ))}

        {/* Tara uRe jay, lekha ashe, gulap pORe */}
        <HeroFX skip={reduce} style={{ opacity: fxOp }} onFinish={() => setIntroDone(true)} />

        <motion.div className="absolute inset-x-0" style={{ top: '15%', opacity: titleOp }}>
          <HeroText name={CONFIG.name} />
        </motion.div>

        {/* Scroll hint */}
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ opacity: hintOp }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: introDone ? 1 : 0 }}
            transition={{ duration: 0.9 }}
            className="flex flex-col items-center gap-2 pb-5 pt-14"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,.5), transparent)', color: 'rgba(240,238,255,.92)' }}
          >
            <span style={{ fontSize: 11, letterSpacing: '0.38em', textTransform: 'uppercase', fontWeight: 600, paddingLeft: '0.38em' }}>
              Scroll down
            </span>
            <div
              className="relative"
              style={{ width: 22, height: 36, borderRadius: 12, border: '1.5px solid rgba(240,238,255,.75)' }}
            >
              <motion.span
                style={{ position: 'absolute', left: '50%', top: 6, width: 3, height: 7, borderRadius: 2, background: '#fff', x: '-50%' }}
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: veilOp, background: '#a9a9ad' }} />
      </div>
    </div>
  )
}
