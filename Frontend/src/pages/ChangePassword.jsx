import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogOut, ShieldAlert } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { ErrorBox, Field } from '../components/ui'
import { AuthApi } from '../api/endpoints'
import { errMsg } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { homePath, passwordScore } from '../utils'

const COLORS = ['var(--border)', '#ef4444', '#f59e0b', '#10b981', '#059669']

export default function ChangePassword() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const score = passwordScore(form.newPassword)
  const forced = user.mustChangePassword

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('New passwords do not match')
    setBusy(true)
    setError('')
    try {
      const res = await AuthApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      login(res)
      toast.success('Password changed successfully')
      navigate(homePath(res.role), { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2>{forced ? 'Choose a new password' : 'Change password'}</h2>
      {forced && (
        <div className="row" style={{ margin: '14px 0', padding: '11px 14px', borderRadius: 12, color: 'var(--warn)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', fontWeight: 600, fontSize: 14 }}>
          <ShieldAlert size={18} /> For your security, replace the temporary password before continuing.
        </div>
      )}
      <form className="stack" onSubmit={submit} style={{ marginTop: forced ? 0 : 20 }}>
        <ErrorBox>{error}</ErrorBox>
        <Field label={forced ? 'Temporary password' : 'Current password'}>
          <input className="input" type="password" required autoComplete="current-password" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </Field>
        <Field label="New password" hint="8+ characters with upper, lower case and a digit">
          <input className="input" type="password" required autoComplete="new-password" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          <div className="strength">{[1, 2, 3, 4].map((i) => <i key={i} style={{ background: score >= i ? COLORS[score] : undefined }} />)}</div>
        </Field>
        <Field label="Confirm new password">
          <input className="input" type="password" required autoComplete="new-password" value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </Field>
        <button className="btn primary block" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Update password</button>
        {forced ? (
          <button type="button" className="btn ghost block" onClick={() => { logout(); navigate('/login') }}><LogOut size={15} /> Sign out</button>
        ) : (
          <button type="button" className="btn ghost block" onClick={() => navigate(-1)}>Cancel</button>
        )}
      </form>
    </AuthShell>
  )
}
