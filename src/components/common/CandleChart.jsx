import { useMemo } from 'react'

/**
 * Decorative candlestick chart for the hero.
 *
 * Illustration only — it is generated, not market data, and is hidden from
 * screen readers. A fixed seed keeps it identical on every visit rather than
 * reshuffling on each render.
 */
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const COUNT = 34
const WIDTH = 560
const HEIGHT = 320

export default function CandleChart() {
  const { candles, line } = useMemo(() => {
    const rand = seeded(42)
    const out = []
    let price = 60

    for (let i = 0; i < COUNT; i++) {
      // A gentle upward drift with honest pullbacks along the way.
      const drift = 1.15 + Math.sin(i / 4) * 1.6
      const open = price
      const close = open + drift + (rand() - 0.5) * 7
      const high = Math.max(open, close) + rand() * 4
      const low = Math.min(open, close) - rand() * 4
      out.push({ open, close, high, low })
      price = close
    }

    const min = Math.min(...out.map((c) => c.low))
    const max = Math.max(...out.map((c) => c.high))
    const y = (v) => HEIGHT - 20 - ((v - min) / (max - min)) * (HEIGHT - 40)
    const step = WIDTH / COUNT

    const candles = out.map((c, i) => ({
      x: i * step + step / 2,
      w: step * 0.56,
      open: y(c.open),
      close: y(c.close),
      high: y(c.high),
      low: y(c.low),
      up: c.close >= c.open,
    }))

    // A moving average, so the eye reads a trend rather than noise.
    const avg = candles.map((c, i) => {
      const window = candles.slice(Math.max(0, i - 4), i + 1)
      return [c.x, window.reduce((sum, w) => sum + (w.open + w.close) / 2, 0) / window.length]
    })

    return {
      candles,
      line: avg.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' '),
    }
  }, [])

  return (
    <svg className="candles" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="candles-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1fd286" stopOpacity="0.22" />
          <stop offset="1" stopColor="#1fd286" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} className="candles__grid" x1="0" x2={WIDTH} y1={HEIGHT * f} y2={HEIGHT * f} />
      ))}

      <path className="candles__area" d={`${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`} fill="url(#candles-fade)" />

      {candles.map((c, i) => (
        <g
          key={i}
          className={`candles__c ${c.up ? 'candles__c--up' : 'candles__c--down'}`}
          style={{ animationDelay: `${i * 35}ms` }}
        >
          <line x1={c.x} x2={c.x} y1={c.high} y2={c.low} />
          <rect
            x={c.x - c.w / 2}
            y={Math.min(c.open, c.close)}
            width={c.w}
            height={Math.max(2, Math.abs(c.close - c.open))}
            rx="1.5"
          />
        </g>
      ))}

      <path className="candles__avg" d={line} />
    </svg>
  )
}
