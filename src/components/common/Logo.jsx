import { Link } from 'react-router-dom'

/** Three rising candles — the mark on its own, for the favicon and tight spots. */
export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="twc-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2BE39A" />
          <stop offset="1" stopColor="#0E9F63" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#twc-mark)" />
      <g stroke="#04110B" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="17" x2="12" y2="31" />
        <line x1="20" y1="12" x2="20" y2="27" />
        <line x1="28" y1="7" x2="28" y2="22" />
      </g>
      <g fill="#04110B">
        <rect x="9.5" y="20" width="5" height="8" rx="1.2" />
        <rect x="17.5" y="15" width="5" height="9" rx="1.2" />
        <rect x="25.5" y="10" width="5" height="9" rx="1.2" />
      </g>
    </svg>
  )
}

export default function Logo({ to = '/', onClick }) {
  return (
    <Link to={to} className="logo" onClick={onClick} aria-label="TradeWithCuso — home">
      <LogoMark />
      <span className="logo__word">
        TradeWith<strong>Cuso</strong>
      </span>
    </Link>
  )
}
