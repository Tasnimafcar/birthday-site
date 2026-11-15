import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { warp } from '../lib/warp'

export default function StarField({ className, style }) {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    const x = c.getContext('2d')
    let W, H, S = [], sh = null, raf

    const resize = () => {
      W = c.width = window.innerWidth
      H = c.height = window.innerHeight
      S = Array.from({ length: Math.min(420, (W * H) / 2800) | 0 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3 + (Math.random() < 0.06 ? 1.1 : 0),
        p: Math.random() * 6,
        z: Math.random() * 0.9 + 0.1,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const iv = setInterval(() => {
      if (!sh) sh = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, l: 0 }
    }, 4500)

    const frame = (t) => {
      const SP = warp.p
      x.clearRect(0, 0, W, H)
      const k = 1 + SP * SP * 5
      S.forEach((s) => {
        const f = 1 + (k - 1) * s.z
        const px = W / 2 + (s.x - W / 2) * f
        const py = H * 0.4 + (s.y - H * 0.4) * f
        if (px < 0 || px > W || py < 0 || py > H) return
        x.globalAlpha = Math.max(
          0,
          (0.4 + 0.6 * Math.abs(Math.sin(t / 1200 + s.p))) * (1 - Math.max(0, SP - 0.85) * 6),
        )
        x.fillStyle = '#e8e4ff'
        x.beginPath()
        x.arc(px, py, s.r * (1 + (f - 1) * 0.25), 0, 7)
        x.fill()
      })
      if (sh) {
        sh.l += 9
        sh.x += 7
        sh.y += 4
        x.globalAlpha = 1
        const g = x.createLinearGradient(sh.x, sh.y, sh.x - 90, sh.y - 50)
        g.addColorStop(0, '#ffd98a')
        g.addColorStop(1, 'transparent')
        x.strokeStyle = g
        x.lineWidth = 2
        x.beginPath()
        x.moveTo(sh.x, sh.y)
        x.lineTo(sh.x - 90, sh.y - 50)
        x.stroke()
        if (sh.l > 260) sh = null
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(iv)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <motion.canvas ref={ref} aria-hidden="true" className={className || 'fixed inset-0 z-0 h-full w-full'} style={style} />
}
