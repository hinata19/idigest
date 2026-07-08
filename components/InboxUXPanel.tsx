'use client'
import { useState, useEffect, useRef } from 'react'
import { notifications, channelConfig } from '@/data/notifications'
import type { NotiCategory } from '@/data/notifications'

const categoryMeta: Record<NotiCategory, { label: string; color: string; bg: string }> = {
  transaction: { label: 'Giao dịch', color: '#dc2626', bg: '#fee2e2' },
  promo: { label: 'Ưu đãi', color: '#7c3aed', bg: '#ede9fe' },
  system: { label: 'Hệ thống', color: '#2563eb', bg: '#dbeafe' },
  personal: { label: 'Cá nhân', color: '#059669', bg: '#d1fae5' },
}

const aiSummaryLines = [
  { type: 'highlight' as const, icon: '📊', text: '2 lệnh khớp hôm nay — MWG +500, tổng GT 26.1tr. Cổ tức HPG 2.5tr đã về TK.' },
  { type: 'action' as const, icon: '⚠️', text: 'Cần bật xác thực 2 lớp — bảo mật tài khoản đang ở mức thấp.' },
  { type: 'promo' as const, icon: '🎯', text: '3 ưu đãi phù hợp profile: Bond 9.5% (kỳ hạn yêu thích), Fund KM 0% phí, iLucky 3 lượt quay.' },
  { type: 'personal' as const, icon: '💬', text: 'NVTV Nguyễn Văn A nhắn về TCBond mới — nên trả lời trong hôm nay.' },
  { type: 'insight' as const, icon: '💡', text: 'Tuần này bạn nhận 8 noti, ít hơn 40% so với tuần trước. Open rate của bạn: 72%.' },
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

  const bgColors = {
    highlight: '#fffbeb',
    action: '#fef2f2',
    promo: '#f5f3ff',
    personal: '#f0fdf4',
    insight: '#eff6ff',
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
            {expanded ? 'Phân tích thông báo hôm nay' : 'Nhấn để xem tóm tắt thông minh'}
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

const dailyBriefData = {
  date: 'Thứ Tư, 09/07/2026',
  greeting: 'Chào buổi sáng! Đây là bản tóm tắt thông báo hôm nay của bạn.',
  sections: [
    {
      title: '💰 Giao dịch & Tài sản',
      color: '#dc2626',
      bg: '#fef2f2',
      items: [
        { label: 'Lệnh khớp MWG x500', detail: 'Giá 52,300 · GT: 26.15tr', status: 'done' as const },
        { label: 'Nạp tiền +50tr', detail: 'Vào TK chứng khoán lúc 08:15', status: 'done' as const },
        { label: 'Cổ tức HPG +2.5tr', detail: 'Đã về TK 5 ngày trước', status: 'done' as const },
        { label: '5 lệnh khớp hôm qua', detail: 'HPG, VNM, FPT, TCB, VIC', status: 'done' as const },
      ],
      summary: 'Tổng giá trị GD hôm nay: ~76.15tr. Portfolio +1.2% so với hôm qua.',
    },
    {
      title: '⚠️ Cần hành động',
      color: '#ea580c',
      bg: '#fff7ed',
      items: [
        { label: 'Bật xác thực 2 lớp', detail: 'Bảo mật TK đang ở mức thấp', status: 'urgent' as const },
        { label: 'Trả lời NVTV Nguyễn Văn A', detail: 'Nhắn về TCBond mới — 6h trước', status: 'pending' as const },
        { label: 'Đăng ký Investor Day 15/07', detail: 'Sự kiện VIP tại HCM — còn 6 ngày', status: 'pending' as const },
      ],
    },
    {
      title: '🎯 Ưu đãi phù hợp bạn',
      color: '#7c3aed',
      bg: '#f5f3ff',
      items: [
        { label: 'TCBond 9.5% kỳ hạn 12 tháng', detail: 'Phù hợp profile đầu tư · còn 3 ngày', status: 'hot' as const },
        { label: 'Fund KM 0% phí mua', detail: 'Diversify portfolio hiệu quả', status: 'new' as const },
        { label: 'iLucky 3 lượt quay miễn phí', detail: 'Hết hạn cuối tuần này', status: 'new' as const },
      ],
      summary: 'AI gợi ý: TCBond 9.5% match 87% với profile risk-appetite của bạn.',
    },
    {
      title: '📊 Insight tuần này',
      color: '#2563eb',
      bg: '#eff6ff',
      items: [
        { label: 'Bạn nhận 8 thông báo', detail: 'Giảm 40% so với tuần trước (13 noti)', status: 'done' as const },
        { label: 'Open rate: 72%', detail: 'Cao hơn trung bình KH cùng segment (54%)', status: 'done' as const },
        { label: '0 thông báo bị dismiss', detail: 'Nội dung đang phù hợp với bạn', status: 'done' as const },
      ],
    },
  ],
  aiNote: 'AI đã lọc 6 thông báo spam/trùng lặp trong tuần này — bạn chỉ nhận những gì thực sự liên quan.',
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
        {/* Header */}
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

        {/* Sections */}
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

          {/* AI footer note */}
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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        background: on ? '#7c3aed' : '#e2e8f0',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s',
        left: on ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

export default function InboxUXPanel() {
  const [filter, setFilter] = useState<NotiCategory | 'all'>('all')
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [prefs, setPrefs] = useState({
    push_tx: true, push_promo: true, push_sys: true, push_personal: true,
    email_tx: true, email_promo: false, email_sys: true,
    email_digest: true, quiet_hours: true,
  })

  const [aiExpanded, setAiExpanded] = useState(false)
  const [showDailyBrief, setShowDailyBrief] = useState(false)

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.category === filter)
  const unreadCount = notifications.filter(n => n.unread && !readIds.has(n.id)).length

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
        💡 <b>Core idea:</b> Tách inbox thành 4 category có màu độc lập — khách hàng biết ngay tin nào quan trọng, tin nào quảng cáo. Ưu tiên "giao dịch" lên đầu, "khuyến mãi" xuống dưới. KH tự chọn nhận/không nhận.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phone mockup */}
        <div>
          <h3 className="text-base font-bold mb-3">📱 Mockup Inbox mới</h3>
          <div style={{ maxWidth: 340, margin: '0 auto', border: '2px solid #e2e8f0', borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'linear-gradient(135deg, #534AB7, #7F77DD)', color: '#fff', padding: '20px 16px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>🔔 Thông báo</span>
                <span style={{ fontSize: 11, opacity: 0.8, cursor: 'pointer' }} onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}>Đọc tất cả</span>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 3 }}>
                {categories.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setFilter(c.key)}
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
            <AiSummaryCard expanded={aiExpanded} onToggle={() => setAiExpanded(!aiExpanded)} onDetail={() => setShowDailyBrief(true)} />
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {filtered.map(n => {
                const meta = categoryMeta[n.category]
                const isUnread = n.unread && !readIds.has(n.id)
                return (
                  <div
                    key={n.id}
                    onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                    style={{
                      display: 'flex', gap: 10, padding: '14px 14px', borderBottom: '1px solid #f1f5f9',
                      background: isUnread ? '#faf5ff' : '#fff', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                  >
                    {isUnread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', marginTop: 7, flexShrink: 0 }} />}
                    {!isUnread && <div style={{ width: 7 }} />}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {n.icon}
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
          </div>
        </div>

        {/* Category + grouping */}
        <div>
          <h3 className="text-base font-bold mb-3">🏷️ 4 Category chính</h3>
          <div className="space-y-3">
            {(Object.entries(categoryMeta) as [NotiCategory, typeof categoryMeta.transaction][]).map(([key, meta]) => (
              <div key={key} className="panel" style={{ borderLeft: `3px solid ${meta.color}`, borderRadius: '0 14px 14px 0', marginBottom: 8, padding: 14 }}>
                <span style={{ background: meta.bg, color: meta.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{meta.label}</span>
                <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {key === 'transaction' && 'Lệnh khớp, nạp/rút tiền, biến động số dư, cổ tức, kỳ hạn đáo hạn. Không giới hạn frequency — luôn gửi ngay.'}
                  {key === 'promo' && 'Campaign, mời sản phẩm, voucher, iLucky, khuyến mãi. Áp frequency cap + smart grouping.'}
                  {key === 'system' && 'Bảo trì, cập nhật app, thay đổi chính sách, OTP, bảo mật. Pin lên đầu inbox.'}
                  {key === 'personal' && 'Nhắn tin từ NVTV, lời mời event, sinh nhật. Như chat, không áp frequency cap.'}
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold mt-5 mb-3">📦 Gom nhóm thông minh</h3>
          <div className="panel">
            <div className="text-xs text-slate-500 space-y-2.5 leading-relaxed">
              <div>🔹 Nhiều sản phẩm mời cùng ngày → gộp <b>1 inbox card carousel</b></div>
              <div>🔹 Lệnh khớp liên tiếp → gộp <b>1 summary</b> "5 lệnh khớp hôm nay"</div>
              <div>🔹 Campaign cùng chiến dịch → chỉ hiện <b>tin mới nhất</b>, ẩn tin cũ</div>
              <div>🔹 Hệ thống cùng loại → <b>stack</b> và hiện badge số lượng</div>
            </div>
          </div>
        </div>

        {/* Preference + channel */}
        <div>
          <h3 className="text-base font-bold mb-3">⚙️ Preference Center (KH tự quản lý)</h3>
          <div className="panel">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Push notification</div>
            {(['tx', 'promo', 'sys', 'personal'] as const).map(cat => {
              const key = `push_${cat}` as keyof typeof prefs
              const labels = { tx: 'Giao dịch', promo: 'Ưu đãi', sys: 'Hệ thống', personal: 'Cá nhân' }
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
                  <span>{labels[cat]}</span>
                  <Toggle on={prefs[key] as boolean} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              )
            })}

            <div className="border-t border-slate-100 my-3" />
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Email</div>
            {(['tx', 'promo', 'sys'] as const).map(cat => {
              const key = `email_${cat}` as keyof typeof prefs
              const labels = { tx: 'Giao dịch', promo: 'Ưu đãi', sys: 'Hệ thống' }
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
                  <span>{labels[cat]}</span>
                  <Toggle on={prefs[key] as boolean} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              )
            })}

            <div className="border-t border-slate-100 my-3" />
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tùy chọn nâng cao</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
              <span>Weekly Digest (gộp email)</span>
              <Toggle on={prefs.email_digest} onToggle={() => setPrefs(p => ({ ...p, email_digest: !p.email_digest }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
              <span>Quiet Hours (22h — 7h)</span>
              <Toggle on={prefs.quiet_hours} onToggle={() => setPrefs(p => ({ ...p, quiet_hours: !p.quiet_hours }))} />
            </div>
          </div>

          <h3 className="text-base font-bold mt-5 mb-3">📊 Channel routing</h3>
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">Kênh</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">Loại noti</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">Giới hạn</th>
                </tr>
              </thead>
              <tbody>
                {channelConfig.map(ch => (
                  <tr key={ch.channel} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 font-semibold">{ch.channel}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {ch.categories.map(c => (
                          <span key={c} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      <div className="font-medium">{ch.limit}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ch.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AiDailyBriefModal open={showDailyBrief} onClose={() => setShowDailyBrief(false)} />
    </div>
  )
}
