import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Store, Tag, CalendarCheck, Wallet, FileText, Check, X, Eye, AlertTriangle, Search, ArrowRight, Megaphone, Repeat } from 'lucide-react'
import { useStore } from '../store'
import { Page, PageHeader } from '../components/layout'
import { KpiCard, Card, Button, StatusBadge, Tabs, Modal, EmptyState, PitchNote, Img, cx } from '../components/ui'
import { Donut } from '../components/charts'
import { MetricTrend, DataTable, IconBtn } from '../clinic/Clinic'
import { PromotionCard } from '../components/cards'
import { platformTrend, revenueMix } from '../data/mock'
import { baht, fmtDate, discountPct } from '../utils/logic'

// [Icon, [en, th], [en, th]]
const LOOP = [
  [Search, ['User searches', 'ผู้ใช้ค้นหา'], ['finds promotions', 'พบโปรโมชั่น']], [CalendarCheck, ['Books', 'จอง'], ['pays deposit', 'ชำระมัดจำ']],
  [Store, ['Clinic gets', 'คลินิกได้'], ['a customer', 'ลูกค้า']], [Megaphone, ['Clinic buys', 'คลินิกซื้อ'], ['Sponsored / Ads', 'โปรโมต / โฆษณา']],
  [Wallet, ['ProFind', 'ProFind'], ['earns revenue', 'มีรายได้']], [Repeat, ['More visibility', 'มองเห็นมากขึ้น'], ['more discovery', 'ผู้ใช้ค้นพบมากขึ้น']],
]
const DOCS = ['Business Registration', 'Clinic License', 'Medical License']

