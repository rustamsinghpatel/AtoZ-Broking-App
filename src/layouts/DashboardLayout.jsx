import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogoutModal, MobileBottomNav, Sidebar, TopHeader } from '../components/layout/Nav'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const openConfirm = () => setConfirm(true)
  const doLogout = () => { logout(); navigate('/login', { replace: true }) }
  return (
    <div className="min-h-screen">
      <Sidebar onLogout={openConfirm} />
      <div className="lg:pl-64">
        <TopHeader onLogout={openConfirm} />
        <main className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:pb-8"><Outlet /></main>
      </div>
      <MobileBottomNav onLogout={openConfirm} />
      <LogoutModal open={confirm} onClose={() => setConfirm(false)} onConfirm={doLogout} />
    </div>
  )
}
