import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  activateSubscription,
  cancelSubscription,
  deleteSubscription,
  fetchSubscription,
  updateSubscriptionNote,
} from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatDateTime, formatNaira, METHOD_LABELS, STATE_LABELS, subscriptionState } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, ErrorState, Field, Panel, Spinner } from '@/components/admin/ui'

function Row({ label, children }) {
  return (
    <div className="ad-dl__row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function SubscriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const fetcher = useCallback((signal) => fetchSubscription(id, signal), [id])
  const { data, status, error, reload, setData } = useAsyncData(fetcher)

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState(null)
  const [busy, setBusy] = useState('')

  if (status === 'loading' && !data) return <Spinner label="Loading the subscription" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const s = data.data
  const state = subscriptionState(s)
  const noteValue = note ?? s.admin_note ?? ''

  const run = async (name, action, success) => {
    setBusy(name)
    try {
      const payload = await action()
      if (payload?.data) setData(payload)
      toast.success(success)
      return payload
    } catch (err) {
      toast.error(Object.values(err.errors ?? {})[0] ?? err.message)
    } finally {
      setBusy('')
    }
  }

  const activate = () => {
    const paid = amount === '' ? s.amount : Number(amount)
    if (!window.confirm(`Activate ${s.plan_name} for ${s.user.name}, recording ${formatNaira(paid)} received?`)) return
    run(
      'activate',
      () => activateSubscription(s.id, { amount_paid: paid, note: noteValue || undefined }),
      'Plan activated — the trader has been emailed.'
    )
  }

  const cancel = () => {
    const warning =
      s.state === 'active'
        ? `Cancel ${s.user.name}'s running plan? Their access ends immediately.`
        : 'Cancel this subscription?'
    if (!window.confirm(warning)) return
    run('cancel', () => cancelSubscription(s.id, { note: noteValue || undefined }), 'Subscription cancelled.')
  }

  const saveNote = () => run('note', () => updateSubscriptionNote(s.id, noteValue), 'Note saved.')

  const remove = async () => {
    if (!window.confirm(`Delete ${s.reference}? This cannot be undone.`)) return
    const ok = await run('delete', () => deleteSubscription(s.id), 'Subscription deleted.')
    if (ok) navigate('/admin/subscriptions', { replace: true })
  }

  const unpaid = !s.paid_at && !s.amount_paid

  return (
    <>
      <Link to="/admin/subscriptions" className="ad-back">
        ← All subscriptions
      </Link>

      <div className="ad-grid">
        <Panel
          title={
            <>
              <span className="ad-mono">{s.reference}</span>
            </>
          }
          action={<Badge status={state} label={STATE_LABELS[state]} />}
        >
          <dl className="ad-dl">
            <Row label="Plan">{s.plan_name}</Row>
            <Row label="Price">
              {formatNaira(s.amount)} · {s.duration_label}
            </Row>
            <Row label="Method">{METHOD_LABELS[s.payment_method] ?? '—'}</Row>
            <Row label="Amount received">{s.amount_paid === null ? '—' : formatNaira(s.amount_paid)}</Row>
            {s.payment_reference && (
              <Row label="Paystack ref">
                <span className="ad-mono">{s.payment_reference}</span>
                {s.payment_channel && <span className="ad-field__hint"> · {s.payment_channel}</span>}
              </Row>
            )}
            {s.transfer_reported_at && <Row label="Transfer reported">{formatDateTime(s.transfer_reported_at)}</Row>}
            <Row label="Created">{formatDateTime(s.created_at)}</Row>
            {s.paid_at && <Row label="Paid">{formatDateTime(s.paid_at)}</Row>}
            {s.starts_at && (
              <Row label="Runs">
                {formatDate(s.starts_at)} – {formatDate(s.ends_at)}
                {s.days_left !== null && <span className="ad-field__hint"> · {s.days_left} days left</span>}
              </Row>
            )}
            {s.activated_by && <Row label="Activated by">{s.activated_by}</Row>}
            {s.cancelled_at && <Row label="Cancelled">{formatDateTime(s.cancelled_at)}</Row>}
          </dl>
        </Panel>

        <Panel title="Trader">
          <dl className="ad-dl">
            <Row label="Name">
              <Link className="link-arrow" to={`/admin/users/${s.user.id}`}>
                {s.user.name}
              </Link>
            </Row>
            <Row label="Email">
              <a href={`mailto:${s.user.email}`}>{s.user.email}</a>
            </Row>
            <Row label="Phone">
              {s.user.phone ? <a href={`tel:${s.user.phone}`}>{s.user.phone}</a> : '—'}
            </Row>
            <Row label="Account">
              <Badge status={s.user.is_active ? 'active' : 'suspended'} />
            </Row>
          </dl>
        </Panel>
      </div>

      <Panel title="Actions">
        <div className="ad-form">
          <Field label="Note" hint="Visible to admins only — e.g. which transfer this matched.">
            <textarea rows={3} value={noteValue} onChange={(e) => setNote(e.target.value)} />
          </Field>

          {s.state === 'pending' && (
            <Field
              label="Amount received (₦)"
              hint={`Leave blank to record the full ${formatNaira(s.amount)}.`}
            >
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder={String(s.amount)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          )}

          <div className="ad-actions">
            {s.state !== 'active' && s.state !== 'scheduled' && s.state !== 'expired' && (
              <button className="ad-btn" onClick={activate} disabled={busy !== ''}>
                {busy === 'activate' ? 'Activating…' : 'Confirm payment & activate'}
              </button>
            )}
            <button className="ad-btn ad-btn--ghost" onClick={saveNote} disabled={busy !== ''}>
              {busy === 'note' ? 'Saving…' : 'Save note'}
            </button>
            {s.state !== 'cancelled' && s.state !== 'expired' && (
              <button className="ad-btn ad-btn--ghost" onClick={cancel} disabled={busy !== ''}>
                {busy === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            )}
            {unpaid && (
              <button className="ad-btn ad-btn--danger" onClick={remove} disabled={busy !== ''}>
                Delete
              </button>
            )}
          </div>
        </div>
      </Panel>
    </>
  )
}
