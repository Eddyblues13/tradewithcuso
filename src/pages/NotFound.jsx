import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true })

  return (
    <section className="page-hero page-hero--center">
      <div className="section__inner">
        <p className="eyebrow">404</p>
        <h1>This page has left the chart</h1>
        <p>The link may be old, or the address mistyped.</p>
        <div className="hero__ctas hero__ctas--center">
          <Link to="/" className="btn">
            Back to home
          </Link>
          <Link to="/plans" className="btn btn--ghost">
            See plans
          </Link>
        </div>
      </div>
    </section>
  )
}
