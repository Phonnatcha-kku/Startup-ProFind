import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, QrCode, Smartphone, ShieldCheck, Loader2, CheckCircle2, Send, CalendarDays, Clock, ChevronLeft, ImagePlus, X, PartyPopper, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { Modal, Button, Img, Stars, cx, VerifiedBadge, Avatar } from './ui'
import { baht, DEPOSIT, fmtDate, dateLocale } from '../utils/logic'
import { IMG } from '../data/mock'

const TIMES = ['10:00', '11:30', '13:00', '15:00', '17:30']
const iso = d => d.toLocaleDateString('en-CA') // local YYYY-MM-DD

function Steps({ step }) {
  const { t } = useStore()
  return (
    <div className="mb-5 flex items-center gap-2">
      {[t('Date & time', 'วันและเวลา'), t('Summary', 'สรุปการจอง'), t('Payment', 'ชำระเงิน')].map((s, i) => (
        <div key={i} className="flex flex-1 flex-col gap-1.5">
          <div className={cx('h-1.5 rounded-full', i <= step ? 'bg-brand-600' : 'bg-zinc-200')} />
          <span className={cx('text-xs font-semibold', i <= step ? 'text-brand-700' : 'text-sub')}>{i + 1}. {s}</span>
        </div>
      ))}
    </div>
  )
}

