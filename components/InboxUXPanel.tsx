'use client'
import { useState, useEffect, useRef } from 'react'
import { notifications, subCategoryMap } from '@/data/notifications'
import type { NotiCategory, SubCategory } from '@/data/notifications'

const categoryMeta: Record<NotiCategory, { label: string; color: string; bg: string }> = {
  transaction: { label: 'Giao dịch', color: '#dc2626', bg: '#fee2e2' },
  promo: { label: 'Ưu đãi', color: '#7c3aed', bg: '#ede9fe' },
  system: { label: 'Hệ thống', color: '#2563eb', bg: '#dbeafe' },
  personal: { label: 'Cá nhân', color: '#059669', bg: '#d1fae5' },
}

/* ── Time Grouping ── */

function getTimeGroup(time: string): 'today' | 'yesterday' | 'earlier' {
  if (time.includes('phút') || time.includes('giờ')) return 'today'
  if (time.includes('Hôm qua')) return 'yesterday'
  return 'earlier'
}

const timeGroupLabels: Record<string, string> = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  earlier: 'Trước đó',
}

const timeGroupIcons: Record<string, string> = {
  today: '🔵',
  yesterday: '⚪',
  earlier: '💤',
}

/* ── Promo Score Cards ── */

interface PromoScoreCard {
  notiId: string
  product: string
  squad: string
  squadColor: string
  squadBg: string
  fitScore: number
  headline: string
  detail: string
  highlight: string
  reason: string
  cta: string
  badge?: string
}

const promoScoreCards: PromoScoreCard[] = [
  {
    notiId: 'n3', product: 'TCBond 9.5%', squad: 'Bond', squadColor: '#1d4ed8', squadBg: '#dbeafe',
    fitScore: 87, headline: 'Lãi suất 9.5%/năm · Kỳ hạn 12 tháng',
    detail: 'Bạn chưa có trái phiếu — Bond đa dạng hóa đầu tư với lãi suất ổn định. Kỳ hạn 12T phù hợp với bạn.',
    highlight: '+3.5tr lợi suất/năm — cao hơn gửi tiết kiệm',
    reason: 'Phù hợp vì: kỳ hạn bạn hay chọn (12T) + chưa có fixed-income + risk profile match',
    cta: 'Xem chi tiết Bond', badge: 'Còn 3 ngày',
  },
  {
    notiId: 'n3', product: 'TCBF Fund', squad: 'Fund', squadColor: '#15803d', squadBg: '#dcfce7',
    fitScore: 72, headline: 'KM 0% phí mua · Quỹ cân bằng',
    detail: 'Quỹ cân bằng giúp giảm rủi ro khi thị trường biến động. TCBF lãi 12.5% năm qua, drawdown max -5%.',
    highlight: 'Giảm rủi ro — quỹ cân bằng ổn định hơn cổ phiếu',
    reason: 'Phù hợp vì: bạn chưa đầu tư quỹ + phí mua 0% dịp này + giảm biến động',
    cta: 'Tìm hiểu Fund',
  },
  {
    notiId: 'n3', product: 'iLucky x2', squad: 'iLucky', squadColor: '#dc2626', squadBg: '#fef2f2',
    fitScore: 25, headline: '3 lượt quay miễn phí tuần này',
    detail: 'Quay số trúng voucher, điểm thưởng. Giải trí nhẹ nhàng.',
    highlight: 'Giải trí — không liên quan đầu tư',
    reason: 'Ít liên quan: không liên quan đến mục tiêu đầu tư hoặc sở thích của bạn',
    cta: 'Quay ngay',
  },
  {
    notiId: 'n6', product: 'TCBond 9.5%', squad: 'Bond', squadColor: '#1d4ed8', squadBg: '#dbeafe',
    fitScore: 87, headline: 'Đầu tư từ 10 triệu · Lãi suất hấp dẫn',
    detail: 'Cơ hội tốt để bắt đầu đầu tư trái phiếu — lãi suất cao nhất gần đây.',
    highlight: 'Lãi suất 9.5%/năm — đầu tư từ 10 triệu',
    reason: 'Cơ hội tốt: lãi suất cao nhất gần đây + phù hợp profile rủi ro + kỳ hạn yêu thích',
    cta: 'Mua ngay', badge: 'Còn 3 ngày',
  },
  {
    notiId: 'n9', product: 'iLucky', squad: 'iLucky', squadColor: '#dc2626', squadBg: '#fef2f2',
    fitScore: 15, headline: 'Quay số trúng thưởng',
    detail: 'Game giải trí — 3 lượt quay miễn phí. Không ảnh hưởng đầu tư.',
    highlight: 'Vui chơi — giải trí nhẹ nhàng',
    reason: 'Không liên quan chiến lược đầu tư. Ưu tiên thấp nhất trong feed.',
    cta: 'Quay ngay',
  },
]

