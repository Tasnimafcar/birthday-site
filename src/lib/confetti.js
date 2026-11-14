const state = { P: [], run: false }
const COLS = ['#ffd98a', '#ff7aa8', '#e8e4ff', '#9ad5ff']

function loop() {
  const c = document.getElementById('fx')
  if (!c) return
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  state.P.forEach((p) => {
    p.vy += 0.35
    p.x += p.vx
    p.y += p.vy
    p.a -= 0.006
    x.globalAlpha = Math.max(p.a, 0)
    x.fillStyle = p.c
    x.fillRect(p.x, p.y, p.r, p.r * 1.6)
  })
  state.P = state.P.filter((p) => p.a > 0 && p.y < c.height + 20)
  if (state.P.length) requestAnimationFrame(loop)
  else {
    state.run = false
    x.clearRect(0, 0, c.width, c.height)
  }
}

export function burst() {
  const c = document.getElementById('fx')
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
  for (let i = 0; i < 160; i++) {
    state.P.push({
      x: c.width / 2,
      y: c.height * 0.55,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 15 - 3,
      r: Math.random() * 5 + 3,
      c: COLS[i % 4],
      a: 1,
    })
  }
  if (!state.run) {
    state.run = true
    loop()
  }
}
