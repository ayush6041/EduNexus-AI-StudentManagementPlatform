import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { ErrorBox, Field } from '../components/ui'
import { AuthApi } from '../api/endpoints'
import { errMsg } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../utils'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await AuthApi.login({ identifier: form.identifier.trim(), password: form.password })
      login(res)
      navigate(res.mustChangePassword ? '/change-password' : homePath(res.role), { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2>Welcome back</h2>
      <p className="muted" style={{ marginBottom: 24 }}>Sign in with your email or username.</p>
      <form className="stack" onSubmit={submit}>
        <ErrorBox>{error}</ErrorBox>
        <Field label="Email or username">
          <div className="input-wrap">
            <User size={17} />
            <input className="input" value={form.identifier} autoComplete="username" required autoFocus
              onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="rahul.2026001 or you@school.com" />
          </div>
        </Field>
        <Field label="Password">
          <div className="input-wrap">
            <Lock size={17} />
            <input className="input" type={show ? 'text' : 'password'} value={form.password} autoComplete="current-password" required
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        <span className="hint">First time? Use the temporary password emailed to you.</span>
        <button className="btn primary block" disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />} Sign in
        </button>
        <Link to="/forgot-password" className="small" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>
          Forgot your password?
        </Link>
      </form>
    </AuthShell>
  )
}
