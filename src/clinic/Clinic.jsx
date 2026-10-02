import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, MousePointerClick, CalendarCheck, Wallet, Plus, Pencil, Pause, Play, Trash2, ExternalLink, Check, X, CheckCheck, Megaphone, Star, Crown, Target, Users, Repeat, Receipt, ImagePlus, Save, Send, Rocket, ArrowRight } from 'lucide-react'
import { useStore, MY_CLINIC } from '../store'
import { Page, PageHeader } from '../components/layout'
import { KpiCard, Card, Button, StatusBadge, Tabs, Modal, EmptyState, Img, Field, inputCls, PitchNote, cx, Badge, Avatar, VerifiedBadge, LangToggle } from '../components/ui'
import { TrendChart, BarsChart } from '../components/charts'
import { PromotionCard, ClinicCard } from '../components/cards'
import { clinicTrend, CATEGORIES, IMG } from '../data/mock'
import { baht, fmtDate, discountPct, campaignEstimate, campaignEnd, isLive, COMMISSION, SUBSCRIPTION, CPC } from '../utils/logic'

// [dataKey, English, Thai]
const METRICS = [['views', 'Views', 'ยอดเข้าชม'], ['clicks', 'Clicks', 'คลิก'], ['bookings', 'Bookings', 'การจอง'], ['revenue', 'Revenue', 'รายได้']]

function useClinic() {
  const s = useStore()
  const bookings = s.bookings.filter(b => b.clinicId === MY_CLINIC)
  const promos = s.promotions.filter(p => p.clinicId === MY_CLINIC)
  const fresh = bookings.filter(b => b.isNew)
  const campaigns = s.campaigns.filter(c => promos.some(p => p.id === c.promoId))
  return { ...s, clinic: s.clinicById(MY_CLINIC), bookings, promos, fresh, campaigns }
}

// Single-measure trend with a metric switcher. `data` rows carry a bilingual `label`.
export function MetricTrend({ data, metrics, initial = metrics[0][0], period }) {
  const { t, pick } = useStore()
  const [m, setM] = useState(initial)
  const row = metrics.find(r => r[0] === m)
  const label = t(row[1], row[2])
  const rows = data.map(d => ({ ...d, x: pick(d.label) }))
  return (
    <Card title={`${label} · ${period ?? t('last 8 weeks', '8 สัปดาห์ล่าสุด')}`} action={<div className="w-full max-w-sm"><Tabs value={m} onChange={setM} tabs={metrics.map(([k, en, th]) => [k, t(en, th)])} /></div>}>
      <TrendChart data={rows} x="x" keys={[m]} names={[label]} money={m === 'revenue'} />
    </Card>
  )
}

export function Dashboard() {
  const { clinic, bookings, promos, fresh, campaigns, setBookingStatus, toast, t } = useClinic()
  const pending = bookings.filter(b => b.status === 'Pending' || b.isNew).slice(0, 4)
  const running = campaigns.filter(c => isLive(c))
  const ads = running.filter(c => c.pkg !== 'CPC'), cpc = running.filter(c => c.pkg === 'CPC')
  const views = promos.reduce((a, p) => a + p.views, 0)
  return (
    <Page>
      <PageHeader title={t(`Good afternoon, ${clinic.name} 👋`, `สวัสดีตอนบ่าย ${clinic.name} 👋`)} sub={t("Here's how your promotions are performing on ProFind.", 'ภาพรวมผลลัพธ์โปรโมชั่นของคุณบน ProFind')} action={<Button to="/clinic/promotions/new"><Plus className="size-4" />{t('Create Promotion', 'สร้างโปรโมชั่น')}</Button>} />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <KpiCard label={t('Total Views', 'ยอดเข้าชมทั้งหมด')} value={views.toLocaleString()} delta="18%" icon={Eye} />
        <KpiCard label={t('Promotion Clicks', 'คลิกโปรโมชั่น')} value={promos.reduce((a, p) => a + p.clicks, 0).toLocaleString()} delta="12%" icon={MousePointerClick} />
        <KpiCard label={t('Bookings', 'การจอง')} value={(128 + fresh.length).toLocaleString()} delta="24%" icon={CalendarCheck} />
        <KpiCard label={t('Revenue', 'รายได้')} value={baht(45800 + fresh.reduce((a, b) => a + b.amount, 0))} delta="21%" icon={Wallet} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <MetricTrend data={clinicTrend} metrics={METRICS} />
        <Card title={t('Needs your attention', 'รายการที่ต้องดำเนินการ')} action={<Link to="/clinic/bookings" className="text-sm font-bold text-brand-700">{t('All', 'ทั้งหมด')}</Link>}>
          {pending.length === 0 ? <p className="text-sm text-sub">{t('All caught up 🎉', 'ไม่มีรายการค้าง 🎉')}</p> : (
            <div className="-my-2 divide-y divide-line">
              {pending.map(b => <MiniBooking key={b.id} b={b} onConfirm={() => { setBookingStatus(b.id, 'Confirmed'); toast(t(`Booking ${b.id} confirmed`, `ยืนยันการจอง ${b.id} แล้ว`)) }} />)}
            </div>
          )}
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={t('Your ProFind plan', 'แพ็กเกจ ProFind ของคุณ')}>
          <div className="space-y-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-sub">{t('Required', 'ค่าบริการหลัก (บังคับ)')}</div>
            <PlanRow icon={Crown} title={t('Subscription', 'ค่าสมาชิก')} sub={t('Unlimited promotions · analytics', 'ลงโปรโมชั่นไม่จำกัด · ดูสถิติ')} value={t(`${baht(SUBSCRIPTION)} / mo`, `${baht(SUBSCRIPTION)} / เดือน`)} />
            <PlanRow icon={Receipt} title={t('Booking commission', 'ค่าคอมมิชชั่นการจอง')} sub={t(`${COMMISSION * 100}% of booked value`, `${COMMISSION * 100}% ของมูลค่าการจอง`)} value="฿3,664" />
            <div className="border-t border-line pt-3 text-xs font-bold uppercase tracking-wide text-sub">{t('Optional · rank higher in search', 'ทางเลือก · ขึ้นอันดับต้นในการค้นหา')}</div>
            <PlanRow icon={Megaphone} title={t('Ad package', 'แพ็กเกจโฆษณา')} sub={ads.length ? t(`${ads.length} running · ends when the time bought is up`, `กำลังแสดง ${ads.length} รายการ · หมดตามระยะเวลาที่ซื้อ`) : t('Not used', 'ไม่ได้ใช้')} value={ads.length ? baht(ads.reduce((a, c) => a + c.budget, 0)) : '—'} />
            <PlanRow icon={MousePointerClick} title={t('Pay-per-click', 'จ่ายต่อคลิก (CPC)')} sub={cpc.length ? t(`${cpc.length} running · ${baht(CPC)} per click`, `กำลังแสดง ${cpc.length} รายการ · คลิกละ ${baht(CPC)}`) : t('Not used', 'ไม่ได้ใช้')} value={cpc.length ? '~' + baht(cpc.reduce((a, c) => a + c.budget, 0)) : '—'} />
          </div>
          <Button to="/clinic/advertising" variant="soft" className="mt-4 w-full"><Megaphone className="size-4" />{t('Boost visibility', 'เพิ่มการมองเห็น')}</Button>
        </Card>
        <PitchNote title={t('Pitch: clinic side', 'นำเสนอ: ฝั่งคลินิก')}>{t(`Every clinic pays only ${baht(SUBSCRIPTION)}/month + ${COMMISSION * 100}% commission on bookings. Ad packages and CPC are optional for clinics that want a top spot — without them, ranking is by relevance only.`, `คลินิกจ่ายแค่ค่าสมาชิก ${baht(SUBSCRIPTION)}/เดือน + ค่าคอมมิชชั่น ${COMMISSION * 100}% เมื่อมีการจอง ส่วนแพ็กเกจโฆษณาและ CPC เป็นทางเลือกสำหรับคลินิกที่อยากขึ้นอันดับต้น — ถ้าไม่ซื้อ อันดับจะขึ้นกับความเกี่ยวข้องเท่านั้น`)}</PitchNote>
      </div>
    </Page>
  )
}

