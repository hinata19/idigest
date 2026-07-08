export type NotiCategory = 'transaction' | 'promo' | 'system' | 'personal'
export type NotiChannel = 'push' | 'inbox' | 'email' | 'sms'
export type CampaignStatus = 'draft' | 'pending' | 'approved' | 'queued' | 'sending' | 'completed' | 'paused'

export interface Notification {
  id: string
  category: NotiCategory
  title: string
  desc: string
  time: string
  unread: boolean
  grouped?: boolean
  groupCount?: number
  icon: string
  iconBg: string
  cta?: string
}

export interface CampaignRequest {
  id: string
  name: string
  segment: string
  channels: NotiChannel[]
  priority: number
  status: CampaignStatus
  estimatedReach: number
  conflictCount: number
  requestedBy: string
  requestDate: string
  scheduledDate: string
  openRate?: number
  clickRate?: number
}

export interface UserNotiProfile {
  userId: string
  name: string
  segment: string
  pushBudget: { used: number; max: number }
  inboxBudget: { used: number; max: number }
  emailBudget: { used: number; max: number }
  lastNotiTime: string
  dismissStreak: number
  suppressionRules: string[]
}

export const notifications: Notification[] = [
  { id: 'n1', category: 'transaction', title: 'Lệnh khớp: MWG x500', desc: 'Giá khớp 52,300. Tổng GT: 26,150,000đ', time: '2 phút trước', unread: true, icon: '↔', iconBg: '#fee2e2', cta: 'Xem chi tiết lệnh' },
  { id: 'n2', category: 'transaction', title: 'Nạp tiền thành công', desc: '+50,000,000đ vào TK chứng khoán', time: '1 giờ trước', unread: true, icon: '₫', iconBg: '#fee2e2' },
  { id: 'n3', category: 'promo', title: '3 ưu đãi đang chờ bạn', desc: 'Bond 9.5%, Fund KM 0% phí, iLucky x2 điểm', time: '3 giờ trước', unread: true, grouped: true, groupCount: 3, icon: '🎁', iconBg: '#ede9fe', cta: 'Xem tất cả ưu đãi' },
  { id: 'n4', category: 'system', title: 'Cập nhật bảo mật', desc: 'Vui lòng bật xác thực 2 lớp để bảo vệ TK', time: '5 giờ trước', unread: false, icon: '🛡', iconBg: '#dbeafe', cta: 'Bật ngay' },
  { id: 'n5', category: 'personal', title: 'NVTV Nguyễn Văn A nhắn bạn', desc: 'Anh/chị ơi, em có thông tin về TCBond mới...', time: '6 giờ trước', unread: true, icon: '💬', iconBg: '#d1fae5', cta: 'Trả lời' },
  { id: 'n6', category: 'promo', title: 'TCBond 9.5% — còn 3 ngày', desc: 'Lãi suất hấp dẫn, kỳ hạn 12 tháng. Đầu tư từ 10 triệu.', time: 'Hôm qua', unread: false, icon: '📊', iconBg: '#ede9fe', cta: 'Mua ngay' },
  { id: 'n7', category: 'transaction', title: '5 lệnh khớp hôm qua', desc: 'HPG +200, VNM -100, FPT +300, TCB +500, VIC -200', time: 'Hôm qua', unread: false, grouped: true, groupCount: 5, icon: '📋', iconBg: '#fee2e2', cta: 'Xem sổ lệnh' },
  { id: 'n8', category: 'system', title: 'Bảo trì hệ thống 01/07', desc: 'Từ 23h-1h. Không ảnh hưởng giao dịch trong phiên', time: '2 ngày trước', unread: false, icon: '🔧', iconBg: '#dbeafe' },
  { id: 'n9', category: 'promo', title: 'iLucky — Quay số trúng thưởng', desc: 'Bạn có 3 lượt quay miễn phí tuần này', time: '3 ngày trước', unread: false, icon: '🎰', iconBg: '#ede9fe', cta: 'Quay ngay' },
  { id: 'n10', category: 'personal', title: 'Mời tham gia Investor Day', desc: 'Sự kiện offline tại HCM ngày 15/07 — dành cho KH VIP', time: '4 ngày trước', unread: false, icon: '🎫', iconBg: '#d1fae5', cta: 'Đăng ký' },
  { id: 'n11', category: 'transaction', title: 'Cổ tức HPG đã về TK', desc: '+2,500,000đ cổ tức bằng tiền mặt', time: '5 ngày trước', unread: false, icon: '💰', iconBg: '#fee2e2' },
  { id: 'n12', category: 'system', title: 'Phiên bản app mới v4.2', desc: 'Cập nhật giao diện, thêm tính năng Dark mode', time: '1 tuần trước', unread: false, icon: '📱', iconBg: '#dbeafe', cta: 'Cập nhật' },
]

