'use client'
import { useState } from 'react'

type SquadId = 'bond' | 'fund' | 'stock' | 'borrowlink' | 'itracker' | 'ipower' | 'ioptima'
type SegmentId = 'balanced' | 'conservative' | 'trader' | 'newcomer'

const squadMeta: Record<SquadId, { label: string; color: string; bg: string; icon: string }> = {
  bond:       { label: 'Bond',       color: '#1d4ed8', bg: '#dbeafe', icon: '📊' },
  fund:       { label: 'Fund',       color: '#15803d', bg: '#dcfce7', icon: '💎' },
  stock:      { label: 'Stock',      color: '#b45309', bg: '#fef3c7', icon: '📈' },
  borrowlink: { label: 'BorrowLink', color: '#be185d', bg: '#fce7f3', icon: '🏦' },
  itracker:   { label: 'iTracker',   color: '#7c3aed', bg: '#ede9fe', icon: '🔔' },
  ipower:     { label: 'iPower',     color: '#0891b2', bg: '#cffafe', icon: '⚡' },
  ioptima:    { label: 'iOptima',    color: '#c2410c', bg: '#fff7ed', icon: '🎯' },
}

const weeklyRotation = [
  { day: 'T2', dayFull: 'Thứ 2', squad: 'bond' as SquadId },
  { day: 'T3', dayFull: 'Thứ 3', squad: 'fund' as SquadId },
  { day: 'T4', dayFull: 'Thứ 4', squad: 'stock' as SquadId },
  { day: 'T5', dayFull: 'Thứ 5', squad: 'borrowlink' as SquadId },
  { day: 'T6', dayFull: 'Thứ 6', squad: 'itracker' as SquadId },
  { day: 'T7', dayFull: 'Thứ 7', squad: 'ipower' as SquadId },
  { day: 'CN', dayFull: 'Chủ nhật', squad: 'ioptima' as SquadId },
]

