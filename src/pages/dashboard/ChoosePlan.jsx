import PlansGrid from '@/components/common/PlansGrid'
import { useTraderAuth } from '@/context/trader-auth-context'
import { formatDate } from '@/lib/format'

export default function ChoosePlan() {
  const { trader } = useTraderAuth()
  const current = trader?.current_subscription

  return (
    <div className="choose">
      <div className="choose__intro">
        <h2>Choose a trading plan</h2>
        <p>
          {current
            ? `You’re on ${current.plan_name} until ${formatDate(current.ends_at)}. A plan you buy now starts the day that one ends.`
            : 'All prices are in naira and cover the whole plan period.'}
        </p>
      </div>
      <PlansGrid />
    </div>
  )
}
