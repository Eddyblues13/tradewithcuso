import { Link } from 'react-router-dom'
import PlansGrid from '@/components/common/PlansGrid'
import { useSeo } from '@/hooks/useSeo'

export default function Plans() {
  useSeo({
    title: 'Plans & pricing',
    description: 'TradeWithCuso trading plans, priced in naira. Pay by card or bank transfer.',
    path: '/plans',
  })

  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <p className="eyebrow">Plans &amp; pricing</p>
          <h1>Choose the plan that fits your trading</h1>
          <p>
            Every price is in naira and covers the whole plan period — no hidden charges. Pay by
            card through Paystack or by bank transfer.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="section__inner">
          <PlansGrid />

          <div className="plans-notes">
            <div>
              <h3>Renewing early?</h3>
              <p>Your new plan is queued to start the day your current one ends.</p>
            </div>
            <div>
              <h3>Paying by transfer?</h3>
              <p>Use your plan reference as the narration and tap “I’ve made the transfer”.</p>
            </div>
            <div>
              <h3>Questions first?</h3>
              <p>
                Read the <Link to="/#faq">FAQ</Link> or the <Link to="/terms">terms</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
