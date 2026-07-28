'use client'
import { useState } from 'react'

type Tab = 'scoring' | 'dismiss' | 'rules' | 'alibaba'

export default function SmartBundleDocPanel() {
  const [tab, setTab] = useState<Tab>('scoring')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'scoring', label: 'Scoring Engine', icon: '⚡' },
    { id: 'dismiss', label: 'Dismiss & Feedback Loop', icon: '🔁' },
    { id: 'rules', label: 'Re-ranking Rules', icon: '🛡️' },
    { id: 'alibaba', label: 'Alibaba vs TCBS', icon: '🏛️' },
  ]

  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-[14px] p-4 mb-6 text-sm text-indigo-800 leading-relaxed">
        📖 <b>Smart Bundle Engine — Tài liệu chi tiết</b> — Trang này mô tả cách hệ thống tính score, xử lý dismiss, áp dụng re-ranking rules, và so sánh với mô hình Alibaba AI OS gốc.
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${
              tab === t.id
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            <span className="mr-1">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'scoring' && <ScoringSection />}
      {tab === 'dismiss' && <DismissSection />}
      {tab === 'rules' && <RulesSection />}
      {tab === 'alibaba' && <AlibabaSection />}
    </div>
  )
}

/* ────────────────── SCORING ────────────────── */

