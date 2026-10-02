import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Phone, MessageCircle, ChevronLeft, Share2, CalendarCheck, Check, ShieldCheck, Stethoscope, Timer, PackageCheck, Info, ThumbsUp } from 'lucide-react'
import { useStore } from '../store'
import { Img, Rating, VerifiedBadge, SponsoredBadge, FavButton, Button, PriceDisplay, Avatar, Stars, EmptyState, PitchNote, cx } from '../components/ui'
import { PromotionCard, TypeBadge } from '../components/cards'
import { MapMock } from '../components/search'
import { ChatModal, BookingModal } from '../components/flows'
import { baht, fmtDate } from '../utils/logic'

function BackBar({ title }) {
  const nav = useNavigate()
  const { t } = useStore()
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 md:hidden">
      <button onClick={() => nav(-1)} className="grid size-10 place-items-center rounded-full bg-white/90 shadow" aria-label={t('Back', 'ย้อนกลับ')}><ChevronLeft className="size-5" /></button>
      <span className="sr-only">{title}</span>
      <button className="grid size-10 place-items-center rounded-full bg-white/90 shadow" aria-label={t('Share', 'แชร์')}><Share2 className="size-4" /></button>
    </div>
  )
}

function StickyCta({ onChat, onBook, price, children }) {
  const { t } = useStore()
  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        {price && <div className="mr-auto"><div className="text-xs text-sub">{t('From', 'เริ่มต้น')}</div><div className="text-lg font-extrabold leading-none">{baht(price)}</div></div>}
        {children}
        <Button variant="outline" size="lg" onClick={onChat} className="px-3.5"><MessageCircle className="size-5" />{t('Consult', 'ปรึกษา')}</Button>
        <Button size="lg" onClick={onBook} className={cx(!price && 'flex-1')}>{t('Book Now', 'จองเลย')}</Button>
      </div>
    </div>
  )
}

