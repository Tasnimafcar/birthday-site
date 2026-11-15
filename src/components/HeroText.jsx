import { motion } from 'motion/react'

const LINE = 'Happy Birthday'

// Tara jokhon uRe jay, tar sathe sathe lekha ashe
export default function HeroText({ name }) {
  return (
    <div className="px-4 text-center">
      <div
        aria-label={LINE}
        className="font-display text-4xl sm:text-6xl"
        style={{ color: '#fff7e0', textShadow: '0 0 18px rgba(255,217,138,.8)' }}
      >
        {[...LINE].map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.7 + i * 0.09, duration: 0.7 }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ delay: 3.3, type: 'spring', stiffness: 120, damping: 12 }}
        className="mt-2"
      >
        <div
          className="font-display text-6xl sm:text-8xl"
          style={{
            background: 'linear-gradient(180deg,#ffffff,#ffd0e1 60%,#ff8fb5)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 16px rgba(255,122,168,.7))',
          }}
        >
          {name}
        </div>
      </motion.div>
    </div>
  )
}
