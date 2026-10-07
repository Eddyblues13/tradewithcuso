import { Navigate, useLocation } from 'react-router-dom'
import Spinner from '@/components/common/Spinner'
import { useTraderAuth } from '@/context/trader-auth-context'

/**
 * Holds the route while a stored token is checked, so a refresh — or the
 * return from Paystack — never bounces through the login page.
 */
export default function RequireTrader({ children }) {
  const { checking, isSignedIn } = useTraderAuth()
  const location = useLocation()

  if (checking) return <Spinner label="Checking your session" />

  if (!isSignedIn) {
    // The whole location, query string included, so the Paystack reference
    // survives a detour through the login page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
