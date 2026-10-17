import { siteUrl } from './site-url'
import { getLang, t } from './i18n'

export function applySeoHead() {
  if (document.body.dataset.i18nPage) return

  const title = t('meta.title')
  const description = t('meta.description')
  const url = siteUrl('/')
  const locale = getLang() === 'fr' ? 'fr_FR' : getLang() === 'es' ? 'es_ES' : 'en_US'

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
}