function fitScoreColor(score: number) {
  if (score >= 80) return { color: '#16a34a', bg: '#f0fdf4', ring: '#bbf7d0', label: 'Rất phù hợp' }
  if (score >= 60) return { color: '#ca8a04', bg: '#fefce8', ring: '#fde68a', label: 'Phù hợp' }
  if (score >= 40) return { color: '#0891b2', bg: '#ecfeff', ring: '#a5f3fc', label: 'Tham khảo' }
  return { color: '#94a3b8', bg: '#f8fafc', ring: '#e2e8f0', label: 'Ít liên quan' }
}

/* ── AI Summary ── */

const aiSummaryLines = [
  { type: 'action' as const, icon: '🚨', text: 'Margin Call: ký quỹ 132%, dưới ngưỡng 140%. Cần nạp thêm hoặc bán bớt trước 14h hôm nay.' },
  { type: 'highlight' as const, icon: '📈', text: '8 tín hiệu mới: ACB ↑MA50, HPG ↑30K nổi bật nhất. MWG x500 vừa khớp, nạp 50tr OK.' },
  { type: 'promo' as const, icon: '🎯', text: 'Bond 9.5% còn 3 ngày — lãi cao hơn tiết kiệm. Fund 0% phí mua phù hợp với bạn.' },
  { type: 'personal' as const, icon: '📊', text: 'Team Phân tích: Top 5 CP tuần này (FPT, ACB, MWG, VNM, HPG). Ngành Thép Q3 phục hồi.' },
]

function AiSummaryCard({ expanded, onToggle, onDetail }: { expanded: boolean; onToggle: () => void; onDetail: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [typingIdx, setTypingIdx] = useState(-1)
  const [typedChars, setTypedChars] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!expanded) {
      setVisibleLines(0)
      setTypingIdx(-1)
      setTypedChars(0)
      return
    }
    setTypingIdx(0)
    setTypedChars(0)
    setVisibleLines(0)
  }, [expanded])

  useEffect(() => {
    if (typingIdx < 0 || typingIdx >= aiSummaryLines.length) return
    const line = aiSummaryLines[typingIdx]
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTypedChars(prev => {
        if (prev >= line.text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setTimeout(() => {
            setVisibleLines(typingIdx + 1)
            setTypingIdx(typingIdx + 1)
            setTypedChars(0)
          }, 300)
          return prev
        }
        return prev + 2
      })
    }, 15)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [typingIdx])

  const bgColors: Record<string, string> = {
    action: '#fef2f2',
    highlight: '#fffbeb',
    promo: '#f5f3ff',
    personal: '#f0fdf4',
  }

  return (
    <div style={{ margin: '0', borderBottom: '1px solid #e2e8f0' }}>
      <div
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #f0fdf4 100%)',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
          animation: expanded ? 'none' : 'pulse 2s ease-in-out infinite',
        }}>
          ✨
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 4 }}>
            AI Summary
            <span style={{ fontSize: 8, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 600, letterSpacing: 0.5 }}>BETA</span>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
            {expanded ? '3 cần hành động · 2 ưu đãi phù hợp' : 'Nhấn để xem tóm tắt thông minh'}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {expanded && (
        <div style={{ padding: '6px 12px 12px', background: '#fafbfc' }}>
          {aiSummaryLines.map((line, i) => {
            if (i > visibleLines) return null
            const isTyping = i === typingIdx
            const displayText = isTyping ? line.text.slice(0, typedChars) : (i < visibleLines ? line.text : '')
            if (!displayText) return null
            return (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 7, padding: '7px 9px', marginBottom: 4, borderRadius: 8,
                  background: bgColors[line.type], fontSize: 11, lineHeight: 1.5, color: '#334155',
                  animation: i === visibleLines - 1 && !isTyping ? 'fadeIn 0.3s' : 'none',
                }}
              >
                <span style={{ flexShrink: 0 }}>{line.icon}</span>
                <span>
                  {displayText}
                  {isTyping && typedChars < line.text.length && (
                    <span style={{ display: 'inline-block', width: 4, height: 13, background: '#8b5cf6', marginLeft: 1, animation: 'blink 0.8s infinite', verticalAlign: 'text-bottom' }} />
                  )}
                </span>
              </div>
            )
          })}
          {visibleLines >= aiSummaryLines.length && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6, padding: '0 4px' }}>
              <button onClick={(e) => e.stopPropagation()} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 10, fontWeight: 600, color: '#7c3aed', cursor: 'pointer' }}>
                🔄 Làm mới
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDetail(); }} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', fontSize: 10, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                📋 Xem chi tiết
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Daily Brief Modal ── */

