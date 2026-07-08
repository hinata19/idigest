'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface SimEvent {
  day: number
  campaign: string
  channel: string
  category: string
  result: 'delivered' | 'suppressed'
  rule?: string
  ruleId?: string
  icon: string
  desc: string
}

interface DaySnapshot {
  day: number
  pushUsed: number
  inboxUsed: number
  emailUsed: number
  delivered: number
  suppressed: number
  events: SimEvent[]
}

const profiles = [
  { id: 'active', name: 'Nguyễn Văn Minh', segment: 'Active Trader', avatar: '👨‍💼', pushMax: 2, inboxMax: 5, emailMax: 2, traits: ['Giao dịch hàng ngày', 'Mở app 3-4 lần/ngày', 'Quan tâm Margin'] },
  { id: 'passive', name: 'Trần Thị Hoa', segment: 'Passive Investor', avatar: '👩‍💻', pushMax: 2, inboxMax: 5, emailMax: 2, traits: ['Mua Bond/Fund dài hạn', 'Mở app 2 lần/tuần', 'Dismiss 2 promo gần đây'] },
  { id: 'newcomer', name: 'Lê Hoàng Nam', segment: 'Newcomer (3 ngày)', avatar: '🧑‍🎓', pushMax: 2, inboxMax: 5, emailMax: 2, traits: ['Mới mở TK 3 ngày', 'Chưa giao dịch', 'Đang onboarding'] },
  { id: 'dormant', name: 'Phạm Quốc Bảo', segment: 'Dormant (45 ngày)', avatar: '😴', pushMax: 1, inboxMax: 5, emailMax: 2, traits: ['Không login 45 ngày', 'AUM còn 8M', 'Từng active trader'] },
  { id: 'vip', name: 'Vũ Thanh Tùng', segment: 'VIP — AUM >2B', avatar: '👑', pushMax: 3, inboxMax: 7, emailMax: 3, traits: ['AUM 2.3 tỷ', 'Giao dịch 5-10 lệnh/ngày', 'Có NVTV riêng'] },
]

