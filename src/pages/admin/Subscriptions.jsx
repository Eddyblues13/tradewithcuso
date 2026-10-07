import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { activateSubscription, fetchAdminPlans, fetchSubscriptions } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime, formatNaira, METHOD_LABELS, STATE_LABELS, subscriptionState } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import {
  Badge,
  EmptyState,
  ErrorState,
  Pagination,
  Panel,
  Spinner,
  TableWrap,
} from '@/components/admin/ui'

const STATES = ['awaiting', 'pending', 'active', 'scheduled', 'expired', 'cancelled']

export default function Subscriptions() {
  const [params] = useSearchParams()
  const fetcher = useCallback((p, signal) => fetchSubscriptions(p, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    state: params.get('state') ?? '',
    plan: '',
    method: '',
  })

  const plansFetcher = useCallback((signal) => fetchAdminPlans(signal), [])
  const { data: plans } = useAsyncData(plansFetcher)

  const toast = useToast()

  const activate = async (s) => {
    if (!window.confirm(`Confirm you have received ${formatNaira(s.amount)} from ${s.user?.name} and activate ${s.plan_name}?`)) return

    try {
      await activateSubscription(s.id)
      toast.success(`${s.reference} is now active.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Subscriptions"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Reference, name, email or phone"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.state} onChange={(e) => setFilter('state', e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {STATE_LABELS[s]}
              </option>
            ))}
          </select>
          <select value={filters.plan} onChange={(e) => setFilter('plan', e.target.value)} aria-label="Plan">
            <option value="">All plans</option>
            {(plans?.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={filters.method} onChange={(e) => setFilter('method', e.target.value)} aria-label="Payment method">
            <option value="">All methods</option>
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading subscriptions" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nothing here" hint="Try clearing the filters above." />
      ) : (
        <>
          <TableWrap head={['Reference', 'Trader', 'Plan', 'Amount', 'Method', 'Created', 'Status', '']}>
            {rows.map((s) => {
              const state = subscriptionState(s)
              return (
                <tr key={s.id}>
                  <td>
                    <Link className="link-arrow ad-mono" to={`/admin/subscriptions/${s.id}`}>
                      {s.reference}
                    </Link>
                  </td>
                  <td>
                    {s.user?.name}
                    <br />
                    <span className="ad-field__hint">{s.user?.phone ?? s.user?.email}</span>
                  </td>
                  <td>{s.plan_name}</td>
                  <td className="ad-mono">{formatNaira(s.amount)}</td>
                  <td>{METHOD_LABELS[s.payment_method] ?? '—'}</td>
                  <td>{formatDateTime(s.created_at)}</td>
                  <td>
                    <Badge status={state} label={STATE_LABELS[state]} />
                  </td>
                  <td>
                    <div className="ad-table__actions">
                      {s.state === 'pending' && (
                        <button className="ad-btn ad-btn--sm" onClick={() => activate(s)}>
                          Activate
                        </button>
                      )}
                      <Link className="ad-btn ad-btn--ghost ad-btn--sm" to={`/admin/subscriptions/${s.id}`}>
                        Open
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </TableWrap>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}
    </Panel>
  )
}
