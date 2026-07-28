'use client'
import { useState } from 'react'
import KpiCard from '@/components/KpiCard'

/* ── Data ── */

type SquadId = 'bond' | 'fund' | 'stock' | 'borrowlink' | 'itracker' | 'ipower' | 'ioptima'
const squadMeta: Record<SquadId, { label: string; color: string; bg: string; icon: string }> = {
  bond:       { label: 'Bond',       color: '#1d4ed8', bg: '#dbeafe', icon: '📊' },
  fund:       { label: 'Fund',       color: '#15803d', bg: '#dcfce7', icon: '💎' },
  stock:      { label: 'Stock',      color: '#b45309', bg: '#fef3c7', icon: '📈' },
  borrowlink: { label: 'BorrowLink', color: '#be185d', bg: '#fce7f3', icon: '🏦' },
  itracker:   { label: 'iTracker',   color: '#7c3aed', bg: '#ede9fe', icon: '🔔' },
  ipower:     { label: 'iPower',     color: '#0891b2', bg: '#cffafe', icon: '⚡' },
  ioptima:    { label: 'iOptima',    color: '#c2410c', bg: '#fff7ed', icon: '🎯' },
}
const squads: SquadId[] = ['bond', 'fund', 'stock', 'borrowlink', 'itracker', 'ipower', 'ioptima']

const crossSellMatrix: Record<SquadId, Record<SquadId, number | null>> = {
  bond:       { bond: null, fund: 28,   stock: 12,  borrowlink: 42, itracker: 8,    ipower: 30,  ioptima: 15 },
  fund:       { bond: 25,   fund: null, stock: 22,  borrowlink: 30, itracker: 15,   ipower: 25,  ioptima: 35 },
  stock:      { bond: 15,   fund: 18,   stock: null, borrowlink: 10, itracker: 55,  ipower: 8,   ioptima: 28 },
  borrowlink: { bond: 38,   fund: 20,   stock: 8,   borrowlink: null, itracker: 5,  ipower: 45,  ioptima: 12 },
  itracker:   { bond: 10,   fund: 12,   stock: 62,  borrowlink: 8,  itracker: null, ipower: 6,   ioptima: 22 },
  ipower:     { bond: 25,   fund: 18,   stock: 6,   borrowlink: 48, itracker: 5,   ipower: null, ioptima: 10 },
  ioptima:    { bond: 18,   fund: 40,   stock: 32,  borrowlink: 15, itracker: 20,  ipower: 12,  ioptima: null },
}

type SegmentId = 'trader' | 'conservative' | 'balanced' | 'saver' | 'newcomer' | 'dormant'
interface Segment {
  id: SegmentId
  name: string
  size: number
  pct: number
  color: string
  bundle: [SquadId, SquadId, SquadId]
  criteria: string
  crossSell: string
}

const segments: Segment[] = [
  { id: 'trader',       name: 'Active Trader',  size: 60000,  pct: 12, color: '#b45309', bundle: ['stock', 'itracker', 'ioptima'], criteria: 'Trade > 5 lần/tháng, mở bảng giá hàng ngày',             crossSell: 'Stock → iTracker (55%)' },
  { id: 'conservative', name: 'Conservative',   size: 100000, pct: 20, color: '#1d4ed8', bundle: ['bond', 'borrowlink', 'fund'],   criteria: 'Hold Bond/BorrowLink > 70% portfolio, trade < 2 lần/tháng', crossSell: 'Bond → BorrowLink (42%)' },
  { id: 'balanced',     name: 'Balanced',       size: 80000,  pct: 16, color: '#15803d', bundle: ['fund', 'bond', 'ioptima'],      criteria: 'Hold > 2 loại SP, không loại nào > 60%',                  crossSell: 'Đa dạng, ưu tiên SP chưa có' },
  { id: 'saver',        name: 'Saver',          size: 70000,  pct: 14, color: '#be185d', bundle: ['borrowlink', 'ipower', 'bond'], criteria: 'BorrowLink/iPower > 50% portfolio, ít trade',              crossSell: 'BorrowLink → iPower (45%)' },
  { id: 'newcomer',     name: 'Newcomer',       size: 90000,  pct: 18, color: '#059669', bundle: ['ipower', 'fund', 'borrowlink'], criteria: 'TK < 3 tháng, < 3 giao dịch',                            crossSell: 'Nurture SP entry thấp' },
  { id: 'dormant',      name: 'Dormant',        size: 100000, pct: 20, color: '#64748b', bundle: ['ipower', 'borrowlink', 'fund'], criteria: 'Không GD > 3 tháng, login < 2 lần/tháng',                 crossSell: 'Gentle re-engage' },
]

