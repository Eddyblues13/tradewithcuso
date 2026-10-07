import Reveal from '@/components/common/Reveal'
import PlansGrid from '@/components/common/PlansGrid'

export default function PlansSection() {
  return (
    <section className="section section--alt" id="plans">
      <div className="section__inner">
        <Reveal className="section__head">
          <p className="eyebrow">Trading plans</p>
          <h2>Simple plans, priced in naira</h2>
          <p>
            One payment covers the whole plan period. Renew early and your new plan starts the day
            the current one ends — you never lose paid-for days.
          </p>
        </Reveal>

        <PlansGrid />
      </div>
    </section>
  )
}
