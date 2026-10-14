/** Révélation douce du bloc entier — le texte reste toujours lisible (pas de découpage par caractère). */

export function initTextAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const targets = document.querySelectorAll<HTMLElement>('[data-text-animate]')
  if (!targets.length) return

  const reveal = (el: HTMLElement) => {
    if (el.classList.contains('text-reveal-in')) return
    el.classList.add('text-reveal-in')
  }

  const heroMeta = document.querySelector<HTMLElement>('.hero__meta[data-text-animate]')
  if (heroMeta) reveal(heroMeta)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        reveal(entry.target as HTMLElement)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
  )

  targets.forEach((el) => {
    if (el === heroMeta) return
    observer.observe(el)
  })
}
