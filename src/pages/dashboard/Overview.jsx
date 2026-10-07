import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '@/components/common/Spinner'
import StatusPill from '@/components/dashboard/StatusPill'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchMySubscriptions } from '@/lib/api'
import { formatDate, formatNaira, METHOD_LABELS } from '@/lib/format'

function CurrentPlan({ subscription }) {
  const total = subscription.duration_days
  const left = subscription.days_left ?? 0
  const used = Math.min(100, Math.max(0, ((total - left) / total) * 100))

  return (
    <div className="card card--glow current">
      <div className="current__top">
        <div>
          <p className="card__label">Current plan</p>
          <h2>{subscription.plan_name}</h2>
        </div>
        <StatusPill subscription={subscription} />
      </div>

      <div className="current__days">
        <strong>{left}</strong>
        <span>{left === 1 ? 'day left' : 'days left'}</span>
      </div>

      <div className="meter" role="progressbar" aria-valuenow={Math.round(used)} aria-valuemin={0} aria-valuemax={100} aria-label="Plan time used">
        <span style={{ width: `${used}%` }} />
      </div>

      <dl className="current__dates">
        <div>
          <dt>Started</dt>
          <dd>{formatDate(subscription.starts_at)}</dd>
        </div>
        <div>
          <dt>Ends</dt>
          <dd>{formatDate(subscription.ends_at)}</dd>
        </div>
      </dl>
    </div>
  )
}

function NoPlan() {
  return (
    <div className="card card--glow empty-plan">
      <p className="card__label">Current plan</p>
      <h2>You don’t have an active plan yet</h2>
      <p>Choose a plan to unlock market analysis, trade ideas and mentorship.</p>
      <Link to="/dashboard/plans" className="btn">
        Choose a plan
      </Link>
    </div>
  )
}

export default function Overview() {
  const fetcher = useCallback((signal) => fetchMySubscriptions(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (status === 'loading' && !data) return <Spinner label="Loading your plans" />

  if (status === 'error') {
    return (
      <div className="notice notice--error">
        <p>{error}</p>
        <button className="btn btn--ghost btn--sm" onClick={reload}>
          Try again
        </button>
      </div>
    )
  }

  const subscriptions = data.data
  const current = subscriptions
    .filter((s) => s.state === 'active')
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at))[0]
  const scheduled = subscriptions.filter((s) => s.state === 'scheduled')
  const pending = subscriptions.find((s) => s.state === 'pending')

  return (
    <div className="overview">
      <div className="overview__top">
        {current ? <CurrentPlan subscription={current} /> : <NoPlan />}

        <div className="overview__side">
          {pending && (
            <Link to={`/dashboard/subscriptions/${pending.reference}`} className="card card--action">
              <p className="card__label">
                {pending.transfer_reported_at ? 'Confirming your transfer' : 'Awaiting payment'}
              </p>
              <h3>
                {pending.plan_name} · {formatNaira(pending.amount)}
              </h3>
              <p>
                {pending.transfer_reported_at
                  ? 'We’re checking our account for your transfer. Your plan switches on as soon as it’s confirmed.'
                  : 'Complete your payment to activate this plan.'}
              </p>
              <span className="link-arrow">
                {pending.transfer_reported_at ? 'View details' : 'Pay now'}
              </span>
            </Link>
          )}

          {scheduled.map((s) => (
            <div key={s.reference} className="card">
              <p className="card__label">Up next</p>
              <h3>{s.plan_name}</h3>
              <p>
                Paid and queued — starts {formatDate(s.starts_at)}, runs until {formatDate(s.ends_at)}.
              </p>
            </div>
          ))}

          {!pending && (
            <div className="card">
              <p className="card__label">{current ? 'Renew early' : 'Get started'}</p>
              <h3>{current ? 'Stay on track' : 'Plans priced in naira'}</h3>
              <p>
                {current
                  ? 'Buy your next plan now and it starts the day this one ends.'
                  : 'Pay by card or bank transfer and get access as soon as payment clears.'}
              </p>
              <Link to="/dashboard/plans" className="link-arrow">
                See plans
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="card card--flush">
        <header className="card__head">
          <h3>Payment history</h3>
        </header>

        {subscriptions.length === 0 ? (
          <p className="card__empty">Your plans and payments will appear here.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.reference}>
                    <td data-label="Reference">
                      <Link to={`/dashboard/subscriptions/${s.reference}`} className="mono">
                        {s.reference}
                      </Link>
                    </td>
                    <td data-label="Plan">{s.plan_name}</td>
                    <td data-label="Amount" className="mono">
                      {formatNaira(s.amount)}
                    </td>
                    <td data-label="Method">{METHOD_LABELS[s.payment_method] ?? '—'}</td>
                    <td data-label="Date">{formatDate(s.paid_at ?? s.created_at)}</td>
                    <td data-label="Status">
                      <StatusPill subscription={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
