import { Link } from 'react-router-dom'
import { useSite } from '@/context/site-context'
import { useSeo } from '@/hooks/useSeo'

const UPDATED = '6 October 2026'

const SECTIONS = [
  ['about', 'About these terms'],
  ['eligibility', 'Who can use the service'],
  ['accounts', 'Your account'],
  ['service', 'What we provide'],
  ['plans', 'Plans, prices and payment'],
  ['refunds', 'Cancellations and refunds'],
  ['risk', 'Risk disclosure'],
  ['no-advice', 'No financial advice'],
  ['conduct', 'Acceptable use'],
  ['ip', 'Content and intellectual property'],
  ['privacy', 'Your information'],
  ['liability', 'Limitation of liability'],
  ['suspension', 'Suspension and termination'],
  ['changes', 'Changes to these terms'],
  ['law', 'Governing law'],
  ['contact', 'Contact us'],
]

export default function Terms() {
  const { settings } = useSite()
  const email = settings.contact_email || 'hello@tradewithcuso.com'

  useSeo({
    title: 'Terms & conditions',
    description: 'The terms and conditions for using TradeWithCuso, including payments, refunds and our risk disclosure.',
    path: '/terms',
  })

  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <p className="eyebrow">Legal</p>
          <h1>Terms &amp; conditions</h1>
          <p>Last updated {UPDATED}. Please read these terms carefully before creating an account or buying a plan.</p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="section__inner legal">
          <aside className="legal__toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal__body">
            <div className="callout callout--warn">
              <strong>Trading involves significant risk.</strong> You can lose some or all of the
              money you trade with. TradeWithCuso provides education, analysis and mentorship only.
              We do not guarantee profits, we do not trade on your behalf, and we never hold or
              manage your funds.
            </div>

            <h2 id="about">1. About these terms</h2>
            <p>
              These terms and conditions (“Terms”) govern your use of the website at
              tradewithcuso.com and the services offered through it (together, the “Service”),
              operated by TradeWithCuso (“we”, “us”, “our”). By creating an account, buying a plan
              or otherwise using the Service, you agree to these Terms. If you do not agree, please
              do not use the Service.
            </p>

            <h2 id="eligibility">2. Who can use the service</h2>
            <p>
              You must be at least 18 years old and legally able to enter into a binding contract to
              use the Service. By registering you confirm that this is the case and that the
              information you give us is true and complete.
            </p>

            <h2 id="accounts">3. Your account</h2>
            <ul>
              <li>You are responsible for keeping your login details private and for all activity on your account.</li>
              <li>Accounts are personal. You may not share, sell or transfer your account or plan access to anyone else.</li>
              <li>Tell us straight away at <a href={`mailto:${email}`}>{email}</a> if you think someone else has accessed your account.</li>
              <li>Keep your email address and phone number up to date — we use them to confirm payments and contact you about your plan.</li>
            </ul>

            <h2 id="service">4. What we provide</h2>
            <p>
              Depending on the plan you choose, the Service may include trading courses and
              educational material, market analysis and commentary, trade ideas (sometimes called
              “signals”), live or recorded sessions, community access and mentorship. The features
              of each plan are described on the <Link to="/plans">plans page</Link> at the time you
              buy it.
            </p>
            <p>
              The Service is educational. We do not open, operate or manage trading accounts for
              you, we do not accept deposits for trading or investment, and we do not promise any
              return. Any money you pay us is a fee for access to the Service only.
            </p>

            <h2 id="plans">5. Plans, prices and payment</h2>
            <ul>
              <li>
                <strong>Currency.</strong> All prices are in Nigerian naira (₦) and are charged in
                naira.
              </li>
              <li>
                <strong>Price at purchase.</strong> The price you pay is the one shown when you
                choose your plan. If we later change a plan’s price, it does not affect a plan you
                have already chosen.
              </li>
              <li>
                <strong>Payment methods.</strong> You can pay by card through our payment provider,
                Paystack, or by bank transfer to the account details shown in your dashboard. Card
                details are handled by Paystack; we never see or store them.
              </li>
              <li>
                <strong>Bank transfers.</strong> When paying by transfer, use your plan reference
                as the transfer narration and confirm the transfer in your dashboard. Your plan is
                activated once we have confirmed that the full amount has reached our account.
              </li>
              <li>
                <strong>Plan period.</strong> Your plan starts when payment is confirmed and runs
                for the period stated on the plan (for example, 30 days). If you buy a new plan
                while one is still running, the new plan starts the day the current one ends.
              </li>
              <li>
                <strong>No automatic renewal.</strong> Plans do not renew automatically. When a plan
                ends, you can choose a new one from your dashboard.
              </li>
              <li>
                <strong>Unpaid plans.</strong> A plan you choose but do not pay for does not give
                access to the Service, and we may cancel it.
              </li>
            </ul>

            <h2 id="refunds">6. Cancellations and refunds</h2>
            <p>
              Because a plan gives you immediate access to paid content and analysis, plan fees are
              generally non-refundable once the plan is active. However:
            </p>
            <ul>
              <li>If you are charged twice for the same plan, or pay the wrong amount by mistake, we will refund the duplicate or excess amount.</li>
              <li>If we are unable to provide a plan you have paid for, we will refund you for the unused part of it.</li>
              <li>You can cancel a plan you have not yet paid for at any time from your dashboard.</li>
            </ul>
            <p>
              To ask for a refund, email <a href={`mailto:${email}`}>{email}</a> with your plan
              reference. Approved refunds are paid back to the original payment method or bank
              account, normally within 14 working days. Nothing in these Terms limits any right you
              have under the Federal Competition and Consumer Protection Act 2018 or other
              applicable Nigerian law.
            </p>

            <h2 id="risk">7. Risk disclosure</h2>
            <p>
              Trading foreign exchange (forex), commodities such as gold, indices, cryptocurrencies
              and leveraged products such as contracts for difference (CFDs) carries a high level of
              risk and may not be suitable for everyone. Leverage can work against you as well as
              for you. Before trading you should consider your experience, your objectives and how
              much you can afford to lose.
            </p>
            <ul>
              <li>You may lose some or all of the money you trade with. Never trade with money you cannot afford to lose.</li>
              <li>Past performance — including any results shared by us, our mentors or other members — is not a reliable indicator of future results.</li>
              <li>Examples, screenshots and case studies are for illustration only and are not typical or guaranteed outcomes.</li>
              <li>Market conditions, internet connectivity and your broker’s platform can all affect your results and are outside our control.</li>
            </ul>

            <h2 id="no-advice">8. No financial advice</h2>
            <p>
              Everything we provide is general information and education. It is not personal
              financial, investment, tax or legal advice, and it does not take your individual
              circumstances into account. Trade ideas show how we read the market; whether you act
              on them, and how much you risk, is entirely your decision and your responsibility. If
              you need advice suited to your circumstances, speak to a licensed professional.
            </p>
            <p>
              We are not a broker and do not recommend any particular broker. Choose a broker that
              is properly regulated and read its terms before opening an account.
            </p>

            <h2 id="conduct">9. Acceptable use</h2>
            <p>When using the Service you agree not to:</p>
            <ul>
              <li>copy, record, resell, forward or publish our content, analysis or trade ideas, or share them outside the Service;</li>
              <li>share your login details or let anyone else use your account;</li>
              <li>harass, abuse or mislead other members, or promote other services, schemes or products in our community spaces;</li>
              <li>try to break, overload or gain unauthorised access to the website or our systems;</li>
              <li>use the Service for anything unlawful, including fraud or money laundering.</li>
            </ul>

            <h2 id="ip">10. Content and intellectual property</h2>
            <p>
              All content on the Service — including courses, videos, analysis, trade ideas,
              graphics, text and our name and logo — belongs to us or our licensors. Your plan gives
              you a personal, non-transferable licence to use that content for your own learning
              while your plan is active. No other rights are granted.
            </p>

            <h2 id="privacy">11. Your information</h2>
            <p>
              We collect the details you give us (such as your name, email address and phone
              number) and records of your plans and payments. We use them to run your account,
              process and confirm payments, provide the Service and contact you about it. Card
              payments are processed by Paystack under its own terms and privacy policy.
            </p>
            <p>
              We do not sell your personal data. We keep it only as long as we need it for these
              purposes or as required by law, and we handle it in line with the Nigeria Data
              Protection Act 2023. You can ask to see, correct or delete your information by
              emailing <a href={`mailto:${email}`}>{email}</a>; we may need to keep payment records
              where the law requires it.
            </p>

            <h2 id="liability">12. Limitation of liability</h2>
            <p>
              We work hard to provide accurate, useful content, but we provide the Service “as is”
              and cannot guarantee that it will always be available, error-free or suitable for
              your purposes. To the fullest extent allowed by law:
            </p>
            <ul>
              <li>we are not liable for any trading losses, lost profits or other losses that result from your trading decisions, whether or not you relied on our content;</li>
              <li>we are not liable for losses caused by your broker, payment provider, internet service or other third parties;</li>
              <li>our total liability to you for any claim relating to the Service is limited to the amount you paid us for the plan the claim relates to.</li>
            </ul>
            <p>
              Nothing in these Terms excludes liability that cannot be excluded under Nigerian law,
              such as liability for fraud.
            </p>

            <h2 id="suspension">13. Suspension and termination</h2>
            <p>
              We may suspend or close your account, without refund, if you seriously or repeatedly
              break these Terms — for example by sharing our content or your login, or by abusing
              other members. Where reasonable we will tell you why first. You can stop using the
              Service at any time and ask us to close your account.
            </p>

            <h2 id="changes">14. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. The “last updated” date at the top shows
              when they last changed. If we make a significant change we will let you know by email
              or on the website. Changes do not affect a plan you have already paid for during its
              current period.
            </p>

            <h2 id="law">15. Governing law</h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. We will
              always try to resolve a complaint with you directly first; if we cannot, disputes will
              be handled by the courts of Nigeria.
            </p>

            <h2 id="contact">16. Contact us</h2>
            <p>
              Questions about these Terms, your plan or a payment? Email{' '}
              <a href={`mailto:${email}`}>{email}</a>
              {settings.contact_phone && (
                <>
                  {' '}or call <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}>{settings.contact_phone}</a>
                </>
              )}
              .
            </p>
          </article>
        </div>
      </section>
    </>
  )
}
