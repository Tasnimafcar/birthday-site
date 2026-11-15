import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'
import { burst } from '../lib/confetti'

export default function Letter({ onAgain }) {
  const full = CONFIG.letter.replace('{nick}', CONFIG.nick)
  const [i, setI] = useState(0)
  const finished = i >= full.length

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (i < full.length) {
      const t = setTimeout(() => setI(i + 1), 38)
      return () => clearTimeout(t)
    }
  }, [i, full])

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{ background: 'rgba(232,228,255,.08)', border: '1px solid rgba(255,217,138,.4)' }}
      >
        <h2 className="font-display text-3xl" style={{ color: 'var(--gold)' }}>
          Priyo {CONFIG.nick},
        </h2>
        <p className="mt-4 text-lg leading-8" aria-label={full}>
          {full.slice(0, i)}
          <span style={{ opacity: 0.6 }}>{finished ? '' : '|'}</span>
        </p>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display mt-6 text-right text-2xl"
            style={{ color: 'var(--rose)' }}
          >
            {CONFIG.from}
          </motion.p>
        )}
      </div>
      {finished && (
        <motion.button
          type="button"
          className="btn mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            burst()
            setTimeout(onAgain, 1800)
          }}
        >
          Abar dekhbo
        </motion.button>
      )}
    </section>
  )
}
