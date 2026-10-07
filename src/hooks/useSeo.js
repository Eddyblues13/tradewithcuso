import { useEffect } from 'react'

const SITE = 'TradeWithCuso'
const ORIGIN = 'https://tradewithcuso.com'

/** Creates the tag on first use, so index.html only has to carry the defaults. */
function setMeta(selector, attr, value) {
  if (!value) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(property|name)="([^"]+)"\]/) ?? []
    if (!key) return
    el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function setCanonical(path) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${ORIGIN}${path}`)
}

/**
 * Per-route title, description and canonical.
 *
 * Link-preview scrapers (WhatsApp, Facebook) never run this — they read the
 * static index.html — so the tags there stay the source of truth for shared
 * links. This is for Google, the browser tab and history.
 */
export function useSeo({ title, description, path, noindex = false } = {}) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Learn to trade with structure`
    document.title = full

    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:description"]', 'content', description)

    if (path) {
      setMeta('meta[property="og:url"]', 'content', `${ORIGIN}${path}`)
      setCanonical(path)
    }

    // Account and dashboard pages are per-person and kept out of the index.
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow')
  }, [title, description, path, noindex])
}
