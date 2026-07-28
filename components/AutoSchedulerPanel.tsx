'use client'
import { useState } from 'react'

type SquadId = 'bond' | 'fund' | 'stock' | 'borrowlink' | 'itracker' | 'ipower' | 'ioptima'
type Priority = 'flash' | 'urgent' | 'normal'

const squadMeta: Record<SquadId, { label: string; color: string; bg: string; icon: string }> = {
  bond:       { label: 'Bond',       color: '#1d4ed8', bg: '#dbeafe', icon: '📊' },
  fund:       { label: 'Fund',       color: '#15803d', bg: '#dcfce7', icon: '💎' },
  stock:      { label: 'Stock',      color: '#b45309', bg: '#fef3c7', icon: '📈' },
  borrowlink: { label: 'BorrowLink', color: '#be185d', bg: '#fce7f3', icon: '🏦' },
  itracker:   { label: 'iTracker',   color: '#7c3aed', bg: '#ede9fe', icon: '🔔' },
  ipower:     { label: 'iPower',     color: '#0891b2', bg: '#cffafe', icon: '⚡' },
  ioptima:    { label: 'iOptima',    color: '#c2410c', bg: '#fff7ed', icon: '🎯' },
}

const priorityMeta: Record<Priority, { label: string; color: string; bg: string; sort: number }> = {
  flash:  { label: 'Flash',  color: '#dc2626', bg: '#fee2e2', sort: 0 },
  urgent: { label: 'Urgent', color: '#d97706', bg: '#fef3c7', sort: 1 },
  normal: { label: 'Normal', color: '#64748b', bg: '#f1f5f9', sort: 2 },
}

interface Campaign {
  id: string
  squad: SquadId
  name: string
  target: number
  windowDays: number
  priority: Priority
  enabled: boolean
}

const defaultCampaigns: Campaign[] = [
  { id: 'c1', squad: 'fund',       name: 'TCBF phí 0% — NGÀY CUỐI',         target: 500000, windowDays: 1, priority: 'flash',  enabled: true },
  { id: 'c2', squad: 'stock',      name: 'VNM oversold RSI < 30',            target: 200000, windowDays: 3, priority: 'urgent', enabled: true },
  { id: 'c3', squad: 'bond',       name: 'VPB Bond 8.9% mới phát hành',     target: 500000, windowDays: 5, priority: 'normal', enabled: true },
  { id: 'c4', squad: 'ipower',     name: 'iPower — sinh lời tiền nhàn',      target: 300000, windowDays: 7, priority: 'normal', enabled: true },
  { id: 'c5', squad: 'ioptima',    name: 'iOptima KM phí 0% — tuần cuối',   target: 400000, windowDays: 6, priority: 'normal', enabled: true },
  { id: 'c6', squad: 'borrowlink', name: 'BorrowLink 7.2% KH 6 tháng',     target: 350000, windowDays: 5, priority: 'normal', enabled: true },
  { id: 'c7', squad: 'itracker',   name: 'iTracker alert — HPG +15%',       target: 150000, windowDays: 4, priority: 'urgent', enabled: true },
]

const days = ['T2 28/07', 'T3 29/07', 'T4 30/07', 'T5 31/07', 'T6 01/08', 'T7 02/08', 'CN 03/08']
const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const DAILY_CAPACITY = 500000

interface ScheduledSlot {
  campaignId: string
  customers: number
  reason: string
}

function autoSchedule(campaigns: Campaign[]): ScheduledSlot[][] {
  const active = campaigns
    .filter(c => c.enabled)
    .sort((a, b) => priorityMeta[a.priority].sort - priorityMeta[b.priority].sort || a.windowDays - b.windowDays)

  const schedule: ScheduledSlot[][] = days.map(() => [])
  const remaining: Record<string, number> = {}
  active.forEach(c => { remaining[c.id] = c.target })

  for (let day = 0; day < 7; day++) {
    let capacityLeft = DAILY_CAPACITY

    for (const camp of active) {
      if (remaining[camp.id] <= 0) continue
      if (day >= camp.windowDays) continue

      const daysLeft = camp.windowDays - day
      const mustSendPerDay = Math.ceil(remaining[camp.id] / daysLeft)
      const send = Math.min(mustSendPerDay, capacityLeft, remaining[camp.id])

      if (send <= 0) continue

      const reason = camp.priority === 'flash' ? 'Flash — deadline hôm nay'
        : camp.priority === 'urgent' ? `Urgent — còn ${daysLeft} ngày`
        : daysLeft <= 2 ? `Sắp hết deadline — còn ${daysLeft} ngày`
        : `Spread đều — còn ${daysLeft} ngày`

      schedule[day].push({ campaignId: camp.id, customers: send, reason })
      remaining[camp.id] -= send
      capacityLeft -= send
    }
  }

  return schedule
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return Math.round(n / 1000) + 'K'
  return n.toString()
}

