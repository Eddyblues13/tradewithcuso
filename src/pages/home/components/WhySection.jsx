import Reveal from '@/components/common/Reveal'

const POINTS = [
  {
    icon: 'M4 19h16M6 15l4-4 3 3 5-6',
    title: 'Daily market analysis',
    body: 'Clear outlooks on the pairs and assets that matter, so you start each session with a plan instead of a guess.',
  },
  {
    icon: 'M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z',
    title: 'Risk management first',
    body: 'Every trade idea comes with an entry, a stop loss and a target. Protecting capital is the first lesson, not the last.',
  },
  {
    icon: 'M16 11a4 4 0 1 0-8 0M4 20c1.5-3 4.5-4.5 8-4.5s6.5 1.5 8 4.5',
    title: 'Mentorship that fits you',
    body: 'From weekly group Q&As to one-on-one calls, get answers from people who trade the markets every day.',
  },
  {
    icon: 'M8 7h8M8 11h8M8 15h5M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    title: 'A structured curriculum',
    body: 'Market structure, price action, psychology and journaling — taught in order, so each lesson builds on the last.',
  },
  {
    icon: 'M3 12h4l3-8 4 16 3-8h4',
    title: 'A disciplined community',
    body: 'Trade alongside people working on the same skills. Accountability beats motivation.',
  },
  {
    icon: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    title: 'Naira pricing, fast access',
    body: 'Pay in naira by card or bank transfer. Card payments switch your plan on in seconds.',
  },
]

export default function WhySection() {
  return (
    <section className="section" id="why">
      <div className="section__inner">
        <Reveal className="section__head">
          <p className="eyebrow">Why TradeWithCuso</p>
          <h2>Built to make you a better trader — not a gambler</h2>
        </Reveal>

        <div className="features">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} className="feature" delay={(i % 3) * 0.08}>
              <span className="feature__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d={point.icon}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
