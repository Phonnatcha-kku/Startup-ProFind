import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { baht } from '../utils/logic'

// Validated categorical order (dataviz validator: CVD + contrast pass on light surface).
export const SERIES = ['#e0457b', '#5b6bd6', '#c98410', '#0d9384']
const axis = { stroke: '#8b8a96', fontSize: 12, tickLine: false, axisLine: false }
const fmt = (money, v) => (money ? baht(v) : v.toLocaleString())

function Tip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-lg">
      <div className="mb-1 font-semibold text-sub">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: p.color }} />{p.name}<b className="ml-auto pl-3">{fmt(money, p.value)}</b></div>
      ))}
    </div>
  )
}

export const Legend = ({ items }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-sub">
    {items.map((name, i) => <span key={name} className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full" style={{ background: SERIES[i], height: 3 }} />{name}</span>)}
  </div>
)

// One measure per chart (no dual axes). Pass several keys only when they share a unit.
export function TrendChart({ data, x, keys, names = keys, money, height = 240 }) {
  return (
    <div>
      {keys.length > 1 && <div className="mb-3"><Legend items={names} /></div>}
      <div style={{ height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {keys.map((k, i) => (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES[i]} stopOpacity={0.16} /><stop offset="100%" stopColor={SERIES[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#ededf1" />
            <XAxis dataKey={x} {...axis} />
            <YAxis {...axis} width={money ? 64 : 40} tickFormatter={v => (money ? `฿${v >= 1000 ? `${v / 1000}k` : v}` : v)} />
            <Tooltip content={<Tip money={money} />} cursor={{ stroke: '#cfcdd8', strokeDasharray: '3 3' }} />
            {keys.map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} name={names[i]} stroke={SERIES[i]} strokeWidth={2} fill={`url(#g-${k})`} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function BarsChart({ data, x, y, name, money, height = 240, layout = 'horizontal' }) {
  const vertical = layout === 'vertical'
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout={layout} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid horizontal={!vertical} vertical={vertical} stroke="#ededf1" />
          {vertical
            ? <><XAxis type="number" {...axis} /><YAxis type="category" dataKey={x} {...axis} width={110} /></>
            : <><XAxis dataKey={x} {...axis} /><YAxis {...axis} width={money ? 64 : 40} tickFormatter={v => (money ? `฿${v / 1000}k` : v)} /></>}
          <Tooltip content={<Tip money={money} />} cursor={{ fill: 'rgba(224,69,123,.06)' }} />
          <Bar dataKey={y} name={name ?? y[0].toUpperCase() + y.slice(1)} fill={SERIES[0]} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Part-to-whole with direct labels in an adjacent list (identity never color-alone).
export function Donut({ data, money, center }) {
  const total = data.reduce((a, d) => a + d.value, 0)
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.map((d, i) => <Cell key={d.name} fill={SERIES[i]} />)}
            </Pie>
            <Tooltip content={<Tip money={money} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><div className="text-xs text-sub">{center}</div><div className="text-lg font-extrabold">{fmt(money, total)}</div></div>
        </div>
      </div>
      <ul className="w-full space-y-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-start gap-2.5">
            <span className="mt-1 size-3 shrink-0 rounded-sm" style={{ background: SERIES[i] }} />
            <div className="flex-1"><div className="flex justify-between gap-2"><span className="font-semibold">{d.name}</span><span className="font-bold">{Math.round((d.value / total) * 100)}%</span></div>
              {d.note && <div className="text-xs text-sub">{d.note}</div>}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
