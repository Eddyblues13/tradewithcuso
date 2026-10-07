import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPlans, fetchSettings } from '@/lib/api'
import { SiteContext } from './site-context'

const DEFAULT_SETTINGS = {
  contact_email: 'hello@tradewithcuso.com',
  contact_phone: '',
  whatsapp_number: '',
  telegram_url: '',
  instagram_url: '',
  twitter_url: '',
  payment_methods: { paystack: false, bank_transfer: false },
}

/**
 * Plans and contact details, fetched once and shared by the homepage, the
 * plans page, checkout and the footer.
 *
 * Settings fall back to defaults if the API is down, so the footer still
 * renders. Plans do not: a made-up price is worse than an honest error.
 */
export function SiteProvider({ children }) {
  const [plans, setPlans] = useState([])
  const [plansStatus, setPlansStatus] = useState('loading')
  const [plansError, setPlansError] = useState('')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchPlans(controller.signal)
      .then((payload) => {
        setPlans(payload.data)
        setPlansStatus('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setPlansError(err.message)
        setPlansStatus('error')
      })

    fetchSettings(controller.signal)
      .then((payload) => setSettings({ ...DEFAULT_SETTINGS, ...payload.data }))
      .catch(() => {
        // Defaults stand in.
      })

    return () => controller.abort()
  }, [attempt])

  const reloadPlans = useCallback(() => {
    setPlansStatus('loading')
    setPlansError('')
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({
      plans,
      plansStatus,
      plansError,
      reloadPlans,
      settings,
      cheapestPlan: plans.length ? Math.min(...plans.map((p) => p.price)) : null,
    }),
    [plans, plansStatus, plansError, reloadPlans, settings]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
