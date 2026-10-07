// Frontend-only service layer. Every function returns mock data via a Promise.
// To go live, replace each function body with a fetch/axios call to your backend.
import { mockUser } from '../data/mockUser'
import { mockHoldings, mockPerformance } from '../data/mockPortfolio'
import { mockTransactions, mockReports } from '../data/mockTransactions'
import { mockNotifications } from '../data/mockNotifications'

const delay = (data, ms = 600) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))

const enrich = (h) => {
  const invested = h.qty * h.avg
  const current = h.qty * h.price
  return { ...h, invested, current, pnl: current - invested, ret: ((current - invested) / invested) * 100 }
}

// GET /api/auth/me
export const getUser = () => delay(mockUser, 300)

// GET /api/holdings
export const getHoldings = () => delay(mockHoldings.map(enrich))

// GET /api/portfolio
export const getPortfolio = () => {
  const holdings = mockHoldings.map(enrich)
  const invested = holdings.reduce((s, h) => s + h.invested, 0)
  const current = holdings.reduce((s, h) => s + h.current, 0)
  const byType = holdings.reduce((m, h) => ({ ...m, [h.type]: (m[h.type] || 0) + h.current }), {})
  return delay({
    summary: { invested, current, returns: current - invested, returnPct: ((current - invested) / invested) * 100, todayChange: Math.round(current * 0.0045), todayPct: 0.45 },
    holdings,
    performance: mockPerformance,
    allocation: Object.entries(byType).map(([name, value]) => ({ name, value })),
  })
}

// GET /api/transactions
export const getTransactions = () => delay(mockTransactions)

// GET /api/reports
export const getReports = () => delay(mockReports, 300)

// GET /api/notifications
const READ_KEY = 'a2z_read_notifications'
const readIds = () => JSON.parse(localStorage.getItem(READ_KEY) || '[]')
export const getNotifications = () => delay(mockNotifications.map((n) => ({ ...n, read: n.read || readIds().includes(n.id) })), 300)
// PATCH /api/notifications/read
export const markNotificationsRead = (ids) => localStorage.setItem(READ_KEY, JSON.stringify([...new Set([...readIds(), ...ids])]))
