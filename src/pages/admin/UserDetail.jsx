import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteUser, fetchAdminPlans, fetchUser, grantPlan, toggleUser } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatDateTime, formatNaira, METHOD_LABELS, STATE_LABELS, subscriptionState } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, EmptyState, ErrorState, Field, Panel, Spinner, StatCard, TableWrap } from '@/components/admin/ui'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const fetcher = useCallback((signal) => fetchUser(id, signal), [id])
  const { data, status, error, reload } = useAsyncData(fetcher)

  const plansFetcher = useCallback((signal) => fetchAdminPlans(signal), [])
  const { data: plansData } = useAsyncData(plansFetcher)

  const [grant, setGrant] = useState({ plan_id: '', amount_paid: '0', note: '' })
  const [grantErrors, setGrantErrors] = useState({})
  const [busy, setBusy] = useState('')

  if (status === 'loading' && !data) return <Spinner label="Loading the trader" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const user = data.data
  const subscriptions = data.subscriptions
  const plans = plansData?.data ?? []

  const toggle = async () => {
    if (
      !window.confirm(
        user.is_active
          ? `Suspend ${user.name}? They will be signed out and unable to log in until restored.`
          : `Restore ${user.name}'s account?`
      )
    )
      return

    setBusy('toggle')
    try {
      await toggleUser(user.id)
      toast.success(user.is_active ? `${user.name} is suspended.` : `${user.name} is restored.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy('')
    }
  }

  const remove = async () => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return

    setBusy('delete')
    try {
      const payload = await deleteUser(user.id)
      toast.success(payload.message)
      navigate('/admin/users', { replace: true })
    } catch (err) {
      toast.error(Object.values(err.errors ?? {})[0] ?? err.message)
      setBusy('')
    }
  }

  const submitGrant = async (e) => {
    e.preventDefault()
    if (busy) return

    setBusy('grant')
    setGrantErrors({})
    try {
      await grantPlan(user.id, {
        plan_id: Number(grant.plan_id),
        amount_paid: Number(grant.amount_paid || 0),
        note: grant.note || undefined,
      })
      toast.success('Plan added and activated.')
      setGrant({ plan_id: '', amount_paid: '0', note: '' })
      reload()
    } catch (err) {
      setGrantErrors(err.errors ?? {})
      toast.error(err.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <>
      <Link to="/admin/users" className="ad-back">
        ← All traders
      </Link>

      <Panel
        title={user.name}
        action={
          <div className="ad-table__actions">
            <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={toggle} disabled={busy !== ''}>
              {user.is_active ? 'Suspend' : 'Restore'}
            </button>
            <button className="ad-btn ad-btn--danger ad-btn--sm" onClick={remove} disabled={busy !== ''}>
              Delete
            </button>
          </div>
        }
      >
        <dl className="ad-dl ad-dl--cols">
          <div className="ad-dl__row">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </dd>
          </div>
          <div className="ad-dl__row">
            <dt>Phone</dt>
            <dd>{user.phone ? <a href={`tel:${user.phone}`}>{user.phone}</a> : '—'}</dd>
          </div>
          <div className="ad-dl__row">
            <dt>Joined</dt>
            <dd>{formatDateTime(user.created_at)}</dd>
          </div>
          <div className="ad-dl__row">
            <dt>Last login</dt>
            <dd>{formatDateTime(user.last_login_at)}</dd>
          </div>
          <div className="ad-dl__row">
            <dt>Account</dt>
            <dd>
              <Badge status={user.is_active ? 'active' : 'suspended'} />
            </dd>
          </div>
        </dl>
      </Panel>

      <div className="ad-stats">
        <StatCard
          label="Current plan"
          value={user.current_plan?.name ?? 'None'}
          hint={user.current_plan ? `Ends ${formatDate(user.current_plan.ends_at)}` : 'No plan running today'}
        />
        <StatCard label="Total paid" value={formatNaira(user.total_paid)} />
        <StatCard label="Subscriptions" value={user.subscriptions_count} />
      </div>

      <Panel title="Subscriptions" bodyFlush>
        {subscriptions.length === 0 ? (
          <EmptyState title="No subscriptions yet" hint="This trader hasn't chosen a plan." />
        ) : (
          <TableWrap head={['Reference', 'Plan', 'Amount', 'Method', 'Runs', 'Status']}>
            {subscriptions.map((s) => {
              const state = subscriptionState(s)
              return (
                <tr key={s.id}>
                  <td>
                    <Link className="link-arrow ad-mono" to={`/admin/subscriptions/${s.id}`}>
                      {s.reference}
                    </Link>
                  </td>
                  <td>{s.plan_name}</td>
                  <td className="ad-mono">{formatNaira(s.amount)}</td>
                  <td>{METHOD_LABELS[s.payment_method] ?? '—'}</td>
                  <td>{s.starts_at ? `${formatDate(s.starts_at)} – ${formatDate(s.ends_at)}` : '—'}</td>
                  <td>
                    <Badge status={state} label={STATE_LABELS[state]} />
                  </td>
                </tr>
              )
            })}
          </TableWrap>
        )}
      </Panel>

      <Panel title="Add a plan manually">
        <form className="ad-form" onSubmit={submitGrant}>
          <p className="ad-field__hint">
            For a payment taken outside the website, or a complimentary place. The plan is activated
            straight away and queued after any plan already running. Record ₦0 for a free place so it
            doesn’t count as revenue.
          </p>
          <div className="ad-row">
            <Field label="Plan" error={grantErrors.plan_id}>
              <select
                required
                value={grant.plan_id}
                onChange={(e) => setGrant({ ...grant, plan_id: e.target.value })}
              >
                <option value="">Choose a plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatNaira(p.price)} / {p.duration_label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount received (₦)" error={grantErrors.amount_paid}>
              <input
                type="number"
                min="0"
                required
                value={grant.amount_paid}
                onChange={(e) => setGrant({ ...grant, amount_paid: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Note" hint="Why this was added — visible to admins only.">
            <input type="text" value={grant.note} onChange={(e) => setGrant({ ...grant, note: e.target.value })} />
          </Field>
          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={busy !== ''}>
              {busy === 'grant' ? 'Adding…' : 'Add & activate plan'}
            </button>
          </div>
        </form>
      </Panel>
    </>
  )
}
