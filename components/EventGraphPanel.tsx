'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import KpiCard from '@/components/KpiCard'

/* ── Types ── */

interface GraphNode {
  id: string
  label: string
  desc: string
  entity: string
  category: 'transaction' | 'corporate_action' | 'market' | 'opportunity' | 'risk' | 'campaign'
  time: string
  impact?: string
  actionRequired?: boolean
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  relation: 'entity' | 'causal' | 'temporal' | 'opportunity'
  label?: string
}

interface GraphCluster {
  id: string
  label: string
  entity: string
  color: string
  narrative: string
  nodes: string[]
  impact: string
}

/* ── Graph Data ── */

const graphNodes: GraphNode[] = [
  // HPG cluster
  { id: 'hpg-dividend', label: 'Cổ tức HPG', desc: 'Nhận 2,500,000đ cổ tức bằng tiền mặt', entity: 'HPG', category: 'transaction', time: '5 ngày trước', x: 120, y: 140 },
  { id: 'hpg-rights', label: 'Quyền mua HPG', desc: 'Quyền mua 1:5, giá 15,000. Deadline: 18/07', entity: 'HPG', category: 'corporate_action', time: '3 ngày trước', impact: 'Mất ~3.75tr chiết khấu nếu bỏ qua', actionRequired: true, x: 300, y: 80 },
  { id: 'hpg-margin', label: 'Ký quỹ HPG', desc: 'Tỷ lệ ký quỹ 148% — gần ngưỡng 140%', entity: 'HPG', category: 'risk', time: '2 ngày trước', impact: 'Nguy cơ bán giải chấp', actionRequired: true, x: 300, y: 210 },
  { id: 'hpg-narrative', label: 'Câu chuyện HPG', desc: 'Cổ tức đã về → thực hiện quyền mua sẽ tăng vị thế → nhưng ký quỹ đang căng. Cân nhắc dùng tiền cổ tức để nạp ký quỹ trước.', entity: 'HPG', category: 'opportunity', time: 'AI insight', x: 480, y: 145 },

  // MWG cluster
  { id: 'mwg-order', label: 'Lệnh khớp MWG', desc: 'Mua 500 CP tại 52,300. Tổng: 26.15tr', entity: 'MWG', category: 'transaction', time: '2 phút trước', x: 120, y: 380 },
  { id: 'mwg-sector', label: 'Bán lẻ tăng 2.3%', desc: 'Ngành bán lẻ outperform VN-Index hôm nay', entity: 'MWG', category: 'market', time: '1 giờ trước', x: 300, y: 330 },
  { id: 'mwg-margin-impact', label: 'Tác động ký quỹ', desc: 'Mua MWG giảm tỷ lệ ký quỹ từ 152% → 148%. Tiếp cận ngưỡng.', entity: 'MWG', category: 'risk', time: 'AI insight', x: 300, y: 440 },

  // Cash flow cluster
  { id: 'cash-deposit', label: 'Nạp tiền 50tr', desc: '+50,000,000đ vào TK chứng khoán', entity: 'CASH', category: 'transaction', time: '1 giờ trước', x: 630, y: 330 },
  { id: 'cash-idle', label: 'Tiền nhàn 150tr', desc: '150tr nhàn rỗi × 12 ngày = ~500K lãi iPower bị bỏ lỡ', entity: 'CASH', category: 'opportunity', time: 'AI insight', impact: '42K/ngày chi phí cơ hội', x: 810, y: 270 },
  { id: 'cash-ipower', label: 'Gợi ý iPower', desc: 'Kích hoạt iPower cho 150tr nhàn rỗi — lãi 7%/năm', entity: 'CASH', category: 'campaign', time: 'Gợi ý AI', x: 810, y: 400 },

  // Bond maturity cluster
  { id: 'bond-maturity', label: 'TCBond đáo hạn', desc: 'TCBond 8.5% đáo hạn 01/08. Nhận 515tr (500tr gốc + 15tr lãi)', entity: 'BOND', category: 'corporate_action', time: 'Trong 14 ngày', actionRequired: true, x: 630, y: 80 },
  { id: 'bond-reinvest', label: 'Tái đầu tư Bond', desc: 'TCBond 9.5% hiện có — tái đầu tư tăng lợi suất +0.7%/năm', entity: 'BOND', category: 'campaign', time: 'Gợi ý AI', x: 810, y: 80 },
  { id: 'bond-cash-flow', label: 'Dòng tiền 515tr', desc: '515tr sẽ available ngày 01/08 — cơ hội phân bổ lại', entity: 'BOND', category: 'opportunity', time: 'AI insight', x: 810, y: 160 },

  // Cross-cluster connections visible via edges
  { id: 'portfolio-risk', label: 'Tổng hợp rủi ro', desc: 'Mua MWG + ký quỹ HPG căng + lệnh chờ = tổng rủi ro tăng. Nạp 50tr chưa đủ buffer.', entity: 'PORTFOLIO', category: 'risk', time: 'AI insight', actionRequired: true, x: 480, y: 380 },
]