interface CustomerProfile {
  id: string
  name: string
  segment: SegmentId
  scores: Record<SquadId, { txn: number; portfolio: number; app: number; click: number; dismiss: number; total: number }>
  details: string
}

const customerProfiles: CustomerProfile[] = [
  {
    id: 'C1', name: 'Nguyễn Minh', segment: 'trader',
    details: 'Trade 15 lần/tháng · Portfolio 80% Stock · Xem bảng giá 4h/ngày',
    scores: {
      bond:       { txn: 5,  portfolio: 0,  app: 5,  click: 6,  dismiss: 0, total: 31 },
      fund:       { txn: 0,  portfolio: 0,  app: 2,  click: 2,  dismiss: 0, total: 18 },
      stock:      { txn: 35, portfolio: 25, app: 20, click: 12, dismiss: 0, total: 92 },
      borrowlink: { txn: 0,  portfolio: 0,  app: 0,  click: 0,  dismiss: -4, total: 4 },
      itracker:   { txn: 20, portfolio: 20, app: 16, click: 12, dismiss: 0, total: 68 },
      ipower:     { txn: 0,  portfolio: 5,  app: 1,  click: 0,  dismiss: -6, total: 8 },
      ioptima:    { txn: 10, portfolio: 8,  app: 12, click: 8,  dismiss: 0, total: 52 },
    },
  },
  {
    id: 'C2', name: 'Trần Lan', segment: 'conservative',
    details: 'Mua Bond 2 lần/quý · Portfolio 60% Bond, 25% BorrowLink · Xem trang Bond 30p/tuần',
    scores: {
      bond:       { txn: 30, portfolio: 22, app: 18, click: 12, dismiss: 0, total: 89 },
      fund:       { txn: 5,  portfolio: 3,  app: 8,  click: 4,  dismiss: 0, total: 35 },
      stock:      { txn: 0,  portfolio: 0,  app: 1,  click: 0,  dismiss: -3, total: 6 },
      borrowlink: { txn: 20, portfolio: 18, app: 10, click: 6,  dismiss: 0, total: 65 },
      itracker:   { txn: 0,  portfolio: 0,  app: 0,  click: 0,  dismiss: -3, total: 5 },
      ipower:     { txn: 8,  portfolio: 10, app: 6,  click: 4,  dismiss: 0, total: 40 },
      ioptima:    { txn: 0,  portfolio: 0,  app: 3,  click: 0,  dismiss: 0, total: 12 },
    },
  },
  {
    id: 'C3', name: 'Phạm Đức', segment: 'newcomer',
    details: 'Mới mở TK · 150M cash chưa dùng · Search "đầu tư cho người mới"',
    scores: {
      bond:       { txn: 0, portfolio: 0, app: 8,  click: 4,  dismiss: 0, total: 30 },
      fund:       { txn: 0, portfolio: 0, app: 16, click: 12, dismiss: 0, total: 58 },
      stock:      { txn: 0, portfolio: 0, app: 4,  click: 2,  dismiss: 0, total: 22 },
      borrowlink: { txn: 0, portfolio: 0, app: 6,  click: 4,  dismiss: 0, total: 28 },
      itracker:   { txn: 0, portfolio: 0, app: 2,  click: 0,  dismiss: 0, total: 15 },
      ipower:     { txn: 0, portfolio: 0, app: 14, click: 8,  dismiss: 0, total: 48 },
      ioptima:    { txn: 0, portfolio: 0, app: 10, click: 6,  dismiss: 0, total: 35 },
    },
  },
]

