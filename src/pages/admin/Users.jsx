import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchUsers } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatDate, formatNaira } from '@/lib/format'
import {
  Badge,
  EmptyState,
  ErrorState,
  Pagination,
  Panel,
  Spinner,
  TableWrap,
} from '@/components/admin/ui'

const STATUSES = [
  ['subscribed', 'On a plan now'],
  ['unsubscribed', 'No active plan'],
  ['active', 'Active accounts'],
  ['suspended', 'Suspended'],
]

export default function Users() {
  const fetcher = useCallback((params, signal) => fetchUsers(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })

  return (
    <Panel
      title="Traders"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Name, email or phone"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter">
            <option value="">Everyone</option>
            {STATUSES.map(([value, label]) => (
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
        <Spinner label="Loading traders" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No traders found" hint="Try clearing the filters above." />
      ) : (
        <>
          <TableWrap head={['Name', 'Contact', 'Current plan', 'Total paid', 'Joined', 'Account']}>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link className="link-arrow" to={`/admin/users/${u.id}`}>
                    {u.name}
                  </Link>
                </td>
                <td>
                  {u.email}
                  <br />
                  <span className="ad-field__hint">{u.phone ?? '—'}</span>
                </td>
                <td>
                  {u.current_plan ? (
                    <>
                      {u.current_plan.name}
                      <br />
                      <span className="ad-field__hint">until {formatDate(u.current_plan.ends_at)}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="ad-mono">{formatNaira(u.total_paid)}</td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  <Badge status={u.is_active ? 'active' : 'suspended'} />
                </td>
              </tr>
            ))}
          </TableWrap>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}
    </Panel>
  )
}