export function Dashboard() {
  const { bookings, applications, promotions, t, pick } = useStore()
  const fresh = bookings.filter(b => b.isNew)
  const pendingApps = applications.filter(a => a.status === 'Pending').length
  const pendingPromos = promotions.filter(p => p.status === 'Pending').length
  return (
    <Page>
      <PageHeader title={t('Admin Dashboard', 'แดชบอร์ดผู้ดูแลระบบ')} sub={t('ProFind marketplace overview · September 2026', 'ภาพรวมแพลตฟอร์ม ProFind · กันยายน 2569')} />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        <KpiCard label={t('Total Users', 'ผู้ใช้ทั้งหมด')} value="6,240" delta="61%" icon={Users} />
        <KpiCard label={t('Registered Clinics', 'คลินิกที่ลงทะเบียน')} value={(127 + applications.filter(a => a.status === 'Verified').length).toString()} delta="26%" icon={Store} />
        <KpiCard label={t('Active Promotions', 'โปรโมชั่นที่เปิดใช้งาน')} value={(486 - 20 + promotions.filter(p => p.status === 'Active').length).toString()} delta="18%" icon={Tag} />
        <KpiCard label={t('Bookings', 'การจอง')} value={(1284 + fresh.length).toLocaleString()} delta="29%" icon={CalendarCheck} />
        <div className="col-span-2 lg:col-span-1"><KpiCard label={t('GMV', 'มูลค่าการจอง (GMV)')} value={baht(2480000 + fresh.reduce((a, b) => a + b.amount, 0))} delta="32%" icon={Wallet} /></div>
      </div>

      {(pendingApps > 0 || pendingPromos > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <QueueLink to="/admin/clinics" n={pendingApps} label={t('clinics awaiting verification', 'คลินิกรอการยืนยันตัวตน')} />
          <QueueLink to="/admin/promotions" n={pendingPromos} label={t('promotions awaiting moderation', 'โปรโมชั่นรอการตรวจสอบ')} />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <MetricTrend data={platformTrend} period={t('last 6 months', '6 เดือนล่าสุด')}
          metrics={[['bookings', 'Bookings', 'การจอง'], ['revenue', 'Revenue', 'รายได้'], ['users', 'New Users', 'ผู้ใช้ใหม่'], ['clinics', 'New Clinics', 'คลินิกใหม่']]} />
        <Card title={t('ProFind revenue by source · Sep', 'รายได้ ProFind แยกตามช่องทาง · ก.ย.')}>
          <Donut data={revenueMix.map(r => ({ ...r, name: pick(r.name), note: pick(r.note) }))} money center={t('Monthly revenue', 'รายได้ต่อเดือน')} />
        </Card>
      </div>

      <Card title={t('Business loop', 'วงจรธุรกิจ')} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LOOP.map(([Icon, a, b], i) => (
            <div key={a[0]} className="relative rounded-2xl bg-zinc-50 p-4">
              <span className="text-xs font-bold text-sub">{i + 1}</span>
              <Icon className="mt-1 size-6 text-brand-700" />
              <div className="mt-2 font-bold leading-tight">{t(...a)}</div><div className="text-sm text-sub">{t(...b)}</div>
              {i < LOOP.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white text-sub lg:block" />}
            </div>
          ))}
        </div>
      </Card>
      <PitchNote className="mt-6" title={t('Pitch: ProFind revenue', 'นำเสนอ: รายได้ของ ProFind')}>{t('Two required lines (Subscription ฿399/mo + 8% Commission) plus two optional ones clinics buy to rank higher (Ad packages, CPC ฿5/click). Admin controls trust: every clinic is verified and every promotion moderated before it goes live.', 'รายได้หลักที่ทุกคลินิกจ่าย (ค่าสมาชิก ฿399/เดือน + ค่าคอมมิชชั่น 8%) และรายได้เสริมจากคลินิกที่อยากขึ้นอันดับต้น (แพ็กเกจโฆษณา, CPC คลิกละ ฿5) แอดมินควบคุมความน่าเชื่อถือ: ทุกคลินิกต้องยืนยันตัวตน และทุกโปรโมชั่นต้องผ่านการตรวจสอบก่อนเผยแพร่')}</PitchNote>
    </Page>
  )
}

const QueueLink = ({ to, n, label }) => (
  <Link to={to} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-md">
    <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-lg font-extrabold text-amber-800">{n}</span>
    <span className="flex-1 font-semibold text-amber-900">{label}</span><ArrowRight className="size-5 text-amber-700" />
  </Link>
)

export function ClinicVerification() {
  const { applications, setApplicationStatus, toast, t, tl } = useStore()
  const [tab, setTab] = useState('Pending')
  const [view, setView] = useState(null)
  const list = tab === 'all' ? applications : applications.filter(a => a.status === tab)
  const decide = (a, status) => { setApplicationStatus(a.id, status); toast(status === 'Verified' ? t(`${a.clinic} approved ✓`, `อนุมัติ ${a.clinic} แล้ว ✓`) : t(`${a.clinic} rejected`, `ไม่อนุมัติ ${a.clinic}`)); setView(null) }
  const actions = a => (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="outline" onClick={() => setView(a)}><FileText className="size-4" />{t('Documents', 'เอกสาร')}</Button>
      {a.status === 'Pending' && <><IconBtn label={t('Approve', 'อนุมัติ')} onClick={() => decide(a, 'Verified')}><Check className="text-emerald-600" /></IconBtn><IconBtn label={t('Reject', 'ไม่อนุมัติ')} danger onClick={() => decide(a, 'Rejected')}><X /></IconBtn></>}
    </div>
  )
  return (
    <Page>
      <PageHeader title={t('Clinic Verification', 'ตรวจสอบคลินิก')} sub={t('Check business, clinic and medical licences before a clinic can go live.', 'ตรวจสอบเอกสารธุรกิจ ใบอนุญาตสถานพยาบาล และใบประกอบวิชาชีพก่อนเปิดให้คลินิกใช้งาน')} />
      <div className="mb-4 max-w-lg"><Tabs value={tab} onChange={setTab} tabs={[['Pending', `${tl('Pending')} (${applications.filter(a => a.status === 'Pending').length})`], ['Verified', tl('Verified')], ['Rejected', tl('Rejected')], ['all', t('All', 'ทั้งหมด')]]} /></div>
      {list.length === 0 ? <EmptyState icon={Check} title={t('Queue is clear', 'ไม่มีรายการค้าง')} body={t('No clinics in this status.', 'ไม่มีคลินิกในสถานะนี้')} /> : (
        <DataTable cols={[t('Clinic', 'คลินิก'), t('Owner', 'เจ้าของ'), t('Submitted Date', 'วันที่ส่ง'), t('Documents', 'เอกสาร'), t('Status', 'สถานะ'), t('Action', 'จัดการ')]}
          rows={list.map(a => [<div><div className="font-bold">{a.clinic}</div><div className="text-xs text-sub">{a.area}</div></div>, a.owner, fmtDate(a.submitted), `${a.docs.length}/3`, <StatusBadge status={a.status} />, actions(a)])}
          mobile={list.map(a => (
            <div key={a.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex justify-between gap-2"><div><b>{a.clinic}</b><div className="text-sm text-sub">{a.owner} · {fmtDate(a.submitted)}</div></div><StatusBadge status={a.status} /></div>
              <div className="mt-3 flex justify-end border-t border-line pt-2">{actions(a)}</div>
            </div>
          ))} />
      )}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.clinic} wide
        footer={view?.status === 'Pending' && <div className="flex gap-2"><Button variant="danger" className="flex-1" onClick={() => decide(view, 'Rejected')}>{t('Reject', 'ไม่อนุมัติ')}</Button><Button className="flex-1" onClick={() => decide(view, 'Verified')}><Check className="size-4" />{t('Approve', 'อนุมัติ')}</Button></div>}>
        {view && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[[t('Owner', 'เจ้าของ'), view.owner], [t('Area', 'พื้นที่'), view.area], [t('Submitted', 'วันที่ส่ง'), fmtDate(view.submitted)], [t('Status', 'สถานะ'), <StatusBadge status={view.status} />]].map(([k, v]) => <div key={k} className="rounded-xl bg-zinc-50 p-3"><div className="text-xs text-sub">{k}</div><div className="font-bold">{v}</div></div>)}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {DOCS.map(d => {
                const has = view.docs.includes(d)
                return (
                  <div key={d} className={cx('rounded-2xl border p-3', has ? 'border-line' : 'border-red-200 bg-red-50')}>
                    <div className="grid aspect-[3/4] place-items-center rounded-xl bg-gradient-to-b from-zinc-50 to-zinc-100">
                      {has ? <div className="w-3/4 space-y-1.5">{[90, 70, 80, 50, 75, 60].map((w, i) => <div key={i} className="h-1.5 rounded bg-zinc-300" style={{ width: `${w}%` }} />)}<div className="!mt-4 size-8 rounded-full border-2 border-red-300" /></div>
                        : <AlertTriangle className="size-6 text-red-500" />}
                    </div>
                    <div className="mt-2 text-sm font-bold">{tl(d)}</div>
                    <div className={cx('text-xs', has ? 'text-emerald-700' : 'text-red-600')}>{has ? t('Uploaded · matches registry', 'อัปโหลดแล้ว · ตรงกับทะเบียน') : t('Missing', 'ขาดเอกสาร')}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </Page>
  )
}

export function PromotionModeration() {
  const { promotions, withClinic, setPromoStatus, toast, t, tl, pick } = useStore()
  const [tab, setTab] = useState('Pending')
  const [view, setView] = useState(null)
  const list = (tab === 'all' ? promotions : promotions.filter(p => p.status === tab)).map(withClinic)
  const decide = (p, status) => { setPromoStatus(p.id, status); toast(status === 'Active' ? t(`“${p.title}” approved — now live`, `อนุมัติ “${p.title}” แล้ว — เผยแพร่แล้ว`) : t(`“${p.title}” rejected`, `ไม่อนุมัติ “${p.title}”`)); setView(null) }
  const actions = p => (
    <div className="flex items-center gap-1">
      <IconBtn label={t('View', 'ดู')} onClick={() => setView(p)}><Eye /></IconBtn>
      {p.status === 'Pending' && <><Button size="sm" onClick={() => decide(p, 'Active')}>{t('Approve', 'อนุมัติ')}</Button><IconBtn label={t('Reject', 'ไม่อนุมัติ')} danger onClick={() => decide(p, 'Rejected')}><X /></IconBtn></>}
    </div>
  )
  return (
    <Page>
      <PageHeader title={t('Promotion Moderation', 'ตรวจสอบโปรโมชั่น')} sub={t('Every promotion is reviewed for accurate pricing and compliant medical claims.', 'ทุกโปรโมชั่นต้องผ่านการตรวจสอบความถูกต้องของราคาและข้อความทางการแพทย์')} />
      <div className="mb-4 max-w-lg"><Tabs value={tab} onChange={setTab} tabs={[['Pending', `${tl('Pending')} (${promotions.filter(p => p.status === 'Pending').length})`], ['Active', tl('Approved')], ['Rejected', tl('Rejected')], ['all', t('All', 'ทั้งหมด')]]} /></div>
      {list.length === 0 ? <EmptyState icon={Check} title={t('Queue is clear', 'ไม่มีรายการค้าง')} body={t('No promotions in this status.', 'ไม่มีโปรโมชั่นในสถานะนี้')} /> : (
        <DataTable cols={[t('Promotion', 'โปรโมชั่น'), t('Clinic', 'คลินิก'), t('Price', 'ราคา'), t('Status', 'สถานะ'), t('Submitted', 'วันที่ส่ง'), t('Actions', 'จัดการ')]}
          rows={list.map(p => [
            <div className="flex items-center gap-3"><Img src={p.image} className="size-10 rounded-lg" /><div><div className="font-bold">{p.title}</div>{p.flag && <div className="flex items-center gap-1 text-xs font-semibold text-red-600"><AlertTriangle className="size-3.5" />{pick(p.flag)}</div>}</div></div>,
            p.clinic.name, <div><b>{baht(p.price)}</b> <span className="text-xs text-sub">-{discountPct(p.originalPrice, p.price)}%</span></div>, <StatusBadge status={p.status} />, p.submitted ? fmtDate(p.submitted) : '—', actions(p),
          ])}
          mobile={list.map(p => (
            <div key={p.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex gap-3"><Img src={p.image} className="size-12 rounded-lg" /><div className="flex-1"><div className="flex justify-between gap-2"><b>{p.title}</b><StatusBadge status={p.status} /></div><div className="text-sm text-sub">{p.clinic.name} · {baht(p.price)}</div>{p.flag && <div className="text-xs font-semibold text-red-600">{pick(p.flag)}</div>}</div></div>
              <div className="mt-3 flex justify-end border-t border-line pt-2">{actions(p)}</div>
            </div>
          ))} />
      )}
      <Modal open={!!view} onClose={() => setView(null)} title={t('Review promotion', 'ตรวจสอบโปรโมชั่น')}
        footer={view?.status === 'Pending' && <div className="flex gap-2"><Button variant="danger" className="flex-1" onClick={() => decide(view, 'Rejected')}>{t('Reject', 'ไม่อนุมัติ')}</Button><Button className="flex-1" onClick={() => decide(view, 'Active')}><Check className="size-4" />{t('Approve', 'อนุมัติ')}</Button></div>}>
        {view && (
          <div className="space-y-4">
            {view.flag && <div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertTriangle className="size-5 shrink-0" />{t('Auto-check:', 'ระบบตรวจพบ:')} {pick(view.flag)}</div>}
            <div className="pointer-events-none"><PromotionCard item={view} /></div>
            <div className="rounded-xl bg-zinc-50 p-3 text-sm"><div className="mb-1 font-bold">{t('Description', 'รายละเอียด')}</div>{pick(view.description)}</div>
            <ul className="space-y-1 text-sm text-sub">{pick(view.terms).map(term => <li key={term}>• {term}</li>)}</ul>
          </div>
        )}
      </Modal>
    </Page>
  )
}
