import { useCallback, useState } from 'react'
import { fetchAdminSettings, updateAdminSettings } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useToast } from '@/components/admin/toast-context'
import { Badge, ErrorState, Field, Panel, Spinner } from '@/components/admin/ui'

const CONTACT = [
  ['contact_email', 'Contact email', 'email', 'Shown in the footer and the terms.'],
  ['contact_phone', 'Contact phone', 'tel', ''],
  ['whatsapp_number', 'WhatsApp number', 'tel', 'With country code, e.g. +2348012345678.'],
  ['telegram_url', 'Telegram link', 'url', 'https://t.me/…'],
  ['instagram_url', 'Instagram link', 'url', 'https://instagram.com/…'],
  ['twitter_url', 'X (Twitter) link', 'url', 'https://x.com/…'],
]

const BANK = [
  ['bank_name', 'Bank name', 'text', ''],
  ['bank_account_number', 'Account number', 'text', 'Digits only.'],
  ['bank_account_name', 'Account name', 'text', ''],
]

export default function Settings() {
  const fetcher = useCallback((signal) => fetchAdminSettings(signal), [])
  const { data, status, error, reload, setData } = useAsyncData(fetcher)
  const toast = useToast()

  const [edits, setEdits] = useState({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  if (status === 'loading' && !data) return <Spinner label="Loading settings" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const values = { ...data.data, ...edits }
  const set = (name, value) => setEdits((e) => ({ ...e, [name]: value }))
  const transfersOn = values.bank_name && values.bank_account_number && values.bank_account_name

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setErrors({})
    try {
      const payload = await updateAdminSettings(values)
      setData(payload)
      setEdits({})
      toast.success(payload.message)
    } catch (err) {
      setErrors(err.errors ?? {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const fields = (list) =>
    list.map(([name, label, type, hint]) => (
      <Field key={name} label={label} hint={hint} error={errors[name]}>
        <input
          type={type}
          inputMode={name === 'bank_account_number' ? 'numeric' : undefined}
          value={values[name] ?? ''}
          onChange={(e) => set(name, e.target.value)}
        />
      </Field>
    ))

  return (
    <form onSubmit={submit}>
      <Panel title="Payments">
        <div className="ad-paystatus">
          <div>
            <strong>Card payments (Paystack)</strong>
            <p className="ad-field__hint">
              {data.paystack_configured
                ? 'Connected. Traders can pay by card and are activated automatically.'
                : 'Not connected. Add PAYSTACK_SECRET_KEY to the API’s .env file to turn on card payments.'}
            </p>
          </div>
          <Badge status={data.paystack_configured ? 'live' : 'off'} label={data.paystack_configured ? 'On' : 'Off'} />
        </div>
        <div className="ad-paystatus">
          <div>
            <strong>Bank transfer</strong>
            <p className="ad-field__hint">
              {transfersOn
                ? 'On. Traders see these details at checkout; you confirm each transfer from Subscriptions.'
                : 'Off. Fill in all three bank fields below to turn it on.'}
            </p>
          </div>
          <Badge status={transfersOn ? 'live' : 'off'} label={transfersOn ? 'On' : 'Off'} />
        </div>

        <div className="ad-form ad-form--top">
          <div className="ad-row ad-row--3">{fields(BANK)}</div>
        </div>
      </Panel>

      <Panel title="Contact & social">
        <div className="ad-form">
          <div className="ad-row">{fields(CONTACT.slice(0, 2))}</div>
          <div className="ad-row">{fields(CONTACT.slice(2, 4))}</div>
          <div className="ad-row">{fields(CONTACT.slice(4))}</div>
        </div>
      </Panel>

      <div className="ad-actions ad-actions--sticky">
        <button type="submit" className="ad-btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
