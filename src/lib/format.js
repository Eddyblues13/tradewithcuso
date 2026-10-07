const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** Amounts are whole naira throughout — ₦25,000, never ₦25,000.00. */
export const formatNaira = (amount) => naira.format(amount ?? 0)

const dateTime = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '—')

const date = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' })

export const formatDate = (iso) => (iso ? date.format(new Date(iso)) : '—')

/** How a subscription's state reads to a person. */
export const STATE_LABELS = {
  pending: 'Awaiting payment',
  awaiting: 'Transfer to confirm',
  scheduled: 'Starts soon',
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const METHOD_LABELS = {
  paystack: 'Card (Paystack)',
  bank_transfer: 'Bank transfer',
  manual: 'Added by admin',
}

/** A pending bill the trader has reported paying reads differently to one they have not. */
export const subscriptionState = (subscription) =>
  subscription.state === 'pending' && subscription.transfer_reported_at ? 'awaiting' : subscription.state
