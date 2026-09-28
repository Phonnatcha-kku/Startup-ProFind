import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Star, BadgeCheck, Megaphone, X, ImageOff, SearchX, AlertTriangle, Presentation, Heart } from 'lucide-react'
import { baht, discountPct } from '../utils/logic'
import { useStore } from '../store'

export const cx = clsx

export function Img({ src, alt = '', className }) {
  const [err, setErr] = useState(false)
  if (err || !src) return (
    <div className={cx('grid place-items-center bg-zinc-100 text-zinc-400', className)}>
      <ImageOff className="size-6" />
    </div>
  )
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={cx('object-cover', className)} />
}

const variants = {
  primary: 'bg-brand-600 text-ink hover:brightness-95 shadow-sm shadow-brand-900/10',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm',
  outline: 'border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50',
  ghost: 'text-ink hover:bg-black/5',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  dark: 'bg-ink text-white hover:bg-black',
}
const sizes = { sm: 'h-9 px-3 text-sm gap-1.5', md: 'h-11 px-4 text-sm gap-2', lg: 'h-12 px-6 text-base gap-2' }

export function Button({ as, to, variant = 'primary', size = 'md', className, ...props }) {
  const cls = cx('inline-flex items-center justify-center rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap', variants[variant], sizes[size], className)
  if (to) return <Link to={to} className={cls} {...props} />
  const C = as || 'button'
  return <C className={cls} {...props} />
}

const tones = {
  gray: 'bg-zinc-100 text-zinc-700', brand: 'bg-brand-50 text-brand-700', accent: 'bg-accent-50 text-accent-600',
  green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700', blue: 'bg-sky-50 text-sky-700',
}
export const Badge = ({ tone = 'gray', className, children }) => (
  <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone], className)}>{children}</span>
)

export function SponsoredBadge({ className }) {
  const { t } = useStore()
  return (
    <span title={t('This clinic paid for this placement. Ranking below is by relevance.', 'คลินิกนี้ชำระเงินเพื่อแสดงในตำแหน่งนี้ ผลลัพธ์อื่นเรียงตามความเกี่ยวข้อง')} className={cx('inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50/95 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800', className)}>
      <Megaphone className="size-3" /> {t('Sponsored', 'โปรโมต · Sponsored')}
    </span>
  )
}
export function VerifiedBadge({ className, label }) {
  const { t } = useStore()
  return <span className={cx('inline-flex items-center gap-1 text-xs font-semibold text-brand-700', className)}><BadgeCheck className="size-4 fill-brand-700 text-white" />{label ?? t('Verified', 'ยืนยันแล้ว')}</span>
}

const STATUS = {
  Active: 'green', Confirmed: 'green', Verified: 'green', Completed: 'blue', Running: 'green', Approved: 'green',
  Pending: 'amber', Draft: 'gray', Paused: 'gray', Expired: 'gray', Cancelled: 'red', Rejected: 'red',
}
export function StatusBadge({ status }) {
  const { tl } = useStore()
  return <Badge tone={STATUS[status] || 'gray'}><span className="size-1.5 rounded-full bg-current" />{tl(status)}</Badge>
}

export const Rating = ({ value, count, className }) => (
  <span className={cx('inline-flex items-center gap-1 text-sm', className)}>
    <Star className="size-4 fill-amber-400 text-amber-400" />
    <b className="font-semibold">{value}</b>
    {count != null && <span className="text-sub">({count.toLocaleString()})</span>}
  </span>
)

