export const baht = n => '฿' + Math.round(n).toLocaleString('en-US')
export const discountPct = (original, price) => Math.round(((original - price) / original) * 100)
export const DEPOSIT = 500
export const COMMISSION = 0.08

// Set by the store when the language changes; th-TH renders Buddhist-era years (พ.ศ.).
let locale = 'th-TH'
export const setLocale = l => { locale = l }
export const dateLocale = () => locale
export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(locale, opts)

export const DEFAULT_FILTERS = { q: '', treatments: [], minPrice: 500, maxPrice: 20000, distance: 0, rating: 0, types: [] }

export function matches(item, f) {
  const q = f.q.trim().toLowerCase()
  if (q && !`${item.title} ${item.treatment} ${item.clinic.name} ${item.clinic.area}`.toLowerCase().includes(q)) return false
  if (f.treatments.length && !f.treatments.includes(item.treatment)) return false
  if (item.price < f.minPrice || item.price > f.maxPrice) return false
  if (f.distance && item.clinic.distance > f.distance) return false
  if (f.rating && item.clinic.rating < f.rating) return false
  const types = f.types.filter(t => t !== 'Sponsored')
  if (types.length && !types.includes(item.type)) return false
  if (f.types.includes('Sponsored') && !item.sponsored) return false
  return true
}

// Relevance: quality + proximity + deal strength. Sponsorship is NOT part of the score —
// it only earns a clearly labelled slot on top.
export const score = i =>
  i.clinic.rating * 20 + Math.log10(i.clinic.reviews + 1) * 6 - i.clinic.distance * 2 + discountPct(i.originalPrice, i.price) * 0.2

const SORTS = {
  price: (a, b) => a.price - b.price,
  distance: (a, b) => a.clinic.distance - b.clinic.distance,
  rating: (a, b) => b.clinic.rating - a.clinic.rating,
  discount: (a, b) => discountPct(b.originalPrice, b.price) - discountPct(a.originalPrice, a.price),
  recommended: (a, b) => score(b) - score(a),
}

// Sponsored (max 2, always labelled) → Recommended → Nearby. Other sorts: Sponsored → flat list.
export function rank(items, f, sort = 'recommended') {
  const hits = items.filter(i => matches(i, f))
  const sponsored = hits.filter(i => i.sponsored).sort(SORTS.recommended).slice(0, 2)
  const rest = hits.filter(i => !sponsored.includes(i))
  if (sort !== 'recommended') return { total: hits.length, groups: [['Sponsored', sponsored], ['All results', rest.sort(SORTS[sort])]] }
  const recommended = rest.filter(i => i.clinic.rating >= 4.6).sort(SORTS.recommended).slice(0, 4)
  const nearby = rest.filter(i => !recommended.includes(i)).sort(SORTS.distance)
  return { total: hits.length, groups: [['Sponsored', sponsored], ['Recommended', recommended], ['Nearby', nearby]] }
}

export const campaignEstimate = (budget, days, km) => {
  const reach = Math.round(budget * 2.4 * (km >= 10 ? 1.5 : km >= 5 ? 1 : 0.6) * (days / 7) ** 0.3)
  return { reach, clicks: Math.round(reach * 0.045), bookings: Math.max(1, Math.round(reach * 0.045 * 0.12)) }
}
