import { Link } from 'react-router-dom'
import { formatNaira } from '@/lib/format'

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.14" />
      <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PlanCard({ plan, to, cta = 'Choose plan' }) {
  return (
    <article className={`plan ${plan.is_popular ? 'plan--popular' : ''}`}>
      {plan.is_popular && <span className="plan__flag">Most popular</span>}

      <header className="plan__head">
        <h3>{plan.name}</h3>
        {plan.tagline && <p>{plan.tagline}</p>}
      </header>

      <p className="plan__price">
        <span className="plan__amount">{formatNaira(plan.price)}</span>
        <span className="plan__per">/ {plan.duration_label}</span>
      </p>

      <ul className="plan__features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check />
            {feature}
          </li>
        ))}
      </ul>

      <Link to={to} className={`btn btn--block ${plan.is_popular ? '' : 'btn--ghost'}`}>
        {cta}
      </Link>
    </article>
  )
}
