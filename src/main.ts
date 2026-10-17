import './style.css'
import { initI18n, getIntroSlogan, t } from './i18n'
import { FORMSUBMIT_ENDPOINT } from './form-config'
import { LEGAL_HOST, LEGAL_PUBLISHER_ADDRESS } from './legal-config'
import { applySeoHead } from './seo'
import { initTextAnimations } from './text-animate'

function applyLegalStatic() {
  document.querySelectorAll<HTMLElement>('[data-legal="publisher-address"]').forEach((el) => {
    el.textContent = LEGAL_PUBLISHER_ADDRESS
  })
  document.querySelectorAll<HTMLElement>('[data-legal="host-name"]').forEach((el) => {
    el.textContent = LEGAL_HOST.name
  })
  document.querySelectorAll<HTMLElement>('[data-legal="host-address"]').forEach((el) => {
    el.textContent = LEGAL_HOST.address
  })
  document.querySelectorAll<HTMLAnchorElement>('[data-legal="host-url"]').forEach((el) => {
    el.href = LEGAL_HOST.website
    el.textContent = LEGAL_HOST.websiteLabel
  })
}

initI18n()
applyLegalStatic()
applySeoHead()
window.addEventListener('madinlab:lang', () => {
  applySeoHead()
  applyLegalStatic()
})

if (!window.location.hash) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initIntroTypewriter() {
  const intro = document.querySelector<HTMLElement>('.intro')
  if (!intro) return

  const typedEl = intro.querySelector<HTMLElement>('.intro__typed')
  const caret = intro.querySelector<HTMLElement>('.intro__caret')
  const fullText = getIntroSlogan()

  const dismissIntro = () => intro.remove()

  const playExit = () => {
    intro.classList.add('intro--exit')
    intro.addEventListener(
      'animationend',
      (event) => {
        if (event.animationName === 'curtain') dismissIntro()
      },
      { once: true },
    )
    window.setTimeout(dismissIntro, 1200)
  }

  if (!typedEl) {
    playExit()
    return
  }

  if (reducedMotion) {
    typedEl.textContent = fullText
    caret?.classList.add('is-done')
    playExit()
    return
  }

  let index = 0
  const typeNext = () => {
    if (index >= fullText.length) {
      caret?.classList.add('is-done')
      window.setTimeout(playExit, 550)
      return
    }
    typedEl.textContent += fullText[index]
    index += 1
    window.setTimeout(typeNext, 52)
  }

  typeNext()
}

initIntroTypewriter()

if (!reducedMotion) {
  const heroVideo = document.querySelector<HTMLVideoElement>('.hero__video')
  if (heroVideo) heroVideo.play().catch(() => {})
  document.querySelectorAll<HTMLVideoElement>('.contact__video').forEach((video) => {
    video.play().catch(() => {})
  })
}

const offres = document.querySelector('#offres')
const offresBits = offres?.querySelectorAll('.rate, .band__lead, .band__trust')

if (offresBits?.length) {
  if (reducedMotion) {
    offresBits.forEach((el) => el.classList.add('is-in'))
  } else {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          reveal.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    offresBits.forEach((el) => reveal.observe(el))
  }
}

const TOTAL_STEPS = 5

type FormulaKey = 'starter' | 'dynamique' | 'ecommerce' | 'surmesure' | 'unsure'

const FORMULA_BY_PROJECT: Record<string, FormulaKey[] | 'all'> = {
  'Site vitrine': ['starter', 'unsure'],
  'Site avec réservation / RDV': ['dynamique', 'unsure'],
  'Boutique en ligne (e-commerce)': ['ecommerce', 'unsure'],
  'Application mobile / logiciel métier': ['surmesure', 'unsure'],
  'Refonte de site existant': 'all',
}

const FORMULA_HINT_KEYS: Record<string, string> = {
  'Site vitrine': 'hint.vitrine',
  'Site avec réservation / RDV': 'hint.rdv',
  'Boutique en ligne (e-commerce)': 'hint.shop',
  'Application mobile / logiciel métier': 'hint.app',
  'Refonte de site existant': 'hint.refonte',
}

