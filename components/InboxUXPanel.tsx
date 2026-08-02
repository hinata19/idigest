'use client'
import { useState, useEffect, useRef } from 'react'
import { notifications, subCategoryMap, marketTicker, portfolioSummary } from '@/data/notifications'
import type { Notification, NotiCategory, SubCategory } from '@/data/notifications'

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */

const T = {
  primary: '#4F46E5',
  primarySoft: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  primaryDark: '#3730A3',
  text: '#0F172A',
  textSec: '#475569',
  textMute: '#94A3B8',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  red: '#DC2626',
  redBg: '#FEF2F2',
  green: '#059669',
  greenBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  violet: '#7C3AED',
  violetBg: '#F5F3FF',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  orange: '#EA580C',
  orangeBg: '#FFF7ED',
}

const catMeta: Record<NotiCategory, { color: string; bg: string; label: string; letter: string }> = {
  transaction: { color: T.orange, bg: T.orangeBg, label: 'Giao dịch', letter: 'GD' },
  promo: { color: T.violet, bg: T.violetBg, label: 'Ưu đãi', letter: 'ƯĐ' },
  system: { color: T.blue, bg: T.blueBg, label: 'Hệ thống', letter: 'HT' },
  personal: { color: T.green, bg: T.greenBg, label: 'Cá nhân', letter: 'CN' },
}

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

function getPriority(n: Notification): number {
  if (n.subCategory === 'Margin') return 0
  if (n.category === 'transaction' && n.subCategory === 'Tín hiệu') return 1
  if (n.category === 'transaction' && n.unread) return 1
  if (n.subCategory === 'Phân tích') return 2
  if (n.subCategory === 'Sự kiện') return 2
  if (n.category === 'promo') return 3
  if (n.category === 'system') return 4
  return 3
}

function getTimeGroup(time: string): 'today' | 'yesterday' | 'earlier' {
  if (time.includes('phút') || time.includes('giờ')) return 'today'
  if (time.includes('Hôm qua')) return 'yesterday'
  return 'earlier'
}

const timeLabels: Record<string, string> = { today: 'Hôm nay', yesterday: 'Hôm qua', earlier: 'Trước đó' }

function getIconForNoti(n: Notification): { letter: string; color: string; bg: string } {
  if (n.subCategory === 'Margin') return { letter: '!', color: T.red, bg: T.redBg }
  if (n.subCategory === 'Tín hiệu') return { letter: '↗', color: T.green, bg: T.greenBg }
  if (n.subCategory === 'Stock') return { letter: 'S', color: T.orange, bg: T.orangeBg }
  if (n.subCategory === 'Bond') return { letter: 'B', color: T.blue, bg: T.blueBg }
  if (n.subCategory === 'Fund') return { letter: 'F', color: T.green, bg: T.greenBg }
  if (n.subCategory === 'iLucky') return { letter: '★', color: T.red, bg: T.redBg }
  if (n.subCategory === 'Bảo mật') return { letter: '⛨', color: T.blue, bg: T.blueBg }
  if (n.subCategory === 'App') return { letter: '◎', color: T.blue, bg: T.blueBg }
  if (n.subCategory === 'Phân tích') return { letter: '◆', color: T.green, bg: T.greenBg }
  if (n.subCategory === 'Sự kiện') return { letter: '▸', color: T.green, bg: T.greenBg }
  if (n.category === 'transaction') return { letter: '↔', color: T.orange, bg: T.orangeBg }
  if (n.category === 'promo') return { letter: '★', color: T.violet, bg: T.violetBg }
  if (n.category === 'system') return { letter: '⚙', color: T.blue, bg: T.blueBg }
  return { letter: '◇', color: T.green, bg: T.greenBg }
}

function getAiExplanation(n: Notification): string {
  if (n.subCategory === 'Margin') return 'HPG -3.2% và MWG -1.5% làm giảm giá trị TSĐB. Bạn cần nạp thêm ~18tr hoặc bán 200 HPG để margin về trên 140%.'
  if (n.subCategory === 'Tín hiệu') return 'ACB vừa cắt lên MA50 với volume tăng 40% — tín hiệu tích cực cho xu hướng ngắn hạn. HPG đang test ngưỡng kháng cự 30K. Bạn đang hold cả 2 mã.'
  if (n.subCategory === 'Stock') return `Lệnh đã được khớp thành công trong phiên. ${n.desc}. Tổng vị thế MWG hiện tại: 1,500 CP.`
  if (n.subCategory === 'Phân tích') return 'Team Phân tích đánh giá 5 CP tiềm năng dựa trên phân tích kỹ thuật và cơ bản. Bạn đang hold HPG và MWG trong danh sách — 2 mã có tín hiệu tích cực.'
  if (n.subCategory === 'Bond') return 'TCBond 9.5% là sản phẩm fixed-income phù hợp nếu bạn muốn đa dạng hóa. Lãi suất cao hơn gửi tiết kiệm 3-4%. Kỳ hạn 12T phù hợp với lịch sử đầu tư.'
  if (n.subCategory === 'Bảo mật') return 'Xác thực 2 lớp (2FA) bảo vệ tài khoản khỏi truy cập trái phép. Chỉ mất 2 phút để bật. 78% KH đã kích hoạt.'
  if (n.subCategory === 'iLucky') return 'Chương trình giải trí — 3 lượt quay miễn phí. Giải thưởng: voucher, điểm thưởng. Không liên quan đến mục tiêu đầu tư.'
  return `${n.desc}. AI đánh giá thông báo này liên quan đến hoạt động giao dịch gần đây của bạn.`
}

function getAiSuggestions(n: Notification): string[] {
  if (n.subCategory === 'Margin') return ['Nếu bán HPG thì lỗ bao nhiêu?', 'So sánh nạp tiền vs bán CP', 'Lịch sử margin']
  if (n.subCategory === 'Tín hiệu') return ['ACB có nên mua thêm?', 'Mục tiêu giá HPG?', 'So sánh 8 tín hiệu']
  if (n.subCategory === 'Stock') return ['Giá vốn trung bình?', 'Lãi/lỗ hôm nay?', 'Xem sổ lệnh']
  if (n.subCategory === 'Phân tích') return ['Tại sao chọn 5 mã này?', 'Mã nào phù hợp nhất?', 'Rủi ro cần lưu ý?']
  if (n.subCategory === 'Bond') return ['So sánh với tiết kiệm?', 'Rủi ro trái phiếu?', 'Tôi nên mua bao nhiêu?']
  return ['Giải thích thêm', 'Ảnh hưởng danh mục?', 'Gợi ý hành động']
}

