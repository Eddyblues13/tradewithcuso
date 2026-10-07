import { useState } from 'react'
import PasswordField from '@/components/common/PasswordField'
import { useTraderAuth } from '@/context/trader-auth-context'
import { updateTraderPassword, updateTraderProfile } from '@/lib/api'

const BLANK_PASSWORD = { current_password: '', password: '', password_confirmation: '' }

function useForm(initial) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ tone: '', text: '' })

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = (action, onDone) => async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setErrors({})
    setMessage({ tone: '', text: '' })
    try {
      const payload = await action(form)
      setMessage({ tone: 'ok', text: payload.message })
      onDone?.(payload)
    } catch (err) {
      setErrors(err.errors ?? {})
      setMessage({ tone: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return { form, setForm, set, busy, errors, message, submit }
}

export default function Profile() {
  const { trader, setTrader } = useTraderAuth()

  const profile = useForm({ name: trader.name, email: trader.email, phone: trader.phone ?? '' })
  const password = useForm(BLANK_PASSWORD)

  const err = (bag, name) => bag.errors[name] && <small className="field__error">{bag.errors[name]}</small>

  return (
    <div className="profile">
      <form
        className="card form"
        onSubmit={profile.submit(updateTraderProfile, (payload) => setTrader(payload.data))}
      >
        <h3>Your details</h3>

        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            required
            value={profile.form.name}
            onChange={(e) => profile.set('name', e.target.value)}
          />
          {err(profile, 'name')}
        </label>

        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            required
            value={profile.form.email}
            onChange={(e) => profile.set('email', e.target.value)}
          />
          {err(profile, 'email')}
        </label>

        <label className="field">
          <span>Phone number</span>
          <input
            type="tel"
            required
            value={profile.form.phone}
            onChange={(e) => profile.set('phone', e.target.value)}
          />
          {err(profile, 'phone')}
        </label>

        {profile.message.text && (
          <p className={profile.message.tone === 'ok' ? 'form__ok' : 'form__error'} role="status">
            {profile.message.text}
          </p>
        )}

        <button type="submit" className="btn" disabled={profile.busy}>
          {profile.busy ? 'Saving…' : 'Save details'}
        </button>
      </form>

      <form
        className="card form"
        onSubmit={password.submit(updateTraderPassword, () => password.setForm(BLANK_PASSWORD))}
      >
        <h3>Change password</h3>
        <p className="form__note">Changing your password signs you out on every other device.</p>

        <label className="field">
          <span>Current password</span>
          <PasswordField
            required
            value={password.form.current_password}
            onChange={(e) => password.set('current_password', e.target.value)}
          />
          {err(password, 'current_password')}
        </label>

        <label className="field">
          <span>New password</span>
          <PasswordField
            required
            autoComplete="new-password"
            value={password.form.password}
            onChange={(e) => password.set('password', e.target.value)}
          />
          {err(password, 'password')}
        </label>

        <label className="field">
          <span>Confirm new password</span>
          <PasswordField
            required
            autoComplete="new-password"
            value={password.form.password_confirmation}
            onChange={(e) => password.set('password_confirmation', e.target.value)}
          />
        </label>

        {password.message.text && (
          <p className={password.message.tone === 'ok' ? 'form__ok' : 'form__error'} role="status">
            {password.message.text}
          </p>
        )}

        <button type="submit" className="btn" disabled={password.busy}>
          {password.busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
