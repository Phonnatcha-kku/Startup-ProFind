import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as mock from './data/mock'
import { DEPOSIT, setLocale } from './utils/logic'

const KEY = 'profind-demo-v2' // bumped when the seed shape changes
const seed = () => ({
  role: 'user',
  lang: 'th',
  pitch: true,
  promotions: [...mock.promotions, ...mock.pendingPromotions],
  clinicStatus: 'Verified', // Glow Clinic (the logged-in clinic)
  bookings: mock.bookings,
  reviews: mock.reviews,
  applications: mock.applications,
  myApplication: null,
  favorites: { clinics: ['c5'], promos: ['p10', 'p17'] },
  campaigns: [{ id: 'cp1', promoId: 'p1', pkg: 'Sponsored Listing', area: 5, days: 7, budget: 2000, start: '2026-09-24', status: 'Running' }],
  chats: {},
  bookingSeq: 128,
})

const load = () => {
  try { return { ...seed(), ...JSON.parse(localStorage.getItem(KEY)) } } catch { return seed() }
}

const Store = createContext(null)
export const useStore = () => useContext(Store)

// The demo clinic account is Glow Clinic; the demo user is u1.
export const MY_CLINIC = 'c1'
export const ME = mock.users[0]

export function StoreProvider({ children }) {
  const [s, setS] = useState(load)
  const [toastMsg, setToast] = useState(null)
  setLocale(s.lang === 'th' ? 'th-TH' : 'en-GB')
  useEffect(() => { document.documentElement.lang = s.lang }, [s.lang])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])

  const api = useMemo(() => {
    const set = fn => setS(prev => ({ ...prev, ...fn(prev) }))
    const clinicById = id => mock.clinics.find(c => c.id === id)
    const promoById = id => s.promotions.find(p => p.id === id)
    const withClinic = p => p && { ...p, clinic: clinicById(p.clinicId) }
    const reviewsFor = cid => s.reviews.filter(r => r.clinicId === cid)
    const clinicStats = c => {
      const extra = s.reviews.filter(r => r.clinicId === c.id && r.mine)
      if (!extra.length) return c
      const n = c.reviews + extra.length
      return { ...c, reviews: n, rating: +((c.rating * c.reviews + extra.reduce((a, r) => a + r.rating, 0)) / n).toFixed(1) }
    }

    const th = s.lang === 'th'
    return {
      ...s,
      // i18n helpers: t('English', 'ไทย'); pick({ en, th } | string); tl(enumValue) → Thai label
      t: (en, thText) => (th ? thText ?? en : en),
      pick: v => (v == null || typeof v !== 'object' ? v : Array.isArray(v) ? v.map(x => (typeof x === 'object' ? x[s.lang] ?? x.en : x)) : v[s.lang] ?? v.en),
      tl: v => (th ? mock.ENUM_TH[v] ?? v : v),
      setLang: lang => set(() => ({ lang })),
      users: mock.users,
      clinics: mock.clinics.map(clinicStats),
      clinicById: id => clinicStats(clinicById(id)),
      promoById,
      withClinic,
      reviewsFor,
      // Public listings: active promos only.
      listings: s.promotions.filter(p => p.status === 'Active').map(p => ({ ...p, clinic: clinicStats(clinicById(p.clinicId)) })),
      toastMsg,
      toast: msg => { setToast(msg); setTimeout(() => setToast(t => (t === msg ? null : t)), 2600) },

      setRole: role => set(() => ({ role })),
      togglePitch: () => set(p => ({ pitch: !p.pitch })),
      reset: () => { localStorage.removeItem(KEY); setS({ ...seed(), lang: s.lang }) }, // keep the chosen language

      toggleFav: (kind, id) => set(p => {
        const list = p.favorites[kind]
        return { favorites: { ...p.favorites, [kind]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] } }
      }),

      createBooking: ({ promoId, date, time, payment, method }) => {
        const promo = promoById(promoId)
        const n = s.bookingSeq + 1
        const booking = {
          id: `PF-2026-${String(n).padStart(5, '0')}`, userId: ME.id, promoId, clinicId: promo.clinicId, date, time,
          status: 'Confirmed', payment, method, amount: promo.price, paid: payment === 'Deposit' ? DEPOSIT : promo.price,
          createdAt: new Date().toISOString().slice(0, 10), isNew: true,
        }
        set(p => ({ bookings: [booking, ...p.bookings], bookingSeq: n, promotions: p.promotions.map(x => x.id === promoId ? { ...x, bookings: x.bookings + 1 } : x) }))
        return booking.id
      },
      setBookingStatus: (id, status) => set(p => ({ bookings: p.bookings.map(b => (b.id === id ? { ...b, status } : b)) })),

      addReview: (booking, { rating, text, photos, recommend }) => set(p => ({
        reviews: [{ id: `r${Date.now()}`, clinicId: booking.clinicId, userName: ME.name, rating, text, photos, recommend, mine: true,
          treatment: promoById(booking.promoId)?.title, date: new Date().toISOString().slice(0, 10) }, ...p.reviews],
        bookings: p.bookings.map(b => (b.id === booking.id ? { ...b, reviewed: true } : b)),
      })),

      sendChat: (clinicId, msg) => set(p => ({ chats: { ...p.chats, [clinicId]: [...(p.chats[clinicId] || []), msg] } })),

      savePromotion: promo => set(p => ({ promotions: [promo, ...p.promotions.filter(x => x.id !== promo.id)] })),
      setPromoStatus: (id, status) => set(p => ({ promotions: p.promotions.map(x => (x.id === id ? { ...x, status } : x)) })),
      deletePromo: id => set(p => ({ promotions: p.promotions.filter(x => x.id !== id) })),

      launchCampaign: c => set(p => ({
        campaigns: [{ ...c, id: `cp${Date.now()}`, status: 'Running', start: new Date().toISOString().slice(0, 10) }, ...p.campaigns],
        promotions: p.promotions.map(x => (x.id === c.promoId ? { ...x, sponsored: true } : x)),
      })),

      submitApplication: app => {
        const id = `a${Date.now()}`
        set(p => ({ applications: [{ ...app, id, status: 'Pending', submitted: new Date().toISOString().slice(0, 10) }, ...p.applications], myApplication: id }))
      },
      setApplicationStatus: (id, status) => set(p => ({ applications: p.applications.map(a => (a.id === id ? { ...a, status } : a)) })),
    }
  }, [s, toastMsg])

  return <Store.Provider value={api}>{children}</Store.Provider>
}
