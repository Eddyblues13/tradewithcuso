import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Spinner from '@/components/common/Spinner'
import StatusPill from '@/components/dashboard/StatusPill'
import { useSite } from '@/context/site-context'
import { useTraderAuth } from '@/context/trader-auth-context'
import {
  cancelSubscription,
  fetchMySubscription,
  payWithPaystack,
  reportTransfer,
  verifyPayment,
} from '@/lib/api'
import { formatDate, formatDateTime, formatNaira, METHOD_LABELS } from '@/lib/format'

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (http, old browser) — the value is on screen to copy by hand.
    }
  }

  return (
    <div className="copy-row">
      <dt>{label}</dt>
      <dd>
        <span className="mono">{value}</span>
        <button type="button" className="copy-row__btn" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </dd>
    </div>
  )
}

export default function SubscriptionDetail() {
  const { reference } = useParams()
  const [params, setParams] = useSearchParams()
  const { settings } = useSite()
  const { refresh } = useTraderAuth()

  const [payload, setPayload] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [verifyNote, setVerifyNote] = useState('')

  // Paystack sends the trader back with ?reference=…&trxref=…
  const returnedFromPaystack = params.has('reference') || params.has('trxref')
  const verified = useRef(false)

  const apply = useCallback(
    (next) => {
      setPayload(next)
      if (['active', 'scheduled'].includes(next.data.state)) {
        // The account's current plan has changed; the header and overview
        // should not have to wait for a reload to show it.
        refresh().catch(() => {})
      }
    },
    [refresh]
  )

  const verify = useCallback(async () => {
    setBusy('verify')
    setVerifyNote('')
    try {
      const next = await verifyPayment(reference)
      apply(next)
      if (next.data.state === 'pending') {
        setVerifyNote(
          'We haven’t received confirmation from Paystack yet. If you completed the payment, this page will update within a few minutes — or try again below.'
        )
      }
    } catch (err) {
      setVerifyNote(err.message)
    } finally {
      setBusy('')
    }
  }, [reference, apply])

  useEffect(() => {
    const controller = new AbortController()

    fetchMySubscription(reference, controller.signal)
      .then((next) => {
        setPayload(next)
        setStatus('ready')

        // Once, on the way back from Paystack. The ref stops StrictMode's
        // double effect from asking Paystack twice, and the query string is
        // cleared afterwards so a refresh doesn't verify again.
        if (returnedFromPaystack && !verified.current) {
          verified.current = true
          const checked = next.data.state === 'pending' ? verify() : Promise.resolve()
          checked.finally(() => setParams({}, { replace: true }))
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.status === 404 ? 'We couldn’t find that plan on your account.' : err.message)
        setStatus('error')
      })

    return () => controller.abort()
  }, [reference, returnedFromPaystack, verify, setParams])

  const run = async (name, action) => {
    setBusy(name)
    setActionError('')
    try {
      await action()
    } catch (err) {
      setActionError(Object.values(err.errors ?? {})[0] ?? err.message)
    } finally {
      setBusy('')
    }
  }

  if (status === 'loading') return <Spinner label="Loading your plan" />

  if (status === 'error') {
    return (
      <div className="notice notice--error">
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn--ghost btn--sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const sub = payload.data
  const bank = payload.bank_transfer
  const isPending = sub.state === 'pending'
  const reported = Boolean(sub.transfer_reported_at)

  const payByCard = () =>
    run('card', async () => {
      const next = await payWithPaystack(reference)
      window.location.assign(next.payment_url)
    })

  const markSent = () => run('sent', async () => apply(await reportTransfer(reference)))

  const cancel = () => {
    if (!window.confirm('Cancel this plan? You can always choose a new one later.')) return
    run('cancel', async () => apply(await cancelSubscription(reference)))
  }

  return (
    <div className="sub">
      <Link to="/dashboard" className="back-link">
        ← Back to overview
      </Link>

      <div className="sub__grid">
        <div className="card sub__main">
          <div className="sub__head">
            <div>
              <p className="card__label">Reference</p>
              <p className="mono sub__ref">{sub.reference}</p>
            </div>
            <StatusPill subscription={sub} />
          </div>

          <h2>{sub.plan_name}</h2>
          <p className="sub__amount">
            {formatNaira(sub.amount)} <span>/ {sub.duration_label}</span>
          </p>

          {busy === 'verify' && (
            <div className="banner">
              <span className="spinner spinner--sm" aria-hidden="true" /> Confirming your payment with
              Paystack…
            </div>
          )}

          {verifyNote && (
            <div className="banner banner--warn">
              <p>{verifyNote}</p>
              <button className="btn btn--ghost btn--sm" onClick={verify} disabled={busy !== ''}>
                Check again
              </button>
            </div>
          )}

          {sub.state === 'active' && (
            <div className="banner banner--ok">
              <strong>You’re all set.</strong> Your plan is active until {formatDate(sub.ends_at)}.
            </div>
          )}

          {sub.state === 'scheduled' && (
            <div className="banner banner--ok">
              <strong>Payment received.</strong> This plan starts on {formatDate(sub.starts_at)}, when
              your current plan ends.
            </div>
          )}

          {sub.state === 'expired' && (
            <div className="banner">
              This plan ended on {formatDate(sub.ends_at)}.{' '}
              <Link to="/dashboard/plans">Choose a new plan</Link>
            </div>
          )}

          {sub.state === 'cancelled' && (
            <div className="banner">
              This plan was cancelled. <Link to="/dashboard/plans">Choose a plan</Link>
            </div>
          )}

          <dl className="details">
            <div>
              <dt>Payment method</dt>
              <dd>{METHOD_LABELS[sub.payment_method] ?? '—'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(sub.created_at)}</dd>
            </div>
            {sub.paid_at && (
              <div>
                <dt>Paid</dt>
                <dd>{formatDateTime(sub.paid_at)}</dd>
              </div>
            )}
            {sub.starts_at && (
              <div>
                <dt>Runs</dt>
                <dd>
                  {formatDate(sub.starts_at)} – {formatDate(sub.ends_at)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {isPending && (
          <div className="card sub__pay">
            {reported ? (
              <>
                <h3>We’re confirming your transfer</h3>
                <p>
                  Thanks — you told us you sent the transfer on {formatDateTime(sub.transfer_reported_at)}.
                  We’ll activate your plan as soon as it reaches our account, usually within a few
                  working hours. You’ll get an email when it’s done.
                </p>
              </>
            ) : bank ? (
              <>
                <h3>Pay by bank transfer</h3>
                <p>
                  Transfer exactly <strong>{formatNaira(sub.amount)}</strong> to the account below and
                  use your reference as the narration.
                </p>

                <dl className="bank">
                  <CopyRow label="Bank" value={bank.bank_name} />
                  <CopyRow label="Account number" value={bank.account_number} />
                  <CopyRow label="Account name" value={bank.account_name} />
                  <CopyRow label="Amount" value={String(sub.amount)} />
                  <CopyRow label="Narration" value={sub.reference} />
                </dl>

                <button className="btn btn--block" onClick={markSent} disabled={busy !== ''}>
                  {busy === 'sent' ? 'Sending…' : 'I’ve made the transfer'}
                </button>
              </>
            ) : (
              <>
                <h3>Complete your payment</h3>
                <p>Pay securely by card through Paystack to activate this plan.</p>
              </>
            )}

            {/* Once a transfer is reported, offering card too invites paying twice. */}
            {settings.payment_methods?.paystack && !reported && (
              <button
                className={`btn btn--block ${bank ? 'btn--ghost' : ''}`}
                onClick={payByCard}
                disabled={busy !== ''}
              >
                {busy === 'card'
                  ? 'Opening Paystack…'
                  : bank
                    ? 'Pay with card instead'
                    : `Pay ${formatNaira(sub.amount)} with card`}
              </button>
            )}

            {actionError && (
              <p className="form__error" role="alert">
                {actionError}
              </p>
            )}

            {!reported && (
              <button className="text-btn" onClick={cancel} disabled={busy !== ''}>
                {busy === 'cancel' ? 'Cancelling…' : 'Cancel this plan'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
