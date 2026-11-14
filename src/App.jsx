import { useState } from 'react'
import { motion } from 'motion/react'
import StarField from './components/StarField'
import Journey from './components/Journey'
import Hunt from './components/Hunt'
import Cake from './components/Cake'
import Letter from './components/Letter'

export default function App() {
  const [stage, setStage] = useState('journey')
  const [flashKey, setFlashKey] = useState(0)

  const go = (next, flash = false) => {
    if (flash) setFlashKey((k) => k + 1)
    setStage(next)
  }

  return (
    <>
      <StarField />
      <canvas id="fx" aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 h-full w-full" />
      {flashKey > 0 && (
        <motion.div
          key={flashKey}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-20"
          style={{ background: '#a9a9ad' }}
        />
      )}
      <main className="relative z-10">
        {stage === 'journey' && <Journey onDone={() => go('hunt', true)} />}
        {stage === 'hunt' && <Hunt onDone={() => go('cake')} />}
        {stage === 'cake' && <Cake onDone={() => go('letter')} />}
        {stage === 'letter' && <Letter onAgain={() => go('journey')} />}
      </main>
    </>
  )
}
