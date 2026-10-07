import { useState } from 'react'
import { Landmark, Lock, ShieldCheck, User, UserCheck } from 'lucide-react'
import { Async, Badge, Button, Card, cx, Input, Modal, PageHeader } from '../components/common'
import { useToast } from '../components/common/Toast'
import { InfoGrid, ProfileSection } from '../components/profile/ProfileSection'
import useAsync from '../hooks/useAsync'
import { getUser } from '../services/api'
import { fmtDate, fmtDateTime } from '../utils/format'

function PasswordModal({ open, onClose }) {
  const toast = useToast()
  const [f, setF] = useState({ current: '', next: '', confirm: '' })
  const [err, setErr] = useState({})
  const close = () => { setF({ current: '', next: '', confirm: '' }); setErr({}); onClose() }
  const submit = (e) => {
    e.preventDefault()
    const n = {}
    if (!f.current) n.current = 'Enter your current password.'
    if (f.next.length < 6) n.next = 'New password must be at least 6 characters.'
    if (f.confirm !== f.next) n.confirm = 'Passwords do not match.'
    setErr(n)
    if (Object.keys(n).length) return
    close(); toast('Password updated (demo).')
  }
  const field = (k, label) => <Input id={`pw-${k}`} label={label} type="password" value={f[k]} error={err[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
  return (
    <Modal open={open} onClose={close} title="Change password">
      <form onSubmit={submit} className="space-y-3" noValidate>
        {field('current', 'Current password')}{field('next', 'New password')}{field('confirm', 'Confirm new password')}
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit">Update</Button></div>
      </form>
    </Modal>
  )
}

function ProfileView({ u }) {
  const toast = useToast()
  const [twoFa, setTwoFa] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const initials = u.name.split(' ').map((p) => p[0]).join('')
  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-xl font-semibold text-white">{initials}</span>
        <div><h2 className="text-lg font-semibold">{u.name}</h2><p className="text-sm text-slate-500">Client ID: {u.clientId}</p><div className="mt-1"><Badge tone="green">{u.status}</Badge></div></div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileSection title="Personal Information" icon={User}>
          <InfoGrid items={[['Full name', u.name], ['Email', u.email], ['Mobile', u.mobile], ['Date of birth', fmtDate(u.dob)]]} />
        </ProfileSection>
        <ProfileSection title="Account Information" icon={UserCheck}>
          <InfoGrid items={[['Client ID', u.clientId], ['PAN', u.pan], ['Account status', u.status], ['Registered on', fmtDate(u.registeredOn)]]} />
        </ProfileSection>
        <ProfileSection title="Bank Information" icon={Landmark}>
          <InfoGrid items={[['Bank name', u.bank.name], ['Account number', u.bank.account], ['IFSC', u.bank.ifsc]]} />
        </ProfileSection>
        <ProfileSection title="Security" icon={ShieldCheck}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-medium">Password</p><p className="text-xs text-slate-500">Use a strong password you don't use elsewhere.</p></div>
              <Button variant="outline" onClick={() => setPwOpen(true)}><Lock size={14} /> Change</Button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-medium">Two-factor authentication</p><p className="text-xs text-slate-500">{twoFa ? 'Enabled via SMS OTP.' : 'Add an extra layer of security.'}</p></div>
              <button role="switch" aria-checked={twoFa} aria-label="Two-factor authentication" onClick={() => { setTwoFa(!twoFa); toast(`Two-factor authentication ${twoFa ? 'disabled' : 'enabled'} (demo).`) }}
                className={cx('relative h-6 w-11 shrink-0 rounded-full transition', twoFa ? 'bg-green-600' : 'bg-slate-300')}>
                <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', twoFa ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          </div>
        </ProfileSection>
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">Login Activity</h2>
        <ul className="divide-y divide-slate-100">
          {u.loginActivity.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div><p className="font-medium">{a.device}</p><p className="text-xs text-slate-500">{a.location}</p></div>
              <div className="flex items-center gap-2 text-xs text-slate-500">{a.current && <Badge tone="green">This device</Badge>}{fmtDateTime(a.time)}</div>
            </li>
          ))}
        </ul>
      </Card>
      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  )
}

export default function Profile() {
  const state = useAsync(getUser)
  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your personal, account and security details." />
      <Async state={state}>{(u) => <ProfileView u={u} />}</Async>
    </>
  )
}
