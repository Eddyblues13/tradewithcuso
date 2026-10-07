import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearTraderToken,
  fetchTrader,
  getTraderToken,
  loginTrader,
  logoutTrader,
  registerTrader,
  setSignedOutHandler,
  setTraderToken,
} from '@/lib/api'
import { TraderAuthContext } from './trader-auth-context'

/**
 * The signed-in trader, if there is one.
 *
 * The homepage, plans and terms all work signed out, so a failure here never
 * blocks the page. A token that no longer works just means signed out.
 */
export function TraderAuthProvider({ children }) {
  const [trader, setTrader] = useState(null)
  const [status, setStatus] = useState(() => (getTraderToken() ? 'loading' : 'guest'))

  const signOutLocally = useCallback(() => {
    clearTraderToken()
    setTrader(null)
    setStatus('guest')
  }, [])

  // An expired token or a suspension, wherever it surfaces, ends the session.
  useEffect(() => {
    setSignedOutHandler(signOutLocally)
    return () => setSignedOutHandler(null)
  }, [signOutLocally])

  useEffect(() => {
    if (!getTraderToken()) return

    const controller = new AbortController()

    fetchTrader(controller.signal)
      .then((payload) => {
        setTrader(payload.data)
        setStatus('signed-in')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        signOutLocally()
      })

    return () => controller.abort()
  }, [signOutLocally])

  /** Re-reads the account — after a payment, so the current plan is up to date. */
  const refresh = useCallback(async () => {
    const payload = await fetchTrader()
    setTrader(payload.data)
    return payload.data
  }, [])

  const signIn = useCallback(async (credentials) => {
    const payload = await loginTrader(credentials)
    setTraderToken(payload.token)
    setTrader(payload.user)
    setStatus('signed-in')
    return payload.user
  }, [])

  const signUp = useCallback(async (details) => {
    const payload = await registerTrader(details)
    setTraderToken(payload.token)
    setTrader(payload.user)
    setStatus('signed-in')
    return payload.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutTrader()
    } catch {
      // The token is being thrown away regardless; a failed call to revoke it
      // server-side must not leave someone stuck signed in.
    }
    signOutLocally()
  }, [signOutLocally])

  const value = useMemo(
    () => ({
      trader,
      status,
      checking: status === 'loading',
      isSignedIn: status === 'signed-in',
      signIn,
      signUp,
      signOut,
      refresh,
      setTrader,
    }),
    [trader, status, signIn, signUp, signOut, refresh]
  )

  return <TraderAuthContext.Provider value={value}>{children}</TraderAuthContext.Provider>
}