export const campaignQueue: CampaignRequest[] = [
  { id: 'CQ-001', name: 'Summer Bond 9.5%', segment: 'Passive Investor', channels: ['inbox', 'email'], priority: 82, status: 'sending', estimatedReach: 4200, conflictCount: 0, requestedBy: 'Product Team', requestDate: '2026-07-01', scheduledDate: '2026-07-05', openRate: 34.2, clickRate: 8.7 },
  { id: 'CQ-002', name: 'Margin Boost July', segment: 'Active Trader', channels: ['inbox', 'push'], priority: 75, status: 'approved', estimatedReach: 6500, conflictCount: 1, requestedBy: 'Marketing', requestDate: '2026-07-02', scheduledDate: '2026-07-08' },
  { id: 'CQ-003', name: 'iLucky Weekend Special', segment: 'Game Lover', channels: ['inbox', 'push'], priority: 55, status: 'queued', estimatedReach: 7200, conflictCount: 0, requestedBy: 'Engagement Team', requestDate: '2026-07-03', scheduledDate: '2026-07-12' },
  { id: 'CQ-004', name: 'Dormant Winback Q3', segment: 'Dormant >30d', channels: ['push', 'sms'], priority: 68, status: 'pending', estimatedReach: 3100, conflictCount: 2, requestedBy: 'Retention Team', requestDate: '2026-07-04', scheduledDate: '2026-07-10' },
  { id: 'CQ-005', name: 'Fund Diversify Promo', segment: 'AUM >500M', channels: ['inbox', 'email', 'push'], priority: 71, status: 'draft', estimatedReach: 2800, conflictCount: 0, requestedBy: 'Product Team', requestDate: '2026-07-05', scheduledDate: '2026-07-15' },
  { id: 'CQ-006', name: 'Newcomer Onboard Wave 2', segment: 'New <7 days', channels: ['inbox', 'push'], priority: 88, status: 'approved', estimatedReach: 1900, conflictCount: 0, requestedBy: 'Growth Team', requestDate: '2026-07-03', scheduledDate: '2026-07-07' },
  { id: 'CQ-007', name: 'VIP Anniversary Reward', segment: 'VIP Tier', channels: ['inbox', 'email', 'push'], priority: 90, status: 'queued', estimatedReach: 850, conflictCount: 0, requestedBy: 'CRM Team', requestDate: '2026-07-02', scheduledDate: '2026-07-09' },
]