const weekCampaigns: { day: number; name: string; channel: string; category: string; icon: string; desc: string; targetSegments: string[]; suppressedBy?: Record<string, { rule: string; ruleId: string }> }[] = [
  { day: 1, name: 'Lệnh khớp VNM x300', channel: 'push', category: 'transaction', icon: '↔', desc: 'Giá khớp 78,200. GT: 23.46M', targetSegments: ['active', 'vip'] },
  { day: 1, name: 'Summer Bond 9.5%', channel: 'inbox', category: 'promo', icon: '📊', desc: 'Kỳ hạn 12 tháng, lãi suất 9.5%/năm', targetSegments: ['active', 'passive', 'newcomer', 'dormant', 'vip'], suppressedBy: { newcomer: { rule: 'KH mới < 7 ngày — chỉ onboarding', ruleId: 'R3' } } },
  { day: 1, name: 'Welcome — Cách đặt lệnh', channel: 'inbox', category: 'system', icon: '📚', desc: 'Hướng dẫn đặt lệnh đầu tiên', targetSegments: ['newcomer'] },
  { day: 1, name: 'Margin Boost July', channel: 'push', category: 'promo', icon: '📈', desc: 'Lãi suất margin chỉ 8.5%/năm', targetSegments: ['active', 'vip'], suppressedBy: { active: { rule: 'Vừa giao dịch trong 1h — cooldown promo', ruleId: 'R1' } } },
  { day: 2, name: 'Cổ tức TCB về TK', channel: 'push', category: 'transaction', icon: '💰', desc: '+1,200,000đ cổ tức tiền mặt', targetSegments: ['active', 'passive', 'vip'] },
  { day: 2, name: 'iLucky x2 điểm', channel: 'inbox', category: 'promo', icon: '🎰', desc: 'Nhân đôi điểm thưởng khi quay', targetSegments: ['active', 'passive', 'newcomer', 'dormant', 'vip'], suppressedBy: { newcomer: { rule: 'KH mới < 7 ngày — chỉ onboarding', ruleId: 'R3' }, dormant: { rule: 'Dormant — max 1 winback/tuần', ruleId: 'R4' } } },
  { day: 2, name: 'Welcome — Nạp tiền', channel: 'inbox', category: 'system', icon: '📚', desc: 'Hướng dẫn nạp tiền vào tài khoản', targetSegments: ['newcomer'] },
  { day: 3, name: 'Fund Diversify KM', channel: 'email', category: 'promo', icon: '💎', desc: 'Miễn phí mua Fund đến 30/07', targetSegments: ['passive', 'vip'] },
  { day: 3, name: 'Lệnh khớp HPG x500', channel: 'push', category: 'transaction', icon: '↔', desc: 'Giá khớp 26,100. GT: 13.05M', targetSegments: ['active', 'vip'] },
  { day: 3, name: 'Flash Sale Bond', channel: 'push', category: 'promo', icon: '⚡', desc: 'Bond 10% chỉ hôm nay', targetSegments: ['active', 'passive', 'dormant', 'vip'], suppressedBy: { active: { rule: 'Vừa giao dịch trong 1h — cooldown promo', ruleId: 'R1' }, dormant: { rule: 'Dormant — max 1 winback/tuần, đã gửi', ruleId: 'R4' } } },
  { day: 4, name: 'Bảo trì 23h-1h', channel: 'inbox', category: 'system', icon: '🔧', desc: 'Bảo trì hệ thống đêm nay', targetSegments: ['active', 'passive', 'newcomer', 'dormant', 'vip'] },
  { day: 4, name: 'Mời event Investor Day', channel: 'inbox', category: 'personal', icon: '🎫', desc: 'Sự kiện offline HCM 15/07', targetSegments: ['vip'] },
  { day: 4, name: 'TCBond reminder', channel: 'push', category: 'promo', icon: '📊', desc: 'Bond 9.5% còn 2 ngày — mua ngay', targetSegments: ['active', 'passive', 'dormant', 'vip'], suppressedBy: { passive: { rule: 'Cùng sản phẩm đã gửi trong 14 ngày', ruleId: 'R5' } } },
  { day: 5, name: 'NVTV nhắn tin', channel: 'push', category: 'personal', icon: '💬', desc: 'Em có deal tốt cho anh/chị...', targetSegments: ['vip'] },
  { day: 5, name: 'Winback — Quay lại nhé', channel: 'push', category: 'promo', icon: '👋', desc: 'Tặng 50K khi giao dịch lại', targetSegments: ['dormant'] },
  { day: 5, name: 'Weekly digest email', channel: 'email', category: 'promo', icon: '📬', desc: 'Tổng hợp ưu đãi tuần này', targetSegments: ['active', 'passive', 'vip'] },
  { day: 5, name: 'Lệnh khớp FPT x200', channel: 'push', category: 'transaction', icon: '↔', desc: 'Giá khớp 125,000. GT: 25M', targetSegments: ['active', 'vip'] },
  { day: 6, name: 'iLucky Weekend', channel: 'inbox', category: 'promo', icon: '🎰', desc: 'Quay số cuối tuần — x3 phần thưởng', targetSegments: ['active', 'passive', 'newcomer', 'dormant', 'vip'], suppressedBy: { newcomer: { rule: 'KH mới < 7 ngày — chỉ onboarding', ruleId: 'R3' }, passive: { rule: 'Dismiss streak ≥ 3 — giảm 50%', ruleId: 'R2' } } },
  { day: 6, name: 'Welcome — Khám phá Fund', channel: 'inbox', category: 'system', icon: '📚', desc: 'Tìm hiểu các quỹ đầu tư', targetSegments: ['newcomer'] },
  { day: 7, name: 'Margin alert', channel: 'push', category: 'transaction', icon: '⚠️', desc: 'Tỷ lệ ký quỹ gần ngưỡng 85%', targetSegments: ['active', 'vip'] },
  { day: 7, name: 'App update v4.3', channel: 'inbox', category: 'system', icon: '📱', desc: 'Tính năng mới: Watchlist nâng cao', targetSegments: ['active', 'passive', 'newcomer', 'dormant', 'vip'] },
  { day: 7, name: 'Fund KM cuối tuần', channel: 'email', category: 'promo', icon: '💎', desc: '0% phí mua Fund đến hết CN', targetSegments: ['passive', 'vip'], suppressedBy: { passive: { rule: 'Cùng sản phẩm đã gửi trong 14 ngày', ruleId: 'R5' } } },
]

