import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CandleChart from '@/components/common/CandleChart'
import { useSite } from '@/context/site-context'
import { useTraderAuth } from '@/context/trader-auth-context'
import { formatNaira } from '@/lib/format'

const rise = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  const { cheapestPlan } = useSite()
  const { isSignedIn } = useTraderAuth()

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__copy">
          <motion.p className="eyebrow" {...rise(0)}>
            <span className="eyebrow__dot" /> Trading education &amp; mentorship
          </motion.p>

          <motion.h1 {...rise(0.08)}>
            Trade with structure. <span className="accent">Grow with Cuso.</span>
          </motion.h1>

          <motion.p className="hero__lead" {...rise(0.16)}>
            Daily market analysis, trade ideas with clear risk management, and mentorship from
            people who trade for a living — on plans priced in naira and paid in minutes.
          </motion.p>

          <motion.div className="hero__ctas" {...rise(0.24)}>
            <Link to={isSignedIn ? '/dashboard/plans' : '/register'} className="btn btn--lg">
              {isSignedIn ? 'Choose a plan' : 'Create your account'}
            </Link>
            <Link to="/plans" className="btn btn--ghost btn--lg">
              View plans
            </Link>
          </motion.div>

          <motion.ul className="hero__facts" {...rise(0.32)}>
            <li>
              <strong>{cheapestPlan ? `From ${formatNaira(cheapestPlan)}` : '₦ Naira'}</strong>
              <span>{cheapestPlan ? 'per plan' : 'pricing'}</span>
            </li>
            <li>
              <strong>Card or transfer</strong>
              <span>Paystack &amp; local banks</span>
            </li>
            <li>
              <strong>Instant access</strong>
              <span>once payment clears</span>
            </li>
          </motion.ul>
        </div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="chart-card">
            <div className="chart-card__head">
              <span className="chart-card__pair">Learn to read the market</span>
              <span className="chart-card__tag">Illustration</span>
            </div>
            <CandleChart />
            <div className="chart-card__foot">
              <span>
                <i className="dot dot--green" /> Plan the entry
              </span>
              <span>
                <i className="dot dot--red" /> Respect the stop
              </span>
              <span>
                <i className="dot dot--gold" /> Manage the risk
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((n) => (
            <span key={n}>
              Forex · Gold (XAU/USD) · Indices · Crypto · Price action · Risk management · Trading
              psychology · Market structure · Supply &amp; demand · Journaling ·{' '}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