const graphEdges: GraphEdge[] = [
  // HPG causal chain
  { from: 'hpg-dividend', to: 'hpg-rights', relation: 'entity', label: 'cùng mã' },
  { from: 'hpg-dividend', to: 'hpg-margin', relation: 'entity', label: 'cùng mã' },
  { from: 'hpg-rights', to: 'hpg-narrative', relation: 'causal', label: 'cần cân nhắc' },
  { from: 'hpg-margin', to: 'hpg-narrative', relation: 'causal', label: 'ảnh hưởng' },
  { from: 'hpg-dividend', to: 'hpg-narrative', relation: 'causal', label: 'nguồn tiền' },

  // MWG chain
  { from: 'mwg-order', to: 'mwg-sector', relation: 'entity', label: 'ngành' },
  { from: 'mwg-order', to: 'mwg-margin-impact', relation: 'causal', label: 'giảm ký quỹ' },

  // Cross-cluster: MWG → HPG margin
  { from: 'mwg-margin-impact', to: 'hpg-margin', relation: 'causal', label: 'cộng dồn rủi ro' },
  { from: 'mwg-margin-impact', to: 'portfolio-risk', relation: 'causal', label: 'tác động' },
  { from: 'hpg-margin', to: 'portfolio-risk', relation: 'causal', label: 'tác động' },

  // Cash flow chain
  { from: 'cash-deposit', to: 'cash-idle', relation: 'causal', label: 'tăng tiền nhàn' },
  { from: 'cash-idle', to: 'cash-ipower', relation: 'opportunity', label: 'gợi ý' },
  { from: 'cash-deposit', to: 'portfolio-risk', relation: 'opportunity', label: 'buffer ký quỹ?' },

  // Bond chain
  { from: 'bond-maturity', to: 'bond-reinvest', relation: 'opportunity', label: 'tái đầu tư' },
  { from: 'bond-maturity', to: 'bond-cash-flow', relation: 'causal', label: 'giải phóng vốn' },
  { from: 'bond-cash-flow', to: 'cash-idle', relation: 'temporal', label: '14 ngày nữa' },
]

const graphClusters: GraphCluster[] = [
  {
    id: 'hpg', label: 'Câu chuyện HPG', entity: 'HPG', color: '#ef4444',
    narrative: '3 thông báo HPG liên quan nhau: Cổ tức 2.5tr đã về TK → Quyền mua 1:5 deadline 18/07 (mất 3.75tr nếu bỏ qua) → Nhưng ký quỹ đang căng 148%. AI gợi ý: dùng tiền cổ tức nạp ký quỹ trước, rồi cân nhắc quyền mua.',
    nodes: ['hpg-dividend', 'hpg-rights', 'hpg-margin', 'hpg-narrative'],
    impact: 'Cần hành động trước 18/07',
  },
  {
    id: 'mwg', label: 'Tác động MWG', entity: 'MWG', color: '#f59e0b',
    narrative: 'Lệnh mua MWG vừa khớp → ngành bán lẻ đang tăng (tín hiệu tốt) → nhưng vị thế mới giảm tỷ lệ ký quỹ từ 152% xuống 148%, tiếp cận ngưỡng nguy hiểm 140%.',
    nodes: ['mwg-order', 'mwg-sector', 'mwg-margin-impact'],
    impact: 'Giám sát ký quỹ',
  },
  {
    id: 'cash', label: 'Dòng tiền', entity: 'CASH', color: '#0891b2',
    narrative: 'Nạp 50tr mới + 100tr sẵn có = 150tr nhàn rỗi. Mỗi ngày không kích hoạt iPower mất 42K. Thêm 515tr sẽ về từ TCBond đáo hạn sau 14 ngày — tổng tiền nhàn sắp lên 665tr.',
    nodes: ['cash-deposit', 'cash-idle', 'cash-ipower'],
    impact: '42K/ngày chi phí cơ hội',
  },
  {
    id: 'bond', label: 'TCBond đáo hạn', entity: 'BOND', color: '#7c3aed',
    narrative: 'TCBond 8.5% đáo hạn 01/08 → 515tr sẽ available → TCBond 9.5% đang mở bán (tăng lợi suất +0.7%/năm). Dòng tiền này cũng có thể dùng để giải quyết vấn đề ký quỹ.',
    nodes: ['bond-maturity', 'bond-reinvest', 'bond-cash-flow'],
    impact: '+3.5tr lợi suất/năm nếu tái đầu tư',
  },
]