function runSimulation(profileId: string): DaySnapshot[] {
  const profile = profiles.find(p => p.id === profileId)!
  const snapshots: DaySnapshot[] = []
  let pushUsed = 0, inboxUsed = 0, emailUsed = 0
  let totalDelivered = 0, totalSuppressed = 0

  for (let day = 1; day <= 7; day++) {
    const dayEvents: SimEvent[] = []
    const dayCampaigns = weekCampaigns.filter(c => c.day === day && c.targetSegments.includes(profileId))

    for (const camp of dayCampaigns) {
      const suppression = camp.suppressedBy?.[profileId]

      if (suppression) {
        dayEvents.push({ day, campaign: camp.name, channel: camp.channel, category: camp.category, result: 'suppressed', rule: suppression.rule, ruleId: suppression.ruleId, icon: camp.icon, desc: camp.desc })
        totalSuppressed++
        continue
      }

      let budgetExceeded = false
      if (camp.category === 'promo') {
        if (camp.channel === 'push' && pushUsed >= profile.pushMax) budgetExceeded = true
        if (camp.channel === 'email' && emailUsed >= profile.emailMax) budgetExceeded = true
        if (camp.channel === 'inbox' && inboxUsed >= profile.inboxMax) budgetExceeded = true
      }

      if (budgetExceeded) {
        dayEvents.push({ day, campaign: camp.name, channel: camp.channel, category: camp.category, result: 'suppressed', rule: `Budget ${camp.channel} đã hết cho tuần này`, ruleId: 'BUDGET', icon: camp.icon, desc: camp.desc })
        totalSuppressed++
        continue
      }

      if (camp.channel === 'push' && camp.category !== 'transaction' && camp.category !== 'personal') pushUsed++
      if (camp.channel === 'inbox' && camp.category !== 'transaction' && camp.category !== 'system' && camp.category !== 'personal') inboxUsed++
      if (camp.channel === 'email' && camp.category !== 'transaction') emailUsed++

      dayEvents.push({ day, campaign: camp.name, channel: camp.channel, category: camp.category, result: 'delivered', icon: camp.icon, desc: camp.desc })
      totalDelivered++
    }

    snapshots.push({ day, pushUsed, inboxUsed, emailUsed, delivered: totalDelivered, suppressed: totalSuppressed, events: dayEvents })
  }

  return snapshots
}

const catColors: Record<string, { color: string; bg: string }> = {
  transaction: { color: '#dc2626', bg: '#fee2e2' },
  promo: { color: '#7c3aed', bg: '#ede9fe' },
  system: { color: '#2563eb', bg: '#dbeafe' },
  personal: { color: '#059669', bg: '#d1fae5' },
}
const catLabels: Record<string, string> = { transaction: 'Giao dịch', promo: 'Ưu đãi', system: 'Hệ thống', personal: 'Cá nhân' }
const channelLabels: Record<string, string> = { push: 'Push', inbox: 'Inbox', email: 'Email', sms: 'SMS' }

