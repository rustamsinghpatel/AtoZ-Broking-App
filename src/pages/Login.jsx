import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Headphones, Lock, ShieldCheck, TrendingUp, User } from 'lucide-react'
import { Button, Input } from '../components/common'
import { Logo } from '../components/layout/Nav'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ clientId: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.clientId.trim()) next.clientId = 'Please enter your Client ID, mobile or email.'
    if (!form.password) next.password = 'Please enter your password or PIN.'
    else if (form.password.length < 4) next.password = 'Password must be at least 4 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    const res = await login(form.clientId, form.password, form.remember)
    setLoading(false)
    if (res.ok) navigate('/dashboard', { replace: true })
    else setErrors({ form: res.error })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-green-700">A2Z</span> A2Z Broking</div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">Your investments, <br />clear and in one place.</h2>
          <ul className="mt-8 space-y-4 text-green-50">
            <li className="flex items-center gap-3"><TrendingUp size={20} /> Track portfolio performance in real time</li>
            <li className="flex items-center gap-3"><ShieldCheck size={20} /> Secure access to statements and reports</li>
            <li className="flex items-center gap-3"><Headphones size={20} /> Dedicated relationship manager support</li>
          </ul>
        </div>
        <p className="text-xs text-green-200">Investments are subject to market risks. Read all scheme related documents carefully.</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your client portal to view your investments.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            {errors.form && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</div>}
            <Input id="clientId" label="Client ID / Mobile / Email" icon={User} autoComplete="username" placeholder="e.g. A2Z10001" value={form.clientId} onChange={set('clientId')} error={errors.clientId} />
            <Input id="password" label="Password / PIN" icon={Lock} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={set('password')} error={errors.password}
              right={<button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="rounded p-1.5 text-slate-500 hover:text-slate-800">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={form.remember} onChange={set('remember')} className="h-4 w-4 rounded border-slate-300 accent-green-600" /> Remember me</label>
              <button type="button" onClick={() => setErrors({ form: 'Password reset is not available in this demo. Contact support.' })} className="font-medium text-green-700 hover:underline">Forgot password?</button>
            </div>
            <Button type="submit" loading={loading} className="w-full !py-3">{loading ? 'Signing in…' : 'Login'}</Button>
          </form>
          <div className="mt-6 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">Demo credentials — Client ID: <b>A2Z10001</b> · Password: <b>123456</b></div>
          <p className="mt-6 text-center text-sm text-slate-500">Need help? Call <b className="text-slate-700">1800-000-0000</b> or email <b className="text-slate-700">support@a2zbroking.example</b></p>
        </div>
      </div>
    </div>
  )
}
