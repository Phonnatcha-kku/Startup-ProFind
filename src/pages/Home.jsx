import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Scale, CalendarCheck, Star, ArrowRight, Stethoscope, Megaphone, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { SearchBar, CAT_ICON } from '../components/search'
import { PromotionCard } from '../components/cards'
import { Img, Rating, VerifiedBadge, PitchNote, Button } from '../components/ui'
import { CATEGORIES, IMG } from '../data/mock'
import { rank, DEFAULT_FILTERS } from '../utils/logic'

export default function Home() {
  const { listings, clinics, t, tl } = useStore()
  const nav = useNavigate()
  const deals = rank(listings, DEFAULT_FILTERS, 'discount').groups.flatMap(g => g[1]).slice(0, 8)
  const nearby = [...clinics].sort((a, b) => a.distance - b.distance).slice(0, 4)

  return (
    <>
      <section className="relative overflow-hidden bg-ink">
        <Img src={IMG.hero} className="absolute inset-0 size-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/20" />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 md:px-6 md:pb-20 md:pt-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur">
            <ShieldCheck className="size-4" /> {t('120+ verified clinics · Transparent pricing', 'คลินิกยืนยันแล้ว 120+ แห่ง · ราคาโปร่งใส')}
          </div>
          <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-white md:text-5xl">
            {t(<>Find beauty clinic promotions<br /><span className="text-brand-200">near you</span></>, <>ค้นหาโปรโมชั่นคลินิกความงาม<br /><span className="text-brand-200">ใกล้คุณ</span></>)}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 md:text-lg">{t('Search treatments, promotions and clinics that suit you — compare prices, read verified reviews and book in minutes.', 'ค้นหาหัตถการ โปรโมชั่น และคลินิกที่เหมาะกับคุณ — เปรียบเทียบราคา อ่านรีวิวจริง และจองได้ในไม่กี่นาที')}</p>
          <div className="mt-7"><SearchBar /></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/75">
            {t('Popular:', 'ยอดนิยม:')}
            {['Botox', 'HydraFacial', 'Pico Laser', 'Filler'].map(q => (
              <button key={q} onClick={() => nav(`/search?q=${q}`)} className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white ring-1 ring-white/15 hover:bg-white/20">{q}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 md:px-6 md:py-12">
        <section>
          <h2 className="mb-4 text-xl font-extrabold tracking-tight md:text-2xl">{t('Browse by treatment', 'เลือกตามหัตถการ')}</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-8 md:px-0">
            {CATEGORIES.map(c => {
              const Icon = CAT_ICON[c]
              return (
                <Link key={c} to={`/search?cat=${c}`} className="group relative w-28 shrink-0 snap-start overflow-hidden rounded-2xl md:w-auto">
                  <Img src={IMG[c]} className="aspect-[4/5] w-full transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <span className="mb-1.5 grid size-8 place-items-center rounded-lg bg-white/20 backdrop-blur"><Icon className="size-4" /></span>
                    <div className="font-bold leading-tight">{tl(c)}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div><h2 className="text-xl font-extrabold tracking-tight md:text-2xl">{t('Top deals this week', 'ดีลเด็ดประจำสัปดาห์')}</h2><p className="text-sm text-sub">{t('Biggest savings from verified clinics', 'ส่วนลดสูงสุดจากคลินิกที่ยืนยันแล้ว')}</p></div>
            <Link to="/search" className="hidden items-center gap-1 text-sm font-bold text-brand-700 sm:flex">{t('See all', 'ดูทั้งหมด')} <ArrowRight className="size-4" /></Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
            {deals.map(d => <PromotionCard key={d.id} item={d} className="w-64 shrink-0 snap-start md:w-auto" />)}
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-line md:grid-cols-3 md:p-8">
          {[
            [Scale, t('Compare in one place', 'เปรียบเทียบได้ในที่เดียว'), t('No more DM-ing 10 clinics for prices. See real promo prices side by side.', 'ไม่ต้องทักถามราคาทีละคลินิกอีกต่อไป ดูราคาโปรโมชั่นจริงเทียบกันได้ทันที')],
            [ShieldCheck, t('Verified clinics only', 'เฉพาะคลินิกที่ยืนยันแล้ว'), t('Every clinic submits business & medical licences before listing.', 'ทุกคลินิกต้องส่งเอกสารธุรกิจและใบอนุญาตทางการแพทย์ก่อนลงประกาศ')],
            [CalendarCheck, t('Book & pay securely', 'จองและชำระเงินอย่างปลอดภัย'), t('Reserve with a ฿500 deposit via PromptPay. Refundable up to 24h before.', 'จองด้วยมัดจำ ฿500 ผ่านพร้อมเพย์ ขอคืนเงินได้ก่อนนัด 24 ชั่วโมง')],
          ].map(([Icon, title, d]) => (
            <div key={title} className="flex gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-6" /></div>
              <div><h3 className="font-bold">{title}</h3><p className="mt-0.5 text-sm text-sub">{d}</p></div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-extrabold tracking-tight md:text-2xl">{t('Clinics near you', 'คลินิกใกล้คุณ')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map(c => (
              <Link key={c.id} to={`/clinic/${c.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg hover:shadow-ink/5">
                <Img src={c.cover} className="aspect-[16/9] w-full" />
                <div className="p-4">
                  <div className="flex items-center gap-1.5 font-bold group-hover:text-brand-700">{c.name}<VerifiedBadge label="" /></div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-sub"><Rating value={c.rating} count={c.reviews} /> · {c.distance} {t('km', 'กม.')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <PitchNote title={t('Pitch: the problem we solve', 'นำเสนอ: ปัญหาที่เราแก้')}>
          {t(<>Users can search and compare clinic promotions in one place — instead of contacting clinic after clinic on LINE/Instagram to ask for prices.
            Try the demo: search <b>“Botox”</b>, filter <b>under ฿5,000</b> and <b>within 5 km</b>.</>,
          <>ผู้ใช้สามารถค้นหาโปรโมชั่นและเปรียบเทียบคลินิกได้ในที่เดียว แทนการทักถามราคาทีละคลินิกผ่าน LINE/Instagram
            ลองเดโม: ค้นหา <b>“Botox”</b> กรอง <b>ไม่เกิน ฿5,000</b> และ <b>ภายใน 5 กม.</b></>)}
        </PitchNote>

        <section className="overflow-hidden rounded-3xl bg-ink text-white md:flex">
          <div className="flex-1 p-8 md:p-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><Stethoscope className="size-4" />{t('For clinics', 'สำหรับคลินิก')}</div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{t('Reach customers already searching for your treatments', 'เข้าถึงลูกค้าที่กำลังค้นหาหัตถการของคุณอยู่')}</h2>
            <p className="mt-2 max-w-lg text-white/70">{t('List promotions, receive bookings with deposits, and boost visibility with Sponsored placement.', 'ลงโปรโมชั่น รับการจองพร้อมมัดจำ และเพิ่มการมองเห็นด้วยตำแหน่งโปรโมต (Sponsored)')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/clinic/onboarding" variant="primary" size="lg">{t('Join ProFind', 'สมัครเข้าร่วม ProFind')}</Button>
              <Button to="/login" variant="ghost" size="lg" className="text-white hover:bg-white/10">{t('Clinic demo login', 'เข้าสู่ระบบคลินิก (เดโม)')}</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-8 md:w-96 md:p-10">
            {[[TrendingUp, '3.2×', t('more enquiries', 'ยอดสอบถามเพิ่มขึ้น')], [CalendarCheck, '128', t('bookings / mo', 'การจอง / เดือน')], [Megaphone, '฿2,500', t('Sponsored / week', 'Sponsored / สัปดาห์')], [Star, '4.8', t('avg. partner rating', 'คะแนนเฉลี่ยพาร์ทเนอร์')]].map(([Icon, v, l]) => (
              <div key={v} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><Icon className="size-5 text-brand-300" /><div className="mt-2 text-xl font-extrabold">{v}</div><div className="text-xs text-white/60">{l}</div></div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
