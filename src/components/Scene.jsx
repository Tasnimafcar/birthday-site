import { useState } from 'react'
import { motion } from 'motion/react'
import sceneImg from '../assets/scene.webp'

// Chobi shob somoy pura screen e. Meye ta bam-majhkhane thake.
// Jodi nijer chobi (scene.webp) boshao, ei duto ta thik koro:
const FOCUS_X = 0.44 // chobir kon jayga screen er majhkhane (0 = bam, 1 = dan)
const LANTERN = { x: 36.3, y: 85 } // lantern kon jaygay (% hishebe), na thakle null koro

export default function Scene() {
  const [ratio, setRatio] = useState(1789 / 717)
  return (
    <div
      className="absolute top-0"
      style={{
        height: '100%',
        aspectRatio: String(ratio),
        left: `calc((100vw - 100dvh * ${ratio}) * ${FOCUS_X})`,
      }}
    >
      <img
        src={sceneImg}
        alt=""
        draggable={false}
        decoding="async"
        className="h-full w-full"
        onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
      />
      {LANTERN && (
        <motion.div
          className="pointer-events-none absolute"
          style={{
            left: `${LANTERN.x}%`,
            top: `${LANTERN.y}%`,
            width: '9%',
            height: '28%',
            x: '-50%',
            y: '-50%',
            mixBlendMode: 'screen',
            background: 'radial-gradient(closest-side, rgba(255,170,70,.5), rgba(255,150,50,0))',
          }}
          animate={{ opacity: [0.55, 1, 0.7, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
