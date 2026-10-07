import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Bell, Briefcase, ChevronDown, FileText, Home, LayoutDashboard, LogOut, MoreHorizontal, PieChart, Search, User } from 'lucide-react'
import { cx, Button, Modal } from '../common'
import useAsync from '../../hooks/useAsync'
import { getNotifications } from '../../services/api'
import { mockUser } from '../../data/mockUser'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: PieChart },
  { to: '/holdings', label: 'Holdings', icon: Briefcase },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
]

export const Logo = () => (
  <div className="flex items-center gap-2">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">A2Z</span>
    <span className="text-lg font-semibold tracking-tight text-slate-900">A2Z <span className="text-green-600">Broking</span></span>
  </div>
)

export function LogoutModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Log out?">
      <p className="text-sm text-slate-600">You will need to sign in again to access your portfolio.</p>
      <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={onConfirm}>Log out</Button></div>
    </Modal>
  )
}

export function Sidebar({ onLogout }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="px-5 py-5"><Logo /></div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <button onClick={onLogout} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"><LogOut size={18} /> Logout</button>
    </aside>
  )
}

export function TopHeader({ onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const { data } = useAsync(getNotifications, [pathname])
  const unread = data ? data.filter((n) => !n.read).length : 0
  const initials = mockUser.name.split(' ').map((p) => p[0]).join('')
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="lg:hidden"><Logo /></div>
      <form className="relative hidden max-w-sm flex-1 sm:block" onSubmit={(e) => { e.preventDefault(); navigate(`/holdings?q=${encodeURIComponent(q)}`) }} role="search">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input aria-label="Search holdings" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search holdings…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <NavLink to="/notifications" aria-label="Notifications" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
          <Bell size={20} />
          {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{unread}</span>}
        </NavLink>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white">{initials}</span>
            <span className="hidden text-sm font-medium sm:block">{mockUser.name}</span><ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg" onClick={() => setMenu(false)}>
              <NavLink role="menuitem" to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"><User size={16} /> My profile</NavLink>
              <button role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function MobileBottomNav({ onLogout }) {
  const [more, setMore] = useState(false)
  const main = [{ to: '/dashboard', label: 'Home', icon: Home }, { to: '/portfolio', label: 'Portfolio', icon: PieChart }, { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight }, { to: '/profile', label: 'Profile', icon: User }]
  const extra = NAV_ITEMS.filter((i) => ['/holdings', '/reports', '/notifications'].includes(i.to))
  const item = 'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium'
  return (
    <>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {main.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cx(item, isActive ? 'text-green-600' : 'text-slate-500')}><Icon size={20} />{label}</NavLink>
        ))}
        <button onClick={() => setMore(true)} className={cx(item, 'text-slate-500')}><MoreHorizontal size={20} />More</button>
      </nav>
      <Modal open={more} onClose={() => setMore(false)} title="More">
        <div className="space-y-1" onClick={() => setMore(false)}>
          {extra.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-slate-100"><Icon size={18} className="text-green-600" />{label}</NavLink>
          ))}
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={18} />Logout</button>
        </div>
      </Modal>
    </>
  )
}
