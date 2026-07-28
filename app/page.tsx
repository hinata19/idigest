'use client'
import { useState } from 'react'
import InboxUXPanel from '@/components/InboxUXPanel'
import SmartBundlePanel from '@/components/SmartBundlePanel'
import SmartBundleDocPanel from '@/components/SmartBundleDocPanel'
import HybridBundlePanel from '@/components/HybridBundlePanel'
import AutoSchedulerPanel from '@/components/AutoSchedulerPanel'

const subTabs = [
  { id: 'smartbundle' as const, label: '🚀 Option 1: Smart Bundle', desc: 'Personalized top 3 offers' },
  { id: 'hybrid' as const, label: '🎯 Option 2: Main + Cross-sell', desc: 'Coverage 100% + personalized' },
  { id: 'scheduler' as const, label: '📅 Option 3: Auto-scheduler', desc: 'Tự xếp lịch campaign' },
  { id: 'bundledoc' as const, label: '📖 Tài liệu chi tiết', desc: 'Scoring, Dismiss, Rules, Alibaba' },
  { id: 'inbox' as const, label: '📱 Inbox UX Redesign', desc: 'Giao diện inbox mới cho KH' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<'smartbundle' | 'hybrid' | 'scheduler' | 'bundledoc' | 'inbox'>('smartbundle')

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '24px 32px 20px' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #534AB7, #7F77DD)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>TCBS</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TCinvest — Campaign Orchestration Demo</h1>
              <p className="text-xs text-slate-400 mt-0.5">3 Options điều phối campaign · Smart Bundle · Main + Cross-sell · Auto-scheduler</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        {/* Sub-tab navigation */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
              }`}
            >
              <div>{t.label}</div>
              <div className="text-[10px] mt-0.5 font-normal opacity-70">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === 'smartbundle' && <SmartBundlePanel />}
          {activeTab === 'hybrid' && <HybridBundlePanel />}
          {activeTab === 'scheduler' && <AutoSchedulerPanel />}
          {activeTab === 'bundledoc' && <SmartBundleDocPanel />}
          {activeTab === 'inbox' && <InboxUXPanel />}
        </div>
      </div>
    </div>
  )
}
