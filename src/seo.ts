import { getLang } from './i18n'
import { messages, type Lang } from './i18n/messages'
import { siteUrl } from './site-url'

const STORAGE_KEY = 'madinlab-lang'

/** Langue pour l’indexation : français sauf si l’utilisateur a choisi EN/ESP (stockage local). */
function seoLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    /* mode privé / crawlers */
  }
  return 'fr'
}

export function applySeoHead() {
  const page = document.body.dataset.i18nPage
  const lang = seoLang()

  let titleKey = 'meta.title'
  let descKey = 'meta.description'
  let path = '/'

  if (page === 'legal') {
    titleKey = 'legal.meta.title'
    descKey = 'legal.meta.description'
    path = '/mentions-legales.html'
  } else if (page === 'orizon') {
    titleKey = 'orizon.meta.title'
    descKey = 'orizon.meta.description'
    path = '/orizon.html'
  } else if (page) {
    return
  }

  const title = messages[lang][titleKey] ?? messages.fr[titleKey]
  const description = messages[lang][descKey] ?? messages.fr[descKey]
  const url = siteUrl(path)
  const locale = lang === 'fr' ? 'fr_FR' : lang === 'es' ? 'es_ES' : 'en_US'

  if (lang === getLang()) {
    document.title = title
  }

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) canonical.href = url

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector<HTMLMetaElement>(selector)
    if (el) el.content = content
  }

  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (metaDesc) metaDesc.content = description

  setMeta('meta[property="og:title"]', title)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:url"]', url)
  setMeta('meta[property="og:locale"]', locale)
  setMeta('meta[name="twitter:title"]', title)
  setMeta('meta[name="twitter:description"]', description)
}
