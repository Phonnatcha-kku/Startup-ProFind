import { useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CalendarCheck, Heart, Star, Bell, Settings, ChevronRight, MapPin, Clock, CreditCard, PartyPopper, Flame, Check, ChevronLeft, Pencil, Store, Building2, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useStore, ME } from '../store'
import { Img, Button, StatusBadge, Tabs, EmptyState, Avatar, Stars, VerifiedBadge, Rating, Modal, PitchNote, cx, Field, inputCls, LangToggle } from '../components/ui'
import { PromotionCard } from '../components/cards'
import { ReviewModal, ChatPanel, BookingModal } from '../components/flows'
import { baht, fmtDate } from '../utils/logic'
import { notifications } from '../data/mock'
import { Logo } from '../components/layout'

export function BookingDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { bookings, clinicById, promoById, setBookingStatus, toast, t, tl } = useStore()
  const [review, setReview] = useState(false)
  const b = bookings.find(x => x.id === id)
  if (!b) return <div className="p-10"><EmptyState title={t('Booking not found', 'ไม่พบการจอง')} action={<Button to="/bookings">{t('My bookings', 'การจองของฉัน')}</Button>} /></div>
  const clinic = clinicById(b.clinicId)
  const promo = promoById(b.promoId)
  const isNew = params.get('new')

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
      {isNew ? (
        <div className="mb-6 text-center">
          <div className="anim-pop mx-auto grid size-20 place-items-center rounded-full bg-emerald-50"><PartyPopper className="size-10 text-emerald-600" /></div>
          <h1 className="mt-4 text-2xl font-extrabold">🎉 {t('Booking Confirmed', 'ยืนยันการจองแล้ว')}</h1>
          <p className="mt-1 text-sub">{t(`We've sent the details to ${ME.email}`, `ส่งรายละเอียดไปที่ ${ME.email} แล้ว`)}</p>
        </div>
      ) : (
        <Link to="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-sub"><ChevronLeft className="size-4" />{t('My bookings', 'การจองของฉัน')}</Link>
      )}
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="flex items-center justify-between bg-brand-600 px-5 py-4 text-ink">
          <div><div className="text-xs text-ink/60">{t('Booking ID', 'หมายเลขการจอง')}</div><div className="font-mono text-lg font-bold">{b.id}</div></div>
          <StatusBadge status={b.status} />
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Img src={promo?.image} className="size-16 rounded-2xl" />
            <div><div className="flex items-center gap-1 font-bold">{clinic.name}<VerifiedBadge label="" /></div><div className="text-sub">{promo?.title}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-zinc-50 p-3"><CalendarCheck className="mb-1 size-4 text-brand-700" /><b>{fmtDate(b.date, { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
            <div className="rounded-xl bg-zinc-50 p-3"><Clock className="mb-1 size-4 text-brand-700" /><b>{b.time} {t('', 'น.')}</b></div>
            <div className="rounded-xl bg-zinc-50 p-3"><CreditCard className="mb-1 size-4 text-brand-700" /><b>{b.payment === 'Deposit' ? t('Deposit Paid', 'ชำระมัดจำแล้ว') : t('Paid', 'ชำระแล้ว')}</b> · {baht(b.paid)}<div className="text-xs text-sub">{tl(b.method)}</div></div>
            <div className="rounded-xl bg-zinc-50 p-3"><MapPin className="mb-1 size-4 text-brand-700" /><b>{clinic.area.split(',')[0]}</b><div className="text-xs text-sub">{t(`${clinic.distance} km away`, `ห่างออกไป ${clinic.distance} กม.`)}</div></div>
          </div>
          {b.payment === 'Deposit' && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t(<>Remaining <b>{baht(b.amount - b.paid)}</b> payable at the clinic.</>, <>ชำระส่วนที่เหลือ <b>{baht(b.amount - b.paid)}</b> ที่คลินิก</>)}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            {isNew ? <><Button to={`/booking/${b.id}`} variant="outline" className="flex-1">{t('View Booking', 'ดูการจอง')}</Button><Button to="/" className="flex-1">{t('Back to Home', 'กลับหน้าแรก')}</Button></>
              : <BookingActions b={b} onReview={() => setReview(true)} onComplete={() => { setBookingStatus(b.id, 'Completed'); toast(t('Marked as completed', 'เปลี่ยนสถานะเป็นเสร็จสิ้นแล้ว')) }} />}
          </div>
        </div>
      </div>
      {isNew && <PitchNote className="mt-6" title={t('Pitch: the business loop', 'นำเสนอ: วงจรธุรกิจ')}>{t(<>This booking now appears instantly in <b>Glow Clinic's dashboard</b> (switch to Clinic in Demo Mode). ProFind earns commission; the clinic gets a customer — and reinvests in Sponsored placement.</>, <>การจองนี้แสดงใน<b>แดชบอร์ดของ Glow Clinic</b> ทันที (สลับเป็น "คลินิก" ในโหมดสาธิต) ProFind ได้ค่าคอมมิชชั่น คลินิกได้ลูกค้า — และนำรายได้กลับมาลงโฆษณาเพิ่ม</>)}</PitchNote>}
      <ReviewModal open={review} booking={b} onClose={() => setReview(false)} />
    </div>
  )
}

function BookingActions({ b, onReview, onComplete }) {
  const nav = useNavigate()
  const { t } = useStore()
  if (b.status === 'Completed') return b.reviewed
    ? <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700"><Check className="size-4" />{t('Reviewed — thank you!', 'รีวิวแล้ว — ขอบคุณค่ะ!')}</div>
    : <Button variant="accent" className="flex-1" onClick={onReview}><Star className="size-4 fill-current" />{t('Rate Your Experience', 'ให้คะแนนประสบการณ์')}</Button>
  if (b.status === 'Cancelled') return <Button variant="outline" className="flex-1" onClick={() => nav(`/promotion/${b.promoId}`)}>{t('Book again', 'จองอีกครั้ง')}</Button>
  return (
    <>
      <Button variant="outline" className="flex-1" onClick={() => nav(`/chat/${b.clinicId}?promo=${b.promoId}`)}>{t('Message clinic', 'ส่งข้อความถึงคลินิก')}</Button>
      <Button variant="soft" className="flex-1" onClick={onComplete} title={t('Demo shortcut: simulate the visit happening', 'ทางลัดสำหรับเดโม: จำลองว่าเข้ารับบริการแล้ว')}>{t('Mark as completed (demo)', 'ทำเครื่องหมายว่าเสร็จสิ้น (เดโม)')}</Button>
    </>
  )
}

export function BookingsList({ embedded }) {
  const { bookings, clinicById, promoById, setBookingStatus, toast, t } = useStore()
  const [tab, setTab] = useState('upcoming')
  const [review, setReview] = useState(null)
  const mine = bookings.filter(b => b.userId === ME.id)
  const lists = {
    upcoming: mine.filter(b => b.status === 'Confirmed' || b.status === 'Pending'),
    completed: mine.filter(b => b.status === 'Completed'),
    cancelled: mine.filter(b => b.status === 'Cancelled'),
  }
  const TAB = { upcoming: t('Upcoming', 'กำลังจะมาถึง'), completed: t('Completed', 'เสร็จสิ้น'), cancelled: t('Cancelled', 'ยกเลิก') }
  const list = lists[tab]
  return (
    <div className={cx(!embedded && 'mx-auto max-w-3xl px-4 py-6 md:py-10')}>
      {!embedded && <h1 className="mb-5 text-2xl font-extrabold tracking-tight">{t('My Bookings', 'การจองของฉัน')}</h1>}
      <Tabs value={tab} onChange={setTab} tabs={Object.keys(lists).map(k => [k, `${TAB[k]} (${lists[k].length})`])} />
      <div className="mt-4 space-y-3">
        {list.length === 0 && <EmptyState icon={CalendarCheck} title={t(`No ${tab} bookings`, `ไม่มีการจองที่${TAB[tab]}`)} body={t('Find a promotion and book in under a minute.', 'ค้นหาโปรโมชั่นแล้วจองได้ในไม่ถึงนาที')} action={<Button to="/search">{t('Explore promotions', 'ค้นหาโปรโมชั่น')}</Button>} />}
        {list.map(b => {
          const clinic = clinicById(b.clinicId), promo = promoById(b.promoId)
          return (
            <div key={b.id} className={cx('rounded-2xl border bg-white p-4', b.isNew && tab === 'upcoming' ? 'border-brand-300 ring-2 ring-brand-100' : 'border-line')}>
              <Link to={`/booking/${b.id}`} className="flex gap-3">
                <Img src={promo?.image} className="size-20 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><div className="truncate font-bold">{clinic.name}</div><StatusBadge status={b.status} /></div>
                  <div className="truncate text-sm text-sub">{promo?.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm font-semibold"><span>{fmtDate(b.date)}</span><span>{b.time}</span><span className="font-mono text-xs font-normal text-sub">{b.id}</span></div>
                </div>
              </Link>
              <div className="mt-3 flex gap-2 border-t border-line pt-3">
                <Button to={`/booking/${b.id}`} variant="outline" size="sm" className="flex-1">{t('View Booking', 'ดูการจอง')}</Button>
                {tab === 'upcoming' && <Button variant="soft" size="sm" className="flex-1" onClick={() => { setBookingStatus(b.id, 'Completed'); setTab('completed'); toast(t('Visit completed — you can now review', 'เข้ารับบริการแล้ว — ตอนนี้รีวิวได้แล้ว')) }}>{t('Mark completed (demo)', 'ทำเครื่องหมายเสร็จสิ้น (เดโม)')}</Button>}
                {tab === 'completed' && (b.reviewed
                  ? <span className="flex flex-1 items-center justify-center gap-1 text-sm font-semibold text-emerald-700"><Check className="size-4" />{t('Reviewed', 'รีวิวแล้ว')}</span>
                  : <Button variant="accent" size="sm" className="flex-1" onClick={() => setReview(b)}><Star className="size-4 fill-current" />{t('Rate Your Experience', 'ให้คะแนนประสบการณ์')}</Button>)}
              </div>
            </div>
          )
        })}
      </div>
      <ReviewModal open={!!review} booking={review} onClose={() => setReview(null)} />
    </div>
  )
}

export function Favorites({ embedded }) {
  const { favorites, clinicById, listings, toggleFav, t } = useStore()
  const [tab, setTab] = useState('promos')
  const [book, setBook] = useState(null)
  const promos = listings.filter(p => favorites.promos.includes(p.id))
  const clinics = favorites.clinics.map(clinicById).filter(Boolean)
  return (
    <div className={cx(!embedded && 'mx-auto max-w-5xl px-4 py-6 md:py-10')}>
      {!embedded && <h1 className="mb-5 text-2xl font-extrabold tracking-tight">{t('Saved', 'รายการที่บันทึก')}</h1>}
      <Tabs value={tab} onChange={setTab} tabs={[['promos', `${t('Saved Promotions', 'โปรโมชั่นที่บันทึก')} (${promos.length})`], ['clinics', `${t('Saved Clinics', 'คลินิกที่บันทึก')} (${clinics.length})`]]} />
      <div className="mt-4">
        {tab === 'promos' && (promos.length === 0 ? <EmptyState icon={Heart} title={t('No saved promotions', 'ยังไม่มีโปรโมชั่นที่บันทึก')} body={t('Tap the heart on any promotion to save it here.', 'กดรูปหัวใจบนโปรโมชั่นเพื่อบันทึกไว้ที่นี่')} action={<Button to="/search">{t('Explore', 'ค้นหา')}</Button>} /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map(p => (
              <div key={p.id}>
                <PromotionCard item={p} />
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" size="sm" className="text-sub" onClick={() => toggleFav('promos', p.id)}>{t('Remove', 'ลบ')}</Button>
                  <Button to={`/promotion/${p.id}`} variant="outline" size="sm" className="flex-1">{t('View', 'ดู')}</Button>
                  <Button size="sm" className="flex-1" onClick={() => setBook(p)}>{t('Book', 'จอง')}</Button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {tab === 'clinics' && (clinics.length === 0 ? <EmptyState icon={Heart} title={t('No saved clinics', 'ยังไม่มีคลินิกที่บันทึก')} /> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {clinics.map(c => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                <Img src={c.cover} className="size-16 rounded-xl" />
                <div className="min-w-0 flex-1"><div className="flex items-center gap-1 font-bold">{c.name}<VerifiedBadge label="" /></div><div className="text-sm text-sub"><Rating value={c.rating} count={c.reviews} className="text-xs" /> · {c.distance} {t('km', 'กม.')}</div></div>
                <div className="flex flex-col gap-1">
                  <Button to={`/clinic/${c.id}`} size="sm">{t('View', 'ดู')}</Button>
                  <button onClick={() => toggleFav('clinics', c.id)} className="text-xs font-semibold text-sub">{t('Remove', 'ลบ')}</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {book && <BookingModal open promo={book} onClose={() => setBook(null)} />}
    </div>
  )
}

const NOTI_ICON = { flame: [Flame, 'bg-accent-50 text-accent-600'], star: [Star, 'bg-amber-50 text-amber-600'], check: [PartyPopper, 'bg-emerald-50 text-emerald-600'] }

export function Profile() {
  const { bookings, favorites, reviews, promoById, t, pick, lang, setLang } = useStore()
  const [section, setSection] = useState(null)
  const [edit, setEdit] = useState(false)
  const mine = bookings.filter(b => b.userId === ME.id)
  const myReviews = reviews.filter(r => r.mine)
  const newBookingNotis = mine.filter(b => b.isNew).map(b => ({
    id: b.id, icon: 'check', title: t('🎉 Booking Confirmed', '🎉 ยืนยันการจองแล้ว'),
    body: t(`Your booking ${b.id} on ${fmtDate(b.date)} has been confirmed.`, `การจอง ${b.id} วันที่ ${fmtDate(b.date)} ได้รับการยืนยันแล้ว`), time: t('Just now', 'เมื่อสักครู่'),
  }))
  const notis = [...newBookingNotis, ...notifications]
  const upcoming = mine.filter(b => ['Confirmed', 'Pending'].includes(b.status)).length
  const saved = favorites.promos.length + favorites.clinics.length
  const items = [
    ['bookings', t('My Bookings', 'การจองของฉัน'), CalendarCheck, t(`${upcoming} upcoming`, `กำลังจะมาถึง ${upcoming} รายการ`)],
    ['favorites', t('Favorites', 'รายการโปรด'), Heart, t(`${saved} saved`, `บันทึกไว้ ${saved} รายการ`)],
    ['reviews', t('Reviews', 'รีวิว'), Star, t(`${myReviews.length} written`, `เขียนแล้ว ${myReviews.length} รายการ`)],
    ['notifications', t('Notifications', 'การแจ้งเตือน'), Bell, t(`${notis.length} new`, `ใหม่ ${notis.length} รายการ`)],
    ['settings', t('Settings', 'ตั้งค่า'), Settings, t('Language, privacy', 'ภาษา ความเป็นส่วนตัว')],
  ]
  const titles = Object.fromEntries(items.map(i => [i[0], i[1]]))
  const savedBaht = mine.filter(b => b.status !== 'Cancelled').reduce((a, b) => { const p = promoById(b.promoId); return a + p.originalPrice - p.price }, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <div className="rounded-3xl border border-line bg-white p-5 md:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={ME.name} className="size-16 text-xl md:size-20" />
          <div className="flex-1"><h1 className="text-xl font-extrabold">{ME.name}</h1><div className="text-sub">{ME.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"><ShieldCheck className="size-3.5" />{t('Verified member', 'สมาชิกยืนยันตัวตนแล้ว')}</div></div>
          <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil className="size-4" /><span className="hidden sm:inline">{t('Edit Profile', 'แก้ไขโปรไฟล์')}</span></Button>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl bg-zinc-50 py-3 text-center">
          {[[mine.length, t('Bookings', 'การจอง')], [myReviews.length + 2, t('Reviews', 'รีวิว')], [baht(savedBaht), t('Saved vs. list price', 'ประหยัดจากราคาปกติ')]].map(([v, l]) => (
            <div key={l}><div className="text-lg font-extrabold">{v}</div><div className="text-xs text-sub">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
        {items.map(([k, label, Icon, sub]) => (
          <button key={k} onClick={() => setSection(k)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
            <span className="flex-1"><span className="block font-bold">{label}</span><span className="text-sm text-sub">{sub}</span></span>
            <ChevronRight className="size-5 text-sub" />
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl border border-line bg-white p-5">
        <div className="flex items-center gap-3"><Building2 className="size-5 text-brand-700" /><div className="flex-1"><div className="font-bold">{t('Own a clinic?', 'เป็นเจ้าของคลินิก?')}</div><div className="text-sm text-sub">{t('List promotions and get bookings on ProFind.', 'ลงโปรโมชั่นและรับการจองผ่าน ProFind')}</div></div><Button to="/clinic/onboarding" size="sm" variant="soft">{t('Join', 'สมัคร')}</Button></div>
      </div>

      <Modal open={!!section} onClose={() => setSection(null)} title={titles[section]} wide>
        {section === 'bookings' && <BookingsList embedded />}
        {section === 'favorites' && <Favorites embedded />}
        {section === 'reviews' && (myReviews.length === 0 ? <EmptyState icon={Star} title={t('No reviews yet', 'ยังไม่มีรีวิว')} body={t('Complete a booking, then rate your experience.', 'เข้ารับบริการให้เสร็จ แล้วให้คะแนนประสบการณ์ของคุณ')} /> : (
          <div className="space-y-3">{myReviews.map(r => (
            <div key={r.id} className="rounded-2xl border border-line p-4"><div className="flex justify-between"><b>{r.treatment}</b><Stars value={r.rating} size="size-4" /></div><p className="mt-1 text-sm">{r.text}</p></div>
          ))}</div>
        ))}
        {section === 'notifications' && (
          <div className="-my-2 divide-y divide-line">{notis.map(n => {
            const [Icon, cls] = NOTI_ICON[n.icon]
            return (
              <div key={n.id} className="flex gap-3 py-4"><span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', cls)}><Icon className="size-5" /></span>
                <div className="flex-1"><div className="flex justify-between gap-2 font-bold">{pick(n.title)}<span className="shrink-0 text-xs font-normal text-sub">{pick(n.time)}</span></div><p className="text-sm text-sub">{pick(n.body)}</p></div></div>
            )
          })}</div>
        )}
        {section === 'settings' && (
          <div className="space-y-4">
            <Field label={t('Language', 'ภาษา')}><select className={inputCls} value={lang} onChange={e => setLang(e.target.value)}><option value="th">ไทย</option><option value="en">English</option></select></Field>
            {[t('Booking reminders', 'แจ้งเตือนการนัดหมาย'), t('Promotions near me', 'โปรโมชั่นใกล้ฉัน'), t('Review reminders', 'แจ้งเตือนให้รีวิว')].map(s => <label key={s} className="flex items-center justify-between py-1 font-semibold">{s}<input type="checkbox" defaultChecked className="size-5 accent-brand-600" /></label>)}
            <p className="text-xs text-sub">{t('Notification settings are for display only in this prototype.', 'การตั้งค่าการแจ้งเตือนเป็นเพียงตัวอย่างในต้นแบบนี้')}</p>
          </div>
        )}
      </Modal>
      <Modal open={edit} onClose={() => setEdit(false)} title={t('Edit Profile', 'แก้ไขโปรไฟล์')} footer={<Button className="w-full" onClick={() => setEdit(false)}>{t('Save', 'บันทึก')}</Button>}>
        <div className="space-y-4">
          <Field label={t('Full name', 'ชื่อ-นามสกุล')}><input className={inputCls} defaultValue={ME.name} /></Field>
          <Field label={t('Email', 'อีเมล')}><input className={inputCls} defaultValue={ME.email} /></Field>
          <Field label={t('Phone', 'เบอร์โทรศัพท์')}><input className={inputCls} defaultValue="08x-xxx-1234" /></Field>
        </div>
      </Modal>
    </div>
  )
}

export function ChatPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { clinicById, withClinic, promoById, listings, t } = useStore()
  const clinic = clinicById(id)
  const promo = withClinic(promoById(params.get('promo'))) || listings.find(p => p.clinicId === id)
  const [book, setBook] = useState(false)
  if (!clinic || !promo) return <div className="p-10"><EmptyState title={t('Conversation not found', 'ไม่พบบทสนทนา')} /></div>
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-2xl flex-col px-4 pb-4">
      <div className="flex items-center gap-3 border-b border-line py-3">
        <button onClick={() => nav(-1)} aria-label={t('Back', 'ย้อนกลับ')} className="grid size-9 place-items-center rounded-full hover:bg-zinc-100"><ChevronLeft className="size-5" /></button>
        <Img src={clinic.cover} className="size-10 rounded-full" />
        <div className="flex-1"><div className="flex items-center gap-1 font-bold">{clinic.name}<VerifiedBadge label="" /></div><div className="flex items-center gap-1 text-xs text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />{t('Online', 'ออนไลน์')}</div></div>
        <Button to={`/clinic/${clinic.id}`} variant="ghost" size="sm" aria-label={t('Clinic page', 'หน้าคลินิก')}><Store className="size-4" /></Button>
      </div>
      <ChatPanel clinic={clinic} promo={promo} onBook={() => setBook(true)} className="flex-1 pt-3" />
      <BookingModal open={book} promo={promo} onClose={() => setBook(false)} />
    </div>
  )
}

export function Login() {
  const { setRole, t } = useStore()
  const nav = useNavigate()
  const go = (role, to) => { setRole(role); nav(to) }
  const roles = [
    ['user', '/', UserIcon, t('Continue as User', 'เข้าใช้งานในฐานะผู้ใช้'), `${ME.name} · ${ME.email}`, t('Search, compare, chat, book & review', 'ค้นหา เปรียบเทียบ แชท จอง และรีวิว')],
    ['clinic', '/clinic', Store, t('Continue as Clinic', 'เข้าใช้งานในฐานะคลินิก'), 'Glow Clinic · owner@glowclinic.example', t('Promotions, bookings, analytics & ads', 'โปรโมชั่น การจอง สถิติ และโฆษณา')],
    ['admin', '/admin', ShieldCheck, t('Continue as Admin', 'เข้าใช้งานในฐานะแอดมิน'), 'ProFind Operations', t('Verify clinics & moderate promotions', 'ตรวจสอบคลินิกและโปรโมชั่น')],
  ]
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between"><Logo /><LangToggle /></div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight">{t('Demo Login', 'เข้าสู่ระบบ (เดโม)')}</h1>
        <p className="mt-1 text-center text-sub">{t('Choose a role — no password needed in this prototype.', 'เลือกบทบาท — ต้นแบบนี้ไม่ต้องใช้รหัสผ่าน')}</p>
        <div className="mt-6 space-y-3">
          {roles.map(([role, to, Icon, title, acct, d]) => (
            <button key={role} onClick={() => go(role, to)} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-md">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-6" /></span>
              <span className="flex-1"><span className="block font-bold">{title}</span><span className="block text-sm text-sub">{acct}</span><span className="block text-xs text-sub">{d}</span></span>
              <ChevronRight className="size-5 text-sub" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