const dailyBriefData = {
  date: 'Thứ Tư, 09/07/2026',
  greeting: '17 thông báo — 1 margin call, 3 tín hiệu, 2 ưu đãi phù hợp.',
  sections: [
    {
      title: '🚨 Cần hành động ngay',
      color: '#dc2626',
      bg: '#fef2f2',
      items: [
        { label: 'Margin Call: ký quỹ 132%', detail: 'Dưới ngưỡng 140% — nạp thêm hoặc bán bớt trước 14h', status: 'urgent' as const },
        { label: 'Cổ tức HPG 2.5tr đã về TK', detail: 'Quyền mua cần xác nhận — sắp hết hạn', status: 'urgent' as const },
        { label: 'Bật xác thực 2 lớp', detail: 'Bảo vệ tài khoản — chỉ mất 2 phút', status: 'urgent' as const },
      ],
      summary: 'Ưu tiên Margin Call — ảnh hưởng trực tiếp đến vốn.',
    },
    {
      title: '📈 Tín hiệu & Phân tích',
      color: '#16a34a',
      bg: '#f0fdf4',
      items: [
        { label: '8 tín hiệu mới hôm nay', detail: 'ACB ↑MA50, HPG ↑30K nổi bật — xem tất cả', status: 'hot' as const },
        { label: 'Báo cáo tuần: Top 5 CP', detail: 'FPT, ACB, MWG, VNM, HPG — từ team Phân tích', status: 'new' as const },
        { label: 'Ngành Thép Q3 phục hồi', detail: 'HPG, HSG hưởng lợi từ giá thép tăng', status: 'pending' as const },
      ],
    },
    {
      title: '📋 Giao dịch',
      color: '#ea580c',
      bg: '#fff7ed',
      items: [
        { label: 'MWG x500 vừa khớp', detail: 'Giá 52,300 — Tổng GT 26.1tr', status: 'done' as const },
        { label: 'Nạp 50tr + Rút 20tr', detail: 'Cả 2 đã xử lý thành công', status: 'done' as const },
        { label: '5 lệnh khớp hôm qua', detail: 'HPG, VNM, FPT, TCB, VIC', status: 'done' as const },
      ],
    },
    {
      title: '🎯 Ưu đãi phù hợp',
      color: '#7c3aed',
      bg: '#f5f3ff',
      items: [
        { label: 'TCBond 9.5% — còn 3 ngày', detail: 'Lãi suất cao, kỳ hạn 12T phù hợp', status: 'hot' as const },
        { label: 'Fund 0% phí mua', detail: 'Quỹ cân bằng, giảm rủi ro', status: 'hot' as const },
      ],
    },
    {
      title: '📌 Thông tin khác',
      color: '#94a3b8',
      bg: '#f8fafc',
      items: [
        { label: 'Investor Day, iLucky, App v4.2', detail: 'Sự kiện + giải trí + cập nhật', status: 'done' as const },
        { label: 'Bảo trì hệ thống 01/07', detail: 'Từ 23h-1h, không ảnh hưởng GD', status: 'done' as const },
      ],
    },
  ],
  aiNote: 'AI tóm tắt 17 thông báo. Margin Call ưu tiên cao nhất. Tín hiệu đầu tư và phân tích từ team nghiên cứu giúp bạn ra quyết định.',
}

function AiDailyBriefModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  const statusStyles = {
    done: { bg: '#dcfce7', color: '#16a34a', label: '✓' },
    urgent: { bg: '#fef2f2', color: '#dc2626', label: '!' },
    pending: { bg: '#fefce8', color: '#ca8a04', label: '→' },
    hot: { bg: '#fef2f2', color: '#ea580c', label: '🔥' },
    new: { bg: '#eff6ff', color: '#2563eb', label: 'NEW' },
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '95%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.3s ease-out',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3b0764 100%)',
          padding: '24px 24px 20px', borderRadius: '20px 20px 0 0', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>✨</span>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>AI Daily Brief</span>
                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>BETA</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{dailyBriefData.date}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{dailyBriefData.greeting}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          {dailyBriefData.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: section.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {section.title}
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>({section.items.length})</span>
              </div>
              <div style={{ background: section.bg, borderRadius: 12, padding: '4px 0', border: `1px solid ${section.color}15` }}>
                {section.items.map((item, ii) => {
                  const st = statusStyles[item.status]
                  return (
                    <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: ii < section.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: st.bg, color: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0, border: `1px solid ${st.color}30` }}>
                        {st.label}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{item.detail}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {section.summary && (
                <div style={{ fontSize: 10, color: section.color, marginTop: 6, padding: '0 4px', fontWeight: 500, fontStyle: 'italic' }}>
                  💡 {section.summary}
                </div>
              )}
            </div>
          ))}

          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)',
            borderRadius: 10, padding: '10px 14px', marginTop: 4,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            border: '1px solid #e0e7ff',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: 11, color: '#4338ca', fontWeight: 600 }}>{dailyBriefData.aiNote}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Powered by TCinvest AI · Cập nhật lúc 09:00 mỗi ngày</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ── */

