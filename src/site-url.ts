/** URL publique du site (Vercel ou domaine custom). Mettre à jour si le domaine change. */
export const SITE_ORIGIN = 'https://ursulet-portfolio.vercel.app'

export function siteUrl(path = '/'): string {
  const base = SITE_ORIGIN.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
