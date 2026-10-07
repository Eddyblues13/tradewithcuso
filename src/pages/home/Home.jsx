import { useSeo } from '@/hooks/useSeo'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import PlansSection from './components/PlansSection'
import WhySection from './components/WhySection'
import Faq from './components/Faq'
import CtaBand from './components/CtaBand'

export default function Home() {
  useSeo({
    description:
      'TradeWithCuso — trading education, daily market analysis and mentorship for Nigerian traders. Choose a plan and pay in naira by card or bank transfer.',
    path: '/',
  })

  return (
    <>
      <Hero />
      <HowItWorks />
      <PlansSection />
      <WhySection />
      <Faq />
      <CtaBand />
    </>
  )
}
