import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate, formatDateTime, formatNaira, STATE_LABELS, subscriptionState } from '@/lib/format'
import { Badge, EmptyState, ErrorState, Panel, Spinner, StatCard, TableWrap } from '@/components/admin/ui'

export default function Dashboard() {
  const fetcher = useCallback((signal) => fetchDashboard(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (status === 'loading' && !data) return <Spinner label="Loading the dashboard" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const d = data.data
  const change = d.revenue_change

  return (
    <>
      {d.subscriptions_awaiting > 0 && (
        <Link to="/admin/subscriptions?state=awaiting" className="ad-alert">
          <strong>
            {d.subscriptions_awaiting} bank transfer{d.subscriptions_awaiting === 1 ? '' : 's'} waiting
            to be confirmed
          </strong>
          <span>Check the account, then activate →</span>
        </Link>
      )}

      <div className="ad-stats">
        <StatCard
          label="Revenue this month"
          value={formatNaira(d.revenue_this_month)}
          hint={
            change === null
              ? `Last month ${formatNaira(d.revenue_last_month)}`
              : `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs last month`
          }
          trend={change}
        />
        <StatCard label="All-time revenue" value={formatNaira(d.revenue_total)} hint="Money received" />
        <StatCard
          label="Active subscribers"
          value={d.subscriptions_active}
          hint={d.subscriptions_expiring ? `${d.subscriptions_expiring} ending within 7 days` : 'None ending this week'}
        />
        <StatCard
          label="Traders"
          value={d.users_total}
          hint={`${d.users_this_month} joined this month`}
        />
        <StatCard
          label="Awaiting payment"
          value={d.subscriptions_pending}
          hint={`${d.subscriptions_awaiting} transfer${d.subscriptions_awaiting === 1 ? '' : 's'} to confirm`}
        />
      </div>

      <div className="ad-grid">
        <Panel
          title="Recent subscriptions"
          action={
            <Link to="/admin/subscriptions" className="ad-btn ad-btn--ghost ad-btn--sm">
              View all
            </Link>
          }
          bodyFlush
        >
          {d.recent_subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions yet" hint="They will appear here as traders choose plans." />
          ) : (
            <TableWrap head={['Trader', 'Plan', 'Amount', 'Status', 'Created']}>
              {d.recent_subscriptions.map((s) => {
                const state = subscriptionState(s)
                return (
                  <tr key={s.id}>
                    <td>
                      <Link className="link-arrow" to={`/admin/subscriptions/${s.id}`}>
                        {s.user?.name}
                      </Link>
                    </td>
                    <td>{s.plan_name}</td>
                    <td className="ad-mono">{formatNaira(s.amount)}</td>
                    <td>
                      <Badge status={state} label={STATE_LABELS[state]} />
                    </td>
                    <td>{formatDateTime(s.created_at)}</td>
                  </tr>
                )
              })}
            </TableWrap>
          )}
        </Panel>

        <Panel title="Plans" bodyFlush>
          {d.plans.length === 0 ? (
            <EmptyState
              title="No plans yet"
              action={
                <Link to="/admin/plans/new" className="ad-btn ad-btn--sm">
                  Create a plan
                </Link>
              }
            />
          ) : (
            <TableWrap head={['Plan', 'Active now', 'Revenue']}>
              {d.plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name}
                    {!p.is_active && <span className="ad-field__hint"> (hidden)</span>}
                  </td>
                  <td className="ad-mono">{p.active_count}</td>
                  <td className="ad-mono">{formatNaira(p.revenue)}</td>
                </tr>
              ))}
            </TableWrap>
          )}
        </Panel>
      </div>

      <Panel
        title="Newest traders"
        action={
          <Link to="/admin/users" className="ad-btn ad-btn--ghost ad-btn--sm">
            View all
          </Link>
        }
        bodyFlush
      >
        {d.recent_users.length === 0 ? (
          <EmptyState title="No traders yet" hint="Sign-ups from the website will show here." />
        ) : (
          <TableWrap head={['Name', 'Email', 'Phone', 'Current plan', 'Joined']}>
            {d.recent_users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link className="link-arrow" to={`/admin/users/${u.id}`}>
                    {u.name}
                  </Link>
                </td>
                <td>{u.email}</td>
                <td>{u.phone ?? '—'}</td>
                <td>{u.current_plan ? `${u.current_plan.name} · ends ${formatDate(u.current_plan.ends_at)}` : '—'}</td>
                <td>{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </TableWrap>
        )}
      </Panel>
    </>
  )
}
