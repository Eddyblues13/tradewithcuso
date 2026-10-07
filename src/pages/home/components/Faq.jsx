import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '@/components/common/Reveal'

const QUESTIONS = [
  {
    q: 'How do I pay for a plan?',
    a: 'Create an account, choose a plan and pay in naira — by debit card through Paystack, or by bank transfer to our account. Card payments activate your plan straight away; transfers are activated once we confirm the money has arrived.',
  },
  {
    q: 'What happens after I pay?',
    a: 'Your dashboard shows your active plan, the date it started and the date it ends. You will also get a confirmation email with your reference.',
  },
  {
    q: 'Can I renew or upgrade before my plan ends?',
    a: 'Yes. A new plan bought while one is still running is queued to start the day the current one ends, so you never lose days you have paid for.',
  },
  {
    q: 'Do you guarantee profits?',
    a: 'No — and you should be wary of anyone who does. Trading carries real risk and you can lose money. We teach skills, share analysis and help you manage risk; the trading decisions, and the results, are always yours.',
  },
  {
    q: 'Do you trade or hold money on my behalf?',
    a: 'Never. TradeWithCuso is an education and mentorship service. We do not accept deposits for trading, manage accounts or hold client funds. Your plan fee pays for education and analysis only.',
  },
  {
    q: 'Can I get a refund?',
    a: (
      <>
        Plans give immediate access to paid content, so they are generally non-refundable once
        active. Duplicate or mistaken payments are always refunded. See the{' '}
        <Link to="/terms#refunds">terms and conditions</Link> for the details.
      </>
    ),
  },
]

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section section--alt" id="faq">
      <div className="section__inner section__inner--narrow">
        <Reveal className="section__head">
          <p className="eyebrow">FAQ</p>
          <h2>Questions, answered honestly</h2>
        </Reveal>

        <div className="faq">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
                <button
                  className="faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {item.q}
                  <span className="faq__icon" aria-hidden="true" />
                </button>
                <div id={`faq-${i}`} className="faq__a" hidden={!isOpen}>
                  <p>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