const PlanRow = ({ icon: Icon, title, sub, value }) => (
  <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
    <div className="flex-1"><div className="font-bold">{title}</div><div className="text-xs text-sub">{sub}</div></div><b className="text-right">{value}</b></div>
)

function MiniBooking({ b, onConfirm }) {
  const { users, promoById, t } = useStore()
  const u = users.find(x => x.id === b.userId)
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={u.name} className="size-9 text-xs" />
      <div className="min-w-0 flex-1 text-sm"><div className="flex items-center gap-1.5 font-bold">{u.name}{b.isNew && <Badge tone="accent">{t('New', 'ใหม่')}</Badge>}</div><div className="truncate text-sub">{promoById(b.promoId)?.title} · {fmtDate(b.date, { day: 'numeric', month: 'short' })} {b.time}</div></div>
      {b.status === 'Pending' ? <Button size="sm" onClick={onConfirm}>{t('Confirm', 'ยืนยัน')}</Button> : <StatusBadge status={b.status} />}
    </div>
  )
}

export function Promotions() {
  const { promos, setPromoStatus, deletePromo, toast, t, tl, pick } = useClinic()
  const nav = useNavigate()
  const [tab, setTab] = useState('all')
  const [del, setDel] = useState(null)
  const list = tab === 'all' ? promos : promos.filter(p => p.status === tab)
  const count = st => promos.filter(p => p.status === st).length
  const actions = p => (
    <div className="flex items-center gap-1">
      <IconBtn label={t('Edit', 'แก้ไข')} onClick={() => nav(`/clinic/promotions/new?edit=${p.id}`)}><Pencil /></IconBtn>
      {p.status === 'Active' && <IconBtn label={t('Pause', 'หยุดชั่วคราว')} onClick={() => { setPromoStatus(p.id, 'Paused'); toast(t('Promotion paused', 'หยุดโปรโมชั่นชั่วคราวแล้ว')) }}><Pause /></IconBtn>}
      {p.status === 'Paused' && <IconBtn label={t('Resume', 'เปิดใช้งานอีกครั้ง')} onClick={() => { setPromoStatus(p.id, 'Active'); toast(t('Promotion resumed', 'เปิดใช้งานโปรโมชั่นอีกครั้งแล้ว')) }}><Play /></IconBtn>}
      <IconBtn label={t('View', 'ดู')} onClick={() => nav(`/promotion/${p.id}`)}><ExternalLink /></IconBtn>
      <IconBtn label={t('Delete', 'ลบ')} onClick={() => setDel(p)} danger><Trash2 /></IconBtn>
    </div>
  )
  return (
    <Page>
      <PageHeader title={t('Promotions', 'โปรโมชั่น')} sub={t(`${count('Active')} active · ${count('Pending')} awaiting ProFind review`, `เปิดใช้งาน ${count('Active')} รายการ · รอ ProFind ตรวจสอบ ${count('Pending')} รายการ`)} action={<Button to="/clinic/promotions/new"><Plus className="size-4" />{t('Create Promotion', 'สร้างโปรโมชั่น')}</Button>} />
      <div className="mb-4 max-w-2xl"><Tabs value={tab} onChange={setTab} tabs={[['all', t('All', 'ทั้งหมด')], ...['Active', 'Pending', 'Draft', 'Expired', 'Rejected'].map(s => [s, tl(s)])]} /></div>
      {list.length === 0 ? <EmptyState title={t('No Promotions Found', 'ไม่พบโปรโมชั่น')} body={t('Nothing in this status yet.', 'ยังไม่มีรายการในสถานะนี้')} action={<Button to="/clinic/promotions/new">{t('Create Promotion', 'สร้างโปรโมชั่น')}</Button>} /> : (
        <DataTable
          cols={[t('Promotion', 'โปรโมชั่น'), t('Views', 'เข้าชม'), t('Clicks', 'คลิก'), t('Bookings', 'การจอง'), t('Status', 'สถานะ'), t('Actions', 'จัดการ')]}
          rows={list.map(p => [
            <div className="flex items-center gap-3"><Img src={p.image} className="size-11 rounded-lg" /><div><div className="flex items-center gap-2 font-bold">{p.title}{p.sponsored && <Megaphone className="size-3.5 text-amber-600" aria-label={t('Sponsored', 'โปรโมต')} />}</div><div className="text-xs text-sub">{baht(p.price)} <s>{baht(p.originalPrice)}</s> · {t('until', 'ถึง')} {fmtDate(p.validUntil)}</div>{p.flag && <div className="text-xs text-red-600">{pick(p.flag)}</div>}</div></div>,
            p.views.toLocaleString(), p.clicks.toLocaleString(), p.bookings, <StatusBadge status={p.status} />, actions(p),
          ])}
          mobile={list.map(p => (
            <div key={p.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex gap-3"><Img src={p.image} className="size-14 rounded-xl" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><b className="truncate">{p.title}</b><StatusBadge status={p.status} /></div><div className="text-sm text-sub">{baht(p.price)} · {t(`${p.views.toLocaleString()} views · ${p.bookings} bookings`, `เข้าชม ${p.views.toLocaleString()} · จอง ${p.bookings}`)}</div></div></div>
              <div className="mt-3 flex justify-end border-t border-line pt-2">{actions(p)}</div>
            </div>
          ))}
        />
      )}
      <Modal open={!!del} onClose={() => setDel(null)} title={t('Delete promotion?', 'ลบโปรโมชั่นนี้?')}
        footer={<div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setDel(null)}>{t('Cancel', 'ยกเลิก')}</Button><Button variant="danger" className="flex-1" onClick={() => { deletePromo(del.id); setDel(null); toast(t('Promotion deleted', 'ลบโปรโมชั่นแล้ว')) }}>{t('Delete', 'ลบ')}</Button></div>}>
        <p className="text-sub">{t(`“${del?.title}” will be removed from ProFind. Existing bookings are not affected.`, `“${del?.title}” จะถูกลบออกจาก ProFind โดยไม่กระทบการจองที่มีอยู่แล้ว`)}</p>
      </Modal>
    </Page>
  )
}

