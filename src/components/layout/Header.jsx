import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { useTraderAuth } from '@/context/trader-auth-context'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/plans', label: 'Plans' },
  { to: '/#how-it-works', label: 'How it works', hash: true },
  { to: '/#faq', label: 'FAQ', hash: true },
  { to: '/terms', label: 'Terms' },
]

export default function Header() {
  const { isSignedIn, trader } = useTraderAuth()
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // The menu remembers which page it was opened on, so following any link —
  // a new location — closes it without an effect to keep in step.
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === location.key

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The page behind an open menu should not scroll.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const firstName = trader?.name?.split(' ')[0]

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${open ? 'header--open' : ''}`}>
      <div className="header__inner">
        <Logo />

        <nav className="header__nav" aria-label="Main">
          {LINKS.map((link) =>
            link.hash ? (
              <Link key={link.to} to={link.to} className="header__link">
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="header__actions">
          {isSignedIn ? (
            <Link to="/dashboard" className="btn btn--sm">
              {firstName ? `Hi, ${firstName}` : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="header__link header__login">
                Log in
              </Link>
              <Link to="/register" className="btn btn--sm">
                Get started
              </Link>
            </>
          )}

          <button
            className="header__burger"
            onClick={() => setOpenOn(open ? null : location.key)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="header__mobile" hidden={!open}>
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="header__mobile-link">
            {link.label}
          </Link>
        ))}
        <div className="header__mobile-actions">
          {isSignedIn ? (
            <Link to="/dashboard" className="btn btn--block">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn--block">
                Create an account
              </Link>
              <Link to="/login" className="btn btn--ghost btn--block">
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
