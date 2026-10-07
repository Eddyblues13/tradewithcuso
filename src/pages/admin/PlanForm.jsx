import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createPlan, fetchAdminPlan, updatePlan } from '@/lib/adminApi'
import { formatNaira } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { ErrorState, Field, Panel, Spinner } from '@/components/admin/ui'

const BLANK = {
  name: '',
  slug: '',
  tagline: '',
  price: '',
  duration_days: '30',
  features: '',
  is_popular: false,
  is_active: true,
  sort_order: '0',
}

const DURATIONS = [
  ['7', '1 week'],
  ['30', '1 month (30 days)'],
  ['90', '3 months (90 days)'],
  ['180', '6 months (180 days)'],
  ['365', '1 year (365 days)'],
]

export default function PlanForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(BLANK)
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const load = useCallback(
    (signal) =>
      fetchAdminPlan(id, signal)
        .then(({ data }) => {
          setForm({
            name: data.name,
            slug: data.slug,
            tagline: data.tagline ?? '',
            price: String(data.price),
            duration_days: String(data.duration_days),
            features: data.features.join('\n'),
            is_popular: data.is_popular,
            is_active: data.is_active,
            sort_order: String(data.sort_order ?? 0),
          })
          setStatus('ready')
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          setLoadError(err.message)
          setStatus('error')
        }),
    [id]
  )

  useEffect(() => {
    if (!isEdit) return
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [isEdit, load])

  if (status === 'loading') return <Spinner label="Loading the plan" />
  if (status === 'error') return <ErrorState message={loadError} />

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setErrors({})

    const body = {
      ...form,
      slug: form.slug || undefined,
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      sort_order: Number(form.sort_order || 0),
    }

    try {
      if (isEdit) {
        await updatePlan(id, body)
        toast.success(`${form.name} saved.`)
      } else {
        await createPlan(body)
        toast.success(`${form.name} created.`)
      }
      navigate('/admin/plans')
    } catch (err) {
      setErrors(err.errors ?? {})
      toast.error(err.message)
      setSaving(false)
    }
  }

  const presetDuration = DURATIONS.some(([days]) => days === form.duration_days)

  return (
    <>
      <Link to="/admin/plans" className="ad-back">
        ← All plans
      </Link>

      <Panel title={isEdit ? `Edit ${form.name || 'plan'}` : 'New plan'}>
        <form className="ad-form" onSubmit={submit}>
          <div className="ad-row">
            <Field label="Name" error={errors.name}>
              <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field
              label="Web address"
              hint={`tradewithcuso.com/register?plan=${form.slug || 'made-from-the-name'}`}
              error={errors.slug}
            >
              <input
                type="text"
                placeholder="Made from the name"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
            </Field>
          </div>

          <Field label="Tagline" hint="One line under the plan name." error={errors.tagline}>
            <input type="text" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>

          <div className="ad-row">
            <Field
              label="Price (₦)"
              hint={
                form.price
                  ? `${formatNaira(Number(form.price))} — existing subscriptions keep the price they were sold at.`
                  : 'Whole naira, e.g. 25000'
              }
              error={errors.price}
            >
              <input
                type="number"
                min="100"
                step="1"
                required
                inputMode="numeric"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </Field>

            <Field label="Length" error={errors.duration_days}>
              <div className="ad-inline">
                <select
                  value={presetDuration ? form.duration_days : 'custom'}
                  onChange={(e) => set('duration_days', e.target.value === 'custom' ? '' : e.target.value)}
                >
                  {DURATIONS.map(([days, label]) => (
                    <option key={days} value={days}>
                      {label}
                    </option>
                  ))}
                  <option value="custom">Custom…</option>
                </select>
                {!presetDuration && (
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Days"
                    value={form.duration_days}
                    onChange={(e) => set('duration_days', e.target.value)}
                  />
                )}
              </div>
            </Field>
          </div>

          <Field label="Features" hint="One per line. Shown as a checklist on the plan card." error={errors.features}>
            <textarea rows={7} value={form.features} onChange={(e) => set('features', e.target.value)} />
          </Field>

          <div className="ad-row">
            <Field label="Display order" hint="Lower numbers show first." error={errors.sort_order}>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
              />
            </Field>
            <div className="ad-checks">
              <label className="ad-check">
                <input type="checkbox" checked={form.is_popular} onChange={(e) => set('is_popular', e.target.checked)} />
                Highlight as “Most popular”
              </label>
              <label className="ad-check">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
                Show on the website
              </label>
            </div>
          </div>

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save plan' : 'Create plan'}
            </button>
            <Link to="/admin/plans" className="ad-btn ad-btn--ghost">
              Cancel
            </Link>
          </div>
        </form>
      </Panel>
    </>
  )
}