const todayOffers: Record<SquadId, { name: string; urgency: string }> = {
  bond:       { name: 'VPB 8.9% kỳ hạn 6T',           urgency: 'Mới phát hành' },
  fund:       { name: 'TCBF miễn phí mua — NGÀY CUỐI', urgency: 'Hết hạn hôm nay' },
  stock:      { name: 'VNM oversold — RSI < 30',       urgency: 'Tín hiệu kỹ thuật' },
  borrowlink: { name: 'BorrowLink 7.2% KH 6 tháng',   urgency: 'Lãi suất mới' },
  itracker:   { name: 'HPG +15% tuần — chốt lời?',    urgency: 'Portfolio alert' },
  ipower:     { name: 'iPower — sinh lời từ tiền nhàn', urgency: 'Không kỳ hạn' },
  ioptima:    { name: 'iOptima KM phí 0% — tuần cuối', urgency: 'Còn 3 ngày' },
}

/* ── Helpers ── */

function SquadBadge({ squad, size = 'sm' }: { squad: SquadId; size?: 'sm' | 'xs' }) {
  const m = squadMeta[squad]
  const px = size === 'xs' ? '4px 7px' : '3px 10px'
  const fs = size === 'xs' ? 9 : 10
  return <span style={{ background: m.bg, color: m.color, padding: px, borderRadius: 99, fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.label}</span>
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 24, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

/* ── Component ── */

export default function SmartBundlePanel() {
  const [selectedCustomer, setSelectedCustomer] = useState(0)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
  const customer = customerProfiles[selectedCustomer]

  const sortedSquads = [...squads].sort((a, b) => customer.scores[b].total - customer.scores[a].total)
  const topBundle = sortedSquads.slice(0, 3)

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-[14px] p-4 mb-6 text-sm text-violet-800 leading-relaxed">
        🚀 <b>Smart Bundle Engine</b> — Mô hình Alipay thu gọn cho TCBS. 7 sản phẩm submit offers → Multi-signal scoring → Re-ranking rules → Mỗi KH nhận bundle 3 offers riêng. Không squad nào mất slot, exposure tăng gấp nhiều lần.
      </div>

      {/* KPI overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard label="Loại sản phẩm" value="7" sub="C(7,3) = 35 bundles" subColor="neutral" />
        <KpiCard label="Customer segments" value="6" sub="Batch 1 lần/tuần" subColor="neutral" />
        <KpiCard label="DAU login" value="100K" sub="A/B test xong 2-3 ngày" subColor="success" />
        <KpiCard label="KH đã giao dịch" value="500K" sub="Data cho cross-sell" subColor="success" />
        <KpiCard label="Squad exposure" value="3x" sub="1 ngày/tuần → 3 ngày" subColor="success" />
      </div>

      {/* Cross-sell matrix + Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cross-sell matrix */}
        <div className="panel">
          <h3 className="text-base font-bold mb-1">📊 Cross-sell Matrix</h3>
          <p className="text-[10px] text-slate-400 mb-4">Từ 500K KH đã giao dịch: &quot;Mua X → bao nhiêu % mua Y trong 3 tháng?&quot;</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-2 py-2 text-left text-xs text-slate-400 uppercase">Đã mua ↓</th>
                  {squads.map(s => (
                    <th key={s} className="px-2 py-2 text-center"><SquadBadge squad={s} size="xs" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {squads.map(from => (
                  <tr key={from} className="border-b border-slate-100">
                    <td className="px-2 py-2"><SquadBadge squad={from} size="xs" /></td>
                    {squads.map(to => {
                      const val = crossSellMatrix[from][to]
                      if (val === null) return <td key={to} className="px-2 py-2 text-center text-slate-300 text-xs">—</td>
                      const color = val >= 35 ? '#059669' : val >= 20 ? '#d97706' : '#94a3b8'
                      return (
                        <td key={to} className="px-2 py-2 text-center">
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}%</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥ 35% (cao)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 20-34% (TB)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> &lt; 20% (thấp)</span>
          </div>
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 leading-relaxed">
            💡 <b>Insight:</b> Stock → iTracker <b>55%</b>, Bond → BorrowLink <b>42%</b>, iPower → Bond <b>38%</b>. Đây là con số ví dụ — TCBS chạy 1 câu SQL trên data thật sẽ có con số chính xác.
          </div>
        </div>

        {/* Segments */}
        <div className="panel">
          <h3 className="text-base font-bold mb-1">👥 Customer Segments</h3>
          <p className="text-[10px] text-slate-400 mb-4">500K KH phân thành 6 segments — mỗi segment map sang 1 bundle template</p>
          <div className="space-y-2">
            {segments.map(seg => (
              <div key={seg.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3" style={{ borderLeftWidth: 3, borderLeftColor: seg.color }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold" style={{ color: seg.color }}>{seg.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{seg.size.toLocaleString()} KH ({seg.pct}%)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-1.5">{seg.criteria}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 mr-1">Bundle:</span>
                    {seg.bundle.map((s, i) => (
                      <span key={s} className="flex items-center gap-0.5">
                        {i > 0 && <span className="text-slate-300 text-[9px]">→</span>}
                        <SquadBadge squad={s} size="xs" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] text-slate-400">Cross-sell</div>
                  <div className="text-[10px] text-slate-600 font-medium mt-0.5">{seg.crossSell}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-signal scoring demo */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">⚡ Multi-signal Scoring Engine</h3>
        <p className="text-[10px] text-slate-400 mb-4">Chọn KH để xem scoring chi tiết — 5 signals xếp theo độ tin cậy</p>

        {/* Signal weights legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'Giao dịch thật', weight: '35%', color: '#059669' },
            { label: 'Portfolio', weight: '25%', color: '#2563eb' },
            { label: 'App behavior', weight: '20%', color: '#d97706' },
            { label: 'Click noti', weight: '12%', color: '#64748b' },
            { label: 'Dismiss (trừ)', weight: '8%', color: '#ef4444' },
          ].map(s => (
            <span key={s.label} className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 font-medium" style={{ color: s.color }}>
              {s.label} <span className="font-bold">{s.weight}</span>
            </span>
          ))}
        </div>

        {/* Customer selector */}
        <div className="flex gap-2 mb-4">
          {customerProfiles.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedCustomer(i)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedCustomer === i
                  ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
              }`}
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-[10px] mt-0.5 font-normal opacity-70">{segments.find(s => s.id === c.segment)?.name}</div>
            </button>
          ))}
        </div>

        {/* Selected customer detail */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold">{customer.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: segments.find(s => s.id === customer.segment)?.color + '18', color: segments.find(s => s.id === customer.segment)?.color }}>
              {segments.find(s => s.id === customer.segment)?.name}
            </span>
          </div>
          <div className="text-xs text-slate-500">{customer.details}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score bars */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600">Affinity Score per Squad</span>
              <button
                onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                className="text-[10px] text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
              >
                {showScoreBreakdown ? 'Ẩn chi tiết ▲' : 'Xem chi tiết ▼'}
              </button>
            </div>
            <div className="space-y-2.5">
              {sortedSquads.map((squad, rank) => (
                <div key={squad}>
                  <div className="flex items-center gap-2 mb-1">
                    {rank < 3 && (
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        background: rank === 0 ? '#d97706' : rank === 1 ? '#64748b' : '#a8a29e',
                      }}>{rank + 1}</span>
                    )}
                    {rank >= 3 && <span style={{ width: 18 }} />}
                    <SquadBadge squad={squad} />
                    <span className="text-[10px] text-slate-400 ml-auto">{todayOffers[squad].name}</span>
                  </div>
                  <ScoreBar value={customer.scores[squad].total} color={squadMeta[squad].color} />
                  {showScoreBreakdown && (
                    <div className="flex gap-1 mt-1 ml-5">
                      {(['txn', 'portfolio', 'app', 'click', 'dismiss'] as const).map(signal => {
                        const val = customer.scores[squad][signal]
                        if (val === 0) return null
                        const colors: Record<string, string> = { txn: '#059669', portfolio: '#2563eb', app: '#d97706', click: '#64748b', dismiss: '#ef4444' }
                        const labels: Record<string, string> = { txn: 'GD', portfolio: 'Port', app: 'App', click: 'Click', dismiss: 'Skip' }
                        return (
                          <span key={signal} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: val > 0 ? colors[signal] + '15' : '#fee2e2', color: val > 0 ? colors[signal] : '#ef4444', fontWeight: 600 }}>
                            {labels[signal]} {val > 0 ? '+' : ''}{val}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bundle preview */}
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3">Bundle cho {customer.name} hôm nay</div>
            <div style={{
              width: 280, border: '2px solid #e2e8f0', borderRadius: 24, overflow: 'hidden',
              background: '#fff', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              {/* Phone header */}
              <div style={{ background: 'linear-gradient(135deg, #534AB7, #7F77DD)', padding: '14px 16px 10px', color: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>🎯 3 ưu đãi cho bạn</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>Cập nhật 09:00 · T2, 28/07</div>
              </div>
              {/* Offers */}
              {topBundle.map((squad, i) => {
                const meta = squadMeta[squad]
                const offer = todayOffers[squad]
                return (
                  <div key={squad} style={{
                    display: 'flex', gap: 10, padding: '11px 14px', alignItems: 'center',
                    borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
                    background: i === 0 ? '#faf5ff' : '#fff',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, background: meta.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
                    }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>
                        {offer.name}
                        {i === 0 && <span style={{ fontSize: 8, background: '#fee2e2', color: '#dc2626', padding: '1px 4px', borderRadius: 3, marginLeft: 4, fontWeight: 600 }}>TOP</span>}
                      </div>
                      <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{offer.urgency}</div>
                      <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600, marginTop: 2 }}>Xem chi tiết →</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: meta.color, flexShrink: 0 }}>
                      {customer.scores[squad].total}
                    </div>
                  </div>
                )
              })}
              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 0' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e2e8f0' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e2e8f0' }} />
              </div>
            </div>
            {/* Why these 3 */}
            <div className="mt-3 bg-violet-50 border border-violet-200 rounded-xl p-3 text-[10px] text-violet-700 leading-relaxed" style={{ maxWidth: 280, margin: '12px auto 0' }}>
              <b>Tại sao bundle này?</b><br />
              {topBundle.map((squad, i) => (
                <div key={squad} className="mt-1">
                  <b>Slot {i + 1}:</b> <SquadBadge squad={squad} size="xs" /> — score {customer.scores[squad].total}
                  {customer.scores[squad].txn > 0 && <span className="text-emerald-600"> (GD thật +{customer.scores[squad].txn})</span>}
                  {customer.scores[squad].portfolio > 0 && <span className="text-blue-600"> (Port +{customer.scores[squad].portfolio})</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Re-ranking rules */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🛡️ Re-ranking Rules (theo Alipay)</h3>
        <p className="text-[10px] text-slate-400 mb-4">Business rules can thiệp sau scoring — đảm bảo fairness giữa squads</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { id: 'R1-DIV', name: 'Diversity', desc: 'Bundle 3 offers phải từ 3 squads khác nhau', color: '#7c3aed', icon: '🔀' },
            { id: 'R2-FAIR', name: 'Fairness quota', desc: 'Mỗi squad tối thiểu 2 lần/tuần. Chưa đạt → boost +20', color: '#2563eb', icon: '⚖️' },
            { id: 'R3-FREQ', name: 'Frequency cap', desc: '1 bundle/ngày. Skip nếu KH vừa giao dịch 4h', color: '#059669', icon: '🕐' },
            { id: 'R4-DEDUP', name: 'Dedup 7 ngày', desc: 'Cùng offer không hiện quá 2 lần/7 ngày cho 1 KH', color: '#d97706', icon: '🔄' },
            { id: 'R5-COOL', name: 'Post-action', desc: 'Vừa mua Bond → ẩn Bond offers 14 ngày', color: '#ef4444', icon: '❄️' },
          ].map(r => (
            <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200" style={{ borderTopWidth: 3, borderTopColor: r.color }}>
              <div className="text-sm mb-1">{r.icon}</div>
              <div className="text-[10px] font-bold mb-0.5" style={{ color: r.color }}>{r.id}</div>
              <div className="text-xs font-semibold mb-1">{r.name}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Before vs After comparison */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-4">📋 So sánh: Hiện tại vs Smart Bundle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 border-2 border-red-200 bg-red-50/40">
            <div className="text-xs font-bold text-red-500 uppercase mb-3">Hiện tại — Fixed rotation</div>
            <div className="space-y-2 text-xs text-red-700">
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> 1 squad/ngày cố định (T2 Bond, T3 Fund...)</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Spray 100% KH, kể cả không phù hợp</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Không attribution — không biết hiệu quả từ đâu</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Squad exposure: 1 ngày/tuần</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Không biết KH phù hợp sản phẩm nào</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Conflict giữa squads vì tranh slot</div>
            </div>
          </div>
          <div className="rounded-xl p-4 border-2 border-emerald-200 bg-emerald-50/40">
            <div className="text-xs font-bold text-emerald-600 uppercase mb-3">Smart Bundle — Multi-signal + Segments</div>
            <div className="space-y-2 text-xs text-emerald-700">
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> 3 squads/ngày, dynamic theo từng KH</div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Mỗi KH nhận bundle phù hợp segment + portfolio</div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Click per offer = attribution rõ ràng</div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Squad exposure: 3 ngày/tuần (tăng 3x)</div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Multi-signal scoring: GD 35% + Portfolio 25% + App 20%</div>
              <div className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Zero conflict — tất cả squads đều ĐƯỢC thêm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily operation flow */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">🕐 Quy trình vận hành hàng ngày</h3>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {[
            { time: '16:00', label: 'Squads submit', desc: 'Mỗi squad gửi 1-2 offers cho ngày mai', color: '#7c3aed', icon: '📝' },
            { time: '17:00', label: 'Engine scoring', desc: 'Tính score per offer × per KH. Apply re-ranking', color: '#d97706', icon: '⚡' },
            { time: '18:00', label: 'Ops review', desc: 'Team vận hành xem preview, confirm hoặc override', color: '#2563eb', icon: '👁️' },
            { time: '09:00', label: 'Send bundles', desc: '1 notification/KH chứa 3 offers. Push + inbox', color: '#059669', icon: '🚀' },
            { time: 'Realtime', label: 'Collect signals', desc: 'Click/dismiss → cập nhật score cho ngày tiếp', color: '#64748b', icon: '📊' },
          ].map((step, i) => (
            <div key={step.time} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: `${step.color}12`, border: `2px solid ${step.color}40`, borderRadius: 14,
                padding: '14px 16px', minWidth: 145, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, marginTop: 4 }}>{step.time}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{step.label}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{step.desc}</div>
              </div>
              {i < 4 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 2, background: '#e2e8f0' }} />
                  <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '6px solid #cbd5e1' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
