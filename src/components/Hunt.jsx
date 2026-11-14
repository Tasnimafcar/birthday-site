import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import moonImg from '../assets/moon.webp'
import { CONFIG } from '../config'
import { burst } from '../lib/confetti'

const HEARTS = [[16, 20], [74, 14], [46, 46], [20, 74], [78, 68]]
const HEART_D =
  'M12 21s-7.5-4.6-9.5-9.3C1.2 8.4 3.2 5 6.5 5c2 0 3.5 1.1 5.5 3.2C14 6.1 15.5 5 17.5 5c3.3 0 5.3 3.4 4 6.7C19.5 16.4 12 21 12 21z'

export default function Hunt({ onDone }) {
  const [found, setFound] = useState([])
  const L = CONFIG.memories
  const done = found.length === HEARTS.length

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!done) return
    burst()
    const t = setTimeout(burst, 700)
    return () => clearTimeout(t)
  }, [done])

  const tap = (i) => {
    if (!found.includes(i)) setFound([...found, i])
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-5 py-8 text-center">
      <h2 className="font-display text-3xl">
        {done ? `Shob peye gechho, ${CONFIG.nick}!` : 'Chader pathore hridoy lukano ache'}
      </h2>
      <p className="mt-2 max-w-xs opacity-80">
        {done
          ? 'Tomar jonno 5ta hridoy, ar ei hridoy ta-o.'
          : `Jolojole hridoy gulo khuje tap koro (${found.length}/${HEARTS.length})`}
      </p>

      <div
        className="relative mt-5 overflow-hidden"
        style={{
          width: 'min(90vw,420px)',
          height: 'min(56vh,460px)',
          borderRadius: 18,
          border: '1px solid rgba(232,228,255,.25)',
          backgroundImage: `linear-gradient(rgba(14,16,48,.55),rgba(14,16,48,.72)),url("${moonImg}")`,
          backgroundSize: 'cover,230%',
          backgroundPosition: 'center,38% 55%',
        }}
      >
        {HEARTS.map((h, i) => {
          const on = found.includes(i)
          return (
            <motion.button
              key={i}
              type="button"
              aria-label={`Hridoy ${i + 1}`}
              onClick={() => tap(i)}
              animate={{ scale: on ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className="absolute cursor-pointer border-0 bg-transparent p-0"
              style={{
                left: `${h[0]}%`,
                top: `${h[1]}%`,
                x: '-50%',
                y: '-50%',
                width: 48,
                height: 48,
                opacity: on ? 1 : 0.3,
                filter: on ? 'drop-shadow(0 0 10px #ff7aa8)' : 'none',
                animation: on ? 'none' : 'twinkle 2.6s infinite',
                animationDelay: `${i * 0.45}s`,
              }}
            >
              <svg viewBox="0 0 24 24" width="30" height="30" className="mx-auto">
                <path d={HEART_D} fill={on ? '#ff7aa8' : '#ffffff'} />
              </svg>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-5 max-w-sm" style={{ minHeight: 120 }} aria-live="polite">
        {!done && found.length > 0 && (
          <motion.p
            key={found.length}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl leading-snug"
          >
            {L[found.length - 1]}
          </motion.p>
        )}
        {done && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-display text-xl leading-snug">{L[L.length - 1]}</p>
            <button type="button" className="btn mt-5" onClick={onDone}>
              Ekta surprise ache
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
