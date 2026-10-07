import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { deletePlan, fetchAdminPlans, togglePlan } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatNaira } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, EmptyState, ErrorState, Panel, Spinner, TableWrap } from '@/components/admin/ui'

export default function Plans() {
  const fetcher = useCallback((signal) => fetchAdminPlans(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)
  const toast = useToast()

  if (status === 'loading' && !data) return <Spinner label="Loading plans" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const plans = data.data

  const toggle = async (plan) => {
    try {
      await togglePlan(plan.id)
      toast.success(plan.is_active ? `${plan.name} is hidden from the website.` : `${plan.name} is live on the website.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (plan) => {
    if (!window.confirm(`Delete ${plan.name}? This cannot be undone.`)) return

    try {
      const payload = await deletePlan(plan.id)
      toast.success(payload.message)
      reload()
    } catch (err) {
      toast.error(Object.values(err.errors ?? {})[0] ?? err.message)
    }
  }

  return (
    <Panel
      title="Plans"
      action={
        <Link to="/admin/plans/new" className="ad-btn ad-btn--sm">
          New plan
        </Link>
      }
      bodyFlush
    >
      {plans.length === 0 ? (
        <EmptyState
          title="No plans yet"
          hint="Create a plan and it will appear on the website straight away."
          action={
            <Link to="/admin/plans/new" className="ad-btn">
              Create a plan
            </Link>
          }
        />
      ) : (
        <TableWrap head={['Plan', 'Price', 'Length', 'Active now', 'All-time', 'Website', '']}>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>
                <Link className="link-arrow" to={`/admin/plans/${plan.id}/edit`}>
                  {plan.name}
                </Link>
                {plan.is_popular && <span className="ad-field__hint"> · most popular</span>}
              </td>
              <td className="ad-mono">{formatNaira(plan.price)}</td>
              <td>{plan.duration_label}</td>
              <td className="ad-mono">{plan.active_count}</td>
              <td className="ad-mono">{plan.subscriptions_count}</td>
              <td>
                <Badge status={plan.is_active ? 'live' : 'hidden'} />
              </td>
              <td>
                <div className="ad-table__actions">
                  <Link className="ad-btn ad-btn--ghost ad-btn--sm" to={`/admin/plans/${plan.id}/edit`}>
                    Edit
                  </Link>
                  <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => toggle(plan)}>
                    {plan.is_active ? 'Hide' : 'Publish'}
                  </button>
                  {plan.subscriptions_count === 0 && (
                    <button className="ad-btn ad-btn--danger ad-btn--sm" onClick={() => remove(plan)}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </TableWrap>
      )}
    </Panel>
  )
}
