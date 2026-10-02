// All data below is fictional. Distances/coordinates are mocked (no GPS).
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`

export const IMG = {
  Botox: u('1570172619644-dfd03ed5d881'),
  Filler: u('1616394584738-fc6e612e71b9'),
  Laser: u('1629909613654-28e377c37b09'),
  Facial: u('1519823551278-64ac92734fb1'),
  Skin: u('1596755389378-c31d21fd1273'),
  Body: u('1540555700478-4be289fbecef'),
  Hair: u('1560750588-73207b1ef5b8'),
  Other: u('1522335789203-aabd1fc54bc9'),
  hero: u('1487412947147-5cebf100ffc2', 1600),
}
// Second image per category so neighbouring cards don't repeat.
const ALT = {
  Botox: u('1487412947147-5cebf100ffc2'), Facial: u('1600334089648-b0d9d3028eb2'), Laser: u('1576091160550-2173dba999ef'),
  Skin: u('1512290923902-8a9f81dc236c'), Filler: u('1522335789203-aabd1fc54bc9'), Body: u('1519823551278-64ac92734fb1'), Hair: u('1540555700478-4be289fbecef'),
}
const seen = {}

export const CATEGORIES = ['Botox', 'Filler', 'Laser', 'Facial', 'Skin', 'Body', 'Hair', 'Other']

// Thai display labels for enum-like values (categories, promo types, statuses, documents).
// Values stay English internally; the UI translates via store.tl().
export const ENUM_TH = {
  Botox: 'โบท็อกซ์', Filler: 'ฟิลเลอร์', Laser: 'เลเซอร์', Facial: 'ทรีตเมนต์หน้า', Skin: 'ดูแลผิว', Body: 'กระชับสัดส่วน', Hair: 'เส้นผม/กำจัดขน', Other: 'อื่นๆ',
  Discount: 'ส่วนลด', Bundle: 'แพ็กเกจ', 'Flash Deal': 'แฟลชดีล', 'New Customer': 'ลูกค้าใหม่', Sponsored: 'โปรโมต',
  Active: 'เปิดใช้งาน', Confirmed: 'ยืนยันแล้ว', Verified: 'ยืนยันแล้ว', Completed: 'เสร็จสิ้น', Running: 'กำลังแสดงผล', Approved: 'อนุมัติแล้ว',
  Pending: 'รอดำเนินการ', Draft: 'ฉบับร่าง', Paused: 'หยุดชั่วคราว', Expired: 'หมดอายุ', Cancelled: 'ยกเลิก', Rejected: 'ไม่อนุมัติ',
  'Business Registration': 'หนังสือรับรองนิติบุคคล', 'Clinic License': 'ใบอนุญาตประกอบกิจการสถานพยาบาล', 'Medical License': 'ใบประกอบวิชาชีพเวชกรรม',
  Deposit: 'มัดจำ', Full: 'ชำระเต็มจำนวน', 'Credit / Debit Card': 'บัตรเครดิต / เดบิต', PromptPay: 'พร้อมเพย์',
}
export const PROMO_TYPES = ['Discount', 'Bundle', 'Flash Deal', 'New Customer', 'Sponsored']

const covers = [
  u('1629909613654-28e377c37b09', 1200), u('1519494026892-80bbd2d6fd0d', 1200), u('1600334089648-b0d9d3028eb2', 1200),
  u('1512290923902-8a9f81dc236c', 1200), u('1576091160550-2173dba999ef', 1200), u('1560750588-73207b1ef5b8', 1200),
]

export const clinics = [
  { id: 'c1', name: 'Glow Clinic', area: 'Siam, Pathum Wan', distance: 1.2, rating: 4.8, reviews: 1245, x: 44, y: 38, since: 2016, doctors: 6 },
  { id: 'c2', name: 'SkinLab Aesthetic', area: 'Thong Lo, Watthana', distance: 2.4, rating: 4.7, reviews: 862, x: 70, y: 44, since: 2018, doctors: 4 },
  { id: 'c3', name: 'Prime Aesthetic', area: 'Asok, Watthana', distance: 0.8, rating: 4.6, reviews: 540, x: 56, y: 58, since: 2019, doctors: 3 },
  { id: 'c4', name: 'Beauty House', area: 'Ari, Phaya Thai', distance: 4.8, rating: 4.5, reviews: 390, x: 30, y: 14, since: 2015, doctors: 3 },
  { id: 'c5', name: 'Lumière Skin Clinic', area: 'Silom, Bang Rak', distance: 3.1, rating: 4.9, reviews: 1502, x: 32, y: 72, since: 2012, doctors: 8 },
  { id: 'c6', name: 'Dr. Nara Clinic', area: 'Lat Phrao', distance: 7.5, rating: 4.4, reviews: 211, x: 84, y: 12, since: 2020, doctors: 2 },
  { id: 'c7', name: 'Seoulful Beauty', area: 'Ekkamai, Watthana', distance: 2.9, rating: 4.7, reviews: 678, x: 76, y: 62, since: 2017, doctors: 4 },
  { id: 'c8', name: 'Aura Derma', area: 'Bang Na', distance: 9.2, rating: 4.3, reviews: 154, x: 88, y: 86, since: 2021, doctors: 2 },
  { id: 'c9', name: 'The Skin Studio', area: 'Chit Lom, Pathum Wan', distance: 1.9, rating: 4.6, reviews: 433, x: 60, y: 30, since: 2018, doctors: 3 },
  { id: 'c10', name: 'Velvet Clinic', area: 'Ratchada, Din Daeng', distance: 5.6, rating: 4.2, reviews: 98, x: 62, y: 10, since: 2022, doctors: 2 },
].map((c, i) => ({
  ...c,
  verified: true,
  cover: covers[i % covers.length],
  closedSunday: i % 3 !== 0,
  hours: i % 3 === 0 ? { en: '10:00 – 20:00 daily', th: 'ทุกวัน 10:00 – 20:00 น.' } : { en: 'Mon–Sat 11:00 – 21:00', th: 'จ.–ส. 11:00 – 21:00 น.' },
  phone: `02-${100 + i * 37}-${4000 + i * 211}`,
  about: {
    en: `${c.name} is a licensed aesthetic clinic in ${c.area.split(',')[0]} with ${c.doctors} board-certified doctors. We focus on natural-looking results, transparent pricing and FDA-approved products only.`,
    th: `${c.name} คลินิกเวชกรรมความงามที่ได้รับอนุญาตถูกต้อง ย่าน ${c.area.split(',')[0]} มีแพทย์ผู้เชี่ยวชาญ ${c.doctors} ท่าน เน้นผลลัพธ์เป็นธรรมชาติ ราคาโปร่งใส และใช้ผลิตภัณฑ์ที่ผ่าน อย. เท่านั้น`,
  },
}))

const dur = x => ({ en: `${x} min`, th: `${x} นาที` })
const P = (id, clinicId, title, treatment, originalPrice, price, type, extra = {}) => ({
  id, clinicId, title, treatment, originalPrice, price, type,
  sponsored: false, status: 'Active',
  validUntil: '2026-10-31', duration: dur('30–45'),
  image: (seen[treatment] = (seen[treatment] || 0) + 1) % 2 === 0 && ALT[treatment] ? ALT[treatment] : IMG[treatment],
  views: 400 + ((originalPrice * 7) % 2600), clicks: 40 + ((price * 3) % 380), bookings: 3 + (price % 29),
  description: {
    en: `${title} performed by certified doctors using genuine, traceable products. Includes consultation and aftercare follow-up.`,
    th: `${title} ทำโดยแพทย์ผู้เชี่ยวชาญ ใช้ผลิตภัณฑ์แท้ ตรวจสอบล็อตได้ รวมค่าปรึกษาแพทย์และการติดตามผลหลังทำ`,
  },
  includes: [
    { en: 'Doctor consultation', th: 'ปรึกษาแพทย์ก่อนทำ' }, { en: 'Numbing cream', th: 'ครีมชา' },
    { en: 'Genuine product (batch verified)', th: 'ผลิตภัณฑ์แท้ (ตรวจสอบล็อตได้)' }, { en: 'Free follow-up within 14 days', th: 'ติดตามผลฟรีภายใน 14 วัน' },
  ],
  terms: [
    { en: 'Valid for new and existing customers unless stated', th: 'ใช้ได้ทั้งลูกค้าใหม่และลูกค้าเดิม เว้นแต่ระบุไว้' },
    { en: 'Please book at least 24 hours in advance', th: 'กรุณาจองล่วงหน้าอย่างน้อย 24 ชั่วโมง' },
    { en: 'Deposit is refundable up to 24 hours before appointment', th: 'คืนเงินมัดจำได้หากยกเลิกก่อนนัดอย่างน้อย 24 ชั่วโมง' },
    { en: 'Cannot be combined with other promotions', th: 'ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่นได้' },
  ],
  ...extra,
})

export const promotions = [
  P('p1', 'c1', 'Botox 100 Units', 'Botox', 4500, 2999, 'Flash Deal', { brand: 'Botulax (Korea)', duration: dur('20–30'), views: 2840, clicks: 426, bookings: 64 }),
  P('p2', 'c1', 'HydraFacial Signature', 'Facial', 3500, 1990, 'New Customer'),
  P('p3', 'c1', 'Ultherapy 300 Lines', 'Skin', 32000, 19900, 'Discount', { duration: dur('60–90') }),
  P('p4', 'c2', 'Botox Jawline 50 Units', 'Botox', 3900, 2490, 'Discount'),
  P('p5', 'c2', 'Pico Laser Full Face', 'Laser', 5900, 3490, 'Bundle'),
  P('p6', 'c3', 'Filler Restylane 1cc', 'Filler', 12900, 8900, 'Discount'),
  P('p7', 'c3', 'Botox 100 Units (Allergan)', 'Botox', 6500, 4290, 'Discount', { brand: 'Allergan (USA)' }),
  P('p8', 'c4', 'Acne Clear Program × 5', 'Skin', 8500, 4990, 'Bundle'),
  P('p9', 'c4', 'Laser Hair Removal Underarm × 10', 'Hair', 6900, 2990, 'Bundle'),
  P('p10', 'c5', 'Profhilo 2 Syringes', 'Skin', 22000, 15900, 'Discount'),
  P('p11', 'c5', 'Lip Filler 1cc', 'Filler', 13900, 9900, 'New Customer'),
  P('p12', 'c6', 'Botox Forehead 50 Units', 'Botox', 3200, 1899, 'Flash Deal'),
  P('p13', 'c7', 'Korean Glass Skin Facial', 'Facial', 2900, 1590, 'Discount'),
  P('p14', 'c7', 'Thread Lift V-Shape', 'Other', 25000, 17900, 'Bundle', { duration: dur('60') }),
  P('p15', 'c8', 'CoolSculpting Body 1 Area', 'Body', 18000, 12900, 'Discount', { duration: dur('60') }),
  P('p16', 'c8', 'Emsculpt NEO × 4', 'Body', 32000, 19900, 'Bundle'),
  P('p17', 'c9', 'Laser Toning × 5', 'Laser', 7500, 3990, 'Bundle'),
  P('p18', 'c9', 'Hair Regrowth PRP', 'Hair', 9800, 5900, 'New Customer'),
  P('p19', 'c10', 'Botox Masseter 100 Units', 'Botox', 5500, 3290, 'Discount'),
  P('p20', 'c5', 'Aqua Peel + LED', 'Facial', 1800, 990, 'Flash Deal'),
]

export const users = [
  { id: 'u1', name: 'Ploy Siriwan', email: 'ploy@example.com' },
  ...['Nam Kanda', 'Beam Pattara', 'Fah Nicha', 'Ice Thanaporn', 'Mew Supitcha', 'Pang Arisa', 'Tan Kittipat', 'Mind Warin', 'Bow Chayanin']
    .map((name, i) => ({ id: `u${i + 2}`, name, email: `${name.split(' ')[0].toLowerCase()}@example.com` })),
]

// 20 bookings — dates around "today" (2026-09-28). u1 is the demo user.
const B = (n, userId, promoId, date, time, status, pay = 'Deposit') => {
  const p = promotions.find(x => x.id === promoId)
  return { id: `PF-2026-${String(n).padStart(5, '0')}`, userId, promoId, clinicId: p.clinicId, date, time, status, payment: pay, amount: p.price, paid: pay === 'Deposit' ? 500 : p.price, method: 'PromptPay', createdAt: date }
}
export const bookings = [
  B(101, 'u1', 'p2', '2026-10-06', '11:30', 'Confirmed'),
  B(102, 'u1', 'p13', '2026-09-14', '15:00', 'Completed', 'Full'),
  B(103, 'u1', 'p17', '2026-08-30', '13:00', 'Cancelled'),
  B(104, 'u2', 'p1', '2026-10-02', '10:00', 'Pending'),
  B(105, 'u3', 'p1', '2026-10-03', '13:00', 'Pending'),
  B(106, 'u4', 'p2', '2026-10-01', '17:30', 'Confirmed'),
  B(107, 'u5', 'p1', '2026-09-27', '15:00', 'Completed', 'Full'),
  B(108, 'u6', 'p3', '2026-09-25', '11:30', 'Completed'),
  B(109, 'u7', 'p1', '2026-09-22', '10:00', 'Completed', 'Full'),
  B(110, 'u8', 'p2', '2026-09-20', '13:00', 'Cancelled'),
  B(111, 'u9', 'p1', '2026-10-08', '15:00', 'Confirmed'),
  B(112, 'u10', 'p2', '2026-10-09', '17:30', 'Pending'),
  B(113, 'u2', 'p5', '2026-10-04', '11:30', 'Confirmed'),
  B(114, 'u3', 'p6', '2026-09-18', '13:00', 'Completed', 'Full'),
  B(115, 'u4', 'p10', '2026-10-12', '15:00', 'Confirmed'),
  B(116, 'u5', 'p11', '2026-09-10', '10:00', 'Completed'),
  B(117, 'u6', 'p15', '2026-10-15', '11:30', 'Pending'),
  B(118, 'u7', 'p19', '2026-09-05', '13:00', 'Completed', 'Full'),
  B(119, 'u8', 'p12', '2026-10-05', '17:30', 'Confirmed'),
  B(120, 'u9', 'p9', '2026-09-29', '15:00', 'Confirmed'),
]

const reviewTexts = [
  'ผลลัพธ์เป็นธรรมชาติมาก หมออธิบายละเอียด ไม่เจ็บอย่างที่คิด',
  'Clean clinic, friendly staff. Price exactly as listed on ProFind — no hidden fees.',
  'จองผ่านแอปง่ายมาก ไปถึงไม่ต้องรอนาน',
  'Doctor showed me the product box and batch number before starting. Very reassuring.',
  'ผิวดูกระจ่างใสขึ้นหลังทำ 1 สัปดาห์ จะกลับมาอีกแน่นอน',
  'Good value for the promotion. Slight bruising for 2 days but faded quickly.',
  'พนักงานบริการดี สถานที่สะอาด ที่จอดรถสะดวก',
  'Compared 4 clinics on ProFind before choosing — this one had the best reviews.',
  'Consultation was honest, they talked me out of an upsell I did not need.',
  'ราคาคุ้มค่ามาก เทียบกับที่อื่นในย่านเดียวกัน',
]
export const reviews = Array.from({ length: 30 }, (_, i) => ({
  id: `r${i + 1}`,
  clinicId: clinics[i % 10].id,
  userName: users[((i * 3) % 9) + 1].name, // never the demo user
  rating: [5, 5, 4, 5, 4, 5, 3, 5, 4, 5][i % 10],
  text: reviewTexts[i % reviewTexts.length],
  treatment: promotions.find(p => p.clinicId === clinics[i % 10].id)?.title,
  date: `2026-0${9 - (i % 3)}-${String(28 - (i % 25)).padStart(2, '0')}`,
  recommend: i % 7 !== 6,
}))

export const applications = [
  { id: 'a1', clinic: 'Serene Aesthetic', owner: 'Dr. Kamon Rattana', area: 'Sathorn', submitted: '2026-09-24', status: 'Pending', docs: ['Business Registration', 'Clinic License', 'Medical License'] },
  { id: 'a2', clinic: 'Bloom Derma Clinic', owner: 'Dr. Suda Meechai', area: 'Nonthaburi', submitted: '2026-09-22', status: 'Pending', docs: ['Business Registration', 'Clinic License', 'Medical License'] },
  { id: 'a3', clinic: 'Nova Skin Lab', owner: 'Anan Thongdee', area: 'Chiang Mai', submitted: '2026-09-19', status: 'Rejected', docs: ['Business Registration', 'Clinic License'] },
  { id: 'a4', clinic: 'Lumière Skin Clinic', owner: 'Dr. Pornpan Wong', area: 'Silom', submitted: '2026-08-02', status: 'Verified', docs: ['Business Registration', 'Clinic License', 'Medical License'] },
]

// Promotions from other clinics awaiting moderation (admin side).
export const pendingPromotions = [
  P('p21', 'c6', 'Filler Chin 2cc', 'Filler', 19800, 11900, 'Discount', { status: 'Pending', submitted: '2026-09-27' }),
  P('p22', 'c8', 'Botox 200 Units — ถูกที่สุดในไทย!', 'Botox', 12000, 1500, 'Flash Deal', { status: 'Pending', submitted: '2026-09-26', flag: { en: 'Price 88% below market — verify product authenticity', th: 'ราคาต่ำกว่าตลาด 88% — ตรวจสอบความแท้ของผลิตภัณฑ์' } }),
  P('p23', 'c4', 'Carbon Peel Laser', 'Laser', 2500, 1290, 'New Customer', { status: 'Pending', submitted: '2026-09-25' }),
  P('p24', 'c1', 'Laser Hair Removal Full Legs × 6', 'Hair', 15900, 8900, 'Bundle', { status: 'Expired', validUntil: '2026-08-31', submitted: '2026-06-01' }),
  P('p25', 'c1', 'Fat Dissolve Injection — Guaranteed -5kg', 'Body', 9900, 3900, 'Discount', { status: 'Rejected', submitted: '2026-09-10', flag: { en: 'Unverifiable medical claim ("guaranteed")', th: 'อ้างผลทางการแพทย์ที่พิสูจน์ไม่ได้ ("รับประกัน")' } }),
]

export const notifications = [
  { id: 'n1', icon: 'flame', title: { en: '🔥 New promotion near you', th: '🔥 โปรโมชั่นใหม่ใกล้คุณ' }, body: { en: 'Botox 100 Units at Glow Clinic — ฿2,999 (1.2 km)', th: 'Botox 100 Units ที่ Glow Clinic — ฿2,999 (1.2 กม.)' }, time: { en: '2h ago', th: '2 ชม.ที่แล้ว' } },
  { id: 'n2', icon: 'star', title: { en: '⭐ How was your experience?', th: '⭐ ประสบการณ์ของคุณเป็นอย่างไร?' }, body: { en: 'Rate your Korean Glass Skin Facial at Seoulful Beauty', th: 'ให้คะแนน Korean Glass Skin Facial ที่ Seoulful Beauty' }, time: { en: '1d ago', th: '1 วันที่แล้ว' } },
  { id: 'n3', icon: 'check', title: { en: '🎉 Booking confirmed', th: '🎉 ยืนยันการจองแล้ว' }, body: { en: 'Your booking at Glow Clinic on 6 Oct has been confirmed.', th: 'การจองของคุณที่ Glow Clinic วันที่ 6 ต.ค. ได้รับการยืนยันแล้ว' }, time: { en: '3d ago', th: '3 วันที่แล้ว' } },
]

// Mock time-series (last 8 weeks) for dashboards.
const WEEKS_TH = ['3 ส.ค.', '10 ส.ค.', '17 ส.ค.', '24 ส.ค.', '31 ส.ค.', '7 ก.ย.', '14 ก.ย.', '21 ก.ย.']
export const clinicTrend = ['Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'Sep 21'].map((w, i) => ({
  label: { en: w, th: WEEKS_TH[i] },
  views: [220, 260, 245, 310, 330, 390, 455, 630][i],
  clicks: [34, 41, 38, 49, 52, 58, 71, 83][i],
  bookings: [9, 11, 10, 13, 14, 17, 21, 33][i],
  revenue: [3200, 3900, 3600, 4700, 5100, 5900, 7400, 12000][i],
}))

const MONTHS_TH = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']
export const platformTrend = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({
  label: { en: m, th: MONTHS_TH[i] },
  bookings: [92, 128, 171, 210, 298, 385][i],
  revenue: [48000, 66000, 91000, 118000, 162000, 214000][i],
  users: [420, 610, 790, 980, 1320, 2120][i],
  clinics: [8, 12, 17, 21, 31, 39][i],
}))

// Monthly ProFind revenue by source (฿), from the pitch deck's revenue table.
export const revenueMix = [
  { name: { en: 'Commission', th: 'ค่าคอมมิชชั่น' }, value: 195000, note: { en: 'Required · 8% of ฿2,437,500 booking GMV', th: 'บังคับ · 8% ของยอดจอง ฿2,437,500' } },
  { name: { en: 'Ad packages', th: 'แพ็กเกจโฆษณา' }, value: 25500, note: { en: 'Optional · Sponsored ฿2,500/wk × 3 · Featured ฿6,000/mo × 3', th: 'ทางเลือก · Sponsored ฿2,500/สัปดาห์ × 3 · Featured ฿6,000/เดือน × 3' } },
  { name: { en: 'CPC', th: 'ค่าคลิก (CPC)' }, value: 15000, note: { en: 'Optional · 3,000 clicks × ฿5', th: 'ทางเลือก · 3,000 คลิก × ฿5' } },
  { name: { en: 'Subscription', th: 'ค่าสมาชิกรายเดือน' }, value: 11970, note: { en: 'Required · 30 clinics × ฿399/mo', th: 'บังคับ · 30 คลินิก × ฿399/เดือน' } },
]

// Seed ad campaigns, dated relative to today so the demo always has one running and one finished.
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
export const campaigns = [
  { id: 'cp1', promoId: 'p1', pkg: 'Sponsored Listing', area: 5, days: 7, budget: 2500, start: daysAgo(2) },
  { id: 'cp2', promoId: 'p4', pkg: 'CPC', area: 5, days: 14, budget: 1500, start: daysAgo(3) },
  { id: 'cp0', promoId: 'p2', pkg: 'Sponsored Listing', area: 5, days: 7, budget: 2500, start: daysAgo(20) },
]
