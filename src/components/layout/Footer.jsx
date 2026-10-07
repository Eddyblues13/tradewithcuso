import { Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { useSite } from '@/context/site-context'

/** "+234 801…" → "2348…", the form wa.me links want. */
const whatsappLink = (number) => `https://wa.me/${number.replace(/[^0-9]/g, '')}`

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { settings } = useSite()

  const socials = [
    settings.telegram_url && { href: settings.telegram_url, label: 'Telegram' },
    settings.instagram_url && { href: settings.instagram_url, label: 'Instagram' },
    settings.twitter_url && { href: settings.twitter_url, label: 'X (Twitter)' },
    settings.whatsapp_number && { href: whatsappLink(settings.whatsapp_number), label: 'WhatsApp' },
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo />
          <p>
            Structured trading education, market analysis and mentorship — priced in naira and built
            for Nigerian traders.
          </p>
          {socials.length > 0 && (
            <ul className="footer__socials">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="footer__col">
          <h4>Explore</h4>
          <Link to="/plans">Plans &amp; pricing</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#faq">FAQ</Link>
        </div>

        <div className="footer__col">
          <h4>Account</h4>
          <Link to="/register">Create an account</Link>
          <Link to="/login">Log in</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          {settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
          {settings.contact_phone && <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}>{settings.contact_phone}</a>}
          <Link to="/terms">Terms &amp; conditions</Link>
        </div>
      </div>

      <div className="footer__risk">
        <p>
          <strong>Risk warning:</strong> Trading forex, commodities, indices and cryptocurrencies
          carries a high level of risk and may not be suitable for everyone. You can lose some or all
          of your capital. Nothing on this website is financial advice, and past performance does not
          guarantee future results. TradeWithCuso does not hold or manage client funds.
        </p>
      </div>

      <div className="footer__base">
        <span>© {YEAR} TradeWithCuso. All rights reserved.</span>
        <span>All prices in Nigerian naira (₦).</span>
      </div>
    </footer>
  )
}