const getFormulaHint = (project: string) => {
  const key = FORMULA_HINT_KEYS[project]
  return key ? t(key) : ''
}

function initDevisWizard() {
  const root = document.querySelector('#devis-wizard')
  const form = document.querySelector<HTMLFormElement>('#devis-form')
  if (!root || !form) return

  const steps = Array.from(form.querySelectorAll<HTMLElement>('.wizard-step'))
  const labelEl = root.querySelector<HTMLElement>('[data-wizard-step-label]')
  const progressEl = root.querySelector<HTMLElement>('[data-wizard-progress]')
  const progressBar = root.querySelector<HTMLElement>('.devis-wizard__progress')
  const btnPrev = form.querySelector<HTMLButtonElement>('[data-wizard-prev]')
  const btnNext = form.querySelector<HTMLButtonElement>('[data-wizard-next]')
  const btnSubmit = form.querySelector<HTMLButtonElement>('[data-wizard-submit]')
  const errorEl = form.querySelector<HTMLElement>('[data-wizard-error]')

  let step = 1
  let successPanel: HTMLElement | null = null

  const fillSuccessPanel = (panel: HTMLElement) => {
    panel.innerHTML = `
      <div class="devis-form__done-ring" aria-hidden="true"><span>✓</span></div>
      <h3 class="devis-form__done-title">${t('wizard.success.title')}</h3>
      <p class="devis-form__done-lead">${t('wizard.success.lead')}</p>
      <p class="devis-form__done-meta">${t('wizard.success.meta')}</p>
    `
  }

  const showSuccessPanel = () => {
    root.classList.add('devis-wizard--done')
    form.querySelector('.devis-form__nav')?.remove()
    form.querySelector('.devis-form__error')?.remove()
    form.querySelector('[data-wizard-success]')?.remove()
    steps.forEach((el) => {
      el.remove()
    })
    root.querySelector('.devis-wizard__head')?.remove()

    successPanel = document.createElement('div')
    successPanel.className = 'devis-form__done'
    successPanel.setAttribute('role', 'status')
    successPanel.setAttribute('aria-live', 'polite')
    fillSuccessPanel(successPanel)
    form.append(successPanel)
    root.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      successPanel?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
  }

  const formulaCards = Array.from(
    form.querySelectorAll<HTMLLabelElement>('.choice-card[data-formula-key]'),
  )
  const formulaHint = form.querySelector<HTMLElement>('[data-formula-hint]')

  const getProjectType = () => {
    const checked = form.querySelector<HTMLInputElement>('input[name="project_type"]:checked')
    return checked?.value ?? ''
  }

  const allowedFormulaKeys = (): Set<FormulaKey> | 'all' => {
    const project = getProjectType()
    const rule = FORMULA_BY_PROJECT[project]
    if (!rule) return 'all'
    if (rule === 'all') return 'all'
    return new Set(rule)
  }

  const syncFormulaOptions = () => {
    const allowed = allowedFormulaKeys()
    const project = getProjectType()

    formulaCards.forEach((card) => {
      const key = card.dataset.formulaKey as FormulaKey | undefined
      const input = card.querySelector<HTMLInputElement>('input[name="formula"]')
      if (!key || !input) return

      const ok = allowed === 'all' || allowed.has(key)
      input.disabled = !ok
      card.classList.toggle('choice-card--disabled', !ok)
      if (!ok && input.checked) {
        input.checked = false
      }
    })

    if (formulaHint) {
      const text = getFormulaHint(project)
      if (text && project) {
        formulaHint.textContent = text
        formulaHint.hidden = false
      } else {
        formulaHint.hidden = true
      }
    }

    updateSubmitState()
  }

  const isFormulaCompatible = (): boolean => {
    const checked = form.querySelector<HTMLInputElement>('input[name="formula"]:checked')
    if (!checked || checked.disabled) return false
    const card = checked.closest<HTMLLabelElement>('[data-formula-key]')
    const key = card?.dataset.formulaKey as FormulaKey | undefined
    if (!key) return false
    const allowed = allowedFormulaKeys()
    if (allowed === 'all') return true
    return allowed.has(key)
  }

  const consentRow = form.querySelector<HTMLElement>('.devis-form__consent')

  const showError = (msg: string) => {
    if (!errorEl) return
    errorEl.textContent = msg
    errorEl.hidden = !msg
    if (msg) {
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const setConsentHighlight = (on: boolean) => {
    consentRow?.classList.toggle('devis-form__consent--missing', on)
  }

  const setStep = (next: number, scrollToWizard = false) => {
    step = next
    steps.forEach((el) => {
      const n = Number(el.dataset.step)
      const active = n === step
      el.classList.toggle('is-active', active)
      el.hidden = !active
    })
    labelEl!.textContent = t('wizard.step', { n: step, total: TOTAL_STEPS })
    progressEl!.style.width = `${(step / TOTAL_STEPS) * 100}%`
    progressBar?.setAttribute('aria-valuenow', String(step))
    btnPrev!.hidden = step <= 1
    btnNext!.hidden = step >= TOTAL_STEPS
    btnSubmit!.hidden = step !== TOTAL_STEPS
    showError('')
    if (step === 2) syncFormulaOptions()
    updateSubmitState()
    if (scrollToWizard) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const stepFields = (n: number): HTMLElement => steps[n - 1]!

  const isStepValid = (n: number): boolean => {
    const panel = stepFields(n)
    const radioNames = new Set<string>()
    panel.querySelectorAll<HTMLInputElement>('input[type="radio"][required]').forEach((el) => {
      radioNames.add(el.name)
    })
    for (const name of radioNames) {
      const checked = form.querySelector<HTMLInputElement>(
        `input[type="radio"][name="${name}"]:checked`,
      )
      if (!checked) return false
    }
    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type="radio"]):required, select[required], textarea[required]',
    )
    for (const el of Array.from(fields)) {
      if (!el.checkValidity()) return false
    }
    if (n === 2 && !isFormulaCompatible()) return false
    if (n === TOTAL_STEPS) {
      const consent = form.querySelector<HTMLInputElement>('input[name="consent_privacy"]:checked')
      if (!consent) return false
    }
    return true
  }

  const validateStep = (n: number): boolean => {
    if (isStepValid(n)) {
      showError('')
      setConsentHighlight(false)
      return true
    }
    const panel = stepFields(n)
    const missingRadio = Array.from(
      panel.querySelectorAll<HTMLInputElement>('input[type="radio"][required]'),
    ).some(
      (el) => !form.querySelector<HTMLInputElement>(`input[type="radio"][name="${el.name}"]:checked`),
    )
    if (missingRadio) {
      showError(t('wizard.err.option'))
      return false
    }
    if (n === 2 && !isFormulaCompatible()) {
      showError(t('wizard.err.formula'))
      return false
    }
    if (n === TOTAL_STEPS) {
      const consent = form.querySelector<HTMLInputElement>('input[name="consent_privacy"]:checked')
      if (!consent) {
        setConsentHighlight(true)
        showError(t('wizard.err.consent'))
        consentRow?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return false
      }
    }
    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type="radio"]):required, select[required], textarea[required]',
    )
    for (const el of Array.from(fields)) {
      if (!el.checkValidity()) {
        el.reportValidity()
        showError(t('wizard.err.required'))
        return false
      }
    }
    showError(t('wizard.err.step'))
    return false
  }

  const validateAllSteps = (): number => {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (!isStepValid(i)) return i
    }
    return 0
  }

  const updateSubmitState = () => {
    if (!btnSubmit) return
    if (step !== TOTAL_STEPS) {
      btnSubmit.disabled = true
      return
    }
    /* Toujours cliquable à l’étape 5 : la validation affiche les messages (case RGPD, champs, etc.). */
    btnSubmit.disabled = false
  }

  btnNext?.addEventListener('click', () => {
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) setStep(step + 1, true)
  })

  btnPrev?.addEventListener('click', () => {
    if (step > 1) setStep(step - 1, true)
  })

  const assetLabels: Record<string, string> = {
    asset_domain: 'Nom de domaine et hébergement',
    asset_brand: 'Logo et charte graphique',
    asset_content: 'Textes et photos prêts',
    asset_content_help: 'Aide rédaction / visuels',
    asset_logo: 'Besoin logo / identité visuelle',
  }

  const collectAssets = () => {
    const picked: string[] = []
    for (const [name, label] of Object.entries(assetLabels)) {
      const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)
      if (input) picked.push(label)
    }
    return picked.length ? picked.join(', ') : 'Non renseigné'
  }

  const buildRecap = (data: Record<string, string>) => {
    return [
      'Détails de la demande Madinlab :',
      '',
      `Type de projet : ${data.project_type}`,
      `Formule choisie : ${data.formula}`,
      `Éléments disponibles : ${data.assets_summary}`,
      `Délais souhaités : ${data.deadline}`,
      `Localisation : ${data.location}`,
      '',
      'Informations du contact :',
      `Nom : ${data.name}`,
      `Société : ${data.company || '—'}`,
      `Email : ${data.email}`,
      `Téléphone : ${data.phone}`,
      '',
      `Message : ${data.message || '—'}`,
    ].join('\n')
  }

  form.addEventListener('change', (e) => {
    const target = e.target
    if (target instanceof HTMLInputElement && target.name === 'project_type') {
      syncFormulaOptions()
    }
    if (target instanceof HTMLInputElement && target.name === 'consent_privacy') {
      setConsentHighlight(false)
      if (target.checked) showError('')
    }
    updateSubmitState()
  })
  form.addEventListener('input', () => updateSubmitState())

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const badStep = validateAllSteps()
    if (badStep !== 0) {
      setStep(badStep, true)
      validateStep(badStep)
      return
    }
    if (!validateStep(TOTAL_STEPS)) return

    const fd = new FormData(form)
    if (fd.get('_honey')) return
    if (!fd.get('consent_privacy')) {
      setConsentHighlight(true)
      showError(t('wizard.err.consent'))
      consentRow?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      updateSubmitState()
      return
    }

    const name = String(fd.get('name') ?? '').trim()
    const company = String(fd.get('company') ?? '').trim()
    const project_type = String(fd.get('project_type') ?? '')
    const formula = String(fd.get('formula') ?? '')
    const deadline = String(fd.get('deadline') ?? '')
    const location = String(fd.get('location') ?? '')

    if (!project_type || !formula || !deadline || !location) {
      showError(t('wizard.err.all'))
      updateSubmitState()
      return
    }
    const email = String(fd.get('email') ?? '').trim()
    const phone = String(fd.get('phone') ?? '').trim()
    const message = String(fd.get('message') ?? '').trim()
    const assets_summary = collectAssets()

    const payload = {
      _subject: `Nouvelle demande de devis Web - ${name}${company ? ` - ${company}` : ''}`,
      _template: 'table',
      _captcha: 'false',
      project_type,
      formula,
      assets_summary,
      deadline,
      location,
      name,
      company: company || '—',
      email,
      phone,
      message: message || '—',
      recap_detaille: buildRecap({
        project_type,
        formula,
        assets_summary,
        deadline,
        location,
        name,
        company,
        email,
        phone,
        message,
      }),
    }

    btnSubmit!.disabled = true
    btnSubmit!.setAttribute('aria-busy', 'true')
    btnSubmit!.textContent = t('wizard.btn.sending')
    showError('')

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => null)) as { success?: string | boolean } | null
      if (!res.ok || (data && 'success' in data && String(data.success) !== 'true')) {
        throw new Error('network')
      }
      showSuccessPanel()
    } catch {
      showError(t('wizard.fail'))
      btnSubmit!.disabled = false
      btnSubmit!.removeAttribute('aria-busy')
      btnSubmit!.textContent = t('wizard.btn.submit')
    }
  })

  window.addEventListener('madinlab:lang', () => {
    if (successPanel) {
      fillSuccessPanel(successPanel)
      return
    }
    setStep(step, false)
    syncFormulaOptions()
  })

  syncFormulaOptions()
  setStep(1, false)
}

initDevisWizard()
initTextAnimations()
