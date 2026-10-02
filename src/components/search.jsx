import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, LocateFixed, Syringe, Droplet, Zap, Sparkles, Sun, PersonStanding, Scissors, LayoutGrid, X, Navigation } from 'lucide-react'
import { CATEGORIES, PROMO_TYPES } from '../data/mock'
import { DEFAULT_FILTERS, baht } from '../utils/logic'
import { cx, Img, Rating, SponsoredBadge, Button } from './ui'
import { useStore } from '../store'

export const CAT_ICON = { Botox: Syringe, Filler: Droplet, Laser: Zap, Facial: Sparkles, Skin: Sun, Body: PersonStanding, Hair: Scissors, Other: LayoutGrid }
export const LOCATIONS = [['Current location · Siam', 'ตำแหน่งปัจจุบัน · สยาม'], ['Sukhumvit', 'สุขุมวิท'], ['Silom / Sathorn', 'สีลม / สาทร'], ['Ari / Phaya Thai', 'อารีย์ / พญาไท'], ['Bang Na', 'บางนา']]

export function SearchBar({ initialQ = '', size = 'lg', onSearch }) {
  const nav = useNavigate()
  const [q, setQ] = useState(initialQ)
  const [loc, setLoc] = useState(0)
  const { t } = useStore()
  const submit = e => {
    e.preventDefault()
    onSearch ? onSearch(q) : nav(`/search?q=${encodeURIComponent(q)}`)
  }
  const big = size === 'lg'
  return (
    <form onSubmit={submit} className={cx('flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-ink/5 ring-1 ring-line md:flex-row md:items-center md:gap-0', !big && 'shadow-none')}>
      <label className="flex flex-1 items-center gap-3 rounded-xl px-3 md:border-r md:border-line">
        <Search className="size-5 shrink-0 text-brand-700" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Botox, Filler, Laser, clinic...', 'โบท็อกซ์, ฟิลเลอร์, เลเซอร์, ชื่อคลินิก...')} aria-label={t('Treatment or clinic', 'หัตถการหรือคลินิก')}
          className={cx('w-full bg-transparent text-[15px] outline-none placeholder:text-zinc-400', big ? 'h-12' : 'h-10')} />
        {q && <button type="button" onClick={() => setQ('')} aria-label={t('Clear', 'ล้าง')}><X className="size-4 text-sub" /></button>}
      </label>
      <label className={cx('flex items-center gap-3 rounded-xl px-3 md:w-64', big ? 'bg-zinc-50 md:bg-transparent' : 'hidden md:flex')}>
        <MapPin className="size-5 shrink-0 text-brand-700" />
        <select value={loc} onChange={e => setLoc(+e.target.value)} aria-label={t('Location', 'ตำแหน่ง')} className={cx('w-full cursor-pointer bg-transparent text-[15px] outline-none', big ? 'h-12' : 'h-10')}>
          {LOCATIONS.map(([en, th], i) => <option key={en} value={i}>{t(en, th)}</option>)}
        </select>
      </label>
      <Button type="submit" size={big ? 'lg' : 'md'} className="md:ml-2"><Search className="size-5" /> {t('Search', 'ค้นหา')}</Button>
    </form>
  )
}

export function CategoryChips({ active = [], onPick, dense }) {
  const { tl } = useStore()
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      {CATEGORIES.map(c => {
        const Icon = CAT_ICON[c]
        const on = active.includes(c)
        return (
          <button key={c} onClick={() => onPick(c)} className={cx('flex shrink-0 items-center gap-2 rounded-full border px-3.5 font-semibold transition', dense ? 'h-9 text-sm' : 'h-10 text-sm',
            on ? 'border-brand-600 bg-brand-600 text-ink' : 'border-line bg-white hover:border-brand-300')}>
            <Icon className="size-4" />{tl(c)}
          </button>
        )
      })}
    </div>
  )
}

