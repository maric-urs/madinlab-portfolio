import { LANGS, messages, type Lang } from './messages'

function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value)
}

const STORAGE_KEY = 'madinlab-lang'

let currentLang: Lang = 'fr'

export function getLang(): Lang {
  return currentLang
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const table = messages[currentLang]
  let value = table[key] ?? messages.fr[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{${k}}`, String(v))
    }
  }
  return value
}

/** Français par défaut (SEO Google.fr) ; EN/ES uniquement si choix explicite enregistré. */
function detectLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && isLang(stored)) return stored
  return 'fr'
}

export function applyI18n() {
  document.documentElement.lang = currentLang
  const page = document.body.dataset.i18nPage
  const titleKey =
    page && messages.fr[`${page}.meta.title`] ? `${page}.meta.title` : 'meta.title'
  const descKey =
    page && messages.fr[`${page}.meta.description`]
      ? `${page}.meta.description`
      : 'meta.description'
  document.title = t(titleKey)
  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (metaDesc) metaDesc.content = t(descKey)

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (!key) return
    el.textContent = t(key)
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml
    if (!key) return
    el.innerHTML = t(key)
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    const spec = el.dataset.i18nAttr
    if (!spec) return
    for (const part of spec.split(';')) {
      const [attr, key] = part.split(':').map((s) => s.trim())
      if (attr && key) el.setAttribute(attr, t(key))
    }
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder
    if (!key || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
    el.placeholder = t(key)
  })

  document.querySelectorAll<HTMLOptionElement>('option[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (key) el.textContent = t(key)
  })

  document.querySelectorAll<HTMLButtonElement>('.lang-switch__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === currentLang)
    btn.setAttribute('aria-pressed', btn.dataset.lang === currentLang ? 'true' : 'false')
  })
}

export function setLang(lang: Lang) {
  currentLang = lang
  localStorage.setItem(STORAGE_KEY, lang)
  applyI18n()
  window.dispatchEvent(new CustomEvent('madinlab:lang', { detail: lang }))
}

export function initI18n(): Lang {
  currentLang = detectLang()
  applyI18n()

  const group = document.querySelector('.lang-switch')
  group?.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang
      if (lang && isLang(lang)) setLang(lang)
    })
  })

  return currentLang
}

export function getIntroSlogan(): string {
  return t('intro.slogan')
}
