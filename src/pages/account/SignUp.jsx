import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordField from '@/components/common/PasswordField'
import Spinner from '@/components/common/Spinner'
import { useSite } from '@/context/site-context'
import { useTraderAuth } from '@/context/trader-auth-context'
import { useSeo } from '@/hooks/useSeo'
import { formatNaira } from '@/lib/format'

const BLANK = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  accept_terms: false,
}

export default function SignUp() {
  useSeo({ title: 'Create an account', path: '/register' })

  const { signUp, isSignedIn, checking } = useTraderAuth()
  const { plans } = useSite()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // A plan picked on the homepage is carried through sign-up to checkout.
  const planSlug = params.get('plan')
  const chosenPlan = plans.find((p) => p.slug === planSlug)
  const destination = planSlug ? `/dashboard/subscribe/${planSlug}` : '/dashboard/plans'

  const [form, setForm] = useState(BLANK)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (checking) return <Spinner label="Checking your session" />
  if (isSignedIn) return <Navigate to={destination} replace />

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await signUp(form)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors ?? {})
      setSubmitting(false)
    }
  }

  const fieldError = (name) =>
    fieldErrors[name] && <small className="field__error">{fieldErrors[name]}</small>

  return (
    <section className="auth">
      <div className="auth__card auth__card--wide">
        <h1>Create your account</h1>
        <p className="auth__lead">
          {chosenPlan ? (
            <>
              You picked <strong>{chosenPlan.name}</strong> ({formatNaira(chosenPlan.price)} /{' '}
              {chosenPlan.duration_label}). Create your account to continue to payment.
            </>
          ) : (
            'It takes under a minute. You will choose your plan next.'
          )}
        </p>

        <form className="form" onSubmit={submit} noValidate>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              disabled={submitting}
              onChange={(e) => set('name', e.target.value)}
            />
            {fieldError('name')}
          </label>

          <div className="form__row">
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                disabled={submitting}
                onChange={(e) => set('email', e.target.value)}
              />
              {fieldError('email')}
            </label>

            <label className="field">
              <span>Phone number</span>
              <input
                type="tel"
                required
                autoComplete="tel"
                placeholder="0801 234 5678"
                value={form.phone}
                disabled={submitting}
                onChange={(e) => set('phone', e.target.value)}
              />
              {fieldError('phone')}
            </label>
          </div>

          <div className="form__row">
            <label className="field">
              <span>Password</span>
              <PasswordField
                required
                autoComplete="new-password"
                value={form.password}
                disabled={submitting}
                onChange={(e) => set('password', e.target.value)}
              />
              {fieldError('password') || <small className="field__hint">At least 8 characters.</small>}
            </label>

            <label className="field">
              <span>Confirm password</span>
              <PasswordField
                required
                autoComplete="new-password"
                value={form.password_confirmation}
                disabled={submitting}
                onChange={(e) => set('password_confirmation', e.target.value)}
              />
            </label>
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={form.accept_terms}
              disabled={submitting}
              onChange={(e) => set('accept_terms', e.target.checked)}
            />
            <span>
              I am 18 or older, I have read and accept the{' '}
              <Link to="/terms" target="_blank">
                terms and conditions
              </Link>
              , and I understand that trading carries a risk of loss.
            </span>
          </label>
          {fieldError('accept_terms')}

          {error && !Object.keys(fieldErrors).length && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--block btn--lg" disabled={submitting}>
            {submitting ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        <p className="auth__switch">
          Already have an account?{' '}
          <Link to="/login" state={planSlug ? { from: { pathname: destination } } : undefined}>
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}
