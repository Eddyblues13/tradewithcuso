import Reveal from '@/components/common/Reveal'

const STEPS = [
  {
    title: 'Create your account',
    body: 'Sign up with your name, email and phone number. It takes under a minute.',
  },
  {
    title: 'Choose a trading plan',
    body: 'Pick the plan that fits where you are — from first steps to one-on-one mentorship.',
  },
  {
    title: 'Pay in naira',
    body: 'Pay by card through Paystack, or by bank transfer to our account. No dollar cards needed.',
  },
  {
    title: 'Start learning & trading',
    body: 'Your plan switches on as soon as payment is confirmed. Track it all from your dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="section__inner">
        <Reveal className="section__head">
          <p className="eyebrow">How it works</p>
          <h2>From sign-up to your first session in four steps</h2>
        </Reveal>

        <ol className="steps">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} className="step" delay={i * 0.08}>
              <span className="step__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
