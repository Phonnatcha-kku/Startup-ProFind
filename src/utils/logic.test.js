import test from 'node:test'
import assert from 'node:assert/strict'
import { discountPct, rank, DEFAULT_FILTERS, withSponsor, isLive } from './logic.js'
import { promotions, clinics, campaigns } from '../data/mock.js'

const items = withSponsor(promotions, campaigns).map(p => ({ ...p, clinic: clinics.find(c => c.id === p.clinicId) }))

test('discount', () => assert.equal(discountPct(4500, 2999), 33))

test('demo search: Botox < ฿5,000 within 5 km', () => {
  const { groups, total } = rank(items, { ...DEFAULT_FILTERS, q: 'botox', maxPrice: 5000, distance: 5 })
  const all = groups.flatMap(g => g[1])
  assert.equal(all.length, total)
  assert.equal(new Set(all).size, all.length, 'no duplicates across groups')
  assert.equal(groups[0][0], 'Sponsored')
  assert.ok(groups[0][1].every(i => i.sponsored), 'sponsored slot only holds sponsored items')
  assert.equal(groups[0][1][0].id, 'p1', 'Glow Clinic Botox is the sponsored demo result')
  assert.ok(all.every(i => i.price <= 5000 && i.clinic.distance <= 5 && i.treatment === 'Botox'))
})

test('ad package only lifts a promo for the days bought', () => {
  const c = { promoId: 'p1', start: '2026-10-01', days: 7 }
  assert.ok(isLive(c, '2026-10-01') && isLive(c, '2026-10-07'))
  assert.ok(!isLive(c, '2026-10-08'), 'expired the day after the week ends')
  assert.equal(withSponsor(promotions, [c], '2026-10-08').find(p => p.id === 'p1').sponsored, false)
})
