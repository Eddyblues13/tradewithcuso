import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import PasswordField from '@/components/common/PasswordField'
import Spinner from '@/components/common/Spinner'
import { useTraderAuth } from '@/context/trader-auth-context'
import { useSeo } from '@/hooks/useSeo'

export default function SignIn() {
  useSeo({ title: 'Log in', path: '/login', noindex: true })

  const { signIn, isSignedIn, checking } = useTraderAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Query string kept, so a Paystack return that detoured through here still
  // carries its reference.
  const from = location.state?.from
  const destination = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (checking) return <Spinner label="Checking your session" />
  if (isSignedIn) return <Navigate to={destination} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await signIn(form)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors ?? {})
      setSubmitting(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth__card">
        <h1>Welcome back</h1>
        <p className="auth__lead">Log in to see your plan and payments.</p>

        <form className="form" onSubmit={submit} noValidate>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              disabled={submitting}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <small className="field__error">{fieldErrors.email}</small>}
          </label>

          <label className="field">
            <span>Password</span>
            <PasswordField
              required
              value={form.password}
              disabled={submitting}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {fieldErrors.password && <small className="field__error">{fieldErrors.password}</small>}
          </label>

          {error && !Object.keys(fieldErrors).length && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--block btn--lg" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth__switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  )
}
