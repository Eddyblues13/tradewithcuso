import { STATE_LABELS, subscriptionState } from '@/lib/format'

export default function StatusPill({ subscription }) {
  const state = subscriptionState(subscription)
  return <span className={`pill pill--${state}`}>{STATE_LABELS[state] ?? state}</span>
}
