import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTraderAuth } from '@/context/trader-auth-context'
import { useSeo } from '@/hooks/useSeo'

const TABS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/plans', label: 'Plans' },
  { to: '/dashboard/profile', label: 'Profile' },
]

export default function DashboardShell() {
  useSeo({ title: 'Dashboard', noindex: true })

  const { trader, signOut } = useTraderAuth()
  const navigate = useNavigate()

  const logOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <section className="dash">
      <div className="section__inner">
        <header className="dash__head">
          <div>
            <p className="eyebrow">Your dashboard</p>
            <h1>Welcome, {trader?.name?.split(' ')[0]}</h1>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={logOut}>
            Log out
          </button>
        </header>

        <nav className="tabs" aria-label="Dashboard">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `tabs__link ${isActive ? 'tabs__link--active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash__body">
          <Outlet />
        </div>
      </div>
    </section>
  )
}