function getAiResponse(n: Notification, q: string): string {
  if (q.includes('bán HPG') || q.includes('lỗ bao nhiêu')) return 'Giá vốn HPG: 30,800đ. Giá hiện tại: 29,200đ. Nếu bán 200 CP, lỗ ước tính: -320,000đ (-5.2%).\n\nGợi ý: Nạp thêm 18tr có thể tốt hơn vì HPG đang gần vùng hỗ trợ MA50. Nếu HPG phục hồi về 31K, bạn sẽ lãi 400K thay vì chốt lỗ.'
  if (q.includes('nạp tiền') || q.includes('So sánh')) return 'Phương án 1 — Nạp 18tr: margin về 140%, an toàn tối thiểu.\nPhương án 2 — Nạp 25tr: margin về 155%, có buffer.\nPhương án 3 — Bán 200 HPG: margin về 148%, nhưng chốt lỗ 320K.\n\nGợi ý: Phương án 2 tốt nhất nếu bạn tin HPG sẽ phục hồi.'
  if (q.includes('ACB')) return 'ACB vừa cắt lên MA50 với volume tăng 40%. Tín hiệu mua ngắn hạn. Bạn đang hold 1,000 ACB giá vốn 23.5K.\n\nTarget ngắn hạn: 26-28K. Stop loss: 22K. Risk/Reward: 1:2.5.'
  if (q.includes('mục tiêu') || q.includes('HPG')) return 'HPG đang test kháng cự 30K. Nếu breakout với volume, target 32-34K. Ngành thép Q3 có tín hiệu phục hồi — giá thép tăng 8% trong 2 tuần qua.'
  return 'Tôi đang phân tích thêm dữ liệu. Danh mục của bạn có 8 vị thế, tổng giá trị 1.25 tỷ. P&L hôm nay +15.2tr (+1.23%). Bạn có thể hỏi cụ thể hơn về mã cổ phiếu hoặc chiến lược.'
}

function getRelatedNotis(n: Notification): Notification[] {
  return notifications
    .filter(o => o.id !== n.id && (o.category === n.category || (n.subCategory && o.subCategory === n.subCategory)))
    .slice(0, 3)
}

/* ═══════════════════════════════════════════
   SPARKLINE & COUNTDOWN
   ═══════════════════════════════════════════ */

const stockSparklines: Record<string, number[]> = {
  ACB: [22.1, 22.5, 22.3, 23.1, 23.8, 24.2, 24.0, 24.5, 25.1, 25.8],
  HPG: [27.5, 28.0, 28.2, 28.8, 29.1, 29.5, 30.0, 30.2, 30.5, 30.8],
  MWG: [50.5, 51.0, 51.2, 51.8, 52.0, 52.5, 52.1, 52.3, 52.0, 52.3],
}

function Sparkline({ data, color, width = 50, height = 18 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1, pad = 2
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })
  const area = [...points, `${width - pad},${height}`, `${pad},${height}`]
  const last = points[points.length - 1].split(',')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0 }}>
      <polygon points={area.join(' ')} fill={color} opacity="0.12" />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  )
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [seconds, setSeconds] = useState(9000)
  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(iv)
  }, [])
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, color: T.red, background: T.redBg,
      padding: '3px 10px', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace",
      border: '1px solid #FECACA', animation: 'countdownPulse 2s ease-in-out infinite',
    }}>
      ⏰ {h}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
      <span style={{ fontSize: 9, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#EF4444', marginLeft: 2 }}>
        ({deadline})
      </span>
    </span>
  )
}

/* ═══════════════════════════════════════════
   PROMO SCORE CARDS
   ═══════════════════════════════════════════ */

interface PromoScoreCard {
  notiId: string; product: string; squad: string; squadColor: string; squadBg: string
  fitScore: number; headline: string; detail: string; highlight: string; reason: string; cta: string; badge?: string
}

const promoScoreCards: PromoScoreCard[] = [
  { notiId: 'n3', product: 'TCBond 9.5%', squad: 'Bond', squadColor: '#1d4ed8', squadBg: '#dbeafe', fitScore: 87, headline: 'Lãi suất 9.5%/năm · Kỳ hạn 12 tháng', detail: 'Bond đa dạng hóa đầu tư với lãi suất ổn định. Kỳ hạn 12T phù hợp.', highlight: '+3.5tr lợi suất/năm', reason: 'Kỳ hạn bạn hay chọn + chưa có fixed-income', cta: 'Xem Bond', badge: 'Còn 3 ngày' },
  { notiId: 'n3', product: 'TCBF Fund', squad: 'Fund', squadColor: '#15803d', squadBg: '#dcfce7', fitScore: 72, headline: 'KM 0% phí mua · Quỹ cân bằng', detail: 'TCBF lãi 12.5% năm qua, drawdown max -5%.', highlight: 'Giảm rủi ro danh mục', reason: 'Chưa đầu tư quỹ + phí 0%', cta: 'Tìm hiểu' },
  { notiId: 'n3', product: 'iLucky x2', squad: 'iLucky', squadColor: '#dc2626', squadBg: '#fef2f2', fitScore: 25, headline: '3 lượt quay miễn phí', detail: 'Giải trí nhẹ nhàng.', highlight: 'Không liên quan đầu tư', reason: 'Ít liên quan mục tiêu đầu tư', cta: 'Quay ngay' },
  { notiId: 'n6', product: 'TCBond 9.5%', squad: 'Bond', squadColor: '#1d4ed8', squadBg: '#dbeafe', fitScore: 87, headline: 'Đầu tư từ 10 triệu', detail: 'Lãi suất cao nhất gần đây.', highlight: '9.5%/năm', reason: 'Lãi suất cao + profile phù hợp', cta: 'Mua ngay', badge: 'Còn 3 ngày' },
  { notiId: 'n9', product: 'iLucky', squad: 'iLucky', squadColor: '#dc2626', squadBg: '#fef2f2', fitScore: 15, headline: 'Quay số trúng thưởng', detail: 'Game giải trí.', highlight: 'Vui chơi', reason: 'Không liên quan chiến lược đầu tư', cta: 'Quay ngay' },
]