export const userProfiles: UserNotiProfile[] = [
  { userId: 'U001', name: 'Nguyễn Văn Minh', segment: 'Active Trader', pushBudget: { used: 1, max: 2 }, inboxBudget: { used: 3, max: 5 }, emailBudget: { used: 1, max: 2 }, lastNotiTime: '2h trước', dismissStreak: 0, suppressionRules: [] },
  { userId: 'U002', name: 'Trần Thị Hoa', segment: 'Passive Investor', pushBudget: { used: 2, max: 2 }, inboxBudget: { used: 4, max: 5 }, emailBudget: { used: 2, max: 2 }, lastNotiTime: '30 phút trước', dismissStreak: 2, suppressionRules: ['R2 — giảm 50% sắp kích hoạt'] },
  { userId: 'U003', name: 'Lê Hoàng Nam', segment: 'Newcomer', pushBudget: { used: 0, max: 2 }, inboxBudget: { used: 1, max: 5 }, emailBudget: { used: 0, max: 2 }, lastNotiTime: '1 ngày trước', dismissStreak: 0, suppressionRules: ['R3 — chỉ onboarding'] },
  { userId: 'U004', name: 'Phạm Quốc Bảo', segment: 'Dormant', pushBudget: { used: 1, max: 1 }, inboxBudget: { used: 0, max: 5 }, emailBudget: { used: 0, max: 2 }, lastNotiTime: '5 ngày trước', dismissStreak: 0, suppressionRules: ['R4 — max 1 winback/tuần'] },
  { userId: 'U005', name: 'Vũ Thanh Tùng', segment: 'VIP', pushBudget: { used: 0, max: 3 }, inboxBudget: { used: 2, max: 7 }, emailBudget: { used: 1, max: 3 }, lastNotiTime: '4h trước', dismissStreak: 0, suppressionRules: [] },
  { userId: 'U006', name: 'Đỗ Minh Châu', segment: 'Active Trader', pushBudget: { used: 2, max: 2 }, inboxBudget: { used: 5, max: 5 }, emailBudget: { used: 2, max: 2 }, lastNotiTime: '15 phút trước', dismissStreak: 4, suppressionRules: ['R2 — giảm 50% đã kích hoạt', 'R1 — vừa giao dịch'] },
]

export const suppressionRules = [
  { id: 'R1', name: 'Post-transaction cooldown', desc: 'KH vừa thực hiện giao dịch trong 1h → không gửi promo (tránh cảm giác bị theo dõi)', color: '#ef4444', triggered: 342 },
  { id: 'R2', name: 'Dismiss streak penalty', desc: 'KH đã dismiss 3 promo liên tiếp → giảm frequency 50% trong 2 tuần', color: '#f59e0b', triggered: 128 },
  { id: 'R3', name: 'Newcomer protection', desc: 'KH mới mở TK < 7 ngày → chỉ gửi onboarding series, không gửi promo', color: '#8b5cf6', triggered: 567 },
  { id: 'R4', name: 'Dormant gentle touch', desc: 'KH dormant > 30 ngày → gửi tối đa 1 winback/tuần qua push', color: '#06b6d4', triggered: 215 },
  { id: 'R5', name: 'Product dedup', desc: 'Cùng 1 sản phẩm đã gửi trong 14 ngày → skip, không gửi lại', color: '#3b82f6', triggered: 891 },
  { id: 'R6', name: 'Low performance auto-pause', desc: 'Campaign có open rate < 5% sau 48h → auto-pause, báo team review', color: '#ec4899', triggered: 3 },
]

export const cooldownMatrix = [
  { after: 'Push promo', push: '4h', inbox: '0', email: '0', sms: '24h' },
  { after: 'Email promo', push: '2h', inbox: '0', email: '48h', sms: '24h' },
  { after: 'SMS', push: '4h', inbox: '0', email: '24h', sms: '72h' },
  { after: 'Giao dịch', push: '1h*', inbox: '0', email: '0', sms: '0' },
]

export const channelConfig = [
  { channel: 'Push', categories: ['Giao dịch', 'Ưu đãi', 'Hệ thống', 'Cá nhân'], limit: 'Max 2/ngày', quietHours: '22h — 7h', note: 'KH tự điều chỉnh trong Settings' },
  { channel: 'In-app Inbox', categories: ['Giao dịch', 'Ưu đãi', 'Hệ thống', 'Cá nhân'], limit: 'Max 5 promo/tuần', note: 'Auto-group nếu > 2 cùng loại/ngày' },
  { channel: 'Email', categories: ['Giao dịch', 'Ưu đãi', 'Hệ thống'], limit: 'Max 2 promo/tuần', note: 'Hoặc 1 weekly digest (KH chọn)' },
  { channel: 'SMS', categories: ['Giao dịch', 'Bảo mật'], limit: 'Chỉ GD + bảo mật', note: 'Không gửi promo qua SMS' },
]
