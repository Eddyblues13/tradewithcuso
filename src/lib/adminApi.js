import { ApiError, BASE_URL } from './api'

const TOKEN_KEY = 'twc-admin-token'

/* localStorage throws in Safari private mode — never let that break the app. */
export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore — the session then lasts only as long as the tab */
  }
}

export const clearToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

// Set by AdminAuthProvider so an expired or revoked token drops the session
// wherever the 401 happens to surface.
let onUnauthorized = null
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

const queryString = (params) =>
  params
    ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )}`
    : ''

async function request(path, { method = 'GET', body, signal, params } = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}/admin${path}${queryString(params)}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError("Can't reach the server — check your connection and try again.")
  }

  if (response.status === 401) {
    clearToken()
    onUnauthorized?.()
    throw new ApiError('Your session has expired. Please sign in again.', { status: 401 })
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Something went wrong (${response.status}).`, {
      status: response.status,
      errors: payload?.errors ?? {},
    })
  }

  return payload
}

/* auth */
export const adminLogin = (credentials) => request('/login', { method: 'POST', body: credentials })
export const adminMe = (signal) => request('/me', { signal })
export const adminLogout = () => request('/logout', { method: 'POST' })
export const adminUpdateProfile = (body) => request('/profile', { method: 'PUT', body })
export const adminUpdatePassword = (body) => request('/password', { method: 'PUT', body })

/* dashboard */
export const fetchDashboard = (signal) => request('/dashboard', { signal })

/* plans */
export const fetchAdminPlans = (signal) => request('/plans', { signal })
export const fetchAdminPlan = (id, signal) => request(`/plans/${id}`, { signal })
export const createPlan = (body) => request('/plans', { method: 'POST', body })
export const updatePlan = (id, body) => request(`/plans/${id}`, { method: 'PUT', body })
export const togglePlan = (id) => request(`/plans/${id}/toggle`, { method: 'PATCH' })
export const deletePlan = (id) => request(`/plans/${id}`, { method: 'DELETE' })

/* subscriptions */
export const fetchSubscriptions = (params, signal) => request('/subscriptions', { params, signal })
export const fetchSubscription = (id, signal) => request(`/subscriptions/${id}`, { signal })
export const activateSubscription = (id, body) =>
  request(`/subscriptions/${id}/activate`, { method: 'PATCH', body })
export const cancelSubscription = (id, body) =>
  request(`/subscriptions/${id}/cancel`, { method: 'PATCH', body })
export const updateSubscriptionNote = (id, note) =>
  request(`/subscriptions/${id}/note`, { method: 'PATCH', body: { note } })
export const deleteSubscription = (id) => request(`/subscriptions/${id}`, { method: 'DELETE' })

/* traders */
export const fetchUsers = (params, signal) => request('/users', { params, signal })
export const fetchUser = (id, signal) => request(`/users/${id}`, { signal })
export const toggleUser = (id) => request(`/users/${id}/toggle`, { method: 'PATCH' })
export const grantPlan = (id, body) => request(`/users/${id}/subscriptions`, { method: 'POST', body })
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' })

/* settings */
export const fetchAdminSettings = (signal) => request('/settings', { signal })
export const updateAdminSettings = (body) => request('/settings', { method: 'PUT', body })

/* team */
export const fetchTeam = (signal) => request('/team', { signal })
export const createTeamMember = (body) => request('/team', { method: 'POST', body })
export const updateTeamMember = (id, body) => request(`/team/${id}`, { method: 'PUT', body })
export const deleteTeamMember = (id) => request(`/team/${id}`, { method: 'DELETE' })