export default function AutoSchedulerPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns)
  const schedule = autoSchedule(campaigns)

  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  const activeCampaigns = campaigns.filter(c => c.enabled)
  const totalDemand = activeCampaigns.reduce((s, c) => s + c.target, 0)
  const totalCapacity = DAILY_CAPACITY * 7
  const utilization = Math.round((totalDemand / totalCapacity) * 100)

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-[14px] p-4 mb-6 text-sm text-blue-800 leading-relaxed">
        📅 <b>Option 3: Auto-scheduler</b> — Squads đăng ký campaign + deadline + priority → Hệ thống tự xếp lịch delivery tối ưu. Không cần manual, đảm bảo mọi campaign chạy đúng hạn.
      </div>

      {/* Capacity overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Campaigns', value: activeCampaigns.length.toString(), sub: `${campaigns.length - activeCampaigns.length} đang tắt`, color: '#2563eb' },
          { label: 'Tổng demand', value: formatNum(totalDemand), sub: 'sends cần gửi', color: '#d97706' },
          { label: 'Capacity/tuần', value: formatNum(totalCapacity), sub: `${formatNum(DAILY_CAPACITY)}/ngày × 7`, color: '#059669' },
          { label: 'Utilization', value: `${utilization}%`, sub: utilization > 90 ? 'Gần đầy!' : 'Còn dư capacity', color: utilization > 90 ? '#dc2626' : '#059669' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{k.label}</div>
            <div className="text-2xl font-extrabold mt-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Campaign list */}
        <div className="panel" style={{ padding: 0 }}>
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold">📋 Campaigns đã đăng ký</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Bật/tắt để xem lịch thay đổi realtime</p>
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {campaigns.map(c => {
              const meta = squadMeta[c.squad]
              const pri = priorityMeta[c.priority]
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCampaign(c.id)}
                  className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50"
                  style={{ opacity: c.enabled ? 1 : 0.4 }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, border: `2px solid ${c.enabled ? meta.color : '#cbd5e1'}`,
                    background: c.enabled ? meta.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0, marginTop: 2,
                  }}>{c.enabled ? '✓' : ''}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span style={{ background: meta.bg, color: meta.color, padding: '2px 6px', borderRadius: 99, fontSize: 9, fontWeight: 600 }}>{meta.label}</span>
                      <span style={{ background: pri.bg, color: pri.color, padding: '2px 6px', borderRadius: 99, fontSize: 9, fontWeight: 600 }}>{pri.label}</span>
                    </div>
                    <div className="text-xs font-medium mt-1 truncate">{c.name}</div>
                    <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                      <span>{formatNum(c.target)} KH</span>
                      <span>Window: {c.windowDays} ngày</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2 panel" style={{ padding: 0 }}>
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold">📅 Lịch delivery tự động — Tuần 28/07</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Hệ thống tự phân bổ dựa trên priority + deadline + capacity</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {days.map((d, i) => {
                const dayTotal = schedule[i].reduce((s, sl) => s + sl.customers, 0)
                const pct = Math.round((dayTotal / DAILY_CAPACITY) * 100)
                return (
                  <div key={d} className="text-center">
                    <div className="text-[10px] font-bold text-slate-500">{dayLabels[i]}</div>
                    <div className="text-[9px] text-slate-400">{d.split(' ')[1]}</div>
                    {/* Capacity bar */}
                    <div className="mt-1.5 mx-auto" style={{ width: '100%', height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 2, background: pct > 90 ? '#ef4444' : pct > 60 ? '#d97706' : '#059669' }} />
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: pct > 90 ? '#ef4444' : '#94a3b8' }}>{formatNum(dayTotal)}</div>
                  </div>
                )
              })}
            </div>

            {/* Schedule grid */}
            <div className="grid grid-cols-7 gap-2 mt-3">
              {schedule.map((daySlots, dayIdx) => (
                <div key={dayIdx} className="space-y-1.5">
                  {daySlots.map((slot, slotIdx) => {
                    const camp = campaigns.find(c => c.id === slot.campaignId)!
                    const meta = squadMeta[camp.squad]
                    const pri = priorityMeta[camp.priority]
                    return (
                      <div key={slotIdx} className="rounded-lg p-2 border" style={{ background: meta.bg + '60', borderColor: meta.color + '30' }}>
                        <div className="flex items-center gap-1">
                          <span style={{ fontSize: 11 }}>{meta.icon}</span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className="text-[9px] font-bold mt-0.5" style={{ color: meta.color }}>{formatNum(slot.customers)}</div>
                        <div className="text-[8px] text-slate-400 mt-0.5 leading-tight">{slot.reason}</div>
                        {camp.priority !== 'normal' && (
                          <span style={{ fontSize: 7, background: pri.bg, color: pri.color, padding: '1px 4px', borderRadius: 3, fontWeight: 600, marginTop: 2, display: 'inline-block' }}>{pri.label}</span>
                        )}
                      </div>
                    )
                  })}
                  {daySlots.length === 0 && (
                    <div className="rounded-lg p-3 border border-dashed border-slate-200 text-center">
                      <div className="text-[9px] text-slate-300">Trống</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-4">⚙️ Thuật toán Auto-scheduler</h3>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {[
            { icon: '📝', label: 'Squads submit', desc: 'Mỗi squad đăng ký campaign: target, deadline, priority', color: '#7c3aed' },
            { icon: '🔢', label: 'Sort by priority', desc: 'Flash → Urgent → Normal. Cùng priority: deadline ngắn lên trước', color: '#dc2626' },
            { icon: '📊', label: 'Capacity planning', desc: 'Tính: demand vs capacity (500K slots/ngày). Cảnh báo nếu quá tải', color: '#d97706' },
            { icon: '📅', label: 'Spread delivery', desc: 'Chia target thành batches. Batch size = remaining ÷ days left', color: '#2563eb' },
            { icon: '✅', label: 'Guarantee check', desc: 'Verify: tất cả campaigns hoàn thành trước deadline. Nếu không → escalate', color: '#059669' },
          ].map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: `${step.color}12`, border: `2px solid ${step.color}40`, borderRadius: 14,
                padding: '14px 16px', minWidth: 160, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, marginTop: 4 }}>{step.label}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>{step.desc}</div>
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

      {/* Scheduling rules */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-4">📐 Scheduling Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'S1', name: 'Priority First', color: '#dc2626', icon: '🔥',
              desc: 'Flash sale (window ≤ 1 ngày) luôn được xếp lịch đầu tiên, chiếm slot ngay ngày đăng ký. Urgent xếp trước Normal.',
            },
            {
              id: 'S2', name: 'Spread Delivery', color: '#2563eb', icon: '📊',
              desc: 'Target lớn → chia thành batches đều qua các ngày trong window. Tránh dồn hết vào 1 ngày gây quá tải.',
            },
            {
              id: 'S3', name: 'Deadline Guard', color: '#059669', icon: '🛡️',
              desc: 'Nếu campaign sắp hết deadline mà chưa gửi hết → tự động tăng batch size các ngày còn lại. Escalate nếu không thể hoàn thành.',
            },
          ].map(r => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4" style={{ borderTopWidth: 3, borderTopColor: r.color }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{r.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: r.color + '15', color: r.color }}>{r.id}</span>
                <span className="text-sm font-bold">{r.name}</span>
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison with other options */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">📋 So sánh 3 Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2.5 text-left font-bold text-slate-500">Tiêu chí</th>
                <th className="px-3 py-2.5 text-center font-bold text-violet-600">Option 1: Smart Bundle</th>
                <th className="px-3 py-2.5 text-center font-bold text-amber-600">Option 2: Main + Cross-sell</th>
                <th className="px-3 py-2.5 text-center font-bold text-blue-600">Option 3: Auto-scheduler</th>
              </tr>
            </thead>
            <tbody>
              {[
                { criteria: 'Coverage per campaign', o1: '30-60%', o1c: '#ef4444', o2: '100%', o2c: '#059669', o3: '100%', o3c: '#059669' },
                { criteria: 'Personalization', o1: 'Cao — top 3 by score', o1c: '#059669', o2: 'TB — content per segment', o2c: '#d97706', o3: 'TB — priority ordering', o3c: '#d97706' },
                { criteria: 'Squad conflict', o1: 'Không — tất cả cùng tồn tại', o1c: '#059669', o2: 'Không — fixed rotation', o2c: '#059669', o3: 'Không — auto resolve', o3c: '#059669' },
                { criteria: 'Lịch cố định', o1: 'Không cần', o1c: '#059669', o2: 'Cần — mỗi squad 1 ngày', o2c: '#d97706', o3: 'Không cần — tự xếp', o3c: '#059669' },
                { criteria: 'Flash sale support', o1: 'Khó — phải boost score', o1c: '#ef4444', o2: 'Khó — lịch cố định', o2c: '#ef4444', o3: 'Tốt — chen lịch tự động', o3c: '#059669' },
                { criteria: 'Độ phức tạp triển khai', o1: 'Cao — scoring engine', o1c: '#d97706', o2: 'Thấp — thêm cross-sell', o2c: '#059669', o3: 'TB — scheduling algo', o3c: '#d97706' },
                { criteria: 'Attribution', o1: 'Per offer trong bundle', o1c: '#059669', o2: 'Per main + cross-sell', o2c: '#059669', o3: 'Per campaign', o3c: '#059669' },
              ].map(row => (
                <tr key={row.criteria} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-semibold text-slate-700">{row.criteria}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: row.o1c }}>{row.o1}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: row.o2c }}>{row.o2}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: row.o3c }}>{row.o3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
          💡 <b>Kết hợp tối ưu:</b> Option 3 (auto-scheduler) quyết định <b>campaign nào chạy ngày nào</b>. Option 2 (main + cross-sell) quyết định <b>format notification</b>. Option 1 (scoring) quyết định <b>cross-sell nào hiện</b>. Ba layer bổ sung nhau, không thay thế.
        </div>
      </div>
    </div>
  )
}