/* ── Category config ── */

const categoryConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  transaction:      { label: 'Giao dịch',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '↔' },
  corporate_action: { label: 'Corporate Action', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '📋' },
  market:           { label: 'Thị trường',       color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: '📈' },
  opportunity:      { label: 'Cơ hội',           color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '💡' },
  risk:             { label: 'Rủi ro',           color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⚠️' },
  campaign:         { label: 'Gợi ý AI',        color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '🎯' },
}

const edgeColors: Record<string, string> = {
  entity: '#94a3b8',
  causal: '#ef4444',
  temporal: '#7c3aed',
  opportunity: '#0891b2',
}

/* ── Helpers ── */

function getClusterBounds(cluster: GraphCluster) {
  const nodes = graphNodes.filter(n => cluster.nodes.includes(n.id))
  const pad = 40
  const minX = Math.min(...nodes.map(n => n.x)) - pad
  const minY = Math.min(...nodes.map(n => n.y)) - pad
  const maxX = Math.max(...nodes.map(n => n.x)) + pad + 120
  const maxY = Math.max(...nodes.map(n => n.y)) + pad + 40
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/* ── Component ── */

export default function EventGraphPanel() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const [showNarrative, setShowNarrative] = useState(false)
  const [narrativeVisible, setNarrativeVisible] = useState(0)
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph')
  const svgRef = useRef<SVGSVGElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const connectedNodes = hoveredNode
    ? new Set([
        hoveredNode,
        ...graphEdges.filter(e => e.from === hoveredNode || e.to === hoveredNode).flatMap(e => [e.from, e.to]),
      ])
    : null

  const clusterConnectedNodes = selectedCluster
    ? new Set(graphClusters.find(c => c.id === selectedCluster)?.nodes ?? [])
    : null

  const activeNodes = connectedNodes || clusterConnectedNodes

  // narrative typing
  useEffect(() => {
    if (!showNarrative) { setNarrativeVisible(0); return }
    if (narrativeVisible >= graphClusters.length) return
    const t = setTimeout(() => setNarrativeVisible(v => v + 1), 600)
    return () => clearTimeout(t)
  }, [showNarrative, narrativeVisible])

  // pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest('.graph-node')) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    })
  }, [isPanning])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const node = selectedNode ? graphNodes.find(n => n.id === selectedNode) : null
  const cluster = selectedCluster ? graphClusters.find(c => c.id === selectedCluster) : null

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Thông báo liên kết" value="14" sub="4 câu chuyện" subColor="success" />
        <KpiCard label="Cần hành động" value="3" sub="2 có deadline" subColor="danger" />
        <KpiCard label="Chi phí cơ hội" value="42K/ngày" sub="150tr nhàn rỗi" subColor="danger" />
        <KpiCard label="Tải nhận thức giảm" value="-60%" sub="14 noti → 4 câu chuyện" subColor="success" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 text-xs font-semibold transition-all ${viewMode === 'graph' ? 'bg-violet-50 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🕸️ Đồ thị
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 text-xs font-semibold transition-all ${viewMode === 'timeline' ? 'bg-violet-50 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            📅 Timeline
          </button>
        </div>

        <button
          onClick={() => { setShowNarrative(!showNarrative); setNarrativeVisible(0) }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${showNarrative ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          ✨ AI Narrative
        </button>

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto text-[10px] font-medium text-slate-400 flex-wrap">
          {Object.entries(edgeColors).map(([key, color]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span style={{ width: 16, height: 2, background: color, display: 'inline-block', borderRadius: 1 }} />
              {{ entity: 'Cùng mã CK', causal: 'Nhân quả', temporal: 'Thời gian', opportunity: 'Cơ hội' }[key]}
            </span>
          ))}
        </div>
      </div>

      {/* AI Narrative panel */}
      {showNarrative && (
        <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {graphClusters.map((c, i) => (
            <div
              key={c.id}
              onClick={() => { setSelectedCluster(selectedCluster === c.id ? null : c.id); setSelectedNode(null) }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                i < narrativeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              } ${selectedCluster === c.id ? 'border-violet-300 bg-violet-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              style={{ transition: 'opacity 0.4s, transform 0.4s, border-color 0.2s, background 0.2s' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-xs font-bold text-slate-700">{c.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{c.entity}</span>
                <span className="ml-auto text-[10px] font-semibold text-rose-500">{c.impact}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{c.narrative}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-5" style={{ minHeight: 520 }}>
        {/* SVG Graph */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative" style={{ minHeight: 500 }}>
          {viewMode === 'graph' ? (
            <svg
              ref={svgRef}
              viewBox="0 0 960 520"
              className="w-full h-full"
              style={{ cursor: isPanning ? 'grabbing' : 'grab', minHeight: 500 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <marker id="arrow-entity" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
                <marker id="arrow-causal" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <marker id="arrow-temporal" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
                </marker>
                <marker id="arrow-opportunity" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
                </marker>
                <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.08" />
                </filter>
                <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.25" />
                </filter>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y})`}>
                {/* Cluster backgrounds */}
                {graphClusters.map(c => {
                  const b = getClusterBounds(c)
                  const isActive = selectedCluster === c.id
                  return (
                    <g key={c.id}>
                      <rect
                        x={b.x} y={b.y} width={b.w} height={b.h}
                        rx={12}
                        fill={c.color}
                        fillOpacity={isActive ? 0.06 : 0.03}
                        stroke={c.color}
                        strokeOpacity={isActive ? 0.3 : 0.1}
                        strokeWidth={isActive ? 2 : 1}
                        strokeDasharray={isActive ? '' : '4 4'}
                      />
                      <text x={b.x + 10} y={b.y + 16} fontSize={10} fontWeight={700} fill={c.color} opacity={0.5}>
                        {c.entity}
                      </text>
                    </g>
                  )
                })}

                {/* Edges */}
                {graphEdges.map((edge, i) => {
                  const from = graphNodes.find(n => n.id === edge.from)!
                  const to = graphNodes.find(n => n.id === edge.to)!
                  const color = edgeColors[edge.relation]
                  const dimmed = activeNodes && (!activeNodes.has(edge.from) || !activeNodes.has(edge.to))

                  const dx = to.x - from.x
                  const dy = to.y - from.y
                  const dist = Math.sqrt(dx * dx + dy * dy)
                  const nx = dx / dist
                  const ny = dy / dist

                  const startX = from.x + 60 + nx * 20
                  const startY = from.y + 18 + ny * 14
                  const endX = to.x + 60 - nx * 20
                  const endY = to.y + 18 - ny * 14

                  const midX = (startX + endX) / 2
                  const midY = (startY + endY) / 2
                  const cpX = midX + ny * 20
                  const cpY = midY - nx * 20

                  return (
                    <g key={i} opacity={dimmed ? 0.1 : 1} style={{ transition: 'opacity 0.2s' }}>
                      <path
                        d={`M${startX},${startY} Q${cpX},${cpY} ${endX},${endY}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={edge.relation === 'causal' ? 2 : 1.5}
                        strokeDasharray={edge.relation === 'temporal' ? '5 3' : ''}
                        markerEnd={`url(#arrow-${edge.relation})`}
                        opacity={0.7}
                      />
                      {edge.label && (
                        <text x={cpX} y={cpY - 4} fontSize={8} fill={color} textAnchor="middle" fontWeight={500} opacity={0.8}>
                          {edge.label}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Nodes */}
                {graphNodes.map(n => {
                  const cat = categoryConfig[n.category]
                  const isSelected = selectedNode === n.id
                  const isHovered = hoveredNode === n.id
                  const dimmed = activeNodes && !activeNodes.has(n.id)

                  return (
                    <g
                      key={n.id}
                      className="graph-node"
                      transform={`translate(${n.x}, ${n.y})`}
                      onClick={(e) => { e.stopPropagation(); setSelectedNode(isSelected ? null : n.id); setSelectedCluster(null) }}
                      onMouseEnter={() => setHoveredNode(n.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                      opacity={dimmed ? 0.15 : 1}
                      filter={isSelected || isHovered ? 'url(#node-glow)' : 'url(#node-shadow)'}
                    >
                      <rect
                        width={120} height={36} rx={8}
                        fill={isSelected ? cat.bg : '#ffffff'}
                        stroke={isSelected || isHovered ? cat.color : cat.border}
                        strokeWidth={isSelected || isHovered ? 2 : 1}
                      />
                      <text x={28} y={15} fontSize={10} fontWeight={700} fill={cat.color}>
                        {n.label.length > 14 ? n.label.slice(0, 14) + '…' : n.label}
                      </text>
                      <text x={28} y={27} fontSize={8} fill="#94a3b8">
                        {n.time}
                      </text>
                      <text x={10} y={23} fontSize={12}>{cat.icon}</text>
                      {n.actionRequired && (
                        <circle cx={114} cy={6} r={5} fill="#ef4444">
                          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          ) : (
            /* Timeline view */
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 500 }}>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
                {graphNodes
                  .filter(n => n.category !== 'opportunity')
                  .sort((a, b) => {
                    const order = ['2 phút trước', '1 giờ trước', '2 ngày trước', '3 ngày trước', '5 ngày trước', 'Trong 14 ngày', 'AI insight', 'Gợi ý AI']
                    return order.indexOf(a.time) - order.indexOf(b.time)
                  })
                  .map(n => {
                    const cat = categoryConfig[n.category]
                    const clust = graphClusters.find(c => c.nodes.includes(n.id))
                    return (
                      <div
                        key={n.id}
                        className={`relative mb-4 pl-5 cursor-pointer group`}
                        onClick={() => { setSelectedNode(selectedNode === n.id ? null : n.id); setSelectedCluster(null) }}
                      >
                        <div
                          className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full border-2 bg-white"
                          style={{ borderColor: clust?.color || cat.color, left: '-1px' }}
                        />
                        <div className={`p-3 rounded-lg border transition-all ${selectedNode === n.id ? 'border-violet-300 bg-violet-50' : 'border-slate-100 bg-slate-50 group-hover:border-slate-200'}`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs">{cat.icon}</span>
                            <span className="text-xs font-bold text-slate-700">{n.label}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-400">{n.entity}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{n.desc}</p>
                          {n.actionRequired && (
                            <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">Cần hành động</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Pan hint */}
          {viewMode === 'graph' && (
            <div className="absolute bottom-3 left-3 text-[10px] text-slate-300 font-medium">
              Kéo để di chuyển · Click node để xem chi tiết
            </div>
          )}
        </div>

        {/* Detail sidebar */}
        <div className="w-72 flex-shrink-0">
          {node ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{categoryConfig[node.category].icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800">{node.label}</div>
                  <div className="text-[10px] font-mono text-slate-400">{node.entity} · {node.time}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed mb-4">{node.desc}</div>

              {node.impact && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 mb-4">
                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Tác động</div>
                  <div className="text-xs text-rose-700">{node.impact}</div>
                </div>
              )}

              {node.actionRequired && (
                <button className="w-full py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors mb-3">
                  Xem chi tiết & Hành động
                </button>
              )}

              {/* Connected nodes */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Liên kết</div>
              {graphEdges
                .filter(e => e.from === node.id || e.to === node.id)
                .map((e, i) => {
                  const otherId = e.from === node.id ? e.to : e.from
                  const other = graphNodes.find(n => n.id === otherId)!
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1"
                      onClick={() => setSelectedNode(otherId)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: edgeColors[e.relation] }} />
                      <span className="text-xs text-slate-600">{other.label}</span>
                      <span className="text-[10px] text-slate-300 ml-auto">{e.label}</span>
                    </div>
                  )
                })}
            </div>
          ) : cluster ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: cluster.color }} />
                <div className="text-sm font-bold text-slate-800">{cluster.label}</div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed mb-4">{cluster.narrative}</div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tác động</div>
                <div className="text-xs font-semibold text-rose-600">{cluster.impact}</div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thông báo trong nhóm</div>
              {cluster.nodes.map(nid => {
                const n = graphNodes.find(nd => nd.id === nid)!
                const cat = categoryConfig[n.category]
                return (
                  <div
                    key={nid}
                    className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1"
                    onClick={() => { setSelectedNode(nid); setSelectedCluster(null) }}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span className="text-xs text-slate-600">{n.label}</span>
                    {n.actionRequired && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-auto" />}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-4">
              <div className="text-sm font-bold text-slate-700 mb-2">Đồ thị Sự kiện Tài chính</div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                AI liên kết 14 thông báo thành 4 câu chuyện theo mã CK, quan hệ nhân quả và dòng tiền. Click node hoặc bật AI Narrative để xem.
              </p>
              <div className="space-y-2">
                {graphClusters.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 cursor-pointer hover:border-slate-200 transition-colors"
                    onClick={() => { setSelectedCluster(selectedCluster === c.id ? null : c.id); setSelectedNode(null) }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <div>
                      <div className="text-xs font-semibold text-slate-700">{c.label}</div>
                      <div className="text-[10px] text-slate-400">{c.nodes.length} thông báo · {c.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