const contentVariants: Record<SquadId, Record<SegmentId, { headline: string; subtext: string; cta: string }>> = {
  bond: {
    balanced:     { headline: 'VPB Bond 8.9% — đa dạng hóa portfolio',       subtext: 'Thêm Bond giúp giảm rủi ro cho danh mục đa dạng', cta: 'Xem chi tiết' },
    conservative: { headline: 'VPB Bond 8.9% 6T — lãi suất hấp dẫn',        subtext: 'Phù hợp portfolio Bond 60% của bạn. Cao hơn kỳ trước', cta: 'Mua ngay' },
    trader:       { headline: 'Hedge portfolio bằng Bond 8.9%',               subtext: 'Giảm exposure vào Stock, lãi cố định 8.9%/năm', cta: 'Tìm hiểu' },
    newcomer:     { headline: 'Bắt đầu an toàn: Bond lãi 8.9%/năm',          subtext: 'Vốn được bảo toàn, lãi cố định. Phù hợp người mới', cta: 'Xem hướng dẫn' },
  },
  fund: {
    balanced:     { headline: 'TCBF miễn phí mua — bổ sung quỹ mở',          subtext: 'Đa dạng danh mục với quỹ trái phiếu ổn định', cta: 'Xem quỹ' },
    conservative: { headline: 'TCBF Fund ổn định — 0% phí mua',              subtext: 'Quỹ trái phiếu an toàn, phù hợp khẩu vị rủi ro', cta: 'Mua ngay' },
    trader:       { headline: 'TCEF quỹ cổ phiếu — phí 0% tuần cuối',       subtext: 'Đầu tư cổ phiếu qua quỹ, không cần chọn mã', cta: 'So sánh quỹ' },
    newcomer:     { headline: 'Quỹ mở là gì? TCBF phí 0% cho người mới',     subtext: 'Chỉ từ 100K, chuyên gia quản lý hộ', cta: 'Tìm hiểu' },
  },
  stock: {
    balanced:     { headline: 'VNM oversold RSI < 30 — cơ hội',              subtext: 'Tín hiệu kỹ thuật tích cực cho portfolio đa dạng', cta: 'Xem phân tích' },
    conservative: { headline: 'VNM — cổ phiếu phòng thủ, cổ tức đều',       subtext: 'Cổ tức 3.5%/năm, phù hợp đầu tư dài hạn', cta: 'Tìm hiểu' },
    trader:       { headline: 'VNM oversold RSI < 30 — entry point',         subtext: 'Volume tăng 200%, kháng cự 82K. Trade ngay', cta: 'Đặt lệnh' },
    newcomer:     { headline: 'Cổ phiếu đầu tiên nên mua: VNM',             subtext: 'Blue-chip ổn định, làm quen thị trường', cta: 'Xem hướng dẫn' },
  },
  borrowlink: {
    balanced:     { headline: 'BorrowLink 7.2% — sinh lời ổn định',          subtext: 'Kỳ hạn linh hoạt 3-12 tháng, bổ sung fixed-income', cta: 'Xem chi tiết' },
    conservative: { headline: 'BorrowLink 7.2% 6T — bổ sung danh mục',      subtext: 'An toàn như gửi tiết kiệm, lãi suất cạnh tranh', cta: 'Đầu tư ngay' },
    trader:       { headline: 'BorrowLink — park tiền chờ deal',             subtext: 'Gửi tiền nhàn 7.2% trong khi chờ cơ hội', cta: 'Tìm hiểu' },
    newcomer:     { headline: 'BorrowLink 7.2% — như gửi tiết kiệm',        subtext: 'An toàn, rút sớm không phạt. Từ 1 triệu', cta: 'Bắt đầu' },
  },
  itracker: {
    balanced:     { headline: 'iTracker — theo dõi danh mục tự động',        subtext: 'Cảnh báo khi cổ phiếu đạt mục tiêu giá', cta: 'Kích hoạt' },
    conservative: { headline: 'iTracker — biết ngay khi Bond đáo hạn',       subtext: 'Nhận thông báo tự động, không bỏ lỡ', cta: 'Thiết lập' },
    trader:       { headline: 'iTracker — HPG +15% alert chốt lời',         subtext: 'Cảnh báo kỹ thuật realtime cho 50+ mã', cta: 'Xem alerts' },
    newcomer:     { headline: 'iTracker — trợ lý theo dõi giá cho bạn',     subtext: 'Không cần nhìn bảng giá cả ngày', cta: 'Dùng thử' },
  },
  ipower: {
    balanced:     { headline: 'iPower — sinh lời từ tiền nhàn rỗi',          subtext: 'Tiền trong TK tự sinh lời, rút bất kỳ lúc nào', cta: 'Kích hoạt' },
    conservative: { headline: 'iPower — tối ưu tiền mặt trong TK',          subtext: 'Tự động sinh lời, không ảnh hưởng giao dịch', cta: 'Bật ngay' },
    trader:       { headline: 'iPower — tiền chờ deal vẫn sinh lời',        subtext: 'Sinh lợi tự động 24/7 cho tiền nhàn rỗi', cta: 'Kích hoạt' },
    newcomer:     { headline: 'iPower — để tiền trong TK cũng có lãi',      subtext: 'Tự động, miễn phí, rút ngay khi cần', cta: 'Tìm hiểu' },
  },
  ioptima: {
    balanced:     { headline: 'iOptima phí 0% — tối ưu chi phí GD',         subtext: 'Giảm phí giao dịch, tăng lợi nhuận ròng', cta: 'Đăng ký' },
    conservative: { headline: 'iOptima — giảm phí cho NĐT dài hạn',         subtext: 'Phí 0% cho Bond và Fund', cta: 'Xem ưu đãi' },
    trader:       { headline: 'iOptima phí 0% — trade nhiều tiết kiệm',     subtext: '15 lệnh/tháng × 0% phí = tiết kiệm đáng kể', cta: 'Đăng ký ngay' },
    newcomer:     { headline: 'iOptima — miễn phí GD cho KH mới',           subtext: 'Phí 0% trong 3 tháng đầu', cta: 'Nhận ưu đãi' },
  },
}

const crossSellBySegment: Record<SegmentId, SquadId[]> = {
  balanced:     ['stock', 'bond', 'fund', 'ioptima', 'ipower', 'itracker', 'borrowlink'],
  conservative: ['bond', 'borrowlink', 'fund', 'ipower', 'ioptima', 'itracker', 'stock'],
  trader:       ['stock', 'itracker', 'ioptima', 'bond', 'fund', 'ipower', 'borrowlink'],
  newcomer:     ['ipower', 'fund', 'borrowlink', 'bond', 'ioptima', 'stock', 'itracker'],
}

const segments: { id: SegmentId; name: string }[] = [
  { id: 'balanced', name: 'Balanced' },
  { id: 'conservative', name: 'Conservative' },
  { id: 'trader', name: 'Active Trader' },
  { id: 'newcomer', name: 'Newcomer' },
]