function ProgressBar({ used, max, color, label }: { used: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0
  const full = used >= max
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold" style={{ color: full ? '#ef4444' : '#64748b' }}>{used}/{max}</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: full ? '#ef4444' : color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function SimulatorPanel() {
  const [selectedProfile, setSelectedProfile] = useState('active')
  const [isRunning, setIsRunning] = useState(false)
  const [currentDay, setCurrentDay] = useState(0)
  const [visibleEvents, setVisibleEvents] = useState<SimEvent[]>([])
  const [snapshots, setSnapshots] = useState<DaySnapshot[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const profile = profiles.find(p => p.id === selectedProfile)!

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => cleanup, [cleanup])

  const startSimulation = () => {
    cleanup()
    const results = runSimulation(selectedProfile)
    setSnapshots(results)
    setVisibleEvents([])
    setCurrentDay(0)
    setShowSummary(false)
    setIsRunning(true)

    const allEvents = results.flatMap(s => s.events)
    let idx = 0
    let dayIdx = 0

    timerRef.current = setInterval(() => {
      if (idx < allEvents.length) {
        const evt = allEvents[idx]
        if (evt.day !== dayIdx) {
          dayIdx = evt.day
          setCurrentDay(dayIdx)
        }
        setVisibleEvents(prev => [...prev, evt])
        idx++
        setTimeout(() => {
          if (timelineRef.current) {
            timelineRef.current.scrollTop = timelineRef.current.scrollHeight
          }
        }, 50)
      } else {
        cleanup()
        setCurrentDay(8)
        setTimeout(() => setShowSummary(true), 600)
      }
    }, 450)
  }

  const reset = () => {
    cleanup()
    setIsRunning(false)
    setCurrentDay(0)
    setVisibleEvents([])
    setSnapshots([])
    setShowSummary(false)
  }

  const currentSnapshot = snapshots.find(s => s.day === Math.min(currentDay, 7)) || { pushUsed: 0, inboxUsed: 0, emailUsed: 0, delivered: 0, suppressed: 0 }
  const deliveredEvents = visibleEvents.filter(e => e.result === 'delivered')
  const suppressedEvents = visibleEvents.filter(e => e.result === 'suppressed')

  const beforeCount = weekCampaigns.filter(c => c.targetSegments.includes(selectedProfile)).length
  const afterCount = deliveredEvents.length

  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-[14px] p-4 mb-6 text-sm text-indigo-800 leading-relaxed">
        🧪 <b>Notification Simulator:</b> Chọn 1 khách hàng mẫu → chạy giả lập 7 ngày → xem hệ thống gửi/chặn notification thế nào theo rules mới. Trải nghiệm trực quan thay vì đọc lý thuyết.
      </div>

      {/* Profile selector */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-3">👤 Chọn khách hàng mẫu</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => { if (!isRunning) { setSelectedProfile(p.id); reset() } }}
              className={`rounded-xl p-3 border-2 cursor-pointer transition-all ${
                selectedProfile === p.id
                  ? 'border-violet-400 bg-violet-50 shadow-md shadow-violet-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl text-center mb-1">{p.avatar}</div>
              <div className="text-xs font-bold text-center truncate">{p.name}</div>
              <div className="text-[10px] text-center text-slate-500 mt-0.5">{p.segment}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.traits.map((t, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{t}</span>
          ))}
          <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">Push: {profile.pushMax}/tuần</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Inbox: {profile.inboxMax}/tuần</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Email: {profile.emailMax}/tuần</span>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-200 active:scale-95'
            }`}
          >
            {isRunning ? (currentDay <= 7 ? `⏳ Đang chạy ngày ${currentDay}/7...` : '✅ Hoàn thành') : '🚀 Chạy giả lập 7 ngày'}
          </button>
          {(isRunning || showSummary) && (
            <button onClick={reset} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* Simulation area */}
      {(isRunning || showSummary) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="panel" style={{ padding: 0 }}>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold">📅 Timeline — 7 ngày</h3>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Gửi ({deliveredEvents.length})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Chặn ({suppressedEvents.length})</span>
                </div>
              </div>
              <div ref={timelineRef} style={{ maxHeight: 520, overflowY: 'auto', padding: '12px 16px' }}>
                {[1,2,3,4,5,6,7].map(day => {
                  const dayEvents = visibleEvents.filter(e => e.day === day)
                  if (dayEvents.length === 0 && day > currentDay) return null
                  return (
                    <div key={day} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          day === currentDay && currentDay <= 7 ? 'bg-violet-600 text-white animate-pulse' :
                          day < currentDay ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                        }`}>{day}</span>
                        <span className="text-xs font-semibold text-slate-500">Ngày {day} {day === currentDay && currentDay <= 7 ? '— đang xử lý...' : ''}</span>
                      </div>
                      <div className="ml-9 space-y-1.5">
                        {dayEvents.map((evt, i) => {
                          const cat = catColors[evt.category]
                          return (
                            <div
                              key={`${day}-${i}`}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg border animate-fade-in"
                              style={{
                                borderColor: evt.result === 'delivered' ? '#d1fae5' : '#fecaca',
                                background: evt.result === 'delivered' ? '#f0fdf4' : '#fef2f2',
                              }}
                            >
                              <span className="text-lg">{evt.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold">{evt.campaign}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: cat.bg, color: cat.color }}>{catLabels[evt.category]}</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{channelLabels[evt.channel]}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{evt.desc}</div>
                                {evt.result === 'suppressed' && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] font-bold text-red-500">✕ CHẶN</span>
                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{evt.ruleId}</span>
                                    <span className="text-[10px] text-red-400">{evt.rule}</span>
                                  </div>
                                )}
                                {evt.result === 'delivered' && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] font-bold text-emerald-600">✓ GỬI</span>
                                    <span className="text-[10px] text-emerald-500">Đã gửi qua {channelLabels[evt.channel]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {dayEvents.length === 0 && day <= currentDay && (
                          <div className="text-xs text-slate-300 italic ml-2">Không có campaign nào cho KH này hôm nay</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar: Budget + Inbox preview */}
          <div>
            {/* Budget tracker */}
            <div className="panel mb-4">
              <h3 className="text-sm font-bold mb-3">📊 Budget tuần này</h3>
              <div className="space-y-3">
                <ProgressBar used={currentSnapshot.pushUsed} max={profile.pushMax} color="#7c3aed" label="Push promo" />
                <ProgressBar used={currentSnapshot.inboxUsed} max={profile.inboxMax} color="#2563eb" label="Inbox promo" />
                <ProgressBar used={currentSnapshot.emailUsed} max={profile.emailMax} color="#059669" label="Email promo" />
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Tổng gửi</span>
                <span className="font-bold text-emerald-600">{deliveredEvents.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Tổng chặn</span>
                <span className="font-bold text-red-500">{suppressedEvents.length}</span>
              </div>
            </div>

            {/* Mini inbox preview */}
            <div className="panel mb-4" style={{ padding: 0 }}>
              <div className="px-4 py-2.5 border-b border-slate-100">
                <h3 className="text-sm font-bold">📱 Inbox KH nhận được</h3>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {deliveredEvents.length === 0 && (
                  <div className="p-4 text-xs text-slate-300 text-center italic">Chưa có notification...</div>
                )}
                {deliveredEvents.map((evt, i) => {
                  const cat = catColors[evt.category]
                  return (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-50 animate-fade-in">
                      <span className="text-sm">{evt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{evt.campaign}</div>
                        <div className="text-[10px] text-slate-400 truncate">{evt.desc}</div>
                      </div>
                      <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: cat.bg, color: cat.color }}>{catLabels[evt.category]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Suppression log */}
            {suppressedEvents.length > 0 && (
              <div className="panel" style={{ padding: 0 }}>
                <div className="px-4 py-2.5 border-b border-red-100 bg-red-50/50">
                  <h3 className="text-sm font-bold text-red-600">🛡️ Đã chặn ({suppressedEvents.length})</h3>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {suppressedEvents.map((evt, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-red-50 text-xs">
                      <span className="font-bold text-red-500 w-12 shrink-0">{evt.ruleId}</span>
                      <span className="text-slate-600 truncate">{evt.campaign}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <div className="mt-6 animate-fade-in">
          <div className="panel" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderColor: '#c4b5fd' }}>
            <h3 className="text-lg font-bold mb-4 text-violet-800">📊 Kết quả giả lập — {profile.name} ({profile.segment})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/80 rounded-xl p-4 text-center border border-violet-100">
                <div className="text-3xl font-extrabold text-slate-400 line-through">{beforeCount}</div>
                <div className="text-xs text-slate-500 mt-1">Trước (không có rules)</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-200">
                <div className="text-3xl font-extrabold text-emerald-600">{afterCount}</div>
                <div className="text-xs text-emerald-600 mt-1 font-medium">Sau (với smart rules)</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center border border-red-100">
                <div className="text-3xl font-extrabold text-red-500">{suppressedEvents.length}</div>
                <div className="text-xs text-red-500 mt-1">Noti bị chặn</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center border border-violet-200">
                <div className="text-3xl font-extrabold text-violet-600">{beforeCount > 0 ? Math.round((1 - afterCount / beforeCount) * 100) : 0}%</div>
                <div className="text-xs text-violet-600 mt-1 font-medium">Giảm spam</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-violet-100">
                <div className="text-xs font-bold text-violet-700 uppercase mb-2">Rules đã kích hoạt</div>
                <div className="space-y-1.5">
                  {Object.entries(
                    suppressedEvents.reduce((acc, e) => {
                      const key = e.ruleId || 'UNKNOWN'
                      acc[key] = (acc[key] || { count: 0, label: e.rule || '' })
                      acc[key].count++
                      return acc
                    }, {} as Record<string, { count: number; label: string }>)
                  ).map(([ruleId, data]) => (
                    <div key={ruleId} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-red-500 w-14">{ruleId}</span>
                      <span className="text-slate-600 flex-1">{data.label}</span>
                      <span className="font-bold text-red-500">×{data.count}</span>
                    </div>
                  ))}
                  {suppressedEvents.length === 0 && <div className="text-xs text-slate-400">Không có rule nào kích hoạt</div>}
                </div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-700 uppercase mb-2">Dự đoán cải thiện</div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Open rate (trước)</span><span className="text-slate-400">~15%</span></div>
                  <div className="flex justify-between"><span>Open rate (sau)</span><span className="font-bold text-emerald-600">~42% (+180%)</span></div>
                  <div className="flex justify-between"><span>Click-through (trước)</span><span className="text-slate-400">~3%</span></div>
                  <div className="flex justify-between"><span>Click-through (sau)</span><span className="font-bold text-emerald-600">~12% (+300%)</span></div>
                  <div className="flex justify-between border-t border-emerald-100 pt-2 mt-1"><span className="font-semibold">KH hài lòng hơn</span><span className="font-bold text-emerald-600">↑ Significantly</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
