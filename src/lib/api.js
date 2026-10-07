const FALLBACK_URL = 'http://localhost:8000/api'

/**
 * Resolves the API base URL from the environment.
 *
 * A value with no scheme — "api.example.com/api" instead of
 * "https://api.example.com/api" — is the one mistake that fails silently and
 * confusingly: fetch treats it as a *relative* path, so a login POST from
 * /admin lands on https://your-site.com/admin/api.example.com/api/admin/login
 * and the SPA host answers 405. The scheme is added back here rather than
 * leaving that to be rediscovered from a stack trace.
 *
 * A leading "/" is left alone — that is a deliberate same-origin path.
 */
function resolveBaseUrl(raw) {
  const value = (raw ?? FALLBACK_URL).trim().replace(/\/+$/, '')

  if (value === '') return FALLBACK_URL
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value

  const fixed = `https://${value}`
  if (import.meta.env.DEV) {
    console.warn(
      `VITE_API_URL is missing a scheme ("${value}"). Using "${fixed}". ` +
        'Set it to the full URL, including https://, to silence this.'
    )
  }
  return fixed
}

export const BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_URL)

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    // Laravel's { field: [message] } validation bag, flattened to first message.
    this.errors = Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages[0] : messages,
      ])
    )
  }
}

/*
 * The signed-in trader's token.
 *
 * Deliberately a different key from the dashboard's, so a trader and a member
 * of staff can be signed in on the same browser without displacing each other.
 */
const TRADER_TOKEN_KEY = 'twc-trader-token'

export const getTraderToken = () => {
  try {
    return localStorage.getItem(TRADER_TOKEN_KEY)
  } catch {
    // Private browsing, or storage turned off. Treated as signed out.
    return null
  }
}

export const setTraderToken = (token) => {
  try {
    localStorage.setItem(TRADER_TOKEN_KEY, token)
  } catch {
    // Not fatal: the session lasts as long as the page does.
  }
}

export const clearTraderToken = () => {
  try {
    localStorage.removeItem(TRADER_TOKEN_KEY)
  } catch {
    // Nothing to clear.
  }
}

// Set by TraderAuthProvider so an expired token or a suspension drops the
// session wherever the 401/403 happens to surface.
let onSignedOut = null
export const setSignedOutHandler = (handler) => {
  onSignedOut = handler
}

async function request(path, { method = 'GET', body, signal, auth = false } = {}) {
  let response
  // `auth` is opt-in: plans and settings work signed out, and sending a token
  // where it is not needed only widens where it can leak.
  const token = auth ? getTraderToken() : null

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError("We can't reach the server right now — check your connection and try again.")
  }

  const payload = await response.json().catch(() => null)

  // 401 is an expired or revoked token; 403 on an account route is a
  // suspension. Either way the session is over.
  if (auth && token && (response.status === 401 || (response.status === 403 && path.startsWith('/account')))) {
    clearTraderToken()
    onSignedOut?.()
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Something went wrong (${response.status}).`, {
      status: response.status,
      errors: payload?.errors ?? {},
      data: payload,
    })
  }

  return payload
}

/* public */
export const fetchPlans = (signal) => request('/plans', { signal })
export const fetchPlan = (slug, signal) => request(`/plans/${encodeURIComponent(slug)}`, { signal })
export const fetchSettings = (signal) => request('/settings', { signal })

/* trader accounts */
export const registerTrader = (body) => request('/account/register', { method: 'POST', body })
export const loginTrader = (credentials) =>
  request('/account/login', { method: 'POST', body: credentials })
export const fetchTrader = (signal) => request('/account/me', { signal, auth: true })
export const logoutTrader = () => request('/account/logout', { method: 'POST', auth: true })
export const updateTraderProfile = (body) =>
  request('/account/profile', { method: 'PUT', body, auth: true })
export const updateTraderPassword = (body) =>
  request('/account/password', { method: 'PUT', body, auth: true })

/* subscriptions */
const sub = (reference) => `/account/subscriptions/${encodeURIComponent(reference)}`

export const fetchMySubscriptions = (signal) =>
  request('/account/subscriptions', { signal, auth: true })
export const fetchMySubscription = (reference, signal) =>
  request(sub(reference), { signal, auth: true })

/** Chooses a plan. For card payments the response carries Paystack's checkout URL. */
export const subscribe = (plan, paymentMethod) =>
  request('/account/subscriptions', {
    method: 'POST',
    body: { plan, payment_method: paymentMethod },
    auth: true,
  })

export const payWithPaystack = (reference) =>
  request(`${sub(reference)}/paystack`, { method: 'POST', auth: true })

/**
 * Asks the server to check a payment with Paystack. Landing back on the site
 * proves nothing on its own — the server is the one that asks Paystack.
 */
export const verifyPayment = (reference) =>
  request(`${sub(reference)}/verify-payment`, { method: 'POST', auth: true })

export const reportTransfer = (reference) =>
  request(`${sub(reference)}/transfer-sent`, { method: 'POST', auth: true })

export const cancelSubscription = (reference) =>
  request(`${sub(reference)}/cancel`, { method: 'POST', auth: true })
