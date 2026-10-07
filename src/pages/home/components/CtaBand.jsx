import { Link } from 'react-router-dom'
import Reveal from '@/components/common/Reveal'
import { useTraderAuth } from '@/context/trader-auth-context'

export default function CtaBand() {
  const { isSignedIn } = useTraderAuth()

  return (
    <section className="section">
      <div className="section__inner">
        <Reveal className="cta-band">
          <div>
            <h2>Ready to trade with a plan?</h2>
            <p>Join TradeWithCuso today. Choose a plan in minutes and pay in naira.</p>
          </div>
          <Link to={isSignedIn ? '/dashboard/plans' : '/register'} className="btn btn--lg">
            {isSignedIn ? 'Choose a plan' : 'Get started'}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
