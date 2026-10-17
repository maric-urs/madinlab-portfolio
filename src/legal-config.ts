/** Coordonnées légales (LCEN / RGPD). Mettre à jour ici si SIREN/SIRET ou adresse postale change. */
export const LEGAL_PUBLISHER_ADDRESS = 'Fort-de-France, Martinique, France'

/** SIREN (9 chiffres). SIRET à compléter quand l’établissement est validé. */
export const LEGAL_SIREN = '131679540'
export const LEGAL_SIRET = ''

export function formatSirenDisplay(siren: string): string {
  const digits = siren.replace(/\D/g, '')
  if (digits.length !== 9) return siren
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`
}

export const SITE_PHONE_E164 = '+596696522347'
export const SITE_PHONE_DISPLAY = '0696 52 23 47'
export const SITE_PHONE_INTL_DISPLAY = '+596 696 52 23 47'
export const SITE_PHONE_WHATSAPP = '596696522347'

export const LEGAL_HOST = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis',
  website: 'https://vercel.com',
  websiteLabel: 'vercel.com',
} as const
