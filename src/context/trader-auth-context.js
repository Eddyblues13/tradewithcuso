import { createContext, useContext } from 'react'

export const TraderAuthContext = createContext(null)

export function useTraderAuth() {
  const ctx = useContext(TraderAuthContext)
  if (!ctx) throw new Error('useTraderAuth must be used inside <TraderAuthProvider>')
  return ctx
}
