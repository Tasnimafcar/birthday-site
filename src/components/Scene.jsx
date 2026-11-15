import { motion } from 'motion/react'
import sceneImg from '../assets/scene.webp'

// Meyer chobi (assets/scene.webp). Edge gulo akasher shathe mishe jay,
// ar lantern er alo jhilmil kore.
const MASK =
  'linear-gradient(to bottom, transparent 0%, #000 22%), linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)'

export default function Scene() {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{ height: 'min(78dvh, 135vw)', aspectRatio: '589/717' }}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: MASK,
          maskImage: MASK,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <img src={sceneImg} alt="" draggable={false} decoding="async" className="h-full w-full" />
        <motion.div
          className="pointer-events-none absolute"
          style={{
            left: '8.5%',
            top: '85%',
            width: '36%',
            height: '30%',
            x: '-50%',
            y: '-50%',
            mixBlendMode: 'screen',
            background: 'radial-gradient(closest-side, rgba(255,170,70,.5), rgba(255,150,50,0))',
          }}
          animate={{ opacity: [0.55, 1, 0.7, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