export function BookingModal({ promo, open, onClose }) {
  const { clinicById, createBooking, t, tl, pick } = useStore()
  const nav = useNavigate()
  const clinic = clinicById(promo.clinicId)
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d }), [])
  const [step, setStep] = useState(0)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [payment, setPayment] = useState('Deposit')
  const [method, setMethod] = useState('PromptPay')
  const [phase, setPhase] = useState('idle') // idle | processing | success
  const total = payment === 'Deposit' ? DEPOSIT : promo.price
  const loc = dateLocale()

  const close = () => { if (phase === 'processing') return; onClose(); setTimeout(() => { setStep(0); setPhase('idle') }, 300) }
  const pay = () => {
    setPhase('processing')
    setTimeout(() => setPhase('success'), 1600)
    setTimeout(() => {
      const id = createBooking({ promoId: promo.id, date, time, payment, method })
      onClose(); nav(`/booking/${id}?new=1`)
    }, 2600)
  }
  // Deterministic "fully booked" slots for realism.
  const taken = (d, slot) => (d.getDate() + TIMES.indexOf(slot)) % 5 === 0
  const back = to => <Button variant="outline" size="lg" onClick={() => setStep(to)} aria-label={t('Back', 'ย้อนกลับ')}><ChevronLeft className="size-5" /></Button>

  const footer = phase !== 'idle' ? null : step === 0
    ? <Button className="w-full" size="lg" disabled={!date || !time} onClick={() => setStep(1)}>{t('Continue to summary', 'ถัดไป: สรุปการจอง')}</Button>
    : step === 1
      ? <div className="flex gap-2">{back(0)}<Button className="flex-1" size="lg" onClick={() => setStep(2)}>{t('Continue to payment', 'ไปชำระเงิน')} · {baht(total)}</Button></div>
      : <div className="flex gap-2">{back(1)}<Button className="flex-1" size="lg" onClick={pay}><ShieldCheck className="size-5" />{t('Confirm Payment', 'ยืนยันการชำระเงิน')} · {baht(total)}</Button></div>

  return (
    <Modal open={open} onClose={close} title={phase === 'idle' ? t('Book appointment', 'จองคิว') : undefined} footer={footer}>
      {phase !== 'idle' ? (
        <div className="flex flex-col items-center py-12 text-center">
          {phase === 'processing'
            ? <><Loader2 className="size-14 animate-spin text-brand-700" /><h3 className="mt-5 text-xl font-bold">{t('Processing Payment...', 'กำลังดำเนินการชำระเงิน...')}</h3><p className="mt-1 text-sm text-sub">{t("Please don't close this window", 'กรุณาอย่าปิดหน้าต่างนี้')}</p></>
            : <><div className="anim-pop grid size-20 place-items-center rounded-full bg-emerald-50"><CheckCircle2 className="size-12 text-emerald-600" /></div><h3 className="mt-5 text-xl font-bold">{t('Payment Successful ✓', 'ชำระเงินสำเร็จ ✓')}</h3><p className="mt-1 text-sm text-sub">{t('Confirming your booking…', 'กำลังยืนยันการจองของคุณ…')}</p></>}
        </div>
      ) : (
        <>
          <Steps step={step} />
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-bold text-sub">1 · {t('Service', 'บริการ')}</h3>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-600 bg-brand-50/50 p-3">
                  <Img src={promo.image} className="size-14 rounded-xl" />
                  <div className="flex-1"><div className="font-bold">{promo.title}</div><div className="text-sm text-sub">{clinic.name} · {pick(promo.duration)}</div></div>
                  <div className="text-right font-extrabold">{baht(promo.price)}</div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-sub"><CalendarDays className="size-4" />2 · {t('Select date', 'เลือกวัน')} · {days[0].toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</h3>
                <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                  {days.map(d => {
                    const on = date === iso(d)
                    const closed = d.getDay() === 0 && clinic.closedSunday
                    return (
                      <button key={iso(d)} disabled={closed} onClick={() => { setDate(iso(d)); setTime(null) }}
                        className={cx('flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition disabled:opacity-35', on ? 'border-brand-600 bg-brand-600 text-ink' : 'border-line hover:border-brand-300')}>
                        <span className={cx('text-xs font-semibold', on ? 'text-ink/70' : 'text-sub')}>{d.toLocaleDateString(loc, { weekday: 'short' })}</span>
                        <span className="text-xl font-extrabold">{d.getDate()}</span>
                        <span className={cx('text-[11px]', on ? 'text-ink/70' : 'text-sub')}>{closed ? t('Closed', 'ปิด') : d.toLocaleDateString(loc, { month: 'short' })}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-sub"><Clock className="size-4" />3 · {t('Select time', 'เลือกเวลา')}</h3>
                {!date ? <p className="rounded-xl bg-zinc-50 p-4 text-sm text-sub">{t('Pick a date to see available times.', 'เลือกวันเพื่อดูเวลาที่ว่าง')}</p> : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {TIMES.map(slot => {
                      const full = taken(new Date(date), slot)
                      return (
                        <button key={slot} disabled={full} onClick={() => setTime(slot)} title={full ? t('Fully booked', 'เต็มแล้ว') : undefined}
                          className={cx('h-12 rounded-xl border text-sm font-bold transition disabled:bg-zinc-50 disabled:text-zinc-300 disabled:line-through', time === slot ? 'border-brand-600 bg-brand-600 text-ink' : 'border-line hover:border-brand-300')}>{slot}</button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <CheckoutSummary clinic={clinic} promo={promo} date={date} time={time} payment={payment} />
              <div>
                <h3 className="mb-2 text-sm font-bold">{t('Payment option', 'รูปแบบการชำระเงิน')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[['Deposit', t(`Pay deposit ${baht(DEPOSIT)}`, `จ่ายมัดจำ ${baht(DEPOSIT)}`), t(`Rest ${baht(promo.price - DEPOSIT)} at clinic`, `ส่วนที่เหลือ ${baht(promo.price - DEPOSIT)} ชำระที่คลินิก`)],
                    ['Full', t(`Pay in full ${baht(promo.price)}`, `จ่ายเต็มจำนวน ${baht(promo.price)}`), t('Nothing to pay at clinic', 'ไม่ต้องชำระเพิ่มที่คลินิก')]].map(([k, title, s]) => (
                    <button key={k} onClick={() => setPayment(k)} className={cx('rounded-2xl border-2 p-3 text-left transition', payment === k ? 'border-brand-600 bg-brand-50/50' : 'border-line')}>
                      <div className="text-sm font-bold">{title}</div><div className="text-xs text-sub">{s}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4">
                <div><div className="text-sm text-sub">{t('Amount due now', 'ยอดที่ต้องชำระตอนนี้')}</div><div className="text-2xl font-extrabold">{baht(total)}</div></div>
                <div className="text-right text-sm text-sub">{promo.title}<br />{fmtDate(date, { day: 'numeric', month: 'short' })} · {time}</div>
              </div>
              <div>
                <h3 className="mb-2 font-bold">{t('Payment Method', 'ช่องทางการชำระเงิน')}</h3>
                <div className="space-y-2">
                  {[['Credit / Debit Card', CreditCard, 'Visa, Mastercard, JCB'], ['PromptPay', Smartphone, t('Instant transfer from any Thai bank app', 'โอนทันทีผ่านแอปธนาคารใดก็ได้')], ['QR Code', QrCode, t('Scan with mobile banking', 'สแกนด้วยโมบายแบงก์กิ้ง')]].map(([m, Icon, s]) => (
                    <label key={m} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition', method === m ? 'border-brand-600 bg-brand-50/50' : 'border-line')}>
                      <input type="radio" name="pm" checked={method === m} onChange={() => setMethod(m)} className="size-5 accent-brand-600" />
                      <Icon className="size-6 text-brand-700" />
                      <div><div className="font-bold">{tl(m)}</div><div className="text-xs text-sub">{s}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              {method !== 'Credit / Debit Card' ? (
                <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
                  <div className="grid size-24 shrink-0 grid-cols-6 gap-0.5 rounded-lg bg-white p-1.5 ring-1 ring-line" aria-label={t('Mock QR code', 'QR Code จำลอง')}>
                    {Array.from({ length: 36 }, (_, i) => <span key={i} className={(i * 7 + (i >> 2)) % 3 ? 'bg-ink' : ''} />)}
                  </div>
                  <p className="text-sm text-sub">{t(<>Mock {method} — no real payment is made. Press <b className="text-ink">Confirm Payment</b> to simulate a successful transfer.</>,
                    <>{tl(method)} จำลอง — ไม่มีการตัดเงินจริง กด <b className="text-ink">ยืนยันการชำระเงิน</b> เพื่อจำลองการโอนสำเร็จ</>)}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line p-4 text-sm">
                  <input className="col-span-2 h-11 rounded-xl border border-line px-3" defaultValue="4242 4242 4242 4242" aria-label={t('Card number', 'หมายเลขบัตร')} />
                  <input className="h-11 rounded-xl border border-line px-3" defaultValue="12/28" aria-label={t('Expiry', 'วันหมดอายุ')} />
                  <input className="h-11 rounded-xl border border-line px-3" defaultValue="123" aria-label="CVC" />
                </div>
              )}
              <p className="flex items-center gap-2 text-xs text-sub"><ShieldCheck className="size-4 text-brand-700" />{t('Payments are held by ProFind and released to the clinic after your visit.', 'ProFind จะถือเงินไว้และโอนให้คลินิกหลังจากคุณเข้ารับบริการแล้ว')}</p>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export function CheckoutSummary({ clinic, promo, date, time, payment }) {
  const { t } = useStore()
  const Row = ({ k, v, bold }) => <div className={cx('flex justify-between py-1.5', bold && 'text-lg font-extrabold')}><span className={bold ? '' : 'text-sub'}>{k}</span><span className={bold ? '' : 'font-semibold'}>{v}</span></div>
  return (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="mb-3 font-bold">{t('Booking Summary', 'สรุปการจอง')}</h3>
      <div className="flex items-center gap-3">
        <Img src={clinic.cover} className="size-12 rounded-xl" />
        <div><div className="flex items-center gap-1 font-bold">{clinic.name}<VerifiedBadge label="" /></div><div className="text-sm text-sub">{promo.title}</div></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-zinc-50 p-3"><div className="text-xs text-sub">{t('Date', 'วันที่')}</div><div className="font-bold">{fmtDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
        <div className="rounded-xl bg-zinc-50 p-3"><div className="text-xs text-sub">{t('Time', 'เวลา')}</div><div className="font-bold">{time}</div></div>
      </div>
      <div className="mt-3 border-t border-dashed border-line pt-2 text-sm">
        <Row k={t('Treatment', 'ค่าหัตถการ')} v={baht(promo.price)} />
        <Row k={t('Service Fee', 'ค่าธรรมเนียม')} v="฿0" />
        {payment === 'Deposit' && <Row k={t('Deposit (pay now)', 'มัดจำ (ชำระตอนนี้)')} v={baht(DEPOSIT)} />}
        {payment === 'Deposit' && <Row k={t('Pay at clinic', 'ชำระที่คลินิก')} v={baht(promo.price - DEPOSIT)} />}
      </div>
      <div className="mt-2 border-t border-line pt-2"><Row k={t('Total due now', 'ยอดชำระตอนนี้')} v={baht(payment === 'Deposit' ? DEPOSIT : promo.price)} bold /></div>
    </div>
  )
}

// Quick questions → scripted clinic replies, in both languages.
const QUICK = [
  ['How much is it?', 'ราคาเท่าไหร่?', (p, t) => t(`The ${p.title} promotion is ${baht(p.price)} (usually ${baht(p.originalPrice)}), doctor consultation included.`, `ราคาโปรโมชั่น ${p.title} อยู่ที่ ${baht(p.price)} ค่ะ (ปกติ ${baht(p.originalPrice)}) รวมค่าปรึกษาแพทย์แล้วนะคะ`)],
  ['What promotions do you have?', 'มีโปรโมชั่นอะไรบ้าง?', (p, t) => t(`Right now we have ${p.title} for ${baht(p.price)}, plus a free LED Mask session for new customers booking via ProFind ✨`, `ตอนนี้มีโปร ${p.title} ราคา ${baht(p.price)} ค่ะ และลูกค้าใหม่ที่จองผ่าน ProFind รับฟรี LED Mask 1 ครั้งค่ะ ✨`)],
  ['Do I need to book ahead?', 'ต้องจองล่วงหน้าหรือไม่?', (p, t) => t('We recommend booking at least 1 day ahead. Just tap Book Now on ProFind and pick a date and time.', 'แนะนำให้จองล่วงหน้าอย่างน้อย 1 วันค่ะ สามารถกด "จองเลย" ใน ProFind แล้วเลือกวันเวลาได้เลยค่ะ')],
  ['How long does it take?', 'ใช้เวลาทำนานไหม?', (p, t, pick) => t(`About ${pick(p.duration)}, including consultation and numbing.`, `ใช้เวลาประมาณ ${pick(p.duration)} ค่ะ รวมเวลาปรึกษาแพทย์และทายาชาแล้วค่ะ`)],
  ['Can I book through ProFind?', 'สามารถจองผ่าน ProFind ได้ไหม?', (p, t) => t('Yes! Tap Book Now and pay the ฿500 deposit instantly via PromptPay 😊', 'ได้ค่ะ กด "จองเลย" ได้เลยค่ะ ชำระมัดจำ ฿500 ผ่านพร้อมเพย์ได้ทันทีค่ะ 😊')],
]

export function ChatPanel({ clinic, promo, onBook, className }) {
  const { chats, sendChat, t, pick } = useStore()
  const msgs = chats[clinic.id] || []
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs.length, typing])

  const send = q => {
    if (!q.trim()) return
    sendChat(clinic.id, { from: 'user', text: q, at: Date.now() })
    setText(''); setTyping(true)
    const hit = QUICK.find(([en, th]) => q === en || q === th)
    const reply = hit ? hit[2](promo, t, pick)
      : t(`Thanks for your question! Our doctor at ${clinic.name} will assess this for you. If you're interested in ${promo.title}, tap Book Now to reserve a slot.`,
        `ขอบคุณที่สอบถามค่ะ แอดมิน ${clinic.name} จะให้แพทย์ประเมินให้นะคะ หากสนใจ ${promo.title} สามารถกด "จองเลย" เพื่อจองคิวได้เลยค่ะ`)
    setTimeout(() => { setTyping(false); sendChat(clinic.id, { from: 'clinic', text: reply, at: Date.now() }) }, 1100)
  }

  return (
    <div className={cx('flex min-h-0 flex-col', className)}>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-zinc-50 p-2.5">
        <Img src={promo.image} className="size-11 rounded-lg" />
        <div className="min-w-0 flex-1 text-sm"><div className="truncate font-bold">{promo.title}</div><div className="text-sub"><b className="text-ink">{baht(promo.price)}</b> <s>{baht(promo.originalPrice)}</s></div></div>
        <Button size="sm" onClick={onBook}>{t('Book Now', 'จองเลย')}</Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        <div className="text-center text-xs text-sub">{t('Today · Typically replies within 5 minutes', 'วันนี้ · ปกติตอบกลับภายใน 5 นาที')}</div>
        <Bubble from="clinic" name={clinic.name}>{t(`Hi! Welcome to ${clinic.name}. How can we help you today? 😊`, `สวัสดีค่ะ ${clinic.name} ยินดีให้คำปรึกษาค่ะ สนใจสอบถามเรื่องไหนคะ? 😊`)}</Bubble>
        {msgs.map(m => <Bubble key={m.at + m.from} from={m.from} name={clinic.name}>{m.text}</Bubble>)}
        {typing && <Bubble from="clinic" name={clinic.name}><span className="inline-flex gap-1">{[0, 1, 2].map(i => <span key={i} className="size-1.5 animate-bounce rounded-full bg-sub" style={{ animationDelay: `${i * 120}ms` }} />)}</span></Bubble>}
        <div ref={end} />
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
        {QUICK.map(([en, th]) => { const q = t(en, th); return <button key={en} onClick={() => send(q)} className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">{q}</button> })}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(text) }} className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder={t('Type message...', 'พิมพ์ข้อความ...')} aria-label={t('Message', 'ข้อความ')} className="h-12 flex-1 rounded-xl border border-line bg-white px-4 text-[15px] outline-none focus:border-brand-500" />
        <Button type="submit" size="lg" className="px-4" aria-label={t('Send', 'ส่ง')}><Send className="size-5" /></Button>
      </form>
    </div>
  )
}

function Bubble({ from, name, children }) {
  const me = from === 'user'
  return (
    <div className={cx('flex items-end gap-2', me && 'flex-row-reverse')}>
      {!me && <Avatar name={name} className="size-7 text-[10px]" />}
      <div className={cx('max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed', me ? 'rounded-br-md bg-brand-600 text-ink' : 'rounded-bl-md bg-zinc-100')}>{children}</div>
    </div>
  )
}

export function ChatModal({ clinic, promo, open, onClose, onBook }) {
  return (
    <Modal open={open} onClose={onClose} title={<span className="flex items-center gap-2">💬 {clinic.name}<VerifiedBadge label="" /></span>}>
      <ChatPanel clinic={clinic} promo={promo} onBook={onBook} className="h-[62dvh]" />
    </Modal>
  )
}

const SAMPLE_PHOTOS = [IMG.Facial, IMG.Skin, IMG.Botox]
export function ReviewModal({ booking, open, onClose }) {
  const { addReview, clinicById, promoById, toast, t } = useStore()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [recommend, setRecommend] = useState(true)
  const [done, setDone] = useState(false)
  if (!booking) return null
  const clinic = clinicById(booking.clinicId)
  const submit = () => { addReview(booking, { rating, text, photos, recommend }); setDone(true); toast(t('Review published', 'เผยแพร่รีวิวแล้ว')) }
  const close = () => { onClose(); setTimeout(() => { setDone(false); setRating(0); setText(''); setPhotos([]) }, 300) }
  const labels = [['', ''], ['Poor', 'แย่'], ['Fair', 'พอใช้'], ['Good', 'ดี'], ['Very good', 'ดีมาก'], ['Excellent!', 'ยอดเยี่ยม!']][rating]
  return (
    <Modal open={open} onClose={close} title={done ? undefined : t('Rate your experience', 'ให้คะแนนประสบการณ์ของคุณ')}
      footer={!done && <Button className="w-full" size="lg" disabled={!rating} onClick={submit}>{t('Submit Review', 'ส่งรีวิว')}</Button>}>
      {done ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="anim-pop grid size-20 place-items-center rounded-full bg-amber-50"><PartyPopper className="size-10 text-amber-500" /></div>
          <h3 className="mt-5 text-xl font-bold">{t('Thank you for your review!', 'ขอบคุณสำหรับรีวิวของคุณ!')}</h3>
          <p className="mt-1 max-w-xs text-sm text-sub">{t(`Your review now appears on ${clinic.name}'s profile and helps others choose with confidence.`, `รีวิวของคุณแสดงบนหน้าโปรไฟล์ของ ${clinic.name} แล้ว และช่วยให้ผู้อื่นตัดสินใจได้อย่างมั่นใจ`)}</p>
          <div className="mt-6 flex gap-2"><Button variant="outline" onClick={close}>{t('Close', 'ปิด')}</Button><Button to={`/clinic/${clinic.id}#reviews`} onClick={close}>{t('View on clinic page', 'ดูในหน้าคลินิก')}</Button></div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
            <Img src={clinic.cover} className="size-12 rounded-xl" />
            <div><div className="font-bold">{clinic.name}</div><div className="text-sm text-sub">{promoById(booking.promoId)?.title} · {fmtDate(booking.date)}</div></div>
          </div>
          <div className="text-center">
            <h3 className="mb-2 font-bold">{t('How was your experience?', 'ประสบการณ์ของคุณเป็นอย่างไร?')}</h3>
            <div className="flex justify-center"><Stars value={rating} onChange={setRating} size="size-10" /></div>
            <div className="mt-1 h-5 text-sm font-semibold text-amber-600">{t(...labels)}</div>
          </div>
          <label className="block"><span className="mb-1.5 block text-sm font-bold">{t('Write a Review', 'เขียนรีวิว')}</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={t('Tell others about the service, results, cleanliness...', 'เล่าประสบการณ์ของคุณ: การบริการ ผลลัพธ์ ความสะอาด...')} className="w-full rounded-xl border border-line p-3 text-[15px] outline-none focus:border-brand-500" />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-bold">{t('Upload Photos', 'อัปโหลดรูปภาพ')}</span>
            <div className="flex gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative"><Img src={p} className="size-20 rounded-xl" />
                  <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-white" aria-label={t('Remove photo', 'ลบรูป')}><X className="size-3.5" /></button>
                </div>
              ))}
              {photos.length < 3 && (
                <button onClick={() => setPhotos([...photos, SAMPLE_PHOTOS[photos.length]])} className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-semibold text-sub hover:border-brand-300">
                  <ImagePlus className="size-5" />{t('Add Photos', 'เพิ่มรูป')}
                </button>
              )}
            </div>
          </div>
          <label className="flex items-center gap-3 text-[15px] font-semibold"><input type="checkbox" checked={recommend} onChange={e => setRecommend(e.target.checked)} className="size-5 accent-brand-600" />{t('Recommend this clinic', 'แนะนำคลินิกนี้')}</label>
          <p className="flex items-center gap-1.5 text-xs text-sub"><Sparkles className="size-3.5" />{t('Verified booking — only customers who completed a visit can review.', 'รีวิวจากการจองจริง — เฉพาะลูกค้าที่เข้ารับบริการแล้วเท่านั้นที่รีวิวได้')}</p>
        </div>
      )}
    </Modal>
  )
}
