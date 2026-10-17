import { siteUrl } from './site-url'
import { messages } from './i18n/messages'

export function applySeoHead() {
  if (document.body.dataset.i18nPage) return

  const title = messages.fr['meta.title']
  const description = messages.fr['meta.description']
  const url = siteUrl('/')
  const locale = 'fr_FR'

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) canonical.href = url

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector<HTMLMetaElement>(selector)
    if (el) el.content = content
  }

  setMeta('meta[property="og:title"]', title)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:url"]', url)
  setMeta('meta[property="og:locale"]', locale)
  setMeta('meta[name="twitter:title"]', title)
  setMeta('meta[name="twitter:description"]', description)

  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (metaDesc) metaDesc.content = description
}
