interface KpiCardProps {
  label: string
  value: string
  sub?: string
  subColor?: 'success' | 'danger' | 'neutral'
}

export default function KpiCard({ label, value, sub, subColor = 'neutral' }: KpiCardProps) {
  const colors = { success: 'text-emerald-600', danger: 'text-rose-500', neutral: 'text-slate-400' }
  const dotColors = { success: 'bg-emerald-400', danger: 'bg-rose-400', neutral: 'bg-slate-300' }
  return (
    <div className="kpi-card group">
      <div className="text-xs text-slate-400 uppercase tracking-[0.08em] font-semibold mb-2.5">{label}</div>
      <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">{value}</div>
      {sub && (
        <div className={`flex items-center gap-1.5 text-sm mt-2.5 font-medium ${colors[subColor]}`}>
          <span className={`w-2 h-2 rounded-full ${dotColors[subColor]}`} />
          {sub}
        </div>
      )}
    </div>
  )
}