function fitScoreColor(score: number) {
  if (score >= 80) return { color: '#16a34a', bg: '#f0fdf4', ring: '#bbf7d0', label: 'Rất phù hợp' }
  if (score >= 60) return { color: '#ca8a04', bg: '#fefce8', ring: '#fde68a', label: 'Phù hợp' }
  if (score >= 40) return { color: '#0891b2', bg: '#ecfeff', ring: '#a5f3fc', label: 'Tham khảo' }
  return { color: '#94a3b8', bg: '#f8fafc', ring: '#e2e8f0', label: 'Ít liên quan' }
}

/* ═══════════════════════════════════════════
   MARKET TICKER
   ═══════════════════════════════════════════ */

function MarketTicker({ visible }: { visible: boolean }) {
  if (!visible) return <div style={{ height: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.violet}, ${T.green})` }} />
  const items = [...marketTicker, ...marketTicker, ...marketTicker]
  return (
    <div style={{ overflow: 'hidden', background: '#0F172A', padding: '6px 0', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', gap: 28, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {items.map((idx, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: '#94A3B8', letterSpacing: 0.3 }}>{idx.name}</span>
            <span style={{ color: '#E2E8F0', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              {idx.value.toLocaleString('vi-VN')}
            </span>
            <span style={{ color: idx.change >= 0 ? '#4ADE80' : '#F87171', fontWeight: 700, fontSize: 10 }}>
              {idx.change >= 0 ? '▲' : '▼'}{Math.abs(idx.changePct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   AI PRIORITY CARD
   ═══════════════════════════════════════════ */

const aiPriorityItems = [
  { id: 'n13', severity: 'critical' as const, letter: '!', color: T.red, bg: T.redBg, title: 'Margin Call: ký quỹ 132%', sub: 'Nạp thêm hoặc bán bớt trước 14h', cta: 'Xử lý' },
  { id: 'n14', severity: 'high' as const, letter: '↗', color: T.green, bg: T.greenBg, title: '8 tín hiệu mới hôm nay', sub: 'ACB ↑MA50, HPG ↑30K nổi bật', cta: 'Xem' },
  { id: 'n1', severity: 'high' as const, letter: 'S', color: T.orange, bg: T.orangeBg, title: 'MWG x500 khớp 52,300', sub: 'Tổng GT 26.1tr', cta: 'Chi tiết' },
]

function AiPriorityCard({ onViewBrief, onTapItem, expanded, onToggle }: {
  onViewBrief: () => void; onTapItem: (id: string) => void; expanded: boolean; onToggle: () => void
}) {
  return (
    <div style={{ margin: '12px 14px', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.primaryBorder}`, background: T.surface }}>
      <div
        onClick={onToggle}
        style={{
          padding: '14px 16px', cursor: 'pointer',
          background: `linear-gradient(135deg, ${T.primarySoft}, #F5F3FF, ${T.greenBg})`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.primary}, ${T.violet})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#fff', flexShrink: 0,
          boxShadow: `0 2px 8px ${T.primary}40`,
        }}>
          ✦
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: -0.2 }}>
            {aiPriorityItems.length} việc cần làm ngay
          </div>
          <div style={{ fontSize: 11, color: T.textMute, marginTop: 2 }}>
            {expanded ? '1 margin call · 1 tín hiệu · 1 giao dịch' : 'Nhấn để xem chi tiết'}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMute} strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {expanded && (
        <div style={{ padding: '4px 12px 12px' }}>
          {aiPriorityItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => onTapItem(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 8px', cursor: 'pointer',
                borderBottom: i < aiPriorityItems.length - 1 ? `1px solid ${T.borderSoft}` : 'none',
                borderRadius: 8, transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: item.color, flexShrink: 0,
                border: `1px solid ${item.color}25`,
              }}>
                {item.letter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.title}</div>
                <div style={{ fontSize: 11, color: T.textMute, marginTop: 1 }}>{item.sub}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, color: item.severity === 'critical' ? T.red : T.primary,
                padding: '4px 10px', borderRadius: 6,
                background: item.severity === 'critical' ? T.redBg : T.primarySoft,
                border: `1px solid ${item.severity === 'critical' ? '#FECACA' : T.primaryBorder}`,
                cursor: 'pointer', flexShrink: 0,
              }}>
                {item.cta} →
              </span>
            </div>
          ))}

          <button
            onClick={(e) => { e.stopPropagation(); onViewBrief() }}
            style={{
              width: '100%', marginTop: 8, padding: '10px', border: `1px dashed ${T.primaryBorder}`,
              borderRadius: 8, background: 'transparent', color: T.primary,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            ✦ Xem AI Daily Brief
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   NOTIFICATION ICON
   ═══════════════════════════════════════════ */

function NotiIcon({ n, size = 38 }: { n: Notification; size?: number }) {
  const icon = getIconForNoti(n)
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: icon.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: icon.color, flexShrink: 0,
      border: `1px solid ${icon.color}18`,
    }}>
      {icon.letter}
    </div>
  )
}

/* ═══════════════════════════════════════════
   NOTIFICATION CARD
   ═══════════════════════════════════════════ */

