import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Spinner from '@/components/common/Spinner'
import { useSite } from '@/context/site-context'
import { useTraderAuth } from '@/context/trader-auth-context'
import { subscribe } from '@/lib/api'
import { formatDate, formatNaira } from '@/lib/format'

const METHODS = [
  {
    id: 'paystack',
    title: 'Pay with card',
    body: 'Debit card, bank app or USSD through Paystack. Your plan activates instantly.',
  },
  {
    id: 'bank_transfer',
    title: 'Bank transfer',
    body: 'Transfer to our account and tell us when it’s done. Activated once we confirm it.',
  },
]

export default function Checkout() {
  const { slug } = useParams()
  const { plans, plansStatus, settings } = useSite()
  const { trader } = useTraderAuth()
  const navigate = useNavigate()

  const available = METHODS.filter((m) => settings.payment_methods?.[m.id])
  const [method, setMethod] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (plansStatus === 'loading') return <Spinner label="Loading the plan" />

  const plan = plans.find((p) => p.slug === slug)

  if (!plan) {
    return (
      <div className="notice">
        <p>That plan isn’t available any more.</p>
        <Link to="/dashboard/plans" className="btn btn--sm">
          See current plans
        </Link>
      </div>
    )
  }

  const chosen = method ?? available[0]?.id
  const current = trader?.current_subscription

  const pay = async () => {
    if (submitting || !chosen) return
    setSubmitting(true)
    setError('')

    try {
      const payload = await subscribe(plan.slug, chosen)

      if (payload.payment_url) {
        // Off to Paystack; it sends the trader back to the subscription page,
        // which asks the server to confirm the payment.
        window.location.assign(payload.payment_url)
        return
      }

      navigate(`/dashboard/subscriptions/${payload.data.reference}`, { replace: true })
    } catch (err) {
      setError(Object.values(err.errors ?? {})[0] ?? err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout">
      <div className="card checkout__summary">
        <p className="card__label">You’re buying</p>
        <h2>{plan.name}</h2>
        {plan.tagline && <p className="checkout__tagline">{plan.tagline}</p>}

        <ul className="plan__features">
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <dl className="checkout__lines">
          <div>
            <dt>Plan length</dt>
            <dd>{plan.duration_label}</dd>
          </div>
          <div>
            <dt>Starts</dt>
            <dd>{current ? formatDate(current.ends_at) : 'As soon as payment clears'}</dd>
          </div>
          <div className="checkout__total">
            <dt>Total</dt>
            <dd>{formatNaira(plan.price)}</dd>
          </div>
        </dl>
      </div>

      <div className="card checkout__pay">
        <h3>How would you like to pay?</h3>

        {available.length === 0 ? (
          <div className="notice">
            <p>
              Online payment isn’t set up yet. Please contact us
              {settings.contact_email && (
                <>
                  {' '}at <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                </>
              )}{' '}
              to buy this plan.
            </p>
          </div>
        ) : (
          <>
            <div className="methods" role="radiogroup" aria-label="Payment method">
              {available.map((m) => (
                <label key={m.id} className={`method ${chosen === m.id ? 'method--on' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={chosen === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  <span className="method__radio" aria-hidden="true" />
                  <span>
                    <strong>{m.title}</strong>
                    <small>{m.body}</small>
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <p className="form__error" role="alert">
                {error}
              </p>
            )}

            <button className="btn btn--block btn--lg" onClick={pay} disabled={submitting}>
              {submitting
                ? 'Please wait…'
                : chosen === 'paystack'
                  ? `Pay ${formatNaira(plan.price)}`
                  : 'Get transfer details'}
            </button>

            <p className="checkout__fine">
              By continuing you agree to the <Link to="/terms">terms and conditions</Link>. Trading
              carries risk; your plan pays for education and analysis, not guaranteed returns.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