export const IconBtn = ({ label, onClick, children, danger }) => (
  <button onClick={onClick} title={label} aria-label={label} className={cx('grid size-9 place-items-center rounded-lg [&>svg]:size-4', danger ? 'text-red-600 hover:bg-red-50' : 'text-sub hover:bg-zinc-100 hover:text-ink')}>{children}</button>
)

export function DataTable({ cols, rows, mobile }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white md:block">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line bg-zinc-50 text-left text-xs font-bold uppercase tracking-wide text-sub">{cols.map(c => <th key={c} className="px-4 py-3 font-bold">{c}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{rows.map((r, i) => <tr key={i} className="hover:bg-zinc-50/60">{r.map((c, j) => <td key={j} className="px-4 py-3 align-middle">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">{mobile}</div>
    </>
  )
}

export function PromotionForm() {
  const { promos, savePromotion, clinic, toast, t, tl, pick } = useClinic()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const editing = promos.find(p => p.id === params.get('edit'))
  const [f, setF] = useState(() => editing ? { ...editing, description: pick(editing.description), terms: pick(editing.terms) } : {
    title: 'Botox Forehead + Frown Lines', treatment: 'Botox', originalPrice: 5900, price: 3490, type: 'New Customer',
    description: t('Smooth forehead and frown lines with genuine Korean toxin, injected by our board-certified dermatologists.', 'ลดริ้วรอยหน้าผากและระหว่างคิ้วด้วยโบท็อกซ์แท้จากเกาหลี ฉีดโดยแพทย์ผิวหนังผู้เชี่ยวชาญ'),
    start: '2026-10-01', validUntil: '2026-11-30', image: IMG.Botox,
    terms: t('New customers only\nBook at least 24 hours in advance\nCannot be combined with other promotions', 'เฉพาะลูกค้าใหม่\nจองล่วงหน้าอย่างน้อย 24 ชั่วโมง\nไม่สามารถใช้ร่วมกับโปรโมชั่นอื่น'),
  })
  const up = patch => setF(p => ({ ...p, ...patch }))
  const valid = f.title && f.price > 0 && +f.originalPrice > +f.price
  const save = status => {
    const id = editing?.id || `p${Date.now()}`
    savePromotion({
      views: 0, clicks: 0, bookings: 0, sponsored: false, duration: { en: '30–45 min', th: '30–45 นาที' },
      includes: [{ en: 'Doctor consultation', th: 'ปรึกษาแพทย์ก่อนทำ' }, { en: 'Genuine product (batch verified)', th: 'ผลิตภัณฑ์แท้ (ตรวจสอบล็อตได้)' }, { en: 'Free follow-up within 14 days', th: 'ติดตามผลฟรีภายใน 14 วัน' }],
      ...f, id, clinicId: MY_CLINIC, status, submitted: new Date().toISOString().slice(0, 10),
      originalPrice: +f.originalPrice, price: +f.price,
      terms: Array.isArray(f.terms) ? f.terms : f.terms.split('\n').filter(Boolean),
    })
    toast(status === 'Draft' ? t('Draft saved', 'บันทึกฉบับร่างแล้ว') : t('Published — sent to ProFind for review', 'เผยแพร่แล้ว — ส่งให้ ProFind ตรวจสอบ'))
    nav('/clinic/promotions')
  }
  const preview = { ...f, id: 'preview', originalPrice: +f.originalPrice || 0, price: +f.price || 0, clinic }
  return (
    <Page>
      <PageHeader title={editing ? t('Edit Promotion', 'แก้ไขโปรโมชั่น') : t('Create Promotion', 'สร้างโปรโมชั่น')} sub={t('Published promotions are reviewed by ProFind within 24 hours.', 'โปรโมชั่นที่เผยแพร่จะได้รับการตรวจสอบโดย ProFind ภายใน 24 ชั่วโมง')} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label={t('Promotion Name', 'ชื่อโปรโมชั่น')}><input className={inputCls} value={f.title} onChange={e => up({ title: e.target.value })} /></Field></div>
            <Field label={t('Treatment Type', 'ประเภทหัตถการ')}><select className={inputCls} value={f.treatment} onChange={e => up({ treatment: e.target.value, image: IMG[e.target.value] })}>{CATEGORIES.map(c => <option key={c} value={c}>{tl(c)}</option>)}</select></Field>
            <Field label={t('Promotion Type', 'ประเภทโปรโมชั่น')}><select className={inputCls} value={f.type} onChange={e => up({ type: e.target.value })}>{['Discount', 'Bundle', 'Flash Deal', 'New Customer'].map(c => <option key={c} value={c}>{tl(c)}</option>)}</select></Field>
            <Field label={t('Original Price (฿)', 'ราคาปกติ (฿)')}><input type="number" className={inputCls} value={f.originalPrice} onChange={e => up({ originalPrice: e.target.value })} /></Field>
            <Field label={t('Promotion Price (฿)', 'ราคาโปรโมชั่น (฿)')} hint={+f.originalPrice > +f.price ? t(`${discountPct(f.originalPrice, f.price)}% off`, `ลด ${discountPct(f.originalPrice, f.price)}%`) : t('Must be lower than original price', 'ต้องต่ำกว่าราคาปกติ')}><input type="number" className={inputCls} value={f.price} onChange={e => up({ price: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label={t('Description', 'รายละเอียด')}><textarea rows={3} className={cx(inputCls, 'h-auto py-3')} value={f.description} onChange={e => up({ description: e.target.value })} /></Field></div>
            <Field label={t('Start Date', 'วันเริ่มต้น')}><input type="date" className={inputCls} value={f.start || ''} onChange={e => up({ start: e.target.value })} /></Field>
            <Field label={t('End Date', 'วันสิ้นสุด')}><input type="date" className={inputCls} value={f.validUntil} onChange={e => up({ validUntil: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">{t('Images', 'รูปภาพ')}</span>
              <div className="flex flex-wrap gap-2">
                {[IMG[f.treatment], IMG.Facial, IMG.Skin].map((src, i) => (
                  <button key={i} onClick={() => up({ image: src })} className={cx('overflow-hidden rounded-xl ring-2', f.image === src ? 'ring-brand-600' : 'ring-transparent')}><Img src={src} className="size-20" /></button>
                ))}
                <button onClick={() => toast(t('Mock upload — pick one of the sample images', 'อัปโหลดจำลอง — เลือกจากรูปตัวอย่าง'))} className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-semibold text-sub"><ImagePlus className="size-5" />{t('Upload', 'อัปโหลด')}</button>
              </div>
            </div>
            <div className="sm:col-span-2"><Field label={t('Terms & Conditions', 'เงื่อนไข')} hint={t('One per line', 'บรรทัดละหนึ่งข้อ')}><textarea rows={3} className={cx(inputCls, 'h-auto py-3')} value={Array.isArray(f.terms) ? f.terms.join('\n') : f.terms} onChange={e => up({ terms: e.target.value })} /></Field></div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => save('Draft')} disabled={!valid}><Save className="size-4" />{t('Save Draft', 'บันทึกฉบับร่าง')}</Button>
            <Button onClick={() => save('Pending')} disabled={!valid}><Send className="size-4" />{t('Publish', 'เผยแพร่')}</Button>
          </div>
        </Card>
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <h3 className="font-bold">{t('Promotion Preview', 'ตัวอย่างโปรโมชั่น')}</h3>
          <PromotionCard item={preview} className="pointer-events-none" />
          <p className="text-xs text-sub">{t('This is how your promotion appears in search results and on your clinic page.', 'นี่คือหน้าตาโปรโมชั่นของคุณในผลการค้นหาและหน้าคลินิก')}</p>
        </div>
      </div>
    </Page>
  )
}

export function Bookings() {
  const { bookings, users, promoById, setBookingStatus, toast, t, tl } = useClinic()
  const [tab, setTab] = useState('all')
  const [detail, setDetail] = useState(null)
  const list = (tab === 'all' ? bookings : bookings.filter(b => b.status === tab)).slice().sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
  const act = (b, status, msg) => { setBookingStatus(b.id, status); toast(msg); setDetail(null) }
  const confirm = b => act(b, 'Confirmed', t(`Booking ${b.id} confirmed`, `ยืนยันการจอง ${b.id} แล้ว`))
  const reject = b => act(b, 'Cancelled', t('Booking rejected — deposit refunded', 'ปฏิเสธการจองแล้ว — คืนเงินมัดจำ'))
  const complete = b => act(b, 'Completed', t('Marked as completed', 'เปลี่ยนสถานะเป็นเสร็จสิ้นแล้ว'))
  const actions = b => (
    <div className="flex items-center gap-1">
      {b.status === 'Pending' && <><Button size="sm" onClick={() => confirm(b)}>{t('Confirm', 'ยืนยัน')}</Button><IconBtn label={t('Reject', 'ปฏิเสธ')} danger onClick={() => reject(b)}><X /></IconBtn></>}
      {b.status === 'Confirmed' && <Button size="sm" variant="soft" onClick={() => complete(b)}><CheckCheck className="size-4" />{t('Complete', 'เสร็จสิ้น')}</Button>}
      <IconBtn label={t('View Detail', 'ดูรายละเอียด')} onClick={() => setDetail(b)}><Eye /></IconBtn>
    </div>
  )
  const name = b => users.find(u => u.id === b.userId)?.name
  const newBadge = <Badge tone="accent" className="ml-1.5">{t('New', 'ใหม่')}</Badge>
  return (
    <Page>
      <PageHeader title={t('Bookings', 'การจอง')} sub={t('Bookings made on ProFind land here instantly.', 'การจองผ่าน ProFind จะแสดงที่นี่ทันที')} />
      <div className="mb-4 max-w-2xl"><Tabs value={tab} onChange={setTab} tabs={['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => [s, s === 'all' ? t('All', 'ทั้งหมด') : `${tl(s)} (${bookings.filter(b => b.status === s).length})`])} /></div>
      {list.length === 0 ? <EmptyState icon={CalendarCheck} title={t('No bookings', 'ไม่มีการจอง')} /> : (
        <DataTable
          cols={[t('Booking ID', 'หมายเลขการจอง'), t('Customer', 'ลูกค้า'), t('Treatment', 'หัตถการ'), t('Date', 'วันที่'), t('Time', 'เวลา'), t('Amount', 'ยอดเงิน'), t('Status', 'สถานะ'), t('Action', 'จัดการ')]}
          rows={list.map(b => [
            <span className="font-mono text-xs">{b.id}{b.isNew && newBadge}</span>,
            <div className="flex items-center gap-2"><Avatar name={name(b)} className="size-7 text-[10px]" /><span className="font-semibold">{name(b)}</span></div>,
            promoById(b.promoId)?.title, fmtDate(b.date), b.time, <b>{baht(b.amount)}</b>, <StatusBadge status={b.status} />, actions(b),
          ])}
          mobile={list.map(b => (
            <div key={b.id} className={cx('rounded-2xl border bg-white p-4', b.isNew ? 'border-brand-300' : 'border-line')}>
              <div className="flex items-center justify-between"><span className="font-mono text-xs text-sub">{b.id}</span><StatusBadge status={b.status} /></div>
              <div className="mt-2 flex items-center gap-2 font-bold">{name(b)}{b.isNew && newBadge}</div>
              <div className="text-sm text-sub">{promoById(b.promoId)?.title}</div>
              <div className="mt-1 text-sm font-semibold">{fmtDate(b.date)} · {b.time} · {baht(b.amount)}</div>
              <div className="mt-3 flex justify-end border-t border-line pt-2">{actions(b)}</div>
            </div>
          ))}
        />
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`${t('Booking', 'การจอง')} ${detail?.id}`}
        footer={detail && ['Pending', 'Confirmed'].includes(detail.status) && (
          <div className="flex gap-2">
            {detail.status === 'Pending' && <><Button variant="danger" className="flex-1" onClick={() => reject(detail)}>{t('Reject', 'ปฏิเสธ')}</Button><Button className="flex-1" onClick={() => confirm(detail)}>{t('Confirm', 'ยืนยัน')}</Button></>}
            {detail.status === 'Confirmed' && <Button className="flex-1" onClick={() => complete(detail)}>{t('Mark Completed', 'ทำเครื่องหมายว่าเสร็จสิ้น')}</Button>}
          </div>
        )}>
        {detail && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[[t('Customer', 'ลูกค้า'), name(detail)], [t('Status', 'สถานะ'), <StatusBadge status={detail.status} />], [t('Treatment', 'หัตถการ'), promoById(detail.promoId)?.title], [t('Date & time', 'วันและเวลา'), `${fmtDate(detail.date)} · ${detail.time}`],
              [t('Treatment price', 'ราคาหัตถการ'), baht(detail.amount)], [t('Paid online', 'ชำระออนไลน์'), `${baht(detail.paid)} (${tl(detail.payment)}, ${tl(detail.method)})`], [t('Due at clinic', 'ชำระที่คลินิก'), baht(detail.amount - detail.paid)], [t('ProFind commission', 'ค่าคอมมิชชั่น ProFind'), baht(detail.amount * COMMISSION)]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-zinc-50 p-3"><dt className="text-xs text-sub">{k}</dt><dd className="mt-0.5 font-bold">{v}</dd></div>
            ))}
          </dl>
        )}
      </Modal>
    </Page>
  )
}

export function Customers() {
  const { bookings, users, promoById, t, tl } = useClinic()
  const top = Object.entries(bookings.reduce((a, b) => { const title = promoById(b.promoId)?.title; a[title] = (a[title] || 0) + 1; return a }, {}))
    .map(([name, n]) => ({ name, bookings: n * 9 })).sort((a, b) => b.bookings - a.bookings)
  const trend = clinicTrend.map((w, i) => ({ label: w.label, new: [6, 8, 7, 9, 10, 12, 15, 24][i], returning: [3, 3, 3, 4, 4, 5, 6, 9][i] }))
  const recent = [...new Map(bookings.map(b => [b.userId, b])).values()]
  const { pick } = useStore()
  return (
    <Page>
      <PageHeader title={t('Customer Insights', 'ข้อมูลลูกค้า')} sub={t('Who books with you, and what they book.', 'ใครจองกับคุณ และจองอะไร')} />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <KpiCard label={t('New Customers', 'ลูกค้าใหม่')} value="91" delta="31%" icon={Users} />
        <KpiCard label={t('Returning Customers', 'ลูกค้าที่กลับมา')} value="37" delta="9%" icon={Repeat} />
        <KpiCard label={t('Top Treatment', 'หัตถการยอดนิยม')} value={tl('Botox')} icon={Star} />
        <KpiCard label={t('Average Booking Value', 'มูลค่าการจองเฉลี่ย')} value={baht(3578)} delta="6%" icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={t('New vs returning customers', 'ลูกค้าใหม่ vs ลูกค้าที่กลับมา')}><TrendChart data={trend.map(d => ({ ...d, x: pick(d.label) }))} x="x" keys={['new', 'returning']} names={[t('New', 'ใหม่'), t('Returning', 'กลับมา')]} /></Card>
        <Card title={t('Top treatments (bookings)', 'หัตถการยอดนิยม (การจอง)')}><BarsChart data={top} x="name" y="bookings" name={t('Bookings', 'การจอง')} layout="vertical" /></Card>
      </div>
      <Card title={t('Recent customers', 'ลูกค้าล่าสุด')} className="mt-6">
        <div className="-my-2 divide-y divide-line">
          {recent.map(b => {
            const u = users.find(x => x.id === b.userId)
            const returning = b.userId === 'u1' || b.userId === 'u2'
            return (
              <div key={b.userId} className="flex items-center gap-3 py-3 text-sm">
                <Avatar name={u.name} className="size-9 text-xs" />
                <div className="flex-1"><div className="font-bold">{u.name}</div><div className="text-sub">{t('Last:', 'ล่าสุด:')} {promoById(b.promoId)?.title}</div></div>
                <span className="hidden text-sub sm:inline">{fmtDate(b.date)}</span>
                <Badge tone={returning ? 'brand' : 'gray'}>{returning ? t('Returning', 'ลูกค้าเก่า') : t('New', 'ลูกค้าใหม่')}</Badge>
              </div>
            )
          })}
        </div>
      </Card>
    </Page>
  )
}

export function Analytics() {
  const { promos, t } = useClinic()
  const active = promos.filter(p => p.status === 'Active')
  const views = active.reduce((a, p) => a + p.views, 0), clicks = active.reduce((a, p) => a + p.clicks, 0), bks = active.reduce((a, p) => a + p.bookings, 0)
  const funnel = [[t('Views', 'เข้าชม'), views, Eye], [t('Clicks', 'คลิก'), clicks, MousePointerClick], [t('Bookings', 'การจอง'), bks, CalendarCheck]]
  return (
    <Page>
      <PageHeader title={t('Analytics', 'สถิติ')} sub={t('From search impression to booked appointment.', 'ตั้งแต่การมองเห็นในผลค้นหาจนถึงการจองนัด')} />
      <Card title={t('Conversion funnel · this month', 'ช่องทางการเปลี่ยนเป็นยอดจอง · เดือนนี้')}>
        <div className="grid gap-3 sm:grid-cols-3">
          {funnel.map(([l, v, Icon], i) => (
            <div key={l} className="relative rounded-2xl bg-zinc-50 p-4">
              <div className="flex items-center gap-2 text-sm text-sub"><Icon className="size-4" />{l}</div>
              <div className="mt-1 text-2xl font-extrabold">{v.toLocaleString()}</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(4, (v / views) * 100)}%` }} /></div>
              {i > 0 && <div className="mt-2 text-xs font-semibold text-brand-700">{t(`${((v / funnel[i - 1][1]) * 100).toFixed(1)}% from ${funnel[i - 1][0].toLowerCase()}`, `${((v / funnel[i - 1][1]) * 100).toFixed(1)}% จาก${funnel[i - 1][0]}`)}</div>}
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-6"><MetricTrend data={clinicTrend} metrics={METRICS} initial="bookings" /></div>
      <Card title={t('Bookings by promotion', 'การจองแยกตามโปรโมชั่น')} className="mt-6">
        <BarsChart data={active.map(p => ({ name: p.title.length > 18 ? p.title.slice(0, 17) + '…' : p.title, bookings: p.bookings }))} x="name" y="bookings" name={t('Bookings', 'การจอง')} layout="vertical" height={Math.max(160, active.length * 52)} />
      </Card>
      <PitchNote className="mt-6" title={t("Pitch: data clinics can't get elsewhere", 'นำเสนอ: ข้อมูลที่คลินิกหาจากที่อื่นไม่ได้')}>{t("Clinics see exactly which promotions convert — and the spike after week 7 is when Sponsored placement started. That's the upsell loop.", 'คลินิกเห็นชัดว่าโปรโมชั่นไหนสร้างยอดจอง — ยอดที่พุ่งขึ้นหลังสัปดาห์ที่ 7 คือช่วงที่เริ่มลงโปรโมต นี่คือวงจรการขายเพิ่ม (upsell)')}</PitchNote>
    </Page>
  )
}

const PACKAGES = [
  { id: 'Sponsored Listing', price: 2000, per: ['week', 'สัปดาห์'], icon: Megaphone, unitDays: 7,
    perks: [['Top of search results for your treatment', 'แสดงบนสุดของผลการค้นหาหัตถการของคุณ'], ['“Sponsored” label — max 2 slots per search', 'มีป้าย “โปรโมต” — สูงสุด 2 ตำแหน่งต่อการค้นหา'], ['Highlighted map pin', 'หมุดบนแผนที่แบบเด่น']] },
  { id: 'Featured Clinic', price: 6000, per: ['month', 'เดือน'], icon: Crown, unitDays: 30, best: true,
    perks: [['Homepage “Clinics near you” feature', 'แสดงในหัวข้อ “คลินิกใกล้คุณ” บนหน้าแรก'], ['Sponsored Listing included', 'รวม Sponsored Listing'], ['Priority in push notifications', 'ได้รับความสำคัญในการแจ้งเตือน']] },
  { id: 'CPC', price: CPC, per: ['click', 'คลิก'], icon: MousePointerClick, unitDays: 7, cpc: true,
    perks: [['Same top-of-search “Sponsored” slot', 'ได้ตำแหน่ง “โปรโมต” บนสุดเหมือน Sponsored Listing'], ['Pay only when someone clicks', 'จ่ายเฉพาะเมื่อมีคนกดเข้าดู'], ['Stops automatically when the period ends', 'หยุดอัตโนมัติเมื่อครบระยะเวลา']] },
]

export function Advertising() {
  const { promos, clinic, campaigns, launchCampaign, toast, promoById, t } = useClinic()
  const active = promos.filter(p => p.status === 'Active')
  const [pkg, setPkg] = useState(null)
  const [c, setC] = useState({ promoId: active.find(p => !p.sponsored)?.id || active[0]?.id, area: 5, days: 7 })
  const selected = PACKAGES.find(p => p.id === pkg)
  const units = Math.ceil(c.days / (selected?.unitDays || 7))
  // CPC gets the same slot as a Sponsored Listing, so estimate on that spend, then bill per click.
  const base = selected ? units * (selected.cpc ? PACKAGES[0].price : selected.price) : 0
  const est = useMemo(() => campaignEstimate(base, c.days, c.area), [base, c.days, c.area])
  const budget = selected?.cpc ? est.clicks * CPC : base
  const promo = promoById(c.promoId)
  const launch = () => { launchCampaign({ ...c, pkg, budget }); toast(t('Campaign launched — now Sponsored in search', 'เริ่มแคมเปญแล้ว — แสดงเป็นโปรโมตในผลการค้นหา')); setPkg(null) }
  return (
    <Page>
      <PageHeader title={t('Advertising Center', 'ศูนย์โฆษณา')} sub={t('Pay to be seen first by people already searching for your treatments.', 'ให้ลูกค้าที่กำลังค้นหาหัตถการของคุณเห็นคุณเป็นอันดับแรก')} />
      <div className="grid gap-4 md:grid-cols-3">
        {PACKAGES.map(p => (
          <div key={p.id} className={cx('relative rounded-3xl border-2 bg-white p-6', p.best ? 'border-brand-600' : 'border-line')}>
            {p.best && <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-ink">{t('Best value', 'คุ้มค่าที่สุด')}</span>}
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><p.icon className="size-5" /></span><h3 className="text-lg font-bold">{p.id}</h3></div>
            <div className="mt-4"><span className="text-3xl font-extrabold">{baht(p.price)}</span><span className="text-sub"> / {t(...p.per)}</span></div>
            <ul className="mt-4 space-y-2 text-sm">{p.perks.map(k => <li key={k[0]} className="flex gap-2"><Check className="size-4 shrink-0 text-brand-700" />{t(...k)}</li>)}</ul>
            <Button className="mt-6 w-full" variant={p.best ? 'primary' : 'outline'} onClick={() => { setPkg(p.id); setC(x => ({ ...x, days: p.unitDays })) }}><Rocket className="size-4" />{t('Promote My Clinic', 'โปรโมตคลินิกของฉัน')}</Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
        <Target className="size-5 text-brand-700" /><div className="flex-1">{t(<><b>No ads? That's fine.</b> Your promotions still appear in search, ranked by relevance to the search and the user — rating, reviews, distance and discount. Paid options only add a labelled slot on top, for the period you pay for.</>, <><b>ไม่ซื้อโฆษณาก็ได้</b> — โปรโมชั่นของคุณยังแสดงในผลการค้นหา โดยจัดอันดับตามความเกี่ยวข้องกับคำค้นและผู้ใช้ (คะแนน รีวิว ระยะทาง ส่วนลด) ตัวเลือกที่ต้องจ่ายเงินเพียงเพิ่มตำแหน่งที่มีป้ายกำกับด้านบน ตามระยะเวลาที่ซื้อเท่านั้น</>)}</div>
      </div>
      <Card title={t('Your campaigns', 'แคมเปญของคุณ')} className="mt-6">
        {campaigns.length === 0 ? <p className="text-sm text-sub">{t('No campaigns yet.', 'ยังไม่มีแคมเปญ')}</p> : (
          <div className="-my-2 divide-y divide-line">
            {campaigns.map(cp => (
              <div key={cp.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <Megaphone className="size-5 text-amber-600" />
                <div className="flex-1"><div className="font-bold">{promoById(cp.promoId)?.title}</div><div className="text-sub">{t(`${cp.pkg} · within ${cp.area} km · ${fmtDate(cp.start)} – ${fmtDate(campaignEnd(cp))}`, `${cp.pkg} · ภายใน ${cp.area} กม. · ${fmtDate(cp.start)} – ${fmtDate(campaignEnd(cp))}`)}</div></div>
                <b>{cp.pkg === 'CPC' ? t(`${baht(CPC)}/click`, `${baht(CPC)}/คลิก`) : baht(cp.budget)}</b><StatusBadge status={isLive(cp) ? 'Running' : 'Expired'} />
              </div>
            ))}
          </div>
        )}
      </Card>
      <PitchNote className="mt-6" title={t('Pitch: advertising revenue', 'นำเสนอ: รายได้จากโฆษณา')}>{t(<>Optional, pay-once or pay-per-click: <b>฿2,000/week</b>, <b>฿6,000/month</b> or <b>{baht(CPC)}/click</b>. A week bought = a week on top, then the promo ranks like everyone else. Clinics self-serve in under a minute.</>, <>เป็นทางเลือก จ่ายครั้งเดียวหรือจ่ายตามคลิก: <b>฿2,000/สัปดาห์</b>, <b>฿6,000/เดือน</b> หรือ <b>{baht(CPC)}/คลิก</b> ซื้อ 1 สัปดาห์ก็อยู่อันดับต้น 1 สัปดาห์ หลังจากนั้นจัดอันดับเหมือนโปรอื่น ๆ คลินิกซื้อเองได้ในไม่ถึงนาที</>)}</PitchNote>

      <Modal open={!!pkg} onClose={() => setPkg(null)} title={`${t('New campaign', 'แคมเปญใหม่')} · ${pkg}`} wide
        footer={<Button size="lg" className="w-full" onClick={launch} disabled={!promo}><Rocket className="size-5" />{t('Launch campaign', 'เริ่มแคมเปญ')} · {selected?.cpc && '~'}{baht(budget)}</Button>}>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('Promotion', 'โปรโมชั่น')}><select className={inputCls} value={c.promoId} onChange={e => setC({ ...c, promoId: e.target.value })}>{active.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
            <Field label={t('Target Area', 'พื้นที่เป้าหมาย')}><select className={inputCls} value={c.area} onChange={e => setC({ ...c, area: +e.target.value })}>{[1, 5, 10].map(k => <option key={k} value={k}>{t(`Within ${k} km`, `ภายใน ${k} กม.`)}</option>)}</select></Field>
            <Field label={t('Duration', 'ระยะเวลา')}><select className={inputCls} value={c.days} onChange={e => setC({ ...c, days: +e.target.value })}>{[7, 14, 30].map(d => <option key={d} value={d}>{t(`${d} Days`, `${d} วัน`)}</option>)}</select></Field>
            <Field label={selected?.cpc ? t('Estimated cost', 'ค่าใช้จ่ายโดยประมาณ') : t('Budget', 'งบประมาณ')} hint={selected && (selected.cpc ? t(`~${est.clicks} clicks × ${baht(CPC)} · billed on actual clicks`, `~${est.clicks} คลิก × ${baht(CPC)} · เรียกเก็บตามคลิกจริง`) : `${baht(selected.price)} × ${units} ${t(...selected.per)}`)}><div className={cx(inputCls, 'flex items-center font-bold')}>{baht(budget)}</div></Field>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[[t('Estimated Reach', 'การเข้าถึงโดยประมาณ'), est.reach, Users], [t('Estimated Clicks', 'คลิกโดยประมาณ'), est.clicks, MousePointerClick], [t('Est. Bookings', 'การจองโดยประมาณ'), est.bookings, CalendarCheck]].map(([l, v, Icon]) => (
              <div key={l} className="rounded-2xl bg-brand-50 p-3"><Icon className="mx-auto size-5 text-brand-700" /><div className="mt-1 text-xl font-extrabold">{v.toLocaleString()}</div><div className="text-xs text-sub">{l}</div></div>
            ))}
          </div>
          {promo && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Target className="size-4" />{t('Campaign Preview — how users will see it', 'ตัวอย่างแคมเปญ — สิ่งที่ผู้ใช้จะเห็น')}</div>
              <div className="pointer-events-none"><ClinicCard item={{ ...promo, sponsored: true, clinic }} /></div>
            </div>
          )}
          <p className="text-xs text-sub">{t('Estimates are mock projections based on average ProFind search volume in your area.', 'ตัวเลขประมาณการเป็นข้อมูลจำลองจากปริมาณการค้นหาเฉลี่ยในพื้นที่ของคุณ')}</p>
        </div>
      </Modal>
    </Page>
  )
}

export function ClinicProfile() {
  const { clinic, clinicStatus, toast, t, pick } = useClinic()
  return (
    <Page>
      <PageHeader title={t('Clinic Profile', 'โปรไฟล์คลินิก')} sub={t('This information appears on your public clinic page.', 'ข้อมูลนี้จะแสดงบนหน้าคลินิกสาธารณะของคุณ')} action={<Button to={`/clinic/${clinic.id}`} variant="outline"><ExternalLink className="size-4" />{t('View public page', 'ดูหน้าสาธารณะ')}</Button>} />
      <div className={cx('mb-6 flex items-center gap-3 rounded-2xl p-4', clinicStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800')}>
        {clinicStatus === 'Verified' ? <><VerifiedBadge label="" /><b>🟢 {t('Verified Clinic', 'คลินิกยืนยันแล้ว')}</b><span className="text-sm">— {t('licences checked by ProFind on 2 Aug 2026', `ProFind ตรวจสอบใบอนุญาตแล้วเมื่อ ${fmtDate('2026-08-02')}`)}</span></> : <b>🟡 {t('Verification Pending', 'รอการยืนยันตัวตน')}</b>}
      </div>
      <Card>
        <div className="mb-5 flex items-center gap-4"><Img src={clinic.cover} className="h-24 w-40 rounded-2xl" /><Button variant="outline" size="sm" onClick={() => toast(t('Mock upload', 'อัปโหลดจำลอง'))}><ImagePlus className="size-4" />{t('Change images', 'เปลี่ยนรูปภาพ')}</Button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('Clinic Name', 'ชื่อคลินิก')}><input className={inputCls} defaultValue={clinic.name} /></Field>
          <Field label={t('Phone', 'เบอร์โทรศัพท์')}><input className={inputCls} defaultValue={clinic.phone} /></Field>
          <div className="sm:col-span-2"><Field label={t('Description', 'รายละเอียด')}><textarea key={pick(clinic.about)} rows={3} className={cx(inputCls, 'h-auto py-3')} defaultValue={pick(clinic.about)} /></Field></div>
          <Field label={t('Address', 'ที่อยู่')}><input className={inputCls} defaultValue={`${clinic.area}, Bangkok`} /></Field>
          <Field label={t('Opening Hours', 'เวลาทำการ')}><input key={pick(clinic.hours)} className={inputCls} defaultValue={pick(clinic.hours)} /></Field>
          <Field label={t('Treatments', 'หัตถการ')}><input className={inputCls} defaultValue="Botox, Filler, Facial, Skin" /></Field>
          <Field label={t('Social Media', 'โซเชียลมีเดีย')}><input className={inputCls} defaultValue="@glowclinic.bkk · LINE @glowclinic" /></Field>
        </div>
        <div className="mt-6 flex justify-end border-t border-line pt-5"><Button onClick={() => toast(t('Profile saved', 'บันทึกโปรไฟล์แล้ว'))}><Save className="size-4" />{t('Save changes', 'บันทึกการเปลี่ยนแปลง')}</Button></div>
      </Card>
    </Page>
  )
}

const DOCS = ['Business Registration', 'Clinic License', 'Medical License']

export function Onboarding() {
  const { applications, myApplication, submitApplication, t, tl } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ clinic: 'Serenity Aesthetic Clinic', area: 'Ari, Phaya Thai', phone: '02-555-0142', owner: 'Dr. Arisa Montri', email: 'arisa@serenity.example', license: 'ว.12345', docs: [] })
  const app = applications.find(a => a.id === myApplication)
  const up = patch => setF(p => ({ ...p, ...patch }))

  if (app) return (
    <OnboardShell>
      <div className="rounded-3xl border border-line bg-white p-6 text-center md:p-10">
        <div className={cx('mx-auto grid size-16 place-items-center rounded-full text-3xl', app.status === 'Verified' ? 'bg-emerald-50' : app.status === 'Rejected' ? 'bg-red-50' : 'bg-amber-50')}>{app.status === 'Verified' ? '🟢' : app.status === 'Rejected' ? '🔴' : '🟡'}</div>
        <h1 className="mt-4 text-2xl font-extrabold">{t('Verification Status', 'สถานะการยืนยันตัวตน')}</h1>
        <div className="mt-2 text-lg font-bold">{app.status === 'Pending' ? t('Pending Review', 'รอการตรวจสอบ') : tl(app.status)}</div>
        <p className="mx-auto mt-2 max-w-md text-sub">{app.status === 'Pending'
          ? t(`Thanks, ${app.owner}. Our team is reviewing ${app.clinic}'s documents — usually within 1 business day.`, `ขอบคุณค่ะ ${app.owner} ทีมงานกำลังตรวจสอบเอกสารของ ${app.clinic} — ปกติใช้เวลาไม่เกิน 1 วันทำการ`)
          : app.status === 'Verified'
            ? t(`${app.clinic} is verified! You can now publish promotions and receive bookings.`, `${app.clinic} ได้รับการยืนยันแล้ว! ตอนนี้สามารถลงโปรโมชั่นและรับการจองได้`)
            : t('Some documents could not be verified. Please re-submit.', 'เอกสารบางรายการไม่ผ่านการตรวจสอบ กรุณาส่งใหม่อีกครั้ง')}</p>
        <div className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {[t('Application submitted', 'ส่งใบสมัครแล้ว'), t('Documents reviewed', 'ตรวจสอบเอกสาร'), t('Clinic verified', 'ยืนยันคลินิก')].map((s, i) => {
            const done = i === 0 || app.status === 'Verified'
            return <div key={s} className="flex items-center gap-3"><span className={cx('grid size-6 place-items-center rounded-full', done ? 'bg-brand-600 text-ink' : 'bg-zinc-200')}>{done && <Check className="size-4" />}</span><span className={done ? 'font-semibold' : 'text-sub'}>{s}</span></div>
          })}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          {app.status === 'Verified' ? <Button to="/clinic">{t('Go to Clinic Dashboard', 'ไปที่แดชบอร์ดคลินิก')}</Button> : <Button variant="outline" onClick={() => nav('/admin/clinics')}>{t('Open Admin to review (demo)', 'เปิดหน้าแอดมินเพื่อตรวจสอบ (เดโม)')} <ArrowRight className="size-4" /></Button>}
        </div>
      </div>
    </OnboardShell>
  )

  const steps = [t('Clinic Information', 'ข้อมูลคลินิก'), t('Owner Information', 'ข้อมูลเจ้าของ'), t('Verification Documents', 'เอกสารยืนยันตัวตน'), t('Review & Submit', 'ตรวจสอบและส่ง')]
  const canNext = step !== 2 || f.docs.length === DOCS.length
  return (
    <OnboardShell>
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{t('Join ProFind', 'สมัครเข้าร่วม ProFind')}</h1>
      <p className="mt-1 text-sub">{t('List your clinic and start receiving bookings. Takes about 5 minutes.', 'ลงทะเบียนคลินิกและเริ่มรับการจอง ใช้เวลาประมาณ 5 นาที')}</p>
      <ol className="mt-6 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col gap-1.5">
            <div className={cx('h-1.5 rounded-full', i <= step ? 'bg-brand-600' : 'bg-zinc-200')} />
            <span className={cx('text-xs font-semibold', i <= step ? 'text-brand-700' : 'text-sub')}><span className="md:hidden">{t('Step', 'ขั้นที่')} {i + 1}</span><span className="hidden md:inline">{i + 1}. {s}</span></span>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5 md:p-7">
        <h2 className="mb-5 text-lg font-bold">{t('Step', 'ขั้นที่')} {step + 1} · {steps[step]}</h2>
        {step === 0 && <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label={t('Clinic name', 'ชื่อคลินิก')}><input className={inputCls} value={f.clinic} onChange={e => up({ clinic: e.target.value })} /></Field></div>
          <Field label={t('Area', 'ย่าน / เขต')}><input className={inputCls} value={f.area} onChange={e => up({ area: e.target.value })} /></Field>
          <Field label={t('Clinic phone', 'เบอร์โทรคลินิก')}><input className={inputCls} value={f.phone} onChange={e => up({ phone: e.target.value })} /></Field>
        </div>}
        {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('Owner / Medical director', 'เจ้าของ / ผู้อำนวยการแพทย์')}><input className={inputCls} value={f.owner} onChange={e => up({ owner: e.target.value })} /></Field>
          <Field label={t('Email', 'อีเมล')}><input className={inputCls} value={f.email} onChange={e => up({ email: e.target.value })} /></Field>
          <Field label={t('Medical licence no.', 'เลขที่ใบประกอบวิชาชีพ')}><input className={inputCls} value={f.license} onChange={e => up({ license: e.target.value })} /></Field>
        </div>}
        {step === 2 && <div className="space-y-3">
          {DOCS.map(d => {
            const done = f.docs.includes(d)
            return (
              <div key={d} className={cx('flex items-center gap-3 rounded-2xl border p-4', done ? 'border-emerald-200 bg-emerald-50/50' : 'border-line')}>
                <span className={cx('grid size-10 place-items-center rounded-xl', done ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-sub')}>{done ? <Check className="size-5" /> : <Receipt className="size-5" />}</span>
                <div className="flex-1"><div className="font-bold">{tl(d)}</div><div className="text-xs text-sub">{done ? `${d.toLowerCase().replace(/ /g, '_')}.pdf · 1.2 MB` : t('PDF or image, max 10 MB', 'PDF หรือรูปภาพ ไม่เกิน 10 MB')}</div></div>
                <Button size="sm" variant={done ? 'ghost' : 'outline'} onClick={() => setF(p => ({ ...p, docs: p.docs.includes(d) ? p.docs.filter(x => x !== d) : [...p.docs, d] }))}>{done ? t('Remove', 'ลบ') : t('Upload', 'อัปโหลด')}</Button>
              </div>
            )
          })}
          <p className="text-xs text-sub">{t('Mock upload — no file is actually read.', 'อัปโหลดจำลอง — ไม่มีการอ่านไฟล์จริง')}</p>
        </div>}
        {step === 3 && <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[[t('Clinic', 'คลินิก'), f.clinic], [t('Area', 'ย่าน / เขต'), f.area], [t('Phone', 'เบอร์โทร'), f.phone], [t('Owner', 'เจ้าของ'), f.owner], [t('Email', 'อีเมล'), f.email], [t('Licence', 'ใบประกอบวิชาชีพ'), f.license], [t('Documents', 'เอกสาร'), t(`${f.docs.length} of ${DOCS.length} uploaded`, `อัปโหลดแล้ว ${f.docs.length} จาก ${DOCS.length}`)]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-zinc-50 p-3"><dt className="text-xs text-sub">{k}</dt><dd className="font-bold">{v}</dd></div>
          ))}
        </dl>}
        <div className="mt-6 flex justify-between gap-2 border-t border-line pt-5">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>{t('Back', 'ย้อนกลับ')}</Button>
          {step < 3 ? <Button onClick={() => setStep(step + 1)} disabled={!canNext}>{t('Continue', 'ถัดไป')}</Button>
            : <Button onClick={() => submitApplication({ clinic: f.clinic, owner: f.owner, area: f.area, docs: f.docs })}><Send className="size-4" />{t('Submit for verification', 'ส่งเพื่อยืนยันตัวตน')}</Button>}
        </div>
      </div>
    </OnboardShell>
  )
}

function OnboardShell({ children }) {
  const { t } = useStore()
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4"><Link to="/" className="text-lg font-extrabold">Pro<span className="text-brand-700">Find</span> <span className="text-sm font-semibold text-sub">{t('for Clinics', 'สำหรับคลินิก')}</span></Link><div className="flex items-center gap-3"><LangToggle /><Link to="/" className="text-sm font-semibold text-sub">{t('Exit', 'ออก')}</Link></div></div></header>
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28">{children}</div>
    </div>
  )
}
