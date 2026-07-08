'use client'
import { useState } from 'react'
import { campaignQueue } from '@/data/notifications'
import type { CampaignStatus } from '@/data/notifications'

const statusMeta: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#64748b', bg: '#f1f5f9' },
  pending: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
  approved: { label: 'Đã duyệt', color: '#059669', bg: '#d1fae5' },
  queued: { label: 'Trong queue', color: '#2563eb', bg: '#dbeafe' },
  sending: { label: 'Đang gửi', color: '#7c3aed', bg: '#ede9fe' },
  completed: { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7' },
  paused: { label: 'Tạm dừng', color: '#ef4444', bg: '#fee2e2' },
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={{ background: bg, color, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>{children}</span>
}

export default function OrchestrationPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const statusOrder: CampaignStatus[] = ['draft', 'pending', 'approved', 'queued', 'sending', 'completed']

  const pipelineSteps = [
    { step: 1, label: 'Request', sub: 'Team tạo request', color: '#64748b', icon: '📝' },
    { step: 2, label: 'Conflict Check', sub: 'Auto kiểm tra', color: '#f59e0b', icon: '🔍' },
    { step: 3, label: 'Approval', sub: 'Lead review', color: '#ef4444', icon: '✅' },
    { step: 4, label: 'Smart Queue', sub: 'Xếp hàng đợi', color: '#2563eb', icon: '📋' },
    { step: 5, label: 'Send & Track', sub: 'Gửi + theo dõi', color: '#059669', icon: '🚀' },
  ]

  return (
    <div>
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-[14px] p-4 mb-6 text-sm text-amber-800 leading-relaxed">
        💡 <b>Core idea:</b> Mỗi campaign phải đi qua pipeline 5 bước, có approval và priority scoring. Không ai được "bắn thẳng" nữa — tất cả phải qua conflict check.
      </div>

      {/* Pipeline */}
      <div className="panel mb-6">
        <h3 className="text-base font-bold mb-4">🔄 Campaign Pipeline</h3>
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {pipelineSteps.map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: `${s.color}12`, border: `2px solid ${s.color}40`, borderRadius: 14,
                padding: '14px 18px', minWidth: 150, textAlign: 'center',
              }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 4 }}>Bước {s.step}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{s.sub}</div>
              </div>
              {i < 4 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 2, background: '#e2e8f0' }} />
                  <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '6px solid #cbd5e1' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100">
            <div className="text-xs font-semibold text-amber-600 uppercase mb-2">Bước 2 — Conflict Check (Auto)</div>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <div>✓ KH này đã nhận bao nhiêu noti trong 7 ngày?</div>
              <div>✓ Có campaign nào đang chạy cùng segment?</div>
              <div>✓ Có vi phạm frequency cap không?</div>
              <div>✓ Overlap với quiet hours?</div>
              <div>✓ Cùng sản phẩm đã gửi trong 14 ngày?</div>
            </div>
          </div>
          <div className="bg-red-50/60 rounded-xl p-4 border border-red-100">
            <div className="text-xs font-semibold text-red-500 uppercase mb-2">Bước 3 — Approval (Manual)</div>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <div>✓ Lead/Manager xem conflict report</div>
              <div>✓ Review estimated volume & reach</div>
              <div>✓ Kiểm tra priority score</div>
              <div>✓ Approve / Reject / Điều chỉnh thời gian</div>
              <div>✓ Auto-escalate nếu chưa duyệt trong 24h</div>
            </div>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-2">Bước 4 — Smart Queue (Auto)</div>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <div>✓ Phân bổ theo optimal time (giờ KH hay mở app)</div>
              <div>✓ Tránh gửi dồn cùng lúc cho 1 KH</div>
              <div>✓ Priority-based: score cao gửi trước</div>
              <div>✓ Batch sending, không flood hệ thống</div>
              <div>✓ Auto-pause nếu open rate thấp bất thường</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority scoring + overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="panel">
          <h3 className="text-base font-bold mb-4">⚡ Priority Scoring</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Tiêu chí</th>
                <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Trọng số</th>
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Loại noti', weight: '40%', wColor: '#ef4444', wBg: '#fee2e2', example: 'GD=100, HT=80, CN=60, Promo=30' },
                { name: 'Urgency', weight: '25%', wColor: '#d97706', wBg: '#fef3c7', example: 'Realtime=100, Trong ngày=60, Tuần=30' },
                { name: 'Segment fit', weight: '20%', wColor: '#7c3aed', wBg: '#ede9fe', example: 'Dựa trên hành vi KH gần đây' },
                { name: 'Frequency budget', weight: '15%', wColor: '#059669', wBg: '#d1fae5', example: 'KH này còn bao nhiêu "slot" trong tuần' },
              ].map(r => (
                <tr key={r.name} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-center"><Badge color={r.wColor} bg={r.wBg}>{r.weight}</Badge></td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{r.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-200">≥70: Gửi ngay</span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-medium border border-amber-200">40-69: Vào queue</span>
            <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg font-medium border border-slate-200">&lt;40: Digest/Skip</span>
          </div>
        </div>

        <div className="panel">
          <h3 className="text-base font-bold mb-4">📊 Pipeline Overview</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Trong pipeline', value: campaignQueue.length, color: '#2563eb' },
              { label: 'Đang gửi', value: campaignQueue.filter(c => c.status === 'sending').length, color: '#7c3aed' },
              { label: 'Chờ duyệt', value: campaignQueue.filter(c => c.status === 'pending').length, color: '#d97706' },
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mb-2 font-medium">Phân bổ theo status:</div>
          <div className="flex gap-1 h-7 rounded-lg overflow-hidden">
            {statusOrder.map(st => {
              const count = campaignQueue.filter(c => c.status === st).length
              if (count === 0) return null
              const meta = statusMeta[st]
              return (
                <div key={st} style={{ flex: count, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: meta.color, fontWeight: 600 }}>{meta.label} ({count})</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Campaign queue table */}
      <div className="panel">
        <h3 className="text-base font-bold mb-4">📋 Campaign Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Campaign</th>
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Segment</th>
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Kênh</th>
                <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Priority</th>
                <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Status</th>
                <th className="px-3 py-2 text-right text-xs text-slate-400 uppercase">Reach</th>
                <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Conflicts</th>
                <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Ngày gửi</th>
                <th className="px-3 py-2 text-right text-xs text-slate-400 uppercase">Open %</th>
              </tr>
            </thead>
            <tbody>
              {campaignQueue.sort((a, b) => b.priority - a.priority).map(c => {
                const sMeta = statusMeta[c.status]
                return (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-violet-50/30 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.id} · {c.requestedBy}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{c.segment}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {c.channels.map(ch => (
                          <span key={ch} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{ch}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-sm font-bold ${c.priority >= 80 ? 'text-emerald-600' : c.priority >= 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge color={sMeta.color} bg={sMeta.bg}>{sMeta.label}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">{c.estimatedReach.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-center">
                      {c.conflictCount > 0
                        ? <span className="text-xs font-bold text-amber-600">⚠ {c.conflictCount}</span>
                        : <span className="text-xs text-emerald-500 font-medium">✓ OK</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-400">{c.scheduledDate}</td>
                    <td className="px-3 py-2.5 text-right">
                      {c.openRate ? <span className="font-bold text-emerald-600">{c.openRate}%</span> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