function ScoringSection() {
  return (
    <div>
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">⚡ Multi-signal Scoring — Công thức tính điểm</h3>
        <p className="text-[10px] text-slate-400 mb-5">Score quyết định thứ tự ưu tiên sản phẩm cho mỗi KH. Mỗi KH có 7 score (1 per squad).</p>

        {/* Formula */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 mb-6 font-mono text-sm leading-relaxed">
          <div className="text-emerald-400 text-xs mb-2">// Công thức tính Affinity Score</div>
          <div>
            Score(KH, SP) = <span className="text-emerald-400">txn</span> × 0.35
            + <span className="text-blue-400">portfolio</span> × 0.25
            + <span className="text-amber-400">app</span> × 0.20
            + <span className="text-slate-400">click</span> × 0.12
            − <span className="text-red-400">dismiss</span> × 0.08
          </div>
          <div className="text-slate-500 text-xs mt-3">// Kết quả: 0-100 điểm → xếp hạng 7 SP → chọn Top 3 vào bundle</div>
        </div>

        {/* 5 signals table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-bold">Signal</th>
                <th className="px-3 py-2.5 text-center text-xs text-slate-500 font-bold">Trọng số</th>
                <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-bold">Nguồn dữ liệu</th>
                <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-bold">Cách tính</th>
                <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-bold">Ví dụ</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                {
                  signal: 'Giao dịch thật (txn)',
                  weight: '35%',
                  color: '#059669',
                  source: 'Lịch sử GD 6 tháng gần nhất',
                  calc: 'Số lần mua SP × recency weight (gần đây = cao hơn)',
                  example: 'KH trade Stock 15 lần/tháng → txn_stock = 35',
                },
                {
                  signal: 'Portfolio holding',
                  weight: '25%',
                  color: '#2563eb',
                  source: 'Danh mục hiện tại',
                  calc: '% NAV của SP trong portfolio. >50% = 25, 30-50% = 18, 10-30% = 10, <10% = 5',
                  example: 'Portfolio 60% Bond → portfolio_bond = 22',
                },
                {
                  signal: 'App behavior',
                  weight: '20%',
                  color: '#d97706',
                  source: 'App tracking 30 ngày',
                  calc: 'Thời gian xem trang SP + search related keywords + click sản phẩm',
                  example: 'Xem trang Fund 3 lần/tuần + search "quỹ mở" → app_fund = 16',
                },
                {
                  signal: 'Click notification',
                  weight: '12%',
                  color: '#64748b',
                  source: 'Click log 30 ngày',
                  calc: 'Số lần click vào offer SP trong bundle. Mỗi click +3, decay 50% mỗi 7 ngày',
                  example: 'Click offer Bond 4 lần trong 2 tuần → click_bond = 12',
                },
                {
                  signal: 'Dismiss (trừ điểm)',
                  weight: '8%',
                  color: '#ef4444',
                  source: 'Dismiss log 30 ngày',
                  calc: 'Mỗi dismiss −2 điểm. Dismiss 3 lần liên tục → trigger cooldown R5',
                  example: 'Dismiss BorrowLink 2 lần → dismiss_borrowlink = −4',
                },
              ].map((row) => (
                <tr key={row.signal} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-semibold" style={{ color: row.color }}>{row.signal}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-bold text-sm" style={{ color: row.color }}>{row.weight}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{row.source}</td>
                  <td className="px-3 py-2.5 text-slate-600">{row.calc}</td>
                  <td className="px-3 py-2.5 text-slate-500 italic">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Worked example */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
          <div className="text-xs font-bold text-violet-700 mb-3">Ví dụ tính score: Nguyễn Minh — Active Trader</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-violet-700">
            <div>
              <div className="font-semibold mb-2">Score cho Stock:</div>
              <div className="font-mono bg-white/50 rounded-lg p-3 text-[11px] leading-relaxed">
                txn = 35 (trade 15 lần/tháng)<br />
                portfolio = 25 (80% portfolio là Stock)<br />
                app = 20 (xem bảng giá 4h/ngày)<br />
                click = 12 (click offer Stock 4 lần)<br />
                dismiss = 0 (chưa dismiss)<br />
                <div className="border-t border-violet-200 mt-2 pt-2 font-bold">
                  Total = 35 + 25 + 20 + 12 − 0 = <span className="text-lg">92</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Score cho BorrowLink:</div>
              <div className="font-mono bg-white/50 rounded-lg p-3 text-[11px] leading-relaxed">
                txn = 0 (chưa bao giờ mua)<br />
                portfolio = 0 (không hold)<br />
                app = 0 (không xem trang BL)<br />
                click = 0 (chưa click offer)<br />
                dismiss = −4 (dismiss 2 lần)<br />
                <div className="border-t border-violet-200 mt-2 pt-2 font-bold">
                  Total = 0 + 0 + 0 + 0 − 4 = <span className="text-lg">4</span> (rất thấp)
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-violet-600">
            → Stock (92) vào Top 3 bundle. BorrowLink (4) bị loại vì score thấp + đã dismiss → không phù hợp.
          </div>
        </div>
      </div>

      {/* Score update cycle */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🔄 Vòng đời cập nhật Score</h3>
        <p className="text-[10px] text-slate-400 mb-4">Score không cố định — thay đổi theo hành vi KH mỗi ngày</p>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {[
            { icon: '📊', label: 'Batch tính score', desc: '17:00 hàng ngày — SQL query trên data warehouse', color: '#7c3aed' },
            { icon: '📨', label: 'Gửi bundle', desc: '09:00 — mỗi KH nhận top 3 offers', color: '#059669' },
            { icon: '👆', label: 'KH phản hồi', desc: 'Click → score SP đó +3. Dismiss → score −2', color: '#d97706' },
            { icon: '🔃', label: 'Signal decay', desc: 'Mỗi 7 ngày: click cũ × 0.5. Sau 30 ngày → xóa', color: '#2563eb' },
            { icon: '📊', label: 'Re-score', desc: '17:00 hôm sau — tính lại với signals mới', color: '#7c3aed' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: `${step.color}12`, border: `2px solid ${step.color}40`, borderRadius: 14,
                padding: '14px 16px', minWidth: 150, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20 }}>{step.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{step.label}</div>
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
    </div>
  )
}

/* ────────────────── DISMISS ────────────────── */

function DismissSection() {
  return (
    <div>
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🔁 Dismiss — Hệ thống phản hồi tiêu cực</h3>
        <p className="text-[10px] text-slate-400 mb-5">Dismiss là tín hiệu quan trọng nhất để hệ thống tự sửa lỗi — nếu gợi ý sai, KH dismiss → hệ thống tự điều chỉnh.</p>

        {/* What counts as dismiss */}
        <h4 className="text-sm font-bold mb-3">Hành vi nào tính là Dismiss?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border-2 border-red-200 bg-red-50/40 p-4">
            <div className="text-xs font-bold text-red-600 uppercase mb-3">Tính là Dismiss ❌</div>
            <div className="space-y-2.5 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                <div><b>Swipe left / vuốt bỏ</b> — KH vuốt bỏ offer trong bundle</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                <div><b>Nhấn "Không quan tâm"</b> — Nút dismiss rõ ràng trên offer</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                <div><b>Xóa notification</b> — KH chủ động xóa bundle khỏi inbox</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4">
            <div className="text-xs font-bold text-emerald-600 uppercase mb-3">Không tính Dismiss ✓</div>
            <div className="space-y-2.5 text-xs text-emerald-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                <div><b>Bỏ qua (ignore)</b> — Nhận notification nhưng không mở → neutral, không trừ điểm</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                <div><b>Mở xem nhưng không click offer</b> — KH mở bundle, đọc rồi thoát → neutral</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                <div><b>Mua sản phẩm</b> — Đây là positive signal, không phải dismiss!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss scoring mechanics */}
        <h4 className="text-sm font-bold mb-3">Dismiss ảnh hưởng Score như thế nào?</h4>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 mb-6 font-mono text-[11px] leading-loose">
          <div className="text-emerald-400 mb-2">// Dismiss penalty cho mỗi sản phẩm</div>
          <div className="text-slate-300">dismiss_count = số lần dismiss SP trong 30 ngày</div>
          <div className="text-slate-300">dismiss_score = dismiss_count × <span className="text-red-400">−2</span></div>
          <div className="text-slate-500 mt-1">// Ví dụ: dismiss BorrowLink 2 lần → −4 điểm</div>
          <div className="border-t border-slate-700 mt-3 pt-3 text-amber-400">// Escalation: dismiss liên tục</div>
          <div className="text-slate-300">Dismiss 1 lần  → <span className="text-red-400">−2</span> điểm &nbsp;&nbsp;(SP vẫn có thể xuất hiện)</div>
          <div className="text-slate-300">Dismiss 2 lần  → <span className="text-red-400">−4</span> điểm &nbsp;&nbsp;(SP rơi xuống cuối danh sách)</div>
          <div className="text-slate-300">Dismiss 3 lần  → <span className="text-red-400">−6</span> điểm + <span className="text-yellow-400">COOLDOWN 7 ngày</span> &nbsp;(R5-COOL kích hoạt)</div>
          <div className="text-slate-500 mt-1">// Sau 7 ngày cooldown → reset dismiss_count = 1, cho SP cơ hội quay lại</div>
        </div>

        {/* Dismiss vs Purchase comparison */}
        <h4 className="text-sm font-bold mb-3">Tại sao Mua ≠ Dismiss?</h4>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="text-xs text-amber-800 leading-relaxed mb-4">
            Sản phẩm tài chính <b>khác hàng tiêu dùng</b>. Mua iPhone xong → không cần quảng cáo iPhone nữa. Nhưng mua Bond xong → hoàn toàn có thể mua thêm Bond kỳ hạn khác.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="text-xs font-bold text-emerald-600 mb-2">✅ Mua thành công → Upsell</div>
              <div className="text-[11px] text-slate-600 space-y-1.5">
                <div>• Mua Bond 6T → gợi ý Bond 12T lãi cao hơn</div>
                <div>• Mua Fund TCBF → gợi ý Fund TCEF đa dạng hóa</div>
                <div>• Kích hoạt iPower → gợi ý BorrowLink nâng cao</div>
                <div className="text-emerald-600 font-semibold mt-2">→ Score <b>tăng thêm</b> vì txn signal mạnh hơn</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="text-xs font-bold text-red-600 mb-2">❌ Dismiss → Cooldown</div>
              <div className="text-[11px] text-slate-600 space-y-1.5">
                <div>• Dismiss Bond 1 lần → giảm −2, vẫn hiện</div>
                <div>• Dismiss Bond 2 lần → giảm −4, rơi cuối list</div>
                <div>• Dismiss Bond 3 lần → cooldown 7 ngày</div>
                <div className="text-red-600 font-semibold mt-2">→ Score <b>giảm</b> + bị tạm ẩn nếu dismiss nhiều</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss decay */}
        <h4 className="text-sm font-bold mb-3">Dismiss Decay — Cơ chế tự phục hồi</h4>
        <div className="panel bg-slate-50">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white">
                  <th className="px-3 py-2 text-left font-bold text-slate-500">Thời gian</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-500">Sự kiện</th>
                  <th className="px-3 py-2 text-center font-bold text-slate-500">Dismiss count</th>
                  <th className="px-3 py-2 text-center font-bold text-slate-500">Dismiss score</th>
                  <th className="px-3 py-2 text-left font-bold text-slate-500">Trạng thái SP</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {[
                  { time: 'Ngày 1', event: 'KH dismiss Bond offer', count: '1', score: '−2', status: 'Vẫn hiện — score giảm nhẹ', statusColor: '#d97706' },
                  { time: 'Ngày 3', event: 'KH dismiss Bond lần 2', count: '2', score: '−4', status: 'Rơi cuối list — ít khả năng vào bundle', statusColor: '#d97706' },
                  { time: 'Ngày 5', event: 'KH dismiss Bond lần 3', count: '3', score: '−6', status: '❄️ COOLDOWN 7 ngày — Bond bị ẩn', statusColor: '#ef4444' },
                  { time: 'Ngày 12', event: 'Hết cooldown', count: '1 (reset)', score: '−2', status: 'Bond quay lại với score thấp', statusColor: '#2563eb' },
                  { time: 'Ngày 19', event: 'Không dismiss thêm', count: '0 (decay)', score: '0', status: '✅ Score reset — Bond bình thường', statusColor: '#059669' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="px-3 py-2.5 font-semibold text-slate-700">{row.time}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.event}</td>
                    <td className="px-3 py-2.5 text-center font-bold">{row.count}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-red-500">{row.score}</td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: row.statusColor }}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 leading-relaxed">
            💡 <b>Thiết kế principle:</b> Dismiss decay đảm bảo không có SP nào bị "chết vĩnh viễn". Nếu KH thay đổi nhu cầu (VD: chuyển từ Stock sang Bond), hệ thống tự phát hiện qua app behavior + portfolio signals, không bị dismiss cũ chặn lại.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────── RULES ────────────────── */

function RulesSection() {
  const rules = [
    {
      id: 'R1-DIV', name: 'Diversity', color: '#7c3aed', icon: '🔀',
      purpose: 'Đảm bảo mỗi bundle giới thiệu KH đến nhiều loại sản phẩm, không phải 3 offer cùng 1 squad.',
      logic: 'Bundle 3 offers PHẢI từ 3 squads khác nhau. Nếu Top 2 cùng squad → lấy #2 thay bằng squad rank kế tiếp.',
      example: 'KH score: Stock 92, Stock(offer2) 85, iTracker 68. → Bundle = Stock 92, iTracker 68, iOptima 52 (skip offer2 vì trùng squad)',
      impact: 'Tăng discovery rate — KH tiếp xúc 3 loại SP mỗi ngày thay vì 1.',
    },
    {
      id: 'R2-FAIR', name: 'Fairness Quota', color: '#2563eb', icon: '⚖️',
      purpose: 'Đảm bảo mỗi squad được xuất hiện tối thiểu — không squad nào bị "chết" vì score thấp toàn bộ.',
      logic: 'Mỗi squad phải xuất hiện ít nhất 2 lần/tuần trên toàn bộ KH base. Nếu squad chưa đạt quota → boost score +20 cho 10% KH có score SP đó cao nhất.',
      example: 'iTracker chỉ xuất hiện 1 lần tuần này → boost +20 cho 50K KH có iTracker score cao nhất → tuần sau đạt quota.',
      impact: 'Giải quyết conflict giữa squads. Mỗi squad đều có minimum exposure, không ai bị mất slot hoàn toàn.',
    },
    {
      id: 'R3-FREQ', name: 'Frequency Cap', color: '#059669', icon: '🕐',
      purpose: 'Tránh spam — KH không bị nhận quá nhiều notification, đặc biệt khi đang giao dịch.',
      logic: '1 bundle/ngày (09:00). Nếu KH vừa thực hiện giao dịch trong 4 giờ gần nhất → skip bundle hôm đó.',
      example: 'KH mua Bond lúc 08:30 → bundle 09:00 bị skip. Ngày mai nhận bình thường.',
      impact: 'Giữ trải nghiệm sạch — notification là giá trị, không phải noise.',
    },
    {
      id: 'R4-DEDUP', name: 'Dedup 7 ngày', color: '#d97706', icon: '🔄',
      purpose: 'Tránh lặp offer — KH không thấy cùng 1 offer quá nhiều lần.',
      logic: 'Cùng 1 offer (cùng SP, cùng nội dung) không hiện quá 2 lần trong 7 ngày cho 1 KH. Offer mới từ cùng squad vẫn được.',
      example: 'Offer "VPB 8.9% 6T" đã hiện 2 lần → lần 3 thay bằng "HDB 9.1% 12T" (cùng Bond squad nhưng offer khác).',
      impact: 'Giữ bundle luôn fresh — KH luôn thấy nội dung mới.',
    },
    {
      id: 'R5-COOL', name: 'Dismiss Cooldown', color: '#ef4444', icon: '❄️',
      purpose: 'Tôn trọng phản hồi tiêu cực — nếu KH dismiss 1 SP nhiều lần, tạm ẩn SP đó.',
      logic: 'Dismiss 3 lần liên tục cùng 1 SP trong 14 ngày → cooldown SP đó 7 ngày. Sau cooldown, reset dismiss_count = 1 (cho cơ hội quay lại). Mua thành công → KHÔNG cooldown, tiếp tục upsell.',
      example: 'KH dismiss BorrowLink 3 lần → BorrowLink bị ẩn 7 ngày. Ngày thứ 8, BorrowLink quay lại với score thấp. Nếu KH vẫn dismiss → cooldown thêm 7 ngày.',
      impact: 'Hệ thống tự sửa — gợi ý sai thì dừng, không ép KH.',
    },
  ]

  return (
    <div>
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🛡️ Re-ranking Rules — Chi tiết</h3>
        <p className="text-[10px] text-slate-400 mb-5">5 rules can thiệp sau scoring — đảm bảo chất lượng bundle. Chạy tuần tự R1 → R2 → R3 → R4 → R5.</p>

        {/* Pipeline flow */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
          <div className="text-xs font-bold text-slate-600 mb-3">Thứ tự áp dụng:</div>
          <div className="flex items-center gap-0 overflow-x-auto text-[10px]">
            {['Score 7 SP', 'R1: Diversity', 'R2: Fairness', 'R3: Freq cap', 'R4: Dedup', 'R5: Cooldown', 'Final bundle'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap',
                  background: i === 0 ? '#7c3aed' : i === 6 ? '#059669' : '#f1f5f9',
                  color: i === 0 || i === 6 ? '#fff' : '#475569',
                  border: i > 0 && i < 6 ? '1px solid #e2e8f0' : 'none',
                }}>{step}</div>
                {i < 6 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 2, background: '#cbd5e1' }} />
                    <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '5px solid #cbd5e1' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rule cards */}
        <div className="space-y-4">
          {rules.map(r => (
            <div key={r.id} className="rounded-xl border border-slate-200 overflow-hidden" style={{ borderLeftWidth: 4, borderLeftColor: r.color }}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{r.icon}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: r.color + '15', color: r.color }}>{r.id}</span>
                  <span className="text-sm font-bold">{r.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-slate-600 mb-1">Mục đích</div>
                    <div className="text-slate-500 leading-relaxed">{r.purpose}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-600 mb-1">Logic</div>
                    <div className="text-slate-500 leading-relaxed">{r.logic}</div>
                  </div>
                </div>
                <div className="mt-3 bg-slate-50 rounded-lg p-3 text-[11px]">
                  <span className="font-semibold text-slate-600">Ví dụ: </span>
                  <span className="text-slate-500">{r.example}</span>
                </div>
                <div className="mt-2 text-[10px] font-medium" style={{ color: r.color }}>
                  Impact: {r.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge cases */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">⚠️ Edge Cases & Conflict Resolution</h3>
        <div className="space-y-3">
          {[
            {
              q: 'R1 (Diversity) vs R5 (Cooldown): 3 SP bị cooldown, chỉ còn 4 SP → có thể không đủ diversity?',
              a: 'Chọn 3 từ 4 SP còn lại. Nếu < 3 SP available → giảm bundle size xuống 2 hoặc 1 offer. Không bao giờ gửi SP đang cooldown.',
            },
            {
              q: 'R2 (Fairness) boost score nhưng KH đã dismiss SP đó → R5 block?',
              a: 'R5 thắng R2. Fairness boost chỉ áp dụng cho KH KHÔNG đang cooldown SP đó. Squad đạt quota từ KH khác.',
            },
            {
              q: 'KH dismiss toàn bộ 7 SP → không còn gì để gửi?',
              a: 'Scenario cực hiếm. Nếu xảy ra: pause notification 14 ngày → sau cooldown reset, bắt đầu lại từ segment default bundle.',
            },
            {
              q: 'KH mua Bond rồi dismiss Bond offer ngay sau đó?',
              a: 'Mua vẫn là positive signal (txn tăng). Dismiss trừ riêng. Net effect: txn +35 − dismiss −2 = vẫn tích cực. R5 chỉ trigger nếu dismiss 3 lần.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-1.5">Q: {item.q}</div>
              <div className="text-xs text-slate-500 leading-relaxed">A: {item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ────────────────── ALIBABA ────────────────── */

function AlibabaSection() {
  return (
    <div>
      {/* Alibaba AI OS overview */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🏛️ Alibaba AI OS — Campaign Orchestration gốc</h3>
        <p className="text-[10px] text-slate-400 mb-5">Alipay phục vụ 1.3 tỷ user, 200+ business units cùng gửi offers. Họ xây AI OS để giải quyết vấn đề y hệt TCBS: nhiều squad tranh nhau 1 slot notification.</p>

        <div className="bg-slate-900 rounded-xl p-5 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase mb-4">Alipay 3-Stage Pipeline</div>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {[
              {
                stage: 'RECALL',
                color: '#7c3aed',
                desc: 'Từ 1000+ campaigns → lọc xuống 50-100 candidates phù hợp per user',
                tech: 'Collaborative filtering + User embedding + Item embedding. Real-time feature store.',
                scale: '1000+ → ~80 candidates',
              },
              {
                stage: 'RANKING',
                color: '#d97706',
                desc: 'Xếp hạng 50-100 candidates theo predicted CTR × conversion rate × LTV',
                tech: 'DIN (Deep Interest Network) — attention-based neural net. Features: user sequence, item features, context.',
                scale: '~80 → ranked list',
              },
              {
                stage: 'RE-RANKING',
                color: '#059669',
                desc: 'Business rules can thiệp: diversity, fairness, frequency, budget pacing',
                tech: 'Deterministic rules + MMR (Maximal Marginal Relevance) cho diversity. Greedy list-wise optimization.',
                scale: 'Ranked → final 3-5 offers',
              },
            ].map((s, i) => (
              <div key={s.stage} style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{
                  background: `${s.color}12`, border: `2px solid ${s.color}40`, borderRadius: 14,
                  padding: '16px 18px', minWidth: 240,
                }}>
                  <div className="text-xs font-bold mb-2" style={{ color: s.color }}>{s.stage}</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed mb-3">{s.desc}</div>
                  <div className="bg-black/20 rounded-lg p-2.5 text-[10px] text-slate-400 leading-relaxed mb-2">
                    <span className="text-slate-500 font-semibold">Tech: </span>{s.tech}
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: s.color }}>{s.scale}</div>
                </div>
                {i < 2 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 16, height: 2, background: '#475569' }} />
                    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '6px solid #64748b' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TCBS adaptation */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-1">🔄 TCBS Smart Bundle — Phiên bản thu gọn</h3>
        <p className="text-[10px] text-slate-400 mb-5">TCBS có 500K KH, 7 SP — nhỏ hơn Alipay 2600x. Không cần ML phức tạp, nhưng pipeline concept vẫn đúng.</p>

        {/* Comparison table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2.5 text-left font-bold text-slate-500 w-1/6">Giai đoạn</th>
                <th className="px-3 py-2.5 text-left font-bold text-slate-500 w-5/12">
                  <span className="text-violet-600">Alibaba / Alipay</span>
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-slate-500 w-5/12">
                  <span className="text-emerald-600">TCBS Smart Bundle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  stage: 'Recall',
                  alibaba: 'ML-based collaborative filtering. User/item embeddings. Real-time feature store. 1000+ campaigns → 80 candidates.',
                  tcbs: 'Segment lookup table. 6 segments × default bundle. 7 SP → 7 candidates (tất cả). Không cần lọc vì số SP nhỏ.',
                },
                {
                  stage: 'Ranking',
                  alibaba: 'DIN neural network. Attention mechanism trên user behavior sequence. Predicted pCTR × pCVR × LTV. GPU inference.',
                  tcbs: 'Multi-signal formula. 5 features: txn (35%) + portfolio (25%) + app (20%) + click (12%) − dismiss (8%). SQL batch 17:00.',
                },
                {
                  stage: 'Re-ranking',
                  alibaba: 'MMR diversity. Budget pacing. Fatigue management. A/B testing framework. 50+ business rules.',
                  tcbs: '5 rules cố định: R1-DIV, R2-FAIR, R3-FREQ, R4-DEDUP, R5-COOL. Deterministic, dễ debug.',
                },
                {
                  stage: 'Serving',
                  alibaba: 'Real-time inference <100ms. Feature store + model serving + A/B routing. 1M+ QPS.',
                  tcbs: 'Daily batch 17:00. Pre-compute bundle per KH. Push 09:00 sáng hôm sau. Zero real-time load.',
                },
                {
                  stage: 'Feedback',
                  alibaba: 'Real-time click stream → online learning. Model retrain 2x/ngày. Explore/exploit bandit.',
                  tcbs: 'Click/dismiss log → update score ngày hôm sau. Dismiss 3x → cooldown. Batch feedback loop.',
                },
              ].map((row) => (
                <tr key={row.stage} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-bold text-slate-700 align-top">{row.stage}</td>
                  <td className="px-3 py-3 text-slate-500 leading-relaxed align-top">{row.alibaba}</td>
                  <td className="px-3 py-3 text-slate-600 leading-relaxed align-top">{row.tcbs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why these simplifications work */}
        <h4 className="text-sm font-bold mb-3">Tại sao TCBS không cần ML phức tạp?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              reason: 'Catalog nhỏ',
              detail: '7 sản phẩm vs Alipay 1000+ campaigns. C(7,3) = 35 bundles khả thi — đủ nhỏ để lookup table, không cần neural net.',
              number: '7 SP',
              color: '#7c3aed',
            },
            {
              reason: 'Tần suất thấp',
              detail: '1 bundle/ngày vs Alipay real-time mỗi lần mở app. Batch xử lý đủ nhanh, không cần inference pipeline.',
              number: '1/ngày',
              color: '#059669',
            },
            {
              reason: 'Signal rõ ràng',
              detail: 'Giao dịch tài chính = signal cực mạnh (mua Bond 100M >> click 1 banner). Không cần DIN để extract weak signals.',
              number: '35%',
              color: '#d97706',
            },
          ].map(item => (
            <div key={item.reason} className="rounded-xl border border-slate-200 p-4" style={{ borderTopWidth: 3, borderTopColor: item.color }}>
              <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.number}</div>
              <div className="text-xs font-bold mb-1">{item.reason}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{item.detail}</div>
            </div>
          ))}
        </div>

        {/* Upgrade path */}
        <h4 className="text-sm font-bold mb-3">Lộ trình nâng cấp</h4>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <div className="space-y-3 text-xs text-indigo-700">
            {[
              { phase: 'Phase 1 (Hiện tại)', desc: 'Segment lookup + Multi-signal formula + 5 rules. Batch daily. MVP đủ để chứng minh concept.', status: 'active' },
              { phase: 'Phase 2 (6 tháng)', desc: 'Thêm A/B testing framework. So sánh Smart Bundle vs Fixed rotation. Đo lift chính xác.', status: 'planned' },
              { phase: 'Phase 3 (12 tháng)', desc: 'Nếu data đủ lớn → thay formula bằng logistic regression / XGBoost. Auto-tune weights.', status: 'future' },
              { phase: 'Phase 4 (18+ tháng)', desc: 'Real-time scoring khi KH mở app. Contextual ranking (giờ, ngày, market condition). Approach Alibaba pipeline.', status: 'future' },
            ].map(p => (
              <div key={p.phase} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                  p.status === 'active' ? 'bg-emerald-500' : p.status === 'planned' ? 'bg-amber-400' : 'bg-slate-300'
                }`} />
                <div>
                  <span className="font-bold">{p.phase}: </span>
                  <span className="text-indigo-600">{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">💡 Bài học từ Alibaba</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Pipeline tách biệt = dễ upgrade',
              desc: 'Alibaba chia Recall/Ranking/Re-ranking riêng biệt. TCBS copy cấu trúc này → sau này thay từng phần mà không phải rewrite cả hệ thống.',
              icon: '🧩',
            },
            {
              title: 'Business rules cứu ML',
              desc: 'Kể cả Alibaba với ML tiên tiến vẫn cần Re-ranking rules (diversity, fairness, freq cap). Rules không phải "tạm thời thay ML" — chúng bổ sung ML.',
              icon: '🛡️',
            },
            {
              title: 'Attribution là nền tảng',
              desc: 'Alibaba đo tất cả: impression, click, conversion, revenue per campaign. Không có attribution → không thể optimize. TCBS phải có tracking link per offer.',
              icon: '📊',
            },
            {
              title: 'Bắt đầu đơn giản, phức tạp hóa khi cần',
              desc: 'Alibaba cũng bắt đầu từ rules trước khi chuyển sang ML. Quan trọng là pipeline đúng, model có thể swap sau.',
              icon: '🚀',
            },
          ].map(item => (
            <div key={item.title} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-lg mb-2">{item.icon}</div>
              <div className="text-xs font-bold mb-1">{item.title}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