function NotiCard({ n, isUnread, onTap }: { n: Notification; isUnread: boolean; onTap: () => void }) {
  const meta = catMeta[n.category]
  const isMargin = n.subCategory === 'Margin'
  const isSignal = n.subCategory === 'Tín hiệu'

  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', gap: 10, padding: '14px 16px',
        borderBottom: `1px solid ${T.borderSoft}`,
        background: isMargin ? T.redBg : isUnread ? '#FAFBFF' : T.surface,
        cursor: 'pointer', transition: 'background 0.15s',
        borderLeft: isMargin ? `3px solid ${T.red}` : isSignal ? `3px solid ${T.green}` : '3px solid transparent',
      }}
    >
      <div style={{ position: 'relative' }}>
        <NotiIcon n={n} />
        {isUnread && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 8, height: 8, borderRadius: '50%',
            background: T.primary, border: `2px solid ${T.surface}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: isUnread ? 600 : 400, color: T.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {n.title}
          </span>
          <span style={{ fontSize: 11, color: T.textMute, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {n.time}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: T.textSec, marginTop: 3, lineHeight: 1.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {n.desc}
        </div>

        {isMargin && (
          <div style={{ marginTop: 8 }}><CountdownTimer deadline="trước 14h" /></div>
        )}

        {isSignal && n.grouped && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {Object.entries(stockSparklines).map(([symbol, data]) => {
              const last = data[data.length - 1], prev = data[data.length - 2], up = last >= prev
              return (
                <div key={symbol} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                  background: up ? T.greenBg : T.redBg, borderRadius: 6,
                  border: `1px solid ${up ? '#BBF7D0' : '#FECACA'}`,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.text }}>{symbol}</span>
                  <Sparkline data={data} color={up ? T.green : T.red} width={40} height={14} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: up ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                    {last.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            background: meta.bg, color: meta.color, fontWeight: 600,
          }}>
            {meta.label}
          </span>
          {n.subCategory && (
            <span style={{ fontSize: 10, color: T.textMute, padding: '1px 5px', borderRadius: 4, background: T.bg, border: `1px solid ${T.border}` }}>
              {n.subCategory}
            </span>
          )}
          {n.grouped && (
            <span style={{ fontSize: 10, background: meta.bg, color: meta.color, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
              {n.groupCount} gộp
            </span>
          )}
          {n.cta && (
            <span style={{ fontSize: 11, color: T.primary, fontWeight: 600, marginLeft: 'auto' }}>{n.cta} →</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PROMO CAROUSEL
   ═══════════════════════════════════════════ */

function PromoCarousel({ n, onRead }: { n: Notification; onRead: () => void }) {
  const cards = promoScoreCards.filter(c => c.notiId === n.id).sort((a, b) => b.fitScore - a.fitScore)
  if (cards.length === 0) return null

  return (
    <div style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 6px' }}>
        <NotiIcon n={n} size={28} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{n.title}</span>
        <span style={{ fontSize: 11, color: T.textMute }}>{n.time}</span>
      </div>
      <div className="promo-scroll" style={{
        padding: '6px 12px 12px', display: 'flex', gap: 8,
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch' as any, scrollbarWidth: 'none' as any,
      }}>
        {cards.map((card, ci) => {
          const fit = fitScoreColor(card.fitScore)
          return (
            <div key={ci} onClick={onRead} style={{
              border: `1px solid ${fit.ring}`, borderRadius: 12, background: T.surface,
              padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
              borderLeft: `3px solid ${card.squadColor}`,
              minWidth: 250, maxWidth: 270, flexShrink: 0, scrollSnapAlign: 'start',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: card.squadColor, background: card.squadBg, padding: '2px 8px', borderRadius: 4 }}>{card.squad}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{card.product}</span>
                <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                  <svg width="34" height="34" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke={fit.ring} strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={fit.color} strokeWidth="3"
                      strokeDasharray={`${card.fitScore * 0.942} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: fit.color }}>
                    {card.fitScore}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSec, marginBottom: 4 }}>{card.headline}</div>
              <div style={{ fontSize: 11, color: T.textMute, lineHeight: 1.5, marginBottom: 8 }}>{card.detail}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: fit.bg, borderRadius: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: fit.color, fontWeight: 600 }}>{card.highlight}</span>
              </div>
              <div style={{ fontSize: 9, color: T.textMute, lineHeight: 1.4, marginBottom: 8 }}>💡 {card.reason}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: card.fitScore >= 60 ? card.squadColor : T.bg, color: card.fitScore >= 60 ? '#fff' : T.textMute,
                  fontSize: 11, fontWeight: 700,
                }}>{card.cta}</button>
                {card.badge && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.red, background: T.redBg, padding: '3px 8px', borderRadius: 6, border: '1px solid #FECACA' }}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {cards.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 0 8px' }}>
          {cards.map((_, i) => (
            <div key={i} style={{ width: i === 0 ? 14 : 5, height: 5, borderRadius: 3, background: i === 0 ? T.primary : T.border }} />
          ))}
          <span style={{ fontSize: 9, color: T.textMute, marginLeft: 4 }}>← vuốt</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   DETAIL VIEW
   ═══════════════════════════════════════════ */

function DetailView({ noti, onBack, onAiChat }: { noti: Notification; onBack: () => void; onAiChat: () => void }) {
  const meta = catMeta[noti.category]
  const isMargin = noti.subCategory === 'Margin'
  const related = getRelatedNotis(noti)

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.surface, zIndex: 20,
      display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.25s ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
      }}>
        <button onClick={onBack} style={{
          width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
          background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.text }}>{meta.label}</span>
        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: meta.bg, color: meta.color, fontWeight: 600 }}>{noti.subCategory || meta.label}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <NotiIcon n={noti} size={48} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{noti.title}</div>
            <div style={{ fontSize: 12, color: T.textMute, marginTop: 4 }}>{noti.time}</div>
          </div>
        </div>

        <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.65, marginBottom: 20 }}>{noti.desc}</div>

        {isMargin && (
          <div style={{ marginBottom: 20 }}>
            <CountdownTimer deadline="trước 14h" />
            <div style={{ marginTop: 12, background: T.redBg, borderRadius: 10, padding: '12px 14px', border: '1px solid #FECACA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                <span>Tỷ lệ ký quỹ</span>
                <span style={{ color: T.red, fontFamily: "'JetBrains Mono', monospace" }}>132%</span>
              </div>
              <div style={{ height: 8, background: '#FECACA', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '94%', background: `linear-gradient(90deg, ${T.red}, #EF4444)`, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textMute, marginTop: 4 }}>
                <span>0%</span><span style={{ color: T.red, fontWeight: 600 }}>132% ← hiện tại</span><span>140% ngưỡng</span>
              </div>
            </div>
          </div>
        )}

        {noti.subCategory === 'Tín hiệu' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {Object.entries(stockSparklines).map(([symbol, data]) => {
              const last = data[data.length - 1], prev = data[data.length - 2], up = last >= prev
              return (
                <div key={symbol} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                  background: up ? T.greenBg : T.redBg, borderRadius: 8,
                  border: `1px solid ${up ? '#BBF7D0' : '#FECACA'}`,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{symbol}</span>
                  <Sparkline data={data} color={up ? T.green : T.red} width={56} height={20} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: up ? T.green : T.red, fontFamily: "'JetBrains Mono', monospace" }}>
                    {last.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{
          background: T.primarySoft, border: `1px solid ${T.primaryBorder}`,
          borderRadius: 12, padding: '16px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: T.primary }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>AI Explain</span>
          </div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.65 }}>{getAiExplanation(noti)}</div>
          <button onClick={onAiChat} style={{
            marginTop: 12, padding: '8px 16px', border: `1px solid ${T.primaryBorder}`,
            borderRadius: 8, background: T.surface, color: T.primary,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ✦ Hỏi thêm AI ↗
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {noti.cta && (
            <button style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: 10,
              background: T.primary, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {noti.cta}
            </button>
          )}
          <button style={{
            flex: noti.cta ? 'none' : 1, padding: '12px 20px', border: `1px solid ${T.border}`,
            borderRadius: 10, background: T.surface, color: T.textSec,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            Lưu lại
          </button>
        </div>

        {related.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMute, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Liên quan
            </div>
            {related.map(rn => (
              <div key={rn.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                borderBottom: `1px solid ${T.borderSoft}`,
              }}>
                <NotiIcon n={rn} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{rn.title}</div>
                  <div style={{ fontSize: 11, color: T.textMute }}>{rn.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   AI CHAT BOTTOM SHEET
   ═══════════════════════════════════════════ */

function AiChatSheet({ noti, open, onClose }: { noti: Notification | null; open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && noti) {
      setMessages([{ role: 'ai', text: getAiExplanation(noti) }])
      setInput('')
    }
  }, [open, noti?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!open || !noti) return null
  const suggestions = getAiSuggestions(noti)

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'ai', text: getAiResponse(noti, text) }])
    setInput('')
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 29 }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '72%', background: T.surface,
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.3s ease-out',
        display: 'flex', flexDirection: 'column', zIndex: 30,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 16px 12px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T.primary, fontSize: 16 }}>✦</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>AI Assistant</span>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`,
            background: T.surface, cursor: 'pointer', fontSize: 14, color: T.textMute,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '6px 16px', fontSize: 11, color: T.textMute, background: T.bg, borderBottom: `1px solid ${T.borderSoft}` }}>
          Context: {noti.title}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 10, display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '85%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? T.primary : T.primarySoft,
                color: msg.role === 'user' ? '#fff' : T.text,
                fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-line',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '4px 16px 6px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => handleSend(s)} style={{
              padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 20,
              background: T.surface, color: T.textSec, fontSize: 11, whiteSpace: 'nowrap',
              cursor: 'pointer', flexShrink: 0,
            }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ padding: '8px 16px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="Hỏi thêm về thông báo..."
            style={{
              flex: 1, padding: '10px 14px', border: `1px solid ${T.border}`,
              borderRadius: 10, fontSize: 13, outline: 'none', background: T.bg,
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(input) }}
          />
          <button onClick={() => handleSend(input)} style={{
            width: 40, height: 40, borderRadius: 10, border: 'none',
            background: T.primary, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            ↗
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   SEARCH OVERLAY
   ═══════════════════════════════════════════ */

function SearchOverlay({ open, onClose, onSelect, readIds }: {
  open: boolean; onClose: () => void; onSelect: (id: string) => void; readIds: Set<string>
}) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])

  if (!open) return null
  const results = q.trim() ? notifications.filter(n =>
    n.title.toLowerCase().includes(q.toLowerCase()) ||
    n.desc.toLowerCase().includes(q.toLowerCase()) ||
    (n.subCategory && n.subCategory.toLowerCase().includes(q.toLowerCase()))
  ) : []

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.surface, zIndex: 25,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMute} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
          placeholder="Tìm thông báo..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: T.text, background: 'transparent' }}
        />
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 14, color: T.textMute, cursor: 'pointer', padding: '4px 8px' }}>
          Huỷ
        </button>
      </div>

      {!q.trim() && (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMute, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Gần đây</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['HPG', 'Margin', 'Bond', 'Tín hiệu', 'MWG'].map(tag => (
              <button key={tag} onClick={() => setQ(tag)} style={{
                padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 20,
                background: T.bg, color: T.textSec, fontSize: 12, cursor: 'pointer',
              }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMute, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Bộ lọc</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Giao dịch', 'Ưu đãi', 'Hệ thống', 'Cá nhân', 'Chưa đọc', 'Có CTA'].map(f => (
              <button key={f} style={{
                padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: 20,
                background: T.surface, color: T.textSec, fontSize: 12, cursor: 'pointer',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {q.trim() && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px', fontSize: 11, color: T.textMute }}>
            {results.length} kết quả
          </div>
          {results.map(n => (
            <NotiCard key={n.id} n={n} isUnread={n.unread && !readIds.has(n.id)} onTap={() => { onSelect(n.id); onClose() }} />
          ))}
          {results.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 13, color: T.textMute }}>Không tìm thấy thông báo nào</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   DAILY BRIEF MODAL
   ═══════════════════════════════════════════ */

const briefSections = [
  {
    title: 'Cần hành động ngay', icon: '!', color: T.red, bg: T.redBg,
    items: [
      { label: 'Margin Call: ký quỹ 132%', detail: 'Nạp thêm hoặc bán bớt trước 14h', status: 'critical' as const },
      { label: 'Cổ tức HPG 2.5tr đã về', detail: 'Quyền mua cần xác nhận', status: 'critical' as const },
      { label: 'Bật xác thực 2 lớp', detail: 'Bảo vệ tài khoản — 2 phút', status: 'critical' as const },
    ],
    note: 'Ưu tiên Margin Call — ảnh hưởng trực tiếp đến vốn.',
  },
  {
    title: 'Tín hiệu & Phân tích', icon: '↗', color: T.green, bg: T.greenBg,
    items: [
      { label: '8 tín hiệu mới hôm nay', detail: 'ACB ↑MA50, HPG ↑30K nổi bật', status: 'hot' as const },
      { label: 'Top 5 CP tuần này', detail: 'FPT, ACB, MWG, VNM, HPG', status: 'new' as const },
      { label: 'Ngành Thép Q3 phục hồi', detail: 'HPG, HSG hưởng lợi', status: 'info' as const },
    ],
  },
  {
    title: 'Giao dịch', icon: '↔', color: T.orange, bg: T.orangeBg,
    items: [
      { label: 'MWG x500 vừa khớp', detail: '52,300 — Tổng 26.1tr', status: 'done' as const },
      { label: 'Nạp 50tr + Rút 20tr', detail: 'Đã xử lý thành công', status: 'done' as const },
    ],
  },
  {
    title: 'Ưu đãi phù hợp', icon: '★', color: T.violet, bg: T.violetBg,
    items: [
      { label: 'TCBond 9.5% — còn 3 ngày', detail: 'Phù hợp score 87', status: 'hot' as const },
      { label: 'Fund 0% phí mua', detail: 'Phù hợp score 72', status: 'info' as const },
    ],
  },
]

const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: T.redBg, color: T.red, label: '!' },
  hot: { bg: T.redBg, color: T.orange, label: '🔥' },
  new: { bg: T.blueBg, color: T.blue, label: 'NEW' },
  done: { bg: T.greenBg, color: T.green, label: '✓' },
  info: { bg: T.bg, color: T.textMute, label: '→' },
}

function DailyBriefModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '95%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto',
        background: T.surface, borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.3s ease-out',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary}, #6D28D9)`,
          padding: '24px 24px 20px', borderRadius: '20px 20px 0 0', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>✦</span>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>AI Daily Brief</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Thứ Tư, 09/07/2026</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>17 thông báo — 1 margin call, 3 tín hiệu, 2 ưu đãi phù hợp</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>Tổng tài sản</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                {(portfolioSummary.totalAsset / 1e9).toFixed(2)} tỷ
              </div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>P&L hôm nay</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#4ADE80', fontFamily: "'JetBrains Mono', monospace" }}>
                +{(portfolioSummary.todayPnL / 1e6).toFixed(1)}tr
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          {briefSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, background: section.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: section.color,
                }}>
                  {section.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: section.color }}>{section.title}</span>
                <span style={{ fontSize: 10, color: T.textMute }}>({section.items.length})</span>
              </div>
              <div style={{ background: section.bg, borderRadius: 10, overflow: 'hidden', border: `1px solid ${section.color}15` }}>
                {section.items.map((item, ii) => {
                  const badge = statusBadge[item.status]
                  return (
                    <div key={ii} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                      borderBottom: ii < section.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6, background: badge.bg, color: badge.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, flexShrink: 0, border: `1px solid ${badge.color}30`,
                      }}>
                        {badge.label}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: T.textMute, marginTop: 1 }}>{item.detail}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {section.note && (
                <div style={{ fontSize: 10, color: section.color, marginTop: 6, padding: '0 4px', fontWeight: 500, fontStyle: 'italic' }}>
                  💡 {section.note}
                </div>
              )}
            </div>
          ))}

          <div style={{
            background: `linear-gradient(135deg, ${T.primarySoft}, ${T.violetBg})`,
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 8,
            border: `1px solid ${T.primaryBorder}`,
          }}>
            <span style={{ fontSize: 14, color: T.primary }}>✦</span>
            <div>
              <div style={{ fontSize: 12, color: T.primary, fontWeight: 600 }}>
                AI tóm tắt 17 thông báo. Margin Call ưu tiên cao nhất. Tín hiệu ACB đáng chú ý nhất vì bạn đang hold ACB.
              </div>
              <div style={{ fontSize: 10, color: T.textMute, marginTop: 4 }}>Powered by TCinvest AI · Cập nhật 09:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function InboxUXPanel() {
  const [view, setView] = useState<'ai-feed' | 'categories' | 'archive'>('ai-feed')
  const [catTab, setCatTab] = useState<NotiCategory | null>(null)
  const [subFilter, setSubFilter] = useState<SubCategory | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [showLowPriority, setShowLowPriority] = useState(false)
  const [tickerOpen, setTickerOpen] = useState(true)
  const [aiExpanded, setAiExpanded] = useState(true)

  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]))
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)))
  const isUnread = (n: Notification) => n.unread && !readIds.has(n.id)
  const unreadCount = notifications.filter(isUnread).length
  const selectedNoti = selectedId ? notifications.find(n => n.id === selectedId) || null : null

  const highPriority = notifications.filter(n => getPriority(n) <= 2 && (isUnread(n) || getPriority(n) === 0))
    .sort((a, b) => getPriority(a) - getPriority(b))
  const lowPriority = notifications.filter(n => !highPriority.includes(n))
    .sort((a, b) => getPriority(a) - getPriority(b))

  const catFiltered = catTab ? notifications.filter(n => n.category === catTab) : notifications
  const withSub = subFilter ? catFiltered.filter(n => n.subCategory === subFilter) : catFiltered
  const currentSubs = catTab ? subCategoryMap[catTab] : null

  const timeGrouped = (['today', 'yesterday', 'earlier'] as const)
    .map(gk => ({ key: gk, label: timeLabels[gk], items: withSub.filter(n => getTimeGroup(n.time) === gk) }))
    .filter(g => g.items.length > 0)

  const handleTapNoti = (id: string) => { markRead(id); setSelectedId(id) }

  const pnlColor = portfolioSummary.todayPnL >= 0 ? T.green : T.red

  const bottomNav = [
    { id: 'ai-feed' as const, label: 'AI Feed', icon: '✦' },
    { id: 'categories' as const, label: 'Categories', icon: '▦' },
    { id: 'archive' as const, label: 'Archive', icon: '▤' },
  ]

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* ═══ PHONE MOCKUP ═══ */}
        <div>
          <div style={{
            width: 375, margin: '0 auto',
            border: '2px solid #D1D5DB', borderRadius: 40,
            overflow: 'hidden', background: T.surface,
            boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative', height: 780,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Status bar */}
            <div style={{
              height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              padding: '0 24px 4px', fontSize: 12, fontWeight: 600, color: T.text,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>9:41</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
                <span>●●●●○</span>
                <span style={{ fontWeight: 700 }}>5G</span>
                <svg width="16" height="10" viewBox="0 0 25 12">
                  <rect x="0" y="0" width="22" height="12" rx="2" fill="none" stroke={T.text} strokeWidth="1.5" />
                  <rect x="2" y="2" width="16" height="8" rx="1" fill={T.green} />
                  <rect x="23" y="3.5" width="2" height="5" rx="1" fill={T.text} />
                </svg>
              </div>
            </div>

            {/* App header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 18px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.violet})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                }}>
                  iD
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>iDigest</span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#fff', background: T.red,
                    padding: '1px 6px', borderRadius: 8, minWidth: 18, textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setShowSearch(true)} style={{
                  width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`,
                  background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMute} strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                <button onClick={() => markAllRead()} style={{
                  width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`,
                  background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: T.textMute,
                }}>
                  ✓✓
                </button>
              </div>
            </div>

            {/* Market Ticker */}
            <div onClick={() => setTickerOpen(!tickerOpen)} style={{ cursor: 'pointer' }}>
              <MarketTicker visible={tickerOpen} />
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

              {/* ── AI Feed View ── */}
              {view === 'ai-feed' && (
                <>
                  {/* Portfolio mini bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', background: T.bg, borderBottom: `1px solid ${T.borderSoft}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, color: T.textMute }}>Tổng tài sản </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
                        {(portfolioSummary.totalAsset / 1e9).toFixed(2)}
                      </span>
                      <span style={{ fontSize: 10, color: T.textMute }}> tỷ</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pnlColor, fontFamily: "'JetBrains Mono', monospace" }}>
                        {portfolioSummary.todayPnL >= 0 ? '+' : ''}{(portfolioSummary.todayPnL / 1e6).toFixed(1)}tr
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: pnlColor, marginLeft: 4 }}>
                        ({portfolioSummary.todayPnLPct >= 0 ? '+' : ''}{portfolioSummary.todayPnLPct}%)
                      </span>
                    </div>
                    <div style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      color: portfolioSummary.marginRatio < 140 ? T.red : T.green,
                      background: portfolioSummary.marginRatio < 140 ? T.redBg : T.greenBg,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      MR {portfolioSummary.marginRatio}%
                    </div>
                  </div>

                  {/* AI Priority Card */}
                  <AiPriorityCard
                    expanded={aiExpanded}
                    onToggle={() => setAiExpanded(!aiExpanded)}
                    onViewBrief={() => setShowBrief(true)}
                    onTapItem={handleTapNoti}
                  />

                  {/* High priority notifications */}
                  <div style={{ padding: '4px 16px 8px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textMute, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Ưu tiên cao ({highPriority.length})
                    </div>
                  </div>
                  {highPriority.map(n =>
                    n.category === 'promo' ? (
                      <PromoCarousel key={n.id} n={n} onRead={() => markRead(n.id)} />
                    ) : (
                      <NotiCard key={n.id} n={n} isUnread={isUnread(n)} onTap={() => handleTapNoti(n.id)} />
                    )
                  )}

                  {/* Low priority — collapsed */}
                  {lowPriority.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowLowPriority(!showLowPriority)}
                        style={{
                          width: '100%', padding: '12px 16px', border: 'none',
                          background: T.bg, borderTop: `1px solid ${T.borderSoft}`, borderBottom: `1px solid ${T.borderSoft}`,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          color: T.textMute, fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMute} strokeWidth="2"
                          style={{ transform: showLowPriority ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        {showLowPriority ? 'Ẩn bớt' : `Xem thêm ${lowPriority.length} thông báo khác`}
                      </button>
                      {showLowPriority && lowPriority.map(n =>
                        n.category === 'promo' ? (
                          <PromoCarousel key={n.id} n={n} onRead={() => markRead(n.id)} />
                        ) : (
                          <NotiCard key={n.id} n={n} isUnread={isUnread(n)} onTap={() => handleTapNoti(n.id)} />
                        )
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── Categories View ── */}
              {view === 'categories' && (
                <>
                  <div style={{ display: 'flex', gap: 4, padding: '10px 14px', borderBottom: `1px solid ${T.borderSoft}`, overflowX: 'auto' }}>
                    {([null, 'transaction', 'promo', 'system', 'personal'] as (NotiCategory | null)[]).map(cat => {
                      const label = cat ? catMeta[cat].label : 'Tất cả'
                      const active = catTab === cat
                      const color = cat ? catMeta[cat].color : T.primary
                      return (
                        <button
                          key={cat || 'all'}
                          onClick={() => { setCatTab(cat); setSubFilter(null) }}
                          style={{
                            padding: '6px 14px', fontSize: 12, border: `1px solid ${active ? color : T.border}`,
                            borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
                            background: active ? `${color}10` : T.surface,
                            color: active ? color : T.textSec,
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {currentSubs && (
                    <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${T.borderSoft}`, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSubFilter(null)}
                        style={{
                          padding: '4px 10px', fontSize: 11, border: 'none', borderRadius: 6, cursor: 'pointer',
                          background: !subFilter ? T.primary : T.bg, color: !subFilter ? '#fff' : T.textMute, fontWeight: 500,
                        }}
                      >Tất cả</button>
                      {currentSubs.map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSubFilter(subFilter === sub ? null : sub)}
                          style={{
                            padding: '4px 10px', fontSize: 11, border: 'none', borderRadius: 6, cursor: 'pointer',
                            background: subFilter === sub ? T.primary : T.bg,
                            color: subFilter === sub ? '#fff' : T.textMute,
                            fontWeight: subFilter === sub ? 600 : 400,
                          }}
                        >{sub}</button>
                      ))}
                    </div>
                  )}

                  {timeGrouped.map(group => (
                    <div key={group.key}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px 6px',
                        background: T.bg, position: 'sticky', top: 0, zIndex: 1,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.textSec, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                          {group.label}
                        </span>
                        <span style={{ fontSize: 10, color: T.textMute }}>({group.items.length})</span>
                        <div style={{ flex: 1, height: 1, background: T.border, marginLeft: 6 }} />
                      </div>
                      {group.items.map(n =>
                        n.category === 'promo' ? (
                          <PromoCarousel key={n.id} n={n} onRead={() => markRead(n.id)} />
                        ) : (
                          <NotiCard key={n.id} n={n} isUnread={isUnread(n)} onTap={() => handleTapNoti(n.id)} />
                        )
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* ── Archive View ── */}
              {view === 'archive' && (
                <>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <div onClick={() => setShowSearch(true)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                      background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, cursor: 'pointer',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMute} strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                      </svg>
                      <span style={{ fontSize: 13, color: T.textMute }}>Tìm trong {notifications.length} thông báo...</span>
                    </div>
                  </div>
                  {notifications.map(n =>
                    n.category === 'promo' ? (
                      <PromoCarousel key={n.id} n={n} onRead={() => markRead(n.id)} />
                    ) : (
                      <NotiCard key={n.id} n={n} isUnread={isUnread(n)} onTap={() => handleTapNoti(n.id)} />
                    )
                  )}
                </>
              )}

              {/* Empty state */}
              {view !== 'ai-feed' && withSub.length === 0 && view === 'categories' && (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>📭</div>
                  <div style={{ fontSize: 14, color: T.textSec, fontWeight: 500 }}>Không có thông báo nào</div>
                  <div style={{ fontSize: 12, color: T.textMute, marginTop: 4 }}>Thử chọn loại khác hoặc bỏ filter</div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div style={{
              display: 'flex', borderTop: `1px solid ${T.border}`,
              background: T.surface, padding: '6px 0 20px',
              borderRadius: '0 0 38px 38px',
            }}>
              {bottomNav.map(tab => {
                const active = view === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setView(tab.id); setCatTab(null); setSubFilter(null) }}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      padding: '8px 0 0', border: 'none', background: 'transparent', cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      fontSize: tab.id === 'ai-feed' ? 18 : 16,
                      color: active ? T.primary : T.textMute,
                      fontWeight: active ? 700 : 400,
                    }}>
                      {tab.icon}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: active ? 700 : 500,
                      color: active ? T.primary : T.textMute,
                    }}>
                      {tab.label}
                    </span>
                    {active && (
                      <div style={{ width: 20, height: 3, borderRadius: 2, background: T.primary, marginTop: 1 }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* AI FAB */}
            {!selectedId && !showChat && (
              <button
                onClick={() => { setSelectedId(null); setShowChat(true) }}
                style={{
                  position: 'absolute', bottom: 80, right: 16,
                  width: 48, height: 48, borderRadius: 14,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.violet})`,
                  border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${T.primary}50`,
                }}
              >
                ✦
              </button>
            )}

            {/* ── Overlays ── */}
            {selectedNoti && !showChat && (
              <DetailView noti={selectedNoti} onBack={() => setSelectedId(null)} onAiChat={() => setShowChat(true)} />
            )}

            <AiChatSheet
              noti={selectedNoti || notifications[0]}
              open={showChat}
              onClose={() => setShowChat(false)}
            />

            <SearchOverlay
              open={showSearch}
              onClose={() => setShowSearch(false)}
              onSelect={handleTapNoti}
              readIds={readIds}
            />
          </div>
        </div>

        {/* ═══ RIGHT PANEL — DESIGN NOTES ═══ */}
        <div>
          <h3 className="text-base font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T.primary }}>✦</span> Redesign v2 — Design Notes
          </h3>

          {/* Key changes */}
          <div className="panel" style={{ borderLeft: `3px solid ${T.primary}`, borderRadius: '0 14px 14px 0', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Thay đổi chính</div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              {[
                { before: 'Flat category tabs', after: '3-tier nav: AI Feed → Categories → Archive', why: 'Superhuman split inbox model' },
                { before: 'Everything visible on load', after: 'Progressive disclosure — P3/P4 collapsed', why: '3-second comprehension rule' },
                { before: 'No detail screen', after: 'Full detail + AI Explain + CTAs', why: 'Robinhood context model' },
                { before: 'No AI chat', after: 'Context-aware AI bottom sheet', why: 'ChatGPT + portfolio data' },
                { before: 'No search', after: 'Full search with recent + filters', why: 'Linear/Notion pattern' },
                { before: 'Emoji icons', after: 'Letter-based circles', why: 'Consistent visual weight' },
                { before: 'No FAB', after: 'AI FAB for instant AI access', why: 'Coinbase action button' },
              ].map((change, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 8px', background: i % 2 === 0 ? T.primarySoft : T.bg, borderRadius: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ textDecoration: 'line-through', color: T.textMute }}>{change.before}</span>
                      <span style={{ color: T.textMute }}>→</span>
                      <span style={{ fontWeight: 600, color: T.primary }}>{change.after}</span>
                    </div>
                    <div style={{ color: T.textMute, fontSize: 10 }}>{change.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Principles */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            Design Principles
          </div>
          <div className="space-y-2 mb-5">
            {[
              { title: '3-Second Comprehension', desc: 'User knows: urgent? how many new? market? — in 3 seconds', color: T.primary },
              { title: 'Less Info, More Value', desc: '50 notifications → 5 priority items + AI summary', color: T.green },
              { title: 'AI Enhances, Never Gatekeeps', desc: 'Every AI feature has a bypass. User controls everything.', color: T.amber },
              { title: 'Critical Alerts Break All Rules', desc: 'Margin Call bypasses grouping, quiet hours, AI ranking', color: T.red },
              { title: 'One-Handed, One-Minute', desc: 'Entire inbox consumed with one thumb in under 2 minutes', color: T.textMute },
            ].map((p, i) => (
              <div key={i} className="panel" style={{ borderLeft: `3px solid ${p.color}`, borderRadius: '0 14px 14px 0', padding: 12, marginBottom: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{p.title}</div>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* AI Features */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: T.primary }}>✦</span> AI Features (8)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { name: 'AI Priority', desc: 'Rank by urgency × relevance', effort: 'M' },
              { name: 'AI Timeline', desc: 'Event chain reconstruction', effort: 'M' },
              { name: 'AI Insight', desc: 'Proactive observations', effort: 'H' },
              { name: 'AI Explain', desc: 'Why this notification?', effort: 'L' },
              { name: 'AI Recommend', desc: 'Behavioral suggestions', effort: 'H' },
              { name: 'AI Ask', desc: 'Context-aware chat', effort: 'H' },
              { name: 'AI Follow-up', desc: 'Track state changes', effort: 'M' },
              { name: 'AI Personalize', desc: 'Learn from behavior', effort: 'H' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '10px 12px', background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>{f.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                    background: f.effort === 'L' ? T.greenBg : f.effort === 'M' ? T.amberBg : T.redBg,
                    color: f.effort === 'L' ? T.green : f.effort === 'M' ? T.amber : T.red,
                  }}>{f.effort}</span>
                </div>
                <div style={{ fontSize: 10, color: T.textMute }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Comparison summary */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>
            Benchmark Sources
          </div>
          <div className="panel" style={{ background: '#0F172A', color: '#E2E8F0', border: 'none', borderRadius: 14 }}>
            <div className="text-xs space-y-2" style={{ color: '#CBD5E1' }}>
              {[
                { app: 'Binance', take: 'Ticker strip, P/I/E toggles, critical alerts always on', color: '#F0B90B' },
                { app: 'Robinhood', take: 'Portfolio context in inbox, clean card design', color: '#00C805' },
                { app: 'Revolut', take: 'Receipt-style detail, generous whitespace', color: '#0075EB' },
                { app: 'Superhuman', take: 'AI Feed as default, split inbox, speed-first', color: '#BC6CFF' },
                { app: 'ChatGPT', take: 'Context-aware AI chat, streaming responses', color: '#10A37F' },
              ].map((ref, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, borderLeft: `3px solid ${ref.color}` }}>
                  <span style={{ fontWeight: 700, color: ref.color, fontSize: 11, width: 80, flexShrink: 0 }}>{ref.app}</span>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>{ref.take}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DailyBriefModal open={showBrief} onClose={() => setShowBrief(false)} />
    </div>
  )
}