export default function InboxUXPanel() {
  const [filter, setFilter] = useState<NotiCategory | 'all'>('all')
  const [subFilter, setSubFilter] = useState<SubCategory | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [aiExpanded, setAiExpanded] = useState(false)
  const [showDailyBrief, setShowDailyBrief] = useState(false)
  const [interests, setInterests] = useState<Set<SubCategory>>(new Set(['Bond', 'Stock']))
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const toggleInterest = (sub: SubCategory) => {
    setInterests(prev => {
      const next = new Set(prev)
      if (next.has(sub)) next.delete(sub)
      else next.add(sub)
      return next
    })
  }

  const baseFiltered = filter === 'all' ? notifications : notifications.filter(n => n.category === filter)
  const withSubFilter = subFilter ? baseFiltered.filter(n => n.subCategory === subFilter) : baseFiltered
  const filtered = showUnreadOnly ? withSubFilter.filter(n => n.unread && !readIds.has(n.id)) : withSubFilter

  const sorted = [...filtered].sort((a, b) => {
    const aInterest = a.subCategory && interests.has(a.subCategory) ? 1 : 0
    const bInterest = b.subCategory && interests.has(b.subCategory) ? 1 : 0
    if (aInterest !== bInterest) return bInterest - aInterest
    return 0
  })

  const unreadCount = notifications.filter(n => n.unread && !readIds.has(n.id)).length
  const totalCount = notifications.length
  const readPct = totalCount > 0 ? Math.round(((totalCount - unreadCount) / totalCount) * 100) : 100
  const unreadByCategory: Record<NotiCategory, number> = { transaction: 0, promo: 0, system: 0, personal: 0 }
  notifications.forEach(n => {
    if (n.unread && !readIds.has(n.id)) unreadByCategory[n.category]++
  })
  const currentSubs = filter !== 'all' ? subCategoryMap[filter] : null

  const timeGroups: { key: string; label: string; icon: string; items: typeof sorted }[] = []
  const groupOrder = ['today', 'yesterday', 'earlier'] as const
  for (const gk of groupOrder) {
    const items = sorted.filter(n => getTimeGroup(n.time) === gk)
    if (items.length > 0) {
      timeGroups.push({ key: gk, label: timeGroupLabels[gk], icon: timeGroupIcons[gk], items })
    }
  }

  const groups: { key: string; items: typeof sorted; label: string; icon?: string; color?: string; unreadBadge?: string }[] = filter === 'all'
    ? (['transaction', 'promo', 'personal', 'system'] as NotiCategory[])
        .map(cat => {
          const items = filtered.filter(n => n.category === cat)
          const u = items.filter(n => n.unread && !readIds.has(n.id)).length
          return { key: cat, items, label: categoryMeta[cat].label, color: categoryMeta[cat].color, unreadBadge: u > 0 ? `${u} mới` : undefined }
        })
        .filter(g => g.items.length > 0)
        .sort((a, b) => (b.unreadBadge ? 1 : 0) - (a.unreadBadge ? 1 : 0))
    : timeGroups.map(tg => ({ key: tg.key, items: tg.items, label: tg.label, icon: tg.icon }))

  const categories: { key: NotiCategory | 'all'; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả', count: unreadCount },
    { key: 'transaction', label: 'Giao dịch' },
    { key: 'promo', label: 'Ưu đãi' },
    { key: 'system', label: 'Hệ thống' },
    { key: 'personal', label: 'Cá nhân' },
  ]

  return (
    <div>
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-[14px] p-4 mb-6 text-sm text-violet-800 leading-relaxed">
        💡 <b>Core idea:</b> Inbox tập trung vào hành động — gì cần làm, gì đã xảy ra, gì phù hợp với bạn. Thông báo nhóm theo thời gian, ưu đãi cá nhân hóa theo sở thích, AI tóm tắt actionable insights.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone mockup */}
        <div>
          <h3 className="text-base font-bold mb-3">📱 Mockup Inbox mới</h3>
          <div style={{ maxWidth: 340, margin: '0 auto', border: '2px solid #e2e8f0', borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'linear-gradient(135deg, #534AB7, #7F77DD)', color: '#fff', padding: '20px 16px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>🔔 Thông báo</span>
                <span style={{ fontSize: 11, opacity: 0.8, cursor: 'pointer' }} onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}>Đọc tất cả</span>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 3 }}>
                {categories.map(c => (
                  <button
                    key={c.key}
                    onClick={() => { setFilter(c.key); setSubFilter(null) }}
                    style={{
                      flex: 1, padding: '7px 2px', fontSize: 10, border: 'none', borderRadius: 8, cursor: 'pointer',
                      background: filter === c.key ? 'rgba(255,255,255,0.28)' : 'transparent',
                      color: filter === c.key ? '#fff' : 'rgba(255,255,255,0.6)',
                      fontWeight: filter === c.key ? 600 : 400, position: 'relative',
                    }}
                  >
                    {c.label}
                    {c.count && c.count > 0 ? (
                      <span style={{ position: 'absolute', top: -2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{c.count}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Unread summary bar */}
            <div style={{ padding: '10px 14px', background: unreadCount > 0 ? 'linear-gradient(135deg, #faf5ff, #f5f3ff)' : '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: unreadCount > 0 ? 6 : 0 }}>
                {unreadCount > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>{unreadCount}</span>
                      <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600 }}>chưa đọc</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(Object.entries(unreadByCategory) as [NotiCategory, number][])
                        .filter(([, count]) => count > 0)
                        .map(([cat, count]) => (
                          <span key={cat} style={{
                            fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                            background: categoryMeta[cat].bg, color: categoryMeta[cat].color,
                          }}>
                            {count} {categoryMeta[cat].label}
                          </span>
                        ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Đã đọc hết — bạn không bỏ lỡ gì!</span>
                  </div>
                )}
              </div>
              {unreadCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${readPct}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 9, color: '#94a3b8', flexShrink: 0 }}>{readPct}% đã đọc</span>
                </div>
              )}
            </div>

            {/* Sub-category filters */}
            {currentSubs && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSubFilter(null)}
                  style={{
                    padding: '3px 8px', fontSize: 10, border: 'none', borderRadius: 6, cursor: 'pointer',
                    background: !subFilter ? '#7c3aed' : '#f1f5f9', color: !subFilter ? '#fff' : '#64748b', fontWeight: 500,
                  }}
                >Tất cả</button>
                {currentSubs.map(sub => {
                  const isActive = subFilter === sub
                  const isInterested = interests.has(sub)
                  return (
                    <button
                      key={sub}
                      onClick={() => setSubFilter(isActive ? null : sub)}
                      style={{
                        padding: '3px 8px', fontSize: 10, border: 'none', borderRadius: 6, cursor: 'pointer',
                        background: isActive ? '#7c3aed' : isInterested ? '#faf5ff' : '#f1f5f9',
                        color: isActive ? '#fff' : isInterested ? '#7c3aed' : '#64748b',
                        fontWeight: isActive || isInterested ? 600 : 400,
                        outline: isInterested && !isActive ? '1px solid #c4b5fd' : 'none',
                      }}
                    >{isInterested ? '⭐ ' : ''}{sub}</button>
                  )
                })}
              </div>
            )}

            {/* AI Summary */}
            <AiSummaryCard expanded={aiExpanded} onToggle={() => setAiExpanded(!aiExpanded)} onDetail={() => setShowDailyBrief(true)} />

            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>
                {filtered.length} thông báo{showUnreadOnly ? ' chưa đọc' : ''}
              </span>
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                style={{
                  padding: '3px 10px', fontSize: 9, border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: showUnreadOnly ? '#7c3aed' : '#f1f5f9',
                  color: showUnreadOnly ? '#fff' : '#94a3b8',
                  fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                {showUnreadOnly ? '● Chưa đọc' : '○ Tất cả'}
              </button>
            </div>

            {/* Notification list with time groups */}
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {groups.map(group => (
                <div key={group.key}>
                  {/* Group header — category (All tab) or time (specific tab) */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 14px 6px',
                    background: '#fafbfc',
                    position: 'sticky', top: 0, zIndex: 1,
                  }}>
                    {group.color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />}
                    {group.icon && <span style={{ fontSize: 9 }}>{group.icon}</span>}
                    <span style={{ fontSize: 10, fontWeight: 700, color: group.color || '#475569', letterSpacing: 0.3, textTransform: 'uppercase' }}>{group.label}</span>
                    {group.unreadBadge && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: group.color, padding: '1px 6px', borderRadius: 8, lineHeight: '1.4' }}>{group.unreadBadge}</span>
                    )}
                    <span style={{ fontSize: 9, color: '#cbd5e1' }}>({group.items.length})</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 4 }} />
                  </div>

                  {group.items.map(n => {
                    const meta = categoryMeta[n.category]
                    const isUnread = n.unread && !readIds.has(n.id)
                    const isInterested = n.subCategory && interests.has(n.subCategory)

                    /* ── Promo → Score Cards ── */
                    if (n.category === 'promo') {
                      const cards = promoScoreCards.filter(c => c.notiId === n.id)
                      if (cards.length === 0) return null
                      return (
                        <div key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px 4px' }}>
                            {isUnread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />}
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{n.title}</span>
                            {n.grouped && (
                              <span style={{ fontSize: 9, background: meta.bg, color: meta.color, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                {n.groupCount} SP
                              </span>
                            )}
                            <span style={{ fontSize: 9, color: '#cbd5e1', marginLeft: 'auto' }}>{n.time}</span>
                          </div>
                          <div className="promo-scroll" style={{
                            padding: '6px 10px 10px', display: 'flex', gap: 8,
                            overflowX: 'auto', scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch' as any,
                            scrollbarWidth: 'none' as any,
                          }}>
                            {cards
                              .sort((a, b) => b.fitScore - a.fitScore)
                              .map((card, ci) => {
                                const fit = fitScoreColor(card.fitScore)
                                return (
                                  <div
                                    key={ci}
                                    onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                                    style={{
                                      border: `1px solid ${fit.ring}`, borderRadius: 12, background: '#fff',
                                      padding: '10px 12px', cursor: 'pointer', transition: 'all 0.15s',
                                      borderLeft: `3px solid ${card.squadColor}`,
                                      minWidth: 260, maxWidth: 280, flexShrink: 0,
                                      scrollSnapAlign: 'start',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                      <span style={{ fontSize: 9, fontWeight: 700, color: card.squadColor, background: card.squadBg, padding: '2px 7px', borderRadius: 4 }}>{card.squad}</span>
                                      <span style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', flex: 1 }}>{card.product}</span>
                                      <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                                        <svg width="32" height="32" viewBox="0 0 36 36">
                                          <circle cx="18" cy="18" r="15" fill="none" stroke={fit.ring} strokeWidth="3" />
                                          <circle cx="18" cy="18" r="15" fill="none" stroke={fit.color} strokeWidth="3"
                                            strokeDasharray={`${card.fitScore * 0.942} 100`}
                                            strokeLinecap="round" transform="rotate(-90 18 18)" />
                                        </svg>
                                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: fit.color }}>
                                          {card.fitScore}
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 3 }}>{card.headline}</div>
                                    <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5, marginBottom: 6 }}>{card.detail}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: fit.bg, borderRadius: 6, marginBottom: 6 }}>
                                      <span style={{ fontSize: 10, color: fit.color, fontWeight: 600 }}>{card.highlight}</span>
                                    </div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.4, marginBottom: 6 }}>
                                      💡 {card.reason}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <button style={{
                                        flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                                        background: card.fitScore >= 60 ? card.squadColor : '#f1f5f9',
                                        color: card.fitScore >= 60 ? '#fff' : '#64748b',
                                        fontSize: 10, fontWeight: 700,
                                      }}>{card.cta}</button>
                                      {card.badge && (
                                        <span style={{ fontSize: 9, fontWeight: 600, color: '#dc2626', background: '#fef2f2', padding: '3px 8px', borderRadius: 4, border: '1px solid #fecaca' }}>
                                          {card.badge}
                                        </span>
                                      )}
                                      <span style={{ fontSize: 9, fontWeight: 600, color: fit.color, background: fit.bg, padding: '3px 8px', borderRadius: 4 }}>
                                        {fit.label}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                          {cards.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '2px 0 6px' }}>
                              {cards.map((_, i) => (
                                <div key={i} style={{ width: i === 0 ? 12 : 5, height: 5, borderRadius: 3, background: i === 0 ? '#7c3aed' : '#e2e8f0', transition: 'all 0.2s' }} />
                              ))}
                              <span style={{ fontSize: 8, color: '#94a3b8', marginLeft: 4 }}>← vuốt</span>
                            </div>
                          )}
                        </div>
                      )
                    }

                    /* ── Regular notification ── */
                    const isMarginCall = n.subCategory === 'Margin'
                    const isSignal = n.subCategory === 'Tín hiệu'
                    return (
                      <div
                        key={n.id}
                        onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                        style={{
                          display: 'flex', gap: 10, padding: '14px 14px', borderBottom: '1px solid #f1f5f9',
                          background: isMarginCall ? '#fef2f2' : isSignal ? '#f0fdf4' : isInterested ? '#fefbff' : isUnread ? '#faf5ff' : '#fff',
                          cursor: 'pointer', transition: 'background 0.15s',
                          borderLeft: isMarginCall ? '3px solid #dc2626' : isSignal ? '3px solid #16a34a' : isInterested ? '3px solid #a78bfa' : '3px solid transparent',
                        }}
                      >
                        {isUnread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', marginTop: 7, flexShrink: 0 }} />}
                        {!isUnread && <div style={{ width: 7 }} />}
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, position: 'relative' }}>
                          {n.icon}
                          {isInterested && (
                            <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 10, lineHeight: 1 }}>⭐</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: isUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{n.title}</span>
                            {n.grouped && (
                              <span style={{ fontSize: 9, background: meta.bg, color: meta.color, padding: '1px 6px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
                                {n.groupCount} gộp
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.desc}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 9, color: '#cbd5e1' }}>{n.time}</span>
                              <span style={{ fontSize: 9, background: meta.bg, color: meta.color, padding: '0 5px', borderRadius: 3, fontWeight: 500 }}>{meta.label}</span>
                              {n.subCategory && (
                                <span style={{ fontSize: 8, background: '#f8fafc', color: '#94a3b8', padding: '0 4px', borderRadius: 3, border: '1px solid #e2e8f0' }}>{n.subCategory}</span>
                              )}
                            </div>
                            {n.cta && (
                              <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }}>{n.cta} →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                    {showUnreadOnly ? 'Đã đọc hết — bạn không bỏ lỡ gì!' : 'Không có thông báo nào'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div>
          {/* User needs section */}
          <h3 className="text-base font-bold mb-3">🎯 Người dùng cần gì khi đọc inbox?</h3>
          <div className="panel" style={{ borderLeft: '3px solid #7c3aed', borderRadius: '0 14px 14px 0' }}>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              {[
                { q: '"Tôi bỏ lỡ gì?"', a: 'Unread dot + count badge + title bold', icon: '👀' },
                { q: '"Có gì cần làm ngay?"', a: 'CTA nổi bật + AI nhắc "3 cần hành động"', icon: '⚡' },
                { q: '"Chuyện gì đã xảy ra?"', a: 'Timeline rõ ràng — Hôm nay / Hôm qua / Trước đó', icon: '📋' },
                { q: '"Có gì hay cho tôi?"', a: 'Ưu đãi match sở thích, fit score, swipe carousel', icon: '🎯' },
                { q: '"Đừng làm phiền tôi"', a: 'Kiểm soát inbox: filter theo loại, đọc tất cả 1 chạm, chọn sản phẩm quan tâm, gộp thông báo tương tự', icon: '🔕' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 8px', background: i % 2 === 0 ? '#faf5ff' : '#f8fafc', borderRadius: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: 2 }}>{item.q}</div>
                    <div style={{ color: '#64748b' }}>{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category system */}
          <h3 className="text-base font-bold mt-5 mb-3">🏷️ 4 Category chính</h3>
          <div className="space-y-3">
            {(Object.entries(categoryMeta) as [NotiCategory, typeof categoryMeta.transaction][]).map(([key, meta]) => (
              <div key={key} className="panel" style={{ borderLeft: `3px solid ${meta.color}`, borderRadius: '0 14px 14px 0', marginBottom: 8, padding: 14 }}>
                <span style={{ background: meta.bg, color: meta.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{meta.label}</span>
                <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {key === 'transaction' && 'Lệnh khớp, nạp/rút tiền, cổ tức, margin call, tín hiệu kỹ thuật (MA, RSI, breakout). Gửi ngay — không giới hạn frequency.'}
                  {key === 'promo' && 'Campaign, mời sản phẩm, voucher, iLucky, khuyến mãi. Áp frequency cap + smart grouping.'}
                  {key === 'system' && 'Bảo trì, cập nhật app, thay đổi chính sách, OTP, bảo mật. Pin lên đầu inbox.'}
                  {key === 'personal' && 'Phân tích đầu tư từ team nghiên cứu, nhắn tin từ NVTV, lời mời event. Không áp frequency cap.'}
                </div>
              </div>
            ))}
          </div>

          {/* Smart grouping */}
          <h3 className="text-base font-bold mt-5 mb-3">📦 Gom nhóm thông minh</h3>
          <div className="panel">
            <div className="text-xs text-slate-500 space-y-2.5 leading-relaxed">
              <div>🔹 <b>&quot;Tất cả&quot;</b> gom theo <b>category</b> (Giao dịch, Ưu đãi, Cá nhân, Hệ thống) — category có tin mới lên trước</div>
              <div>🔹 Tab riêng (VD: Giao dịch) gom theo <b>thời gian</b> (Hôm nay / Hôm qua / Trước đó)</div>
              <div>🔹 Nhiều sản phẩm mời cùng ngày → gộp <b>1 inbox card carousel</b></div>
              <div>🔹 Lệnh khớp liên tiếp → gộp <b>1 summary</b> &quot;5 lệnh khớp hôm nay&quot;</div>
              <div>🔹 Tín hiệu đăng ký nhiều → gộp <b>1 dòng đếm</b> &quot;8 tín hiệu mới&quot;</div>
            </div>
          </div>

          {/* Product interests */}
          <h3 className="text-base font-bold mt-5 mb-3">⭐ Quan tâm theo sản phẩm</h3>
          <div className="panel">
            <div className="text-xs text-slate-500 mb-3 leading-relaxed">
              KH chọn sản phẩm quan tâm → thông báo liên quan được <b>highlight + pin lên đầu</b>. Khi chọn category, sub-filter hiện ra theo sản phẩm.
            </div>
            {(Object.entries(subCategoryMap) as [NotiCategory, SubCategory[]][]).map(([cat, subs]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: categoryMeta[cat].color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  {categoryMeta[cat].label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {subs.map(sub => {
                    const active = interests.has(sub)
                    return (
                      <button
                        key={`${cat}-${sub}`}
                        onClick={() => toggleInterest(sub)}
                        style={{
                          padding: '4px 10px', fontSize: 11, border: 'none', borderRadius: 8, cursor: 'pointer',
                          background: active ? '#7c3aed' : '#f1f5f9',
                          color: active ? '#fff' : '#64748b',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.15s',
                        }}
                      >
                        {active ? '⭐ ' : ''}{sub}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '8px 10px', background: '#faf5ff', borderRadius: 8, border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600 }}>
                Đang quan tâm: {interests.size > 0 ? [...interests].join(', ') : 'Chưa chọn'}
              </div>
              <div style={{ fontSize: 9, color: '#a78bfa', marginTop: 2 }}>
                Thông báo ⭐ sẽ pin lên đầu inbox + có viền highlight tím
              </div>
            </div>
          </div>

          {/* Read/unread tracking mechanism */}
          <h3 className="text-base font-bold mt-5 mb-3">📖 Cơ chế Đọc / Chưa đọc</h3>
          <div className="panel">
            <div className="text-xs text-slate-500 space-y-2.5 leading-relaxed">
              <div>🔹 Server lưu <b>read_at timestamp</b> mỗi notification × user</div>
              <div>🔹 Mở inbox → API trả <b>unread count</b> → hiện badge trên app icon</div>
              <div>🔹 Tap notification → gọi <b>mark_read</b> API → bỏ unread dot + cập nhật count</div>
              <div>🔹 &quot;Đọc tất cả&quot; → batch <b>mark_all_read</b> → clear toàn bộ</div>
              <div>🔹 Push badge = server unread count, sync <b>realtime</b> qua WebSocket</div>
            </div>
            <div style={{ marginTop: 12, padding: '8px 10px', background: '#faf5ff', borderRadius: 8, border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>Visual treatment:</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', marginBottom: 3 }}>● Chưa đọc</div>
                  <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>Dot tím · Title bold · Nền tím nhạt · Count badge</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginBottom: 3 }}>○ Đã đọc</div>
                  <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>Không dot · Font normal · Nền trắng</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#2563eb', marginBottom: 2 }}>Unread summary bar</div>
              <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>
                Hiện tổng chưa đọc + breakdown theo category + progress bar % đã đọc. Khi đọc hết → &quot;✅ Đã đọc hết&quot;
              </div>
            </div>
          </div>
        </div>

      </div>

      <AiDailyBriefModal open={showDailyBrief} onClose={() => setShowDailyBrief(false)} />
    </div>
  )
}
