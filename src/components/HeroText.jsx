import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { T } from '../lib/timing'

// Kolom diye lekhar moto: bam theke dane dhire dhire ashe
function Wipe({ at, dur, className, style, children }) {
  const v = useMotionValue(-12)
  const mask = useTransform(v, (x) => `linear-gradient(90deg,#000 ${x - 10}%,transparent ${x + 2}%)`)
  useEffect(() => {
    const a = animate(v, 112, { duration: dur, delay: at, ease: 'easeInOut' })
    return () => a.stop()
  }, [v, at, dur])
  return (
    <motion.div className={className} style={{ ...style, WebkitMaskImage: mask, maskImage: mask }}>
      {children}
    </motion.div>
  )
}

export default function HeroText({ name }) {
  return (
    <motion.div
      className="px-3 text-center"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4.5 }}
    >
      <Wipe
        at={T.LINE1}
        dur={T.LINE1_DUR}
        className="font-script px-4 text-5xl leading-[1.2] sm:text-6xl"
        style={{ color: '#fff1d6', textShadow: '0 0 14px rgba(255,214,150,.65), 0 0 40px rgba(255,170,110,.35)' }}
      >
        Happy Birthday
      </Wipe>
      <Wipe at={T.NAME_AT} dur={T.NAME_DUR} className="px-4">
        <div
          className="font-script text-7xl leading-[1.1] sm:text-8xl"
          style={{
            background: 'linear-gradient(180deg,#ffffff 0%,#ffe3ec 45%,#ffb3c8 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 14px rgba(255,150,180,.65))',
          }}
        >
          {name}
        </div>
      </Wipe>
    </motion.div>
  )
}
