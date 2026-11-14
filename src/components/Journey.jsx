import { useEffect, useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import moonImg from '../assets/moon.webp'
import { CONFIG } from '../config'
import { warp } from '../lib/warp'

export default function Journey({ onDone }) {
  const box = useRef(null)
  const done = useRef(false)
  const timer = useRef(null)

  const { scrollYProgress: p } = useScroll({
    target: box,
    offset: ['start start', 'end end'],
  })

  const kmax = useMemo(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    return (2.6 * Math.max(w, h)) / (0.24 * Math.min(w, h))
  }, [])

  const scale = useTransform(p, (v) => Math.exp(Math.log(kmax) * Math.pow(Math.max(0, v), 1.25)))
  const top = useTransform(p, (v) => `${34 + 16 * v}%`)
  const titleOp = useTransform(p, [0, 0.12], [1, 0])
  const hintOp = useTransform(p, [0, 0.05], [1, 0])
  const t2Op = useTransform(p, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0])
  const t3Op = useTransform(p, [0.55, 0.65, 0.8, 0.9], [0, 1, 1, 0])
  const veilOp = useTransform(p, [0.9, 1], [0, 1])

  useMotionValueEvent(p, 'change', (v) => {
    warp.p = v
    if (v >= 0.995 && !done.current) {
      done.current = true
      timer.current = setTimeout(onDone, 900)
    }
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    warp.p = 0
    return () => {
      warp.p = 0
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div ref={box} className="relative" style={{ height: '520vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Chad */}
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2"
          style={{ top, x: '-50%', y: '-50%', scale, width: '24vmin', height: '24vmin', willChange: 'transform' }}
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
            className="absolute inset-0 h-full w-full rounded-full"
            style={{ filter: 'drop-shadow(0 0 2.5vmin rgba(235,240,255,.35))' }}
          />
        </motion.div>

        {/* Prothom text */}
        <motion.div className="absolute inset-x-0 px-6 text-center" style={{ top: '58%', opacity: titleOp }}>
          <h1 className="font-display text-5xl leading-tight sm:text-7xl">{CONFIG.name}, tomar jonno</h1>
          <p className="mx-auto mt-4 max-w-sm text-lg opacity-80">
            Oi dure ekta chad dekhchho? Oikhane tomar jonno kichu lukano ache.
          </p>
        </motion.div>

        <motion.div className="absolute inset-x-0 px-6 text-center" style={{ top: '72%', opacity: t2Op }}>
          <p className="font-display mx-auto max-w-md text-3xl leading-snug sm:text-4xl">Chad ta kache ashche...</p>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 px-6 text-center"
          style={{ top: '44%', y: '-50%', opacity: t3Op, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,.8)' }}
        >
          <p className="font-display mx-auto max-w-md text-3xl leading-snug sm:text-5xl">Prai pouchhe gelam</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div className="absolute inset-x-0 text-center" style={{ bottom: '7%', opacity: hintOp, color: 'var(--gold)' }}>
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

        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: veilOp, background: '#a9a9ad' }} />
      </div>
    </div>
  )
}
