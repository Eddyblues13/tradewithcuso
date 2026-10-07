import { useSite } from '@/context/site-context'
import { useTraderAuth } from '@/context/trader-auth-context'
import PlanCard from './PlanCard'
import Reveal from './Reveal'

/**
 * Every active plan. Where each card leads depends on who is looking:
 * a signed-in trader goes straight to checkout; anyone else signs up first,
 * with the plan they picked carried through.
 */
export default function PlansGrid({ cta }) {
  const { plans, plansStatus, plansError, reloadPlans } = useSite()
  const { isSignedIn } = useTraderAuth()

  if (plansStatus === 'loading') {
    return (
      <div className="plans-grid" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="plan plan--skeleton" />
        ))}
      </div>
    )
  }

  if (plansStatus === 'error') {
    return (
      <div className="notice notice--error">
        <p>We couldn't load the plans. {plansError}</p>
        <button className="btn btn--ghost btn--sm" onClick={reloadPlans}>
          Try again
        </button>
      </div>
    )
  }

  if (!plans.length) {
    return <p className="notice">New plans are on the way — check back soon.</p>
  }

  return (
    <div className="plans-grid">
      {plans.map((plan, i) => (
        <Reveal key={plan.id} delay={i * 0.08}>
          <PlanCard
            plan={plan}
            cta={cta}
            to={isSignedIn ? `/dashboard/subscribe/${plan.slug}` : `/register?plan=${plan.slug}`}
          />
        </Reveal>
      ))}
    </div>
  )
}
