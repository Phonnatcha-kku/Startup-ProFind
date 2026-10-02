import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ArrowUpDown, List, Map as MapIcon, Megaphone, ThumbsUp, Navigation, Info } from 'lucide-react'
import { useStore } from '../store'
import { SearchBar, CategoryChips, FilterPanel, MapMock, activeFilterCount } from '../components/search'
import { ClinicCard, ResultSkeleton } from '../components/cards'
import { Modal, Button, EmptyState, ErrorState, PitchNote, cx } from '../components/ui'
import { ChatModal, BookingModal } from '../components/flows'
import { DEFAULT_FILTERS, rank } from '../utils/logic'

// [English, Thai]
const SORT_LABEL = {
  recommended: ['Recommended', 'แนะนำ'], price: ['Price: low to high', 'ราคา: ต่ำไปสูง'], distance: ['Nearest', 'ใกล้ที่สุด'],
  rating: ['Top rated', 'คะแนนสูงสุด'], discount: ['Biggest discount', 'ส่วนลดมากที่สุด'],
}
const GROUP_META = {
  Sponsored: [Megaphone, ['Sponsored', 'โปรโมต (Sponsored)'], ['Paid placement · clearly labelled, not a quality ranking', 'ตำแหน่งที่คลินิกชำระเงิน · ระบุชัดเจน ไม่ใช่การจัดอันดับคุณภาพ'], 'text-amber-700'],
  Recommended: [ThumbsUp, ['Recommended', 'แนะนำสำหรับคุณ'], ['Best match on rating, reviews, distance & deal', 'ตรงที่สุดตามคะแนน รีวิว ระยะทาง และดีล'], 'text-brand-700'],
  Nearby: [Navigation, ['Nearby', 'ใกล้คุณ'], ['More results sorted by distance', 'ผลลัพธ์อื่นเรียงตามระยะทาง'], 'text-sub'],
  'All results': [List, ['All results', 'ผลลัพธ์ทั้งหมด'], null, 'text-sub'],
}

