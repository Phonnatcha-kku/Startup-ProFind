import { Link, useNavigate } from 'react-router-dom'
import { MapPin, MessageCircle, Clock, Flame } from 'lucide-react'
import { Img, Rating, PriceDisplay, SponsoredBadge, VerifiedBadge, FavButton, Badge, Button, cx } from './ui'
import { baht, discountPct } from '../utils/logic'
import { useStore } from '../store'

const typeTone = { 'Flash Deal': 'accent', 'New Customer': 'blue', Bundle: 'brand', Discount: 'gray' }
export function TypeBadge({ type }) {
  const { tl } = useStore()
  return <Badge tone={typeTone[type]}>{type === 'Flash Deal' && <Flame className="size-3" />}{tl(type)}</Badge>
}

// Search result card: clinic + its matching promotion (the spec's "Clinic Card").
export function ClinicCard({ item, onChat }) {
  const { clinic } = item
  const nav = useNavigate()
  const { t, pick } = useStore()
  return (
    <article className={cx('group overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg hover:shadow-ink/5 sm:flex', item.sponsored ? 'border-amber-200 ring-1 ring-amber-100' : 'border-line')}>
      <Link to={`/promotion/${item.id}`} className="relative block shrink-0 sm:w-64">
        <Img src={item.image} alt={item.title} className="aspect-[16/10] w-full sm:aspect-auto sm:h-full" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {item.sponsored && <SponsoredBadge />}
        </div>
        <FavButton kind="promos" id={item.id} className="absolute right-3 top-3" />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/clinic/${clinic.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-sub hover:text-brand-700">
              <span className="truncate">{clinic.name}</span>{clinic.verified && <VerifiedBadge label="" />}
            </Link>
            <Link to={`/promotion/${item.id}`}><h3 className="mt-0.5 text-lg font-bold leading-snug group-hover:text-brand-700">{item.title}</h3></Link>
          </div>
          <TypeBadge type={item.type} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sub">
          <Rating value={clinic.rating} count={clinic.reviews} />
          <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{clinic.distance} {t('km', 'กม.')} · {clinic.area.split(',')[0]}</span>
          <span className="hidden items-center gap-1 md:inline-flex"><Clock className="size-4" />{pick(item.duration)}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <PriceDisplay original={item.originalPrice} price={item.price} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onChat ? onChat(item) : nav(`/chat/${clinic.id}?promo=${item.id}`)} aria-label={t('Chat with clinic', 'แชทกับคลินิก')}>
              <MessageCircle className="size-4" /><span className="hidden sm:inline">{t('Chat', 'แชท')}</span>
            </Button>
            <Button to={`/promotion/${item.id}`} size="sm">{t('View Promotion', 'ดูโปรโมชั่น')}</Button>
          </div>
        </div>
      </div>
    </article>
  )
}

// Compact vertical card for carousels/grids.
export function PromotionCard({ item, className }) {
  const { t } = useStore()
  return (
    <Link to={`/promotion/${item.id}`} className={cx('group block overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5', className)}>
      <div className="relative">
        <Img src={item.image} alt={item.title} className="aspect-[4/3] w-full" />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {item.sponsored && <SponsoredBadge />}
        </div>
        <FavButton kind="promos" id={item.id} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1 truncate text-xs font-semibold text-sub">{item.clinic.name}{item.clinic.verified && <VerifiedBadge label="" />}</div>
        <h3 className="mt-0.5 line-clamp-1 font-bold group-hover:text-brand-700">{item.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-sub"><Rating value={item.clinic.rating} className="text-xs" /> · {item.clinic.distance} {t('km', 'กม.')}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold">{baht(item.price)}</span>
          <span className="text-xs text-sub line-through">{baht(item.originalPrice)}</span>
          <span className="ml-auto text-xs font-bold text-accent-600">-{discountPct(item.originalPrice, item.price)}%</span>
        </div>
      </div>
    </Link>
  )
}

export function ResultSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white sm:flex">
      <div className="aspect-[16/10] animate-pulse bg-zinc-200/70 sm:aspect-auto sm:h-48 sm:w-64" />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-3 w-32 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-5 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-3 w-44 animate-pulse rounded bg-zinc-200/70" />
        <div className="flex justify-between pt-6"><div className="h-7 w-24 animate-pulse rounded bg-zinc-200/70" /><div className="h-9 w-36 animate-pulse rounded-xl bg-zinc-200/70" /></div>
      </div>
    </div>
  )
}
