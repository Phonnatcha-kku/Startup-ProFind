import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, CalendarCheck, Heart, User, LayoutDashboard, Tag, Users, BarChart3, Megaphone, Store, ShieldCheck, Menu, X, FlaskConical, RotateCcw, ClipboardCheck, BadgeCheck, CheckCircle2, LogOut } from 'lucide-react'
import { useStore, ME } from '../store'
import { cx, Avatar, LangToggle } from './ui'

export const Logo = ({ to = '/', sub }) => (
  <Link to={to} className="flex items-center gap-2">
    <span className="grid size-8 place-items-center rounded-[10px] bg-brand-600 text-ink"><Search className="size-[18px]" strokeWidth={3} /></span>
    <span className="text-lg font-extrabold tracking-tight">Pro<span className="text-brand-700">Find</span></span>
    {sub && <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sub">{sub}</span>}
  </Link>
)

// [path, English, Thai, Icon]
const userNav = [
  ['/', 'Home', 'หน้าแรก', Home], ['/search', 'Search', 'ค้นหา', Search], ['/bookings', 'Bookings', 'การจอง', CalendarCheck], ['/favorites', 'Saved', 'ที่บันทึก', Heart], ['/profile', 'Profile', 'โปรไฟล์', User],
]

export function UserLayout() {
  const { pathname } = useLocation()
  const { role, setRole, t } = useStore()
  useEffect(() => { if (role !== 'user') setRole('user') }, [role, setRole])
  // Detail pages own the bottom of the screen (sticky CTA), so hide the tab bar there.
  const hideBottom = /^\/(promotion|chat|booking)\//.test(pathname) || /^\/clinic\/c\d+/.test(pathname)
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {userNav.slice(0, 4).map(([to, en, th]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => cx('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-sub hover:text-ink')}>{t(en, th)}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/clinic/onboarding" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 lg:block">{t('For Clinics', 'สำหรับคลินิก')}</Link>
            <LangToggle />
            <Link to="/profile" className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm font-semibold hover:bg-zinc-50">
              <Avatar name={ME.name} className="size-8 text-xs" /><span className="hidden sm:inline">{ME.name.split(' ')[0]}</span>
            </Link>
          </div>
        </div>
      </header>
      <main className={cx(!hideBottom && 'pb-24 md:pb-0')}><Outlet /></main>
      <footer className="hidden border-t border-line bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-sub">
          <Logo /><span>© 2026 ProFind · {t('Prototype for demonstration — all clinics & data are fictional', 'ต้นแบบสำหรับการสาธิต — คลินิกและข้อมูลทั้งหมดเป็นข้อมูลสมมติ')}</span>
        </div>
      </footer>
      {!hideBottom && (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
          <div className="grid grid-cols-5">
            {userNav.map(([to, en, th, Icon]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-brand-700' : 'text-sub')}>
                <Icon className="size-[22px]" />{t(en, th)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

const clinicNav = [
  ['/clinic', 'Dashboard', 'แดชบอร์ด', LayoutDashboard], ['/clinic/promotions', 'Promotions', 'โปรโมชั่น', Tag], ['/clinic/bookings', 'Bookings', 'การจอง', CalendarCheck],
  ['/clinic/customers', 'Customers', 'ลูกค้า', Users], ['/clinic/analytics', 'Analytics', 'สถิติ', BarChart3], ['/clinic/advertising', 'Advertising', 'โฆษณา', Megaphone],
  ['/clinic/profile', 'Clinic Profile', 'โปรไฟล์คลินิก', Store], ['/clinic/onboarding', 'Verification', 'การยืนยันตัวตน', ShieldCheck],
]
const adminNav = [['/admin', 'Dashboard', 'แดชบอร์ด', LayoutDashboard], ['/admin/clinics', 'Clinic Verification', 'ตรวจสอบคลินิก', BadgeCheck], ['/admin/promotions', 'Promotion Moderation', 'ตรวจสอบโปรโมชั่น', ClipboardCheck]]

export function PortalLayout({ kind }) {
  const [open, setOpen] = useState(false)
  const store = useStore()
  const { t } = store
  const isClinic = kind === 'clinic'
  const nav = isClinic ? clinicNav : adminNav
  const pendingBookings = store.bookings.filter(b => b.clinicId === 'c1' && b.status === 'Pending').length
  const pendingAdmin = store.applications.filter(a => a.status === 'Pending').length + store.promotions.filter(p => p.status === 'Pending').length
  useEffect(() => { if (store.role !== kind) store.setRole(kind) }, [kind, store.role, store.setRole])
  const account = isClinic
    ? { name: 'Glow Clinic', sub: t('Owner · Dr. Mai', 'เจ้าของ · พญ.ใหม่') }
    : { name: 'ProFind Admin', sub: t('Operations', 'ฝ่ายปฏิบัติการ') }

  const links = (
    <nav className="flex flex-col gap-0.5">
      {nav.map(([to, en, th, Icon]) => (
        <NavLink key={to} to={to} end onClick={() => setOpen(false)}
          className={({ isActive }) => cx('flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition', isActive ? 'bg-brand-600 text-ink' : 'text-zinc-600 hover:bg-zinc-100 hover:text-ink')}>
          <Icon className="size-[18px]" />{t(en, th)}
          {to === '/clinic/bookings' && pendingBookings > 0 && <span className="ml-auto rounded-full bg-accent-500 px-1.5 text-xs text-white">{pendingBookings}</span>}
          {to === '/admin/clinics' && pendingAdmin > 0 && <span className="ml-auto rounded-full bg-accent-500 px-1.5 text-xs text-white">{store.applications.filter(a => a.status === 'Pending').length}</span>}
        </NavLink>
      ))}
    </nav>
  )
  const accountBox = (
    <div className="mt-auto rounded-2xl border border-line p-3">
      <div className="flex items-center gap-3">
        <Avatar name={account.name} className="size-9 text-xs" />
        <div className="min-w-0 text-sm"><div className="truncate font-bold">{account.name}</div><div className="truncate text-xs text-sub">{account.sub}</div></div>
      </div>
      {isClinic && <div className={cx('mt-2 flex items-center gap-1 text-xs font-semibold', store.clinicStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700')}><CheckCircle2 className="size-3.5" /> {store.clinicStatus === 'Verified' ? t('Verified Clinic', 'คลินิกยืนยันแล้ว') : t('Verification Pending', 'รอการยืนยันตัวตน')}</div>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link to="/login" className="flex items-center gap-1.5 text-xs font-semibold text-sub hover:text-ink"><LogOut className="size-3.5" />{t('Switch account', 'สลับบัญชี')}</Link>
        <LangToggle />
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-zinc-50 lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-line bg-white p-4 lg:flex">
        <div className="px-2 pt-1"><Logo to={isClinic ? '/clinic' : '/admin'} sub={isClinic ? 'Clinic' : 'Admin'} /></div>
        {links}
        {accountBox}
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo to={isClinic ? '/clinic' : '/admin'} sub={isClinic ? 'Clinic' : 'Admin'} />
        <button onClick={() => setOpen(true)} aria-label={t('Open menu', 'เปิดเมนู')} className="grid size-10 place-items-center rounded-xl hover:bg-zinc-100"><Menu className="size-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="anim-pop absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-white p-4">
            <div className="flex items-center justify-between px-2"><Logo sub={isClinic ? 'Clinic' : 'Admin'} /><button onClick={() => setOpen(false)} aria-label={t('Close menu', 'ปิดเมนู')}><X className="size-5" /></button></div>
            {links}{accountBox}
          </div>
        </div>
      )}
      <main className="min-w-0 flex-1 pb-24 lg:pb-10"><Outlet /></main>
      {/* mobile bottom nav: first 5 entries */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <div className={cx('grid', isClinic ? 'grid-cols-5' : 'grid-cols-3')}>
          {nav.slice(0, 5).map(([to, en, th, Icon]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-brand-700' : 'text-sub')}>
              <Icon className="size-5" /><span className="max-w-full truncate px-1">{t(en.split(' ')[0], th)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export const PageHeader = ({ title, sub, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h1>{sub && <p className="mt-1 text-sub">{sub}</p>}</div>
    {action}
  </div>
)
export const Page = ({ children, className }) => <div className={cx('mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8', className)}>{children}</div>

const HOME = { user: '/', clinic: '/clinic', admin: '/admin' }

export function DemoSwitcher() {
  const [open, setOpen] = useState(false)
  const { role, setRole, pitch, togglePitch, reset, toast, t } = useStore()
  const ROLE = { user: t('User', 'ผู้ใช้'), clinic: t('Clinic', 'คลินิก'), admin: t('Admin', 'แอดมิน') }
  const nav = useNavigate()
  const go = r => { setRole(r); nav(HOME[r]); setOpen(false) }
  return (
    <div className="fixed bottom-20 right-3 z-[60] md:bottom-5 md:right-5">
      {open && (
        <div className="anim-pop mb-2 w-60 rounded-2xl border border-line bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wide text-sub">{t('Demo Mode', 'โหมดสาธิต')} <button onClick={() => setOpen(false)} aria-label={t('Close', 'ปิด')}><X className="size-4" /></button></div>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
            {['user', 'clinic', 'admin'].map(r => (
              <button key={r} onClick={() => go(r)} className={cx('rounded-lg py-2 text-sm font-semibold capitalize', role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-sub')}>{ROLE[r]}</button>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl px-1 py-1.5 text-sm font-semibold">
            {t('Pitch notes', 'โน้ตสำหรับนำเสนอ')} <input type="checkbox" checked={pitch} onChange={togglePitch} className="size-4 accent-brand-600" />
          </label>
          <div className="flex items-center justify-between px-1 py-1.5 text-sm font-semibold">{t('Language', 'ภาษา')} <LangToggle /></div>
          <button onClick={() => { reset(); nav('/'); toast(t('Demo data reset', 'รีเซ็ตข้อมูลสาธิตแล้ว')) }} className="flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-sm font-semibold text-sub hover:text-ink">
            <RotateCcw className="size-4" />{t('Reset demo data', 'รีเซ็ตข้อมูลสาธิต')}
          </button>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} className="ml-auto flex h-10 items-center gap-2 rounded-full bg-ink px-3.5 text-xs font-bold text-white shadow-lg">
        <FlaskConical className="size-4" />{t('Demo', 'สาธิต')} · <span>{ROLE[role]}</span>
      </button>
    </div>
  )
}

export function Toast() {
  const { toastMsg } = useStore()
  if (!toastMsg) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4" role="status">
      <div className="anim-pop flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xl"><CheckCircle2 className="size-4 text-brand-300" />{toastMsg}</div>
    </div>
  )
}