function SquadBadge({ squad, size = 'sm' }: { squad: SquadId; size?: 'sm' | 'xs' }) {
  const m = squadMeta[squad]
  const px = size === 'xs' ? '4px 7px' : '3px 10px'
  const fs = size === 'xs' ? 9 : 10
  return <span style={{ background: m.bg, color: m.color, padding: px, borderRadius: 99, fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.label}</span>
}

export default function HybridBundlePanel() {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSegment, setSelectedSegment] = useState<SegmentId>('balanced')

  const rotation = weeklyRotation[selectedDay]
  const mainSquad = rotation.squad
  const mainMeta = squadMeta[mainSquad]
  const mainContent = contentVariants[mainSquad][selectedSegment]
  const crossSellSquads = crossSellBySegment[selectedSegment].filter(s => s !== mainSquad).slice(0, 2)

  return (
    <div>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[14px] p-4 mb-6 text-sm text-amber-800 leading-relaxed">
        🎯 <b>Option 2: Main + Cross-sell</b> — Giữ nguyên lịch rotation (mỗi squad 1 ngày) → phủ 100% KH. Thêm nội dung personalized theo segment + 2 cross-sell offers từ scoring engine.
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Coverage', value: '100%', sub: 'Mỗi squad phủ toàn bộ KH', color: '#059669' },
          { label: 'Content variants', value: '4', sub: 'Nội dung riêng per segment', color: '#d97706' },
          { label: 'Cross-sell/ngày', value: '+2', sub: 'Bonus offers personalized', color: '#7c3aed' },
          { label: 'Squad exposure', value: '7+', sub: '1 main + cross-sell các ngày', color: '#2563eb' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{k.label}</div>
            <div className="text-2xl font-extrabold mt-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly rotation calendar */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">📅 Lịch rotation tuần — Chọn ngày để xem</h3>
        <p className="text-[10px] text-slate-400 mb-4">Mỗi ngày 1 squad làm main offer. Cross-sell tự động chọn theo scoring.</p>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weeklyRotation.map((r, i) => {
            const meta = squadMeta[r.squad]
            return (
              <button
                key={r.day}
                onClick={() => setSelectedDay(i)}
                className={`rounded-xl p-3 border-2 transition-all text-center ${
                  selectedDay === i
                    ? 'shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={selectedDay === i ? { borderColor: meta.color, background: meta.bg + '40' } : {}}
              >
                <div className="text-xs font-bold text-slate-600">{r.day}</div>
                <div className="text-lg mt-1">{meta.icon}</div>
                <div className="text-[9px] font-semibold mt-1" style={{ color: meta.color }}>{meta.label}</div>
              </button>
            )
          })}
        </div>

        {/* Segment selector */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-slate-500 font-medium">Xem nội dung cho segment:</span>
          {segments.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSegment(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                selectedSegment === s.id
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >{s.name}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Phone mockup */}
          <div className="flex justify-center">
            <div style={{
              width: 340, border: '3px solid #1e293b', borderRadius: 32, overflow: 'hidden',
              background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }}>
              {/* Status bar */}
              <div style={{ background: '#1e293b', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>09:00</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 12, height: 7, border: '1px solid #fff', borderRadius: 2, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 1, left: 1, right: 2, bottom: 1, background: '#4ade80', borderRadius: 1 }} />
                  </div>
                </div>
              </div>
              {/* App header */}
              <div style={{ background: 'linear-gradient(135deg, #534AB7, #7F77DD)', padding: '16px 18px 14px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>TCinvest</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Thông báo · {rotation.dayFull}</div>
              </div>
              {/* Notification content */}
              <div style={{ padding: '14px' }}>
                {/* Main offer */}
                <div style={{ background: `linear-gradient(135deg, ${mainMeta.bg}, ${mainMeta.bg}90)`, borderRadius: 16, overflow: 'hidden', border: `1px solid ${mainMeta.color}30`, marginBottom: 10 }}>
                  <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 8, color: mainMeta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Main offer — {mainMeta.label}</div>
                    <span style={{ fontSize: 8, background: mainMeta.color, color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>MAIN</span>
                  </div>
                  <div style={{ padding: '4px 14px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1px solid ${mainMeta.color}20` }}>{mainMeta.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{mainContent.headline}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{mainContent.subtext}</div>
                      </div>
                    </div>
                    <div style={{ background: mainMeta.color, color: '#fff', padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, textAlign: 'center', marginTop: 10 }}>{mainContent.cta}</div>
                  </div>
                </div>

                {/* Cross-sell divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Gợi ý thêm cho bạn</span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {/* Cross-sell offers */}
                {crossSellSquads.map(squad => {
                  const meta = squadMeta[squad]
                  const content = contentVariants[squad][selectedSegment]
                  return (
                    <div key={squad} style={{ display: 'flex', gap: 10, padding: '10px 12px', alignItems: 'center', background: '#f8fafc', borderRadius: 12, marginBottom: 6, border: '1px solid #f1f5f9' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{content.headline}</div>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{content.subtext}</div>
                      </div>
                      <span style={{ fontSize: 8, color: '#7c3aed', fontWeight: 600, flexShrink: 0 }}>CROSS-SELL</span>
                    </div>
                  )
                })}
              </div>
              {/* Bottom nav */}
              <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', padding: '8px 0 12px' }}>
                {['🏠 Tổng quan', '📈 Thị trường', '💼 Tài sản', '🔔 Thông báo', '👤 Tài khoản'].map((nav, i) => (
                  <div key={nav} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 14 }}>{nav.split(' ')[0]}</div>
                    <div style={{ fontSize: 7, marginTop: 1, color: i === 3 ? '#7c3aed' : '#94a3b8', fontWeight: i === 3 ? 600 : 400 }}>{nav.split(' ')[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right info */}
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-amber-700 mb-2">📌 {rotation.dayFull} — {squadMeta[mainSquad].label} Day</div>
              <div className="text-[11px] text-amber-700 leading-relaxed">
                <b>Main offer:</b> <SquadBadge squad={mainSquad} size="xs" /> → gửi cho <b>100% KH</b> (500K)<br />
                <b>Cross-sell #1:</b> <SquadBadge squad={crossSellSquads[0]} size="xs" /> → chọn bằng scoring<br />
                <b>Cross-sell #2:</b> <SquadBadge squad={crossSellSquads[1]} size="xs" /> → chọn bằng scoring
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-violet-700 mb-2">🧠 Content personalization</div>
              <div className="text-[11px] text-violet-700 leading-relaxed">
                Segment <b>{segments.find(s => s.id === selectedSegment)?.name}</b> nhận nội dung:<br /><br />
                <b>Headline:</b> &quot;{mainContent.headline}&quot;<br />
                <b>CTA:</b> &quot;{mainContent.cta}&quot;<br /><br />
                → Chuyển sang segment khác để thấy nội dung thay đổi.
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-emerald-700 mb-2">📊 Attribution tracking</div>
              <div className="text-[11px] text-emerald-700 leading-relaxed">
                <b>Main offer click</b> → ghi nhận cho squad <SquadBadge squad={mainSquad} size="xs" /><br />
                <b>Cross-sell click</b> → ghi nhận cho squad tương ứng<br />
                → Mỗi squad biết chính xác bao nhiêu KH engage từ campaign của mình.
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-600 mb-2">📈 Exposure tuần này cho mỗi squad</div>
              <div className="space-y-1.5">
                {(['bond', 'fund', 'stock', 'borrowlink', 'itracker', 'ipower', 'ioptima'] as SquadId[]).map(sq => {
                  const isMain = sq === mainSquad
                  const isCross = crossSellSquads.includes(sq)
                  return (
                    <div key={sq} className="flex items-center gap-2 text-[11px]">
                      <SquadBadge squad={sq} size="xs" />
                      <span className="text-slate-400 flex-1">1 main day + cross-sell appearances</span>
                      {isMain && <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: squadMeta[sq].bg, color: squadMeta[sq].color }}>MAIN HÔM NAY</span>}
                      {isCross && <span className="text-[9px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded">CROSS-SELL</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">📋 So sánh: Hiện tại vs Option 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border-2 border-red-200 bg-red-50/40">
            <div className="text-xs font-bold text-red-500 uppercase mb-3">Hiện tại — Spray & pray</div>
            <div className="space-y-2 text-xs text-red-700">
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> 1 nội dung chung cho TẤT CẢ KH</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Không cross-sell, chỉ 1 SP/ngày</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Không attribution</div>
              <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span> Squad exposure: 1 ngày/tuần</div>
            </div>
          </div>
          <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/40">
            <div className="text-xs font-bold text-amber-600 uppercase mb-3">Option 2 — Main + Cross-sell</div>
            <div className="space-y-2 text-xs text-amber-700">
              <div className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✓</span> Content personalized per segment</div>
              <div className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✓</span> +2 cross-sell offers/ngày</div>
              <div className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✓</span> Attribution per offer (main + cross)</div>
              <div className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✓</span> Coverage 100% + thêm exposure</div>
            </div>
          </div>
          <div className="rounded-xl p-4 border-2 border-violet-200 bg-violet-50/40">
            <div className="text-xs font-bold text-violet-600 uppercase mb-3">Option 1 — Smart Bundle</div>
            <div className="space-y-2 text-xs text-violet-700">
              <div className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">✓</span> 3 offers hoàn toàn personalized</div>
              <div className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">✓</span> Scoring engine chọn top 3</div>
              <div className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">△</span> Coverage không 100% (chỉ top 3)</div>
              <div className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">✓</span> UX tốt nhất cho KH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