const Section = ({ title, children }) => (
  <fieldset className="border-b border-line py-5 first:pt-0 last:border-0">
    <legend className="mb-3 font-bold">{title}</legend>{children}
  </fieldset>
)
const Check = ({ checked, onChange, children, type = 'checkbox', name }) => (
  <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px]">
    <input type={type} name={name} checked={checked} onChange={onChange} className="size-5 accent-brand-600" />{children}
  </label>
)
const toggle = (list, v) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])

export function FilterPanel({ f, set }) {
  const up = patch => set({ ...f, ...patch })
  const { t, tl } = useStore()
  return (
    <div>
      <Section title={t('Price range', 'ช่วงราคา')}>
        <div className="mb-3 flex items-center justify-between text-sm font-semibold">
          <span className="rounded-lg bg-zinc-100 px-2.5 py-1">{baht(f.minPrice)}</span><span className="text-sub">–</span>
          <span className="rounded-lg bg-zinc-100 px-2.5 py-1">{baht(f.maxPrice)}{f.maxPrice === 20000 && '+'}</span>
        </div>
        <label className="text-xs text-sub">{t('Min', 'ต่ำสุด')}
          <input type="range" min={500} max={20000} step={500} value={f.minPrice} onChange={e => up({ minPrice: Math.min(+e.target.value, f.maxPrice) })} className="w-full" />
        </label>
        <label className="text-xs text-sub">{t('Max', 'สูงสุด')}
          <input type="range" min={500} max={20000} step={500} value={f.maxPrice} onChange={e => up({ maxPrice: Math.max(+e.target.value, f.minPrice) })} className="w-full" />
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[3000, 5000, 10000].map(v => (
            <button key={v} onClick={() => up({ minPrice: 500, maxPrice: v })} className={cx('rounded-full border px-3 py-1 text-xs font-semibold', f.maxPrice === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line')}>
              {t('Under', 'ไม่เกิน')} {baht(v)}
            </button>
          ))}
        </div>
      </Section>
      <Section title={t('Treatment', 'หัตถการ')}>
        <div className="grid grid-cols-2 gap-x-3">
          {CATEGORIES.filter(c => c !== 'Other').map(c => <Check key={c} checked={f.treatments.includes(c)} onChange={() => up({ treatments: toggle(f.treatments, c) })}>{tl(c)}</Check>)}
        </div>
      </Section>
      <Section title={t('Distance', 'ระยะทาง')}>
        {[[0, t('Any distance', 'ทุกระยะ')], [1, t('Within 1 km', 'ภายใน 1 กม.')], [5, t('Within 5 km', 'ภายใน 5 กม.')], [10, t('Within 10 km', 'ภายใน 10 กม.')]].map(([v, l]) => (
          <Check key={v} type="radio" name="dist" checked={f.distance === v} onChange={() => up({ distance: v })}>{l}</Check>
        ))}
      </Section>
      <Section title={t('Rating', 'คะแนนรีวิว')}>
        {[[0, t('Any rating', 'ทุกคะแนน')], [4.5, '4.5+'], [4, '4.0+'], [3.5, '3.5+']].map(([v, l]) => (
          <Check key={v} type="radio" name="rating" checked={f.rating === v} onChange={() => up({ rating: v })}>{v ? <>★ {l}</> : l}</Check>
        ))}
      </Section>
      <Section title={t('Promotion type', 'ประเภทโปรโมชั่น')}>
        {PROMO_TYPES.map(p => <Check key={p} checked={f.types.includes(p)} onChange={() => up({ types: toggle(f.types, p) })}>{tl(p)}</Check>)}
      </Section>
    </div>
  )
}

export const activeFilterCount = f =>
  f.treatments.length + f.types.length + (f.distance ? 1 : 0) + (f.rating ? 1 : 0) + (f.minPrice !== DEFAULT_FILTERS.minPrice || f.maxPrice !== DEFAULT_FILTERS.maxPrice ? 1 : 0)

// Mock map: CSS/SVG streets + absolutely positioned markers (no Maps API).
export function MapMock({ items, className, height = 'h-[520px]' }) {
  const clinicsOnMap = [...new Map(items.map(i => [i.clinic.id, i])).values()]
  const [sel, setSel] = useState(null)
  const selected = clinicsOnMap.find(i => i.clinic.id === sel)
  const { t } = useStore()
  return (
    <div className={cx('relative overflow-hidden rounded-2xl border border-line bg-[#eff0f4]', height, className)}>
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <rect x="8" y="64" width="18" height="14" rx="2" fill="#d9ead3" />
        <rect x="70" y="18" width="12" height="10" rx="2" fill="#d9ead3" />
        <path d="M0 82 C 25 76, 40 90, 100 70" stroke="#bfdbe8" strokeWidth="5" fill="none" />
        {['M0 40 H100', 'M0 22 H100', 'M40 0 V100', 'M66 0 V100', 'M0 100 L100 0', 'M18 0 V100', 'M0 60 H100'].map((d, i) => (
          <path key={d} d={d} stroke="#fff" strokeWidth={i < 3 ? 2.2 : 1.2} fill="none" vectorEffect="non-scaling-stroke" style={{ strokeWidth: i < 3 ? 9 : 5 }} />
        ))}
      </svg>
      <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-sub shadow-sm">{t('Mock map · Bangkok', 'แผนที่จำลอง · กรุงเทพฯ')}</div>
      {/* user */}
      <div className="absolute" style={{ left: '50%', top: '48%' }}>
        <span className="absolute -inset-4 animate-ping rounded-full bg-sky-400/30" />
        <span className="relative block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-sky-500 shadow" />
        <span className="absolute left-3 top-1 whitespace-nowrap rounded bg-white px-1.5 text-[11px] font-bold text-sky-700 shadow-sm">{t('You', 'คุณ')}</span>
      </div>
      {clinicsOnMap.map(i => (
        <button key={i.clinic.id} onClick={() => setSel(i.clinic.id)} style={{ left: `${i.clinic.x}%`, top: `${i.clinic.y}%` }}
          className={cx('absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold shadow-md transition hover:z-10 hover:scale-110',
            sel === i.clinic.id ? 'z-10 scale-110 bg-ink text-white' : i.sponsored ? 'bg-amber-400 text-amber-950' : 'bg-white text-ink')}>
          {baht(i.price)}
          <span className={cx('absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1 rotate-45', sel === i.clinic.id ? 'bg-ink' : i.sponsored ? 'bg-amber-400' : 'bg-white')} />
        </button>
      ))}
      <button className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white shadow" aria-label={t('Recenter', 'กลับตำแหน่งปัจจุบัน')}><LocateFixed className="size-5 text-brand-700" /></button>
      {selected && (
        <div className="anim-pop absolute inset-x-3 bottom-3 flex gap-3 rounded-2xl bg-white p-3 shadow-xl sm:left-auto sm:right-16 sm:w-96">
          <Img src={selected.clinic.cover} className="size-20 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            {selected.sponsored && <SponsoredBadge className="mb-1" />}
            <div className="truncate font-bold">{selected.clinic.name}</div>
            <div className="flex items-center gap-2 text-xs text-sub"><Rating value={selected.clinic.rating} count={selected.clinic.reviews} className="text-xs" /><span className="inline-flex items-center gap-0.5"><Navigation className="size-3" />{selected.clinic.distance} {t('km', 'กม.')}</span></div>
            <div className="mt-1 truncate text-sm">{selected.title} · <b>{baht(selected.price)}</b></div>
            <Link to={`/clinic/${selected.clinic.id}`} className="mt-1 inline-block text-sm font-bold text-brand-700">{t('View Clinic', 'ดูคลินิก')} →</Link>
          </div>
          <button onClick={() => setSel(null)} aria-label={t('Close preview', 'ปิดตัวอย่าง')} className="self-start"><X className="size-4 text-sub" /></button>
        </div>
      )}
    </div>
  )
}