export default function Search() {
  const { listings, clinicById, t } = useStore()
  const [params, setParams] = useSearchParams()
  const [f, setF] = useState(() => ({ ...DEFAULT_FILTERS, q: params.get('q') || '', treatments: params.get('cat') ? [params.get('cat')] : [] }))
  const [draft, setDraft] = useState(f)
  const [sheet, setSheet] = useState(null) // 'filter' | 'sort'
  const [sort, setSort] = useState('recommended')
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)
  const [chat, setChat] = useState(null)
  const [book, setBook] = useState(null)

  // Simulated network latency so the skeleton state is visible in demos.
  useEffect(() => { setLoading(true); const timer = setTimeout(() => setLoading(false), 550); return () => clearTimeout(timer) }, [f, sort])
  useEffect(() => { const q = params.get('q') || ''; setF(p => (p.q === q ? p : { ...p, q })) }, [params])

  const { groups, total } = useMemo(() => rank(listings, f, sort), [listings, f, sort])
  const flat = groups.flatMap(g => g[1])
  const failed = f.q.trim().toLowerCase() === 'error' // demo hook for the error state
  const nFilters = activeFilterCount(f)
  const resultCount = t(<><b className="text-ink">{loading ? '…' : total}</b> promotions{f.q && <> for “<b className="text-ink">{f.q}</b>”</>}</>,
    <>พบ <b className="text-ink">{loading ? '…' : total}</b> โปรโมชั่น{f.q && <> สำหรับ “<b className="text-ink">{f.q}</b>”</>}</>)
  const toggleCat = c => setF(p => ({ ...p, treatments: p.treatments.includes(c) ? p.treatments.filter(x => x !== c) : [c] }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
      <div className="mb-4"><SearchBar size="sm" initialQ={f.q} key={f.q} onSearch={q => { setParams(q ? { q } : {}); setF(p => ({ ...p, q })) }} /></div>
      <div className="mb-4"><CategoryChips active={f.treatments} onPick={toggleCat} dense /></div>

      <div className="flex gap-6">
        <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-72 shrink-0 overflow-y-auto rounded-2xl border border-line bg-white p-5 lg:block">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{t('Filters', 'ตัวกรอง')}</h2>
            {nFilters > 0 && <button onClick={() => setF({ ...DEFAULT_FILTERS, q: f.q })} className="text-sm font-semibold text-brand-700">{t('Clear all', 'ล้างทั้งหมด')}</button>}</div>
          <FilterPanel f={f} set={setF} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-16 z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-line bg-canvas/95 px-4 py-2.5 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => { setDraft(f); setSheet('filter') }}>
              <SlidersHorizontal className="size-4" />{t('Filter', 'ตัวกรอง')}{nFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] text-ink">{nFilters}</span>}
            </Button>
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setSheet('sort')}><ArrowUpDown className="size-4" />{t('Sort', 'เรียง')}</Button>
            <p className="hidden text-sm text-sub md:block">{resultCount}</p>
            <select value={sort} onChange={e => setSort(e.target.value)} aria-label={t('Sort', 'เรียงลำดับ')} className="ml-auto hidden h-9 rounded-xl border border-line bg-white px-3 text-sm font-semibold md:block">
              {Object.entries(SORT_LABEL).map(([k, l]) => <option key={k} value={k}>{t('Sort', 'เรียง')}: {t(...l)}</option>)}
            </select>
            <div className="ml-auto flex rounded-xl border border-line bg-white p-0.5 md:ml-0">
              {[['list', List, t('List', 'รายการ')], ['map', MapIcon, t('Map', 'แผนที่')]].map(([k, Icon, l]) => (
                <button key={k} onClick={() => setView(k)} className={cx('flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold', view === k ? 'bg-ink text-white' : 'text-sub')}><Icon className="size-4" />{l}</button>
              ))}
            </div>
          </div>
          <p className="mb-3 text-sm text-sub md:hidden">{resultCount}</p>

          {failed ? <ErrorState onRetry={() => setF(p => ({ ...p, q: '' }))} />
            : loading ? <div className="space-y-4">{[0, 1, 2].map(i => <ResultSkeleton key={i} />)}</div>
            : total === 0 ? (
              <EmptyState title={t('No Promotions Found', 'ไม่พบโปรโมชั่น')} body={t('Try widening the price range, distance, or removing a few filters.', 'ลองขยายช่วงราคา ระยะทาง หรือลดตัวกรองบางรายการ')}
                action={<Button variant="outline" onClick={() => setF({ ...DEFAULT_FILTERS })}>{t('Reset filters', 'รีเซ็ตตัวกรอง')}</Button>} />
            ) : view === 'map' ? (
              <MapMock items={flat} height="h-[calc(100dvh-16rem)] min-h-[420px]" />
            ) : (
              <div className="space-y-8">
                {groups.map(([name, items]) => items.length > 0 && (
                  <section key={name}>
                    <GroupHeader name={name} count={items.length} />
                    {name === 'Sponsored' && (
                      <PitchNote title={t('Pitch: Sponsored placement = revenue', 'นำเสนอ: ตำแหน่งโปรโมต = รายได้')} className="mb-3">
                        {t(<>Optional for clinics: an ad package (<b>฿2,000/week</b>) or <b>CPC ฿5/click</b> puts a promo here only for the period paid. It's always labelled <b>Sponsored</b> and capped at 2 slots — the organic ranking below is untouched, so users keep trusting results.</>,
                          <>เป็นทางเลือกของคลินิก: ซื้อแพ็กเกจโฆษณา (<b>฿2,000/สัปดาห์</b>) หรือ <b>CPC คลิกละ ฿5</b> เพื่อแสดงตรงนี้เฉพาะช่วงเวลาที่จ่าย โดยมีป้าย <b>โปรโมต</b> เสมอและจำกัดไม่เกิน 2 ตำแหน่ง — อันดับปกติด้านล่างไม่ถูกแทรกแซง ผู้ใช้จึงยังเชื่อถือผลการค้นหาได้</>)}
                      </PitchNote>
                    )}
                    <div className="space-y-4">{items.map(i => <ClinicCard key={i.id} item={i} onChat={setChat} />)}</div>
                  </section>
                ))}
                <p className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs text-sub ring-1 ring-line"><Info className="mt-px size-4 shrink-0" />{t('How ranking works: Sponsored results are paid and always labelled. Recommended and Nearby are ranked only by rating, review count, distance and discount — clinics cannot pay to change them.', 'วิธีจัดอันดับ: ผลลัพธ์โปรโมตเป็นตำแหน่งที่ชำระเงินและมีป้ายกำกับเสมอ ส่วน "แนะนำ" และ "ใกล้คุณ" จัดอันดับจากคะแนน จำนวนรีวิว ระยะทาง และส่วนลดเท่านั้น — คลินิกไม่สามารถจ่ายเงินเพื่อเปลี่ยนอันดับได้')}</p>
              </div>
            )}
        </div>
      </div>

      <Modal open={sheet === 'filter'} onClose={() => setSheet(null)} title={t('Filter', 'ตัวกรอง')}
        footer={<div className="flex gap-2"><Button variant="outline" size="lg" onClick={() => setDraft({ ...DEFAULT_FILTERS, q: f.q })}>{t('Reset', 'รีเซ็ต')}</Button><Button size="lg" className="flex-1" onClick={() => { setF(draft); setSheet(null) }}>{t('Apply Filters', 'ใช้ตัวกรอง')}</Button></div>}>
        <FilterPanel f={draft} set={setDraft} />
      </Modal>
      <Modal open={sheet === 'sort'} onClose={() => setSheet(null)} title={t('Sort by', 'เรียงตาม')}>
        <div className="-my-2">
          {Object.entries(SORT_LABEL).map(([k, l]) => (
            <label key={k} className="flex h-12 cursor-pointer items-center justify-between border-b border-line text-[15px] font-semibold last:border-0">
              {t(...l)}<input type="radio" name="sort" checked={sort === k} onChange={() => { setSort(k); setSheet(null) }} className="size-5 accent-brand-600" />
            </label>
          ))}
        </div>
      </Modal>
      {chat && <ChatModal open clinic={clinicById(chat.clinicId)} promo={chat} onClose={() => setChat(null)} onBook={() => { setBook(chat); setChat(null) }} />}
      {book && <BookingModal open promo={book} onClose={() => setBook(null)} />}
    </div>
  )
}

function GroupHeader({ name, count }) {
  const { t } = useStore()
  const [Icon, label, sub, color] = GROUP_META[name]
  return (
    <div className="mb-3 flex items-center gap-3 border-b border-line pb-2">
      <Icon className={cx('size-5', color)} />
      <div className="flex-1"><h2 className="font-bold">{t(...label)} <span className="font-normal text-sub">· {count}</span></h2>{sub && <p className="text-xs text-sub">{t(...sub)}</p>}</div>
    </div>
  )
}