export function ReviewList({ reviews }) {
  const { t } = useStore()
  if (!reviews.length) return <EmptyState title={t('No reviews yet', 'ยังไม่มีรีวิว')} body={t('Be the first to review after your visit.', 'เป็นคนแรกที่รีวิวหลังเข้ารับบริการ')} />
  return (
    <div className="divide-y divide-line">
      {reviews.map(r => (
        <div key={r.id} className={cx('py-4 first:pt-0', r.mine && 'anim-pop')}>
          <div className="flex items-center gap-3">
            <Avatar name={r.userName} className="size-9 text-xs" />
            <div className="flex-1"><div className="flex items-center gap-2 text-sm font-bold">{r.userName}{r.mine && <span className="rounded bg-brand-50 px-1.5 text-[11px] text-brand-700">{t('Your review', 'รีวิวของคุณ')}</span>}</div>
              <div className="text-xs text-sub">{r.treatment} · {fmtDate(r.date)}</div></div>
            <Stars value={r.rating} size="size-4" />
          </div>
          <p className="mt-2 text-[15px] leading-relaxed">{r.text || <i className="text-sub">{t('Rated without comment', 'ให้คะแนนโดยไม่มีความคิดเห็น')}</i>}</p>
          {r.photos?.length > 0 && <div className="mt-2 flex gap-2">{r.photos.map((p, i) => <Img key={i} src={p} className="size-16 rounded-lg" />)}</div>}
          <div className="mt-2 flex items-center gap-3 text-xs text-sub">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><ShieldCheck className="size-3.5" />{t('Verified booking', 'จองและใช้บริการจริง')}</span>
            {r.recommend && <span className="inline-flex items-center gap-1"><ThumbsUp className="size-3.5" />{t('Recommends', 'แนะนำ')}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

const Box = ({ title, id, children }) => (
  <section id={id} className="scroll-mt-20 rounded-2xl border border-line bg-white p-5 md:p-6"><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</section>
)

export function ClinicDetail() {
  const { id } = useParams()
  const { clinicById, listings, reviewsFor, t, tl, pick } = useStore()
  const clinic = clinicById(id)
  const [chat, setChat] = useState(false)
  const [book, setBook] = useState(null)
  if (!clinic) return <div className="p-10"><EmptyState title={t('Clinic not found', 'ไม่พบคลินิก')} action={<Button to="/search">{t('Browse promotions', 'ดูโปรโมชั่น')}</Button>} /></div>
  const promos = listings.filter(p => p.clinicId === id)
  const reviews = reviewsFor(id)
  const main = promos[0]
  const treatments = [...new Set(promos.map(p => p.treatment))]

  return (
    <div className="pb-24 md:pb-10">
      <div className="relative">
        <BackBar title={clinic.name} />
        <Img src={clinic.cover} className="h-56 w-full md:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent md:hidden" />
      </div>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative -mt-10 rounded-3xl border border-line bg-white p-5 shadow-sm md:-mt-16 md:flex md:items-end md:justify-between md:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{clinic.name}</h1>
              <VerifiedBadge label={t('Verified ✓', 'ยืนยันแล้ว ✓')} className="rounded-full bg-brand-50 px-2 py-0.5" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sub">
              <Rating value={clinic.rating} count={clinic.reviews} /><span className="text-sub">{t('Reviews', 'รีวิว')}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{clinic.area} · {clinic.distance} {t('km', 'กม.')}</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-4" />{pick(clinic.hours)}</span>
            </div>
          </div>
          <div className="mt-4 hidden gap-2 md:flex">
            <Button variant="outline" onClick={() => setChat(true)}><MessageCircle className="size-4" />{t('Consult Clinic', 'ปรึกษาคลินิก')}</Button>
            <FavButton kind="clinics" id={clinic.id} className="size-11 rounded-xl border border-line shadow-none" />
            <Button onClick={() => setBook(main)}>{t('Book Now', 'จองเลย')}</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Box title={t('Current Promotions', 'โปรโมชั่นปัจจุบัน')}>
              <div className="grid gap-4 sm:grid-cols-2">{promos.map(p => <PromotionCard key={p.id} item={p} />)}</div>
            </Box>
            <Box title={t('About Clinic', 'เกี่ยวกับคลินิก')}>
              <p className="leading-relaxed text-zinc-700">{pick(clinic.about)}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[[Stethoscope, clinic.doctors, t('Doctors', 'แพทย์')], [CalendarCheck, t(`${2026 - clinic.since} yrs`, `${2026 - clinic.since} ปี`), t('Experience', 'ประสบการณ์')], [ShieldCheck, t('FDA', 'อย.'), t('Approved products', 'ผลิตภัณฑ์ที่ได้รับอนุญาต')]].map(([Icon, v, l]) => (
                  <div key={l} className="rounded-2xl bg-zinc-50 p-3"><Icon className="mx-auto size-5 text-brand-700" /><div className="mt-1 font-extrabold">{v}</div><div className="text-xs text-sub">{l}</div></div>
                ))}
              </div>
              <h3 className="mb-2 mt-5 font-bold">{t('Available Treatments', 'หัตถการที่ให้บริการ')}</h3>
              <div className="flex flex-wrap gap-2">{treatments.map(c => <Link key={c} to={`/search?cat=${c}`} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{tl(c)}</Link>)}</div>
            </Box>
            <Box title={`${t('Reviews', 'รีวิว')} (${reviews.length})`} id="reviews">
              <div className="mb-4 flex items-center gap-4 rounded-2xl bg-zinc-50 p-4">
                <div className="text-4xl font-extrabold">{clinic.rating}</div>
                <div><Stars value={Math.round(clinic.rating)} size="size-5" /><div className="text-sm text-sub">{t(`Based on ${clinic.reviews.toLocaleString()} verified bookings`, `จากการจองจริง ${clinic.reviews.toLocaleString()} ครั้ง`)}</div></div>
              </div>
              <ReviewList reviews={reviews} />
            </Box>
          </div>
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <Box title={t('Location', 'ที่ตั้ง')}>
              <MapMock items={main ? [main] : []} height="h-48" />
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex gap-2"><MapPin className="size-4 shrink-0 text-sub" />{clinic.area}, {t('Bangkok', 'กรุงเทพฯ')}</div>
                <div className="flex gap-2"><Clock className="size-4 shrink-0 text-sub" />{pick(clinic.hours)}</div>
                <div className="flex gap-2"><Phone className="size-4 shrink-0 text-sub" />{clinic.phone}</div>
              </div>
            </Box>
          </div>
        </div>
      </div>
      <StickyCta onChat={() => setChat(true)} onBook={() => setBook(main)}>
        <FavButton kind="clinics" id={clinic.id} className="size-12 rounded-xl border border-line shadow-none" />
      </StickyCta>
      {main && <ChatModal open={chat} clinic={clinic} promo={main} onClose={() => setChat(false)} onBook={() => { setChat(false); setBook(main) }} />}
      {book && <BookingModal open promo={book} onClose={() => setBook(null)} />}
    </div>
  )
}

export function PromotionDetail() {
  const { id } = useParams()
  const { withClinic, promoById, reviewsFor, listings, t, tl, pick } = useStore()
  const promo = withClinic(promoById(id))
  const [chat, setChat] = useState(false)
  const [book, setBook] = useState(false)
  if (!promo) return <div className="p-10"><EmptyState title={t('Promotion not found', 'ไม่พบโปรโมชั่น')} action={<Button to="/search">{t('Browse promotions', 'ดูโปรโมชั่น')}</Button>} /></div>
  const { clinic } = promo
  const reviews = reviewsFor(clinic.id).slice(0, 3)
  const similar = listings.filter(p => p.treatment === promo.treatment && p.id !== promo.id).slice(0, 3)
  const inactive = promo.status !== 'Active'

  return (
    <div className="pb-24 md:pb-10">
      <div className="mx-auto max-w-6xl md:px-6 md:pt-6">
        <div className="hidden text-sm text-sub md:block"><Link to="/search" className="hover:text-ink">{t('Search', 'ค้นหา')}</Link> / <Link to={`/clinic/${clinic.id}`} className="hover:text-ink">{clinic.name}</Link> / <span className="text-ink">{promo.title}</span></div>
        <div className="grid gap-6 md:mt-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="relative overflow-hidden md:rounded-3xl">
              <BackBar title={promo.title} />
              <Img src={promo.image} alt={promo.title} className="aspect-[4/3] w-full md:aspect-[16/9]" />
              <div className="absolute bottom-3 left-3 flex gap-2">{promo.sponsored && <SponsoredBadge />}</div>
              <FavButton kind="promos" id={promo.id} className="absolute right-3 top-3 max-md:top-16" />
            </div>
            <div className="space-y-6 px-4 md:px-0">
              <div>
                <div className="flex flex-wrap items-center gap-2"><TypeBadge type={promo.type} /><span className="text-sm text-sub">{tl(promo.treatment)}</span></div>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{promo.title}</h1>
                <Link to={`/clinic/${clinic.id}`} className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold">{clinic.name}</span><VerifiedBadge label="" /><Rating value={clinic.rating} count={clinic.reviews} /><span className="text-sub">· {clinic.distance} {t('km', 'กม.')}</span>
                </Link>
                <div className="mt-4 lg:hidden"><PriceBlock promo={promo} /></div>
              </div>
              {inactive && <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">{t(`This promotion is ${promo.status.toLowerCase()} and not bookable right now.`, `โปรโมชั่นนี้อยู่ในสถานะ "${tl(promo.status)}" จึงยังไม่สามารถจองได้ในขณะนี้`)}</div>}
              <Box title={t('Treatment Details', 'รายละเอียดหัตถการ')}>
                <p className="leading-relaxed text-zinc-700">{pick(promo.description)}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-zinc-50 p-3"><Timer className="mb-1 size-4 text-brand-700" /><div className="text-xs text-sub">{t('Duration', 'ระยะเวลา')}</div><b>{pick(promo.duration)}</b></div>
                  <div className="rounded-xl bg-zinc-50 p-3"><PackageCheck className="mb-1 size-4 text-brand-700" /><div className="text-xs text-sub">{t('Product', 'ผลิตภัณฑ์')}</div><b>{promo.brand || t('Genuine, batch-verified', 'ของแท้ ตรวจสอบล็อตได้')}</b></div>
                </div>
              </Box>
              <Box title={t("What's Included", 'สิ่งที่ได้รับ')}>
                <ul className="space-y-2.5">{pick(promo.includes).map(i => <li key={i} className="flex gap-2.5"><Check className="mt-0.5 size-5 shrink-0 rounded-full bg-emerald-50 p-0.5 text-emerald-600" />{i}</li>)}</ul>
              </Box>
              <Box title={t('Terms & Conditions', 'เงื่อนไขการใช้บริการ')}>
                <ul className="space-y-2 text-sm text-zinc-700">{pick(promo.terms).map(term => <li key={term} className="flex gap-2"><Info className="mt-0.5 size-4 shrink-0 text-sub" />{term}</li>)}</ul>
              </Box>
              <Box title={t('Reviews', 'รีวิว')}>
                <ReviewList reviews={reviews} />
                <Link to={`/clinic/${clinic.id}#reviews`} className="mt-3 inline-block text-sm font-bold text-brand-700">{t(`See all ${clinic.reviews.toLocaleString()} reviews`, `ดูรีวิวทั้งหมด ${clinic.reviews.toLocaleString()} รายการ`)} →</Link>
              </Box>
              {similar.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold">{t(`Compare similar ${promo.treatment} promotions`, `เปรียบเทียบโปรโมชั่น${tl(promo.treatment)}ที่คล้ายกัน`)}</h2>
                  <div className="grid gap-4 sm:grid-cols-3">{similar.map(p => <PromotionCard key={p.id} item={p} />)}</div>
                </section>
              )}
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4 rounded-3xl border border-line bg-white p-6 shadow-sm">
              <PriceBlock promo={promo} />
              <Button size="lg" className="w-full" disabled={inactive} onClick={() => setBook(true)}><CalendarCheck className="size-5" />{t('Book Now', 'จองเลย')}</Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setChat(true)}><MessageCircle className="size-5" />{t('Consult Clinic', 'ปรึกษาคลินิก')}</Button>
              <p className="text-center text-xs text-sub">{t('Reserve with ฿500 deposit · Free cancellation 24h before', 'จองด้วยมัดจำ ฿500 · ยกเลิกฟรีก่อนนัด 24 ชม.')}</p>
              <div className="border-t border-line pt-4">
                <Link to={`/clinic/${clinic.id}`} className="flex items-center gap-3">
                  <Img src={clinic.cover} className="size-12 rounded-xl" />
                  <div className="text-sm"><div className="flex items-center gap-1 font-bold">{clinic.name}<VerifiedBadge label="" /></div><div className="text-sub">{clinic.area}</div></div>
                </Link>
              </div>
            </div>
            <PitchNote className="mt-4" title={t('Pitch: conversion', 'นำเสนอ: การเปลี่ยนเป็นยอดจอง')}>{t(<>Chat and booking sit side by side — users who consult first convert at higher rates, and every booking earns ProFind an <b>8% commission</b>.</>, <>แชทและปุ่มจองอยู่คู่กัน — ผู้ใช้ที่ปรึกษาก่อนมีแนวโน้มจองมากกว่า และทุกการจองสร้าง <b>ค่าคอมมิชชั่น 8%</b> ให้ ProFind</>)}</PitchNote>
          </aside>
        </div>
      </div>
      {!inactive && <StickyCta price={promo.price} onChat={() => setChat(true)} onBook={() => setBook(true)} />}
      <ChatModal open={chat} clinic={clinic} promo={promo} onClose={() => setChat(false)} onBook={() => { setChat(false); setBook(true) }} />
      <BookingModal open={book} promo={promo} onClose={() => setBook(false)} />
    </div>
  )
}

function PriceBlock({ promo }) {
  const { t } = useStore()
  return (
    <div>
      <PriceDisplay original={promo.originalPrice} price={promo.price} size="lg" />
      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        <span className="rounded-lg bg-accent-50 px-2 py-1 font-bold text-accent-600">{t('Save', 'ประหยัด')} {baht(promo.originalPrice - promo.price)}</span>
        <span className="rounded-lg bg-zinc-100 px-2 py-1 font-semibold text-sub">{t('Valid until', 'ใช้ได้ถึง')} {fmtDate(promo.validUntil)}</span>
      </div>
    </div>
  )
}