export function Stars({ value, onChange, size = 'size-8' }) {
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} stars`} className="disabled:cursor-default">
          <Star className={cx(size, n <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300')} />
        </button>
      ))}
    </div>
  )
}

export function PriceDisplay({ original, price, size = 'md' }) {
  const pct = discountPct(original, price)
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-sub line-through">{baht(original)}</span>
        <span className="rounded-md bg-accent-500 px-1.5 py-px text-xs font-bold text-white">-{pct}%</span>
      </div>
      <div className={cx('font-extrabold tracking-tight text-ink', size === 'lg' ? 'text-3xl' : 'text-xl')}>{baht(price)}</div>
    </div>
  )
}

export function FavButton({ kind, id, className }) {
  const { favorites, toggleFav, toast, t } = useStore()
  const on = favorites[kind].includes(id)
  return (
    <button
      aria-label={on ? t('Remove from saved', 'ลบออกจากรายการที่บันทึก') : t('Save', 'บันทึก')}
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(kind, id); toast(on ? t('Removed from Saved', 'ลบออกจากรายการที่บันทึกแล้ว') : t('Saved to Favorites', 'บันทึกในรายการโปรดแล้ว')) }}
      className={cx('grid size-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-105', className)}
    >
      <Heart className={cx('size-[18px]', on ? 'fill-accent-500 text-accent-500' : 'text-ink')} />
    </button>
  )
}

// Bottom sheet on mobile, centered dialog on ≥sm.
export function Modal({ open, onClose, title, children, footer, wide }) {
  const { t } = useStore()
  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="anim-fade absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx('anim-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-zinc-200 sm:hidden" />
        {title !== undefined && (
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} aria-label={t('Close', 'ปิด')} className="grid size-9 place-items-center rounded-full hover:bg-zinc-100"><X className="size-5" /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="pb-safe border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export const Skeleton = ({ className }) => <div className={cx('animate-pulse rounded-xl bg-zinc-200/70', className)} />

export const EmptyState = ({ icon: Icon = SearchX, title, body, action }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-14 text-center">
    <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-7" /></div>
    <h3 className="text-lg font-bold">{title}</h3>
    {body && <p className="mt-1 max-w-sm text-sm text-sub">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export function ErrorState({ onRetry }) {
  const { t } = useStore()
  return (
    <EmptyState icon={AlertTriangle} title={t('Something went wrong', 'เกิดข้อผิดพลาด')}
      body={t("We couldn't load promotions right now. Please check your connection and try again.", 'ไม่สามารถโหลดโปรโมชั่นได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง')}
      action={<Button onClick={onRetry}>{t('Try Again', 'ลองอีกครั้ง')}</Button>} />
  )
}

export function KpiCard({ label, value, delta, icon: Icon }) {
  const { t } = useStore()
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm text-sub">
        {label}{Icon && <Icon className="size-4" />}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">{value}</div>
      {delta && <div className="mt-1 text-xs font-semibold text-emerald-700">▲ {delta} <span className="font-normal text-sub">{t('vs last month', 'เทียบเดือนก่อน')}</span></div>}
    </div>
  )
}

export const Card = ({ className, children, title, action }) => (
  <section className={cx('rounded-2xl border border-line bg-white', className)}>
    {title && <div className="flex items-center justify-between gap-3 px-5 pt-5"><h3 className="font-bold">{title}</h3>{action}</div>}
    <div className="p-5">{children}</div>
  </section>
)

// Presenter callout for pitching moments; toggle from the Demo panel.
export function PitchNote({ title, children, className }) {
  const { pitch, t } = useStore()
  if (!pitch) return null
  title ??= t('Pitch moment', 'จุดนำเสนอ')
  return (
    <aside className={cx('flex gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-ink', className)}>
      <Presentation className="mt-0.5 size-5 shrink-0 text-brand-700" />
      <div><div className="font-bold text-brand-700">{title}</div><div className="mt-0.5 leading-relaxed">{children}</div></div>
    </aside>
  )
}

export const Avatar = ({ name, className }) => (
  <div className={cx('grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700', className || 'size-10 text-sm')}>
    {name.split(' ').map(w => w[0]).slice(0, 2).join('')}
  </div>
)

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-sub">{hint}</span>}
  </label>
)
export const inputCls = 'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'

export function LangToggle({ className, dark }) {
  const { lang, setLang } = useStore()
  return (
    <div className={cx('flex rounded-full p-0.5 text-xs font-bold', dark ? 'bg-white/10' : 'bg-zinc-100', className)} role="group" aria-label="Language / ภาษา">
      {[['th', 'TH'], ['en', 'EN']].map(([k, l]) => (
        <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
          className={cx('h-7 rounded-full px-2.5 transition', lang === k ? 'bg-white text-ink shadow-sm' : dark ? 'text-white/70' : 'text-sub hover:text-ink')}>{l}</button>
      ))}
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
      {tabs.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)} className={cx('flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition', value === k ? 'bg-white shadow-sm' : 'text-sub hover:text-ink')}>{label}</button>
      ))}
    </div>
  )
}
