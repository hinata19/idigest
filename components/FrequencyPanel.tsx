'use client'
import { useState } from 'react'
import { userProfiles, suppressionRules, cooldownMatrix } from '@/data/notifications'
import KpiCard from '@/components/KpiCard'

function ProgressBar({ used, max, color }: { used: number; max: number; color: string }) {
  const pct = max > 0 ? (used / max) * 100 : 0
  const full = used >= max
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: full ? '#ef4444' : color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: full ? '#ef4444' : '#64748b', minWidth: 36 }}>{used}/{max}</span>
    </div>
  )
}

function Toggle({ on, onToggle, color }: { on: boolean; onToggle: () => void; color: string }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        background: on ? color : '#e2e8f0',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s',
        left: on ? 18 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

export default function FrequencyPanel() {
  const [rulesEnabled, setRulesEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(suppressionRules.map(r => [r.id, true]))
  )

  const totalSuppressed = suppressionRules.filter(r => rulesEnabled[r.id]).reduce((s, r) => s + r.triggered, 0)

  return (
    <div>
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-[14px] p-4 mb-6 text-sm text-teal-800 leading-relaxed">
        💡 <b>Core idea:</b> Chuyển từ &quot;rule cứng giới hạn toàn hệ thống&quot; sang &quot;budget per-user&quot; — mỗi KH có quota riêng, hệ thống tự phân bổ thông minh dựa trên hành vi.
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard label="Noti suppressed" value={totalSuppressed.toLocaleString()} sub="Tuần này" subColor="success" />
        <KpiCard label="Avg noti/user/tuần" value="6.2" sub="Target < 10" subColor="success" />
        <KpiCard label="Opt-out rate" value="1.3%" sub="Target < 2%" subColor="success" />
        <KpiCard label="Push open rate" value="42.8%" sub="+5.2% vs tháng trước" subColor="success" />
        <KpiCard label="Email unsubscribe" value="0.8%" sub="Target < 1.5%" subColor="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Per-user budget */}
        <div className="panel">
          <h3 className="text-base font-bold mb-1">👤 Frequency Budget Per-User</h3>
          <p className="text-[10px] text-slate-400 mb-4">Mỗi KH có quota riêng — hệ thống tự track và throttle theo tuần</p>
          <div className="space-y-3">
            {userProfiles.map(u => (
              <div key={u.userId} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold">{u.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-2">{u.segment}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Gần nhất: {u.lastNotiTime}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Push</span>
                    <div className="flex-1"><ProgressBar used={u.pushBudget.used} max={u.pushBudget.max} color="#7c3aed" /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Inbox</span>
                    <div className="flex-1"><ProgressBar used={u.inboxBudget.used} max={u.inboxBudget.max} color="#2563eb" /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Email</span>
                    <div className="flex-1"><ProgressBar used={u.emailBudget.used} max={u.emailBudget.max} color="#059669" /></div>
                  </div>
                </div>
                {u.suppressionRules.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {u.suppressionRules.map((r, i) => (
                      <span key={i} className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">⚡ {r}</span>
                    ))}
                  </div>
                )}
                {u.dismissStreak >= 3 && (
                  <div className="mt-2 text-[10px] text-red-500 font-medium">⚠ Dismiss streak: {u.dismissStreak} — frequency giảm 50% trong 2 tuần</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suppression rules + cooldown */}
        <div>
          <div className="panel mb-4">
            <h3 className="text-base font-bold mb-1">🛡️ Smart Suppression Rules</h3>
            <p className="text-[10px] text-slate-400 mb-4">Bật/tắt từng rule — số lần triggered trong tuần qua</p>
            <div className="space-y-2">
              {suppressionRules.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200" style={{ borderLeftColor: r.color, borderLeftWidth: 3 }}>
                  <Toggle on={rulesEnabled[r.id]} onToggle={() => setRulesEnabled(prev => ({ ...prev, [r.id]: !prev[r.id] }))} color={r.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: r.color }}>{r.id}</span>
                      <span className="text-sm font-medium">{r.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold" style={{ color: rulesEnabled[r.id] ? r.color : '#cbd5e1' }}>{r.triggered}</div>
                    <div className="text-[9px] text-slate-400">tuần này</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="text-base font-bold mb-1">⏱️ Cooldown Matrix</h3>
            <p className="text-[10px] text-slate-400 mb-4">Thời gian chờ tối thiểu giữa các kênh (chỉ áp dụng cho promo)</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Sau khi gửi...</th>
                  <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Push</th>
                  <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Inbox</th>
                  <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Email</th>
                  <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">SMS</th>
                </tr>
              </thead>
              <tbody>
                {cooldownMatrix.map(row => (
                  <tr key={row.after} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-xs">{row.after}</td>
                    {[row.push, row.inbox, row.email, row.sms].map((v, i) => (
                      <td key={i} className="px-3 py-2 text-center">
                        <span className={`text-xs font-medium ${v === '0' ? 'text-emerald-500' : 'text-amber-600'}`}>
                          {v === '0' ? '✓ 0' : v}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[10px] text-slate-400">* Cooldown chỉ áp dụng cho promo push sau giao dịch. GD push không bị giới hạn.</div>
          </div>
        </div>
      </div>

      {/* Engagement + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <h3 className="text-base font-bold mb-4">📈 Engagement Metrics</h3>
          <div className="space-y-3">
            {[
              { label: 'Push open rate', value: 42.8, target: 35, color: '#7c3aed' },
              { label: 'Inbox read rate', value: 68.5, target: 60, color: '#2563eb' },
              { label: 'Email open rate', value: 28.3, target: 25, color: '#059669' },
              { label: 'Click-through rate', value: 12.1, target: 10, color: '#d97706' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{m.label}</span>
                  <span className="font-bold" style={{ color: m.value >= m.target ? '#059669' : '#ef4444' }}>
                    {m.value}% <span className="text-slate-400 font-normal">(target: {m.target}%)</span>
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(m.value, 100)}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3 className="text-base font-bold mb-4">🏥 Health Metrics</h3>
          <div className="space-y-3">
            {[
              { label: 'Noti/user/tuần', value: 6.2, target: 10, color: '#2563eb' },
              { label: 'Opt-out rate (%/tháng)', value: 1.3, target: 2, color: '#ef4444' },
              { label: 'Push permission revoke', value: 0.5, target: 1, color: '#d97706' },
              { label: 'Email unsubscribe (%)', value: 0.8, target: 1.5, color: '#7c3aed' },
            ].map(m => {
              const hit = m.value <= m.target
              return (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{m.label}</span>
                    <span className="font-bold" style={{ color: hit ? '#059669' : '#ef4444' }}>
                      {m.value} <span className="text-slate-400 font-normal">(target: ≤ {m.target})</span>
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%`, background: hit ? '#10b981' : '#ef4444' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
