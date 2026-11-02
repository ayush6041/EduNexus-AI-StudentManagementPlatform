import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Loader2, Mail } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { ErrorBox, Field } from '../components/ui'
import { AuthApi } from '../api/endpoints'
import { errMsg } from '../api/client'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ otp: '', newPassword: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const sendCode = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      await AuthApi.forgot(email.trim())
      setStep(2)
      toast.success('If that email is registered, a 6-digit code is on its way')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const reset = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('Passwords do not match')
    setBusy(true)
    setError('')
    try {
      await AuthApi.reset({ email: email.trim(), otp: form.otp.trim(), newPassword: form.newPassword })
      toast.success('Password updated - please sign in')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <Link to="/login" className="small muted row" style={{ marginBottom: 18, fontWeight: 600 }}><ArrowLeft size={15} /> Back to sign in</Link>
      {step === 1 ? (
        <>
          <h2>Reset your password</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Enter your account email and we will send a 6-digit code.</p>
          <form className="stack" onSubmit={sendCode}>
            <ErrorBox>{error}</ErrorBox>
            <Field label="Email">
              <div className="input-wrap">
                <Mail size={17} />
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.com" autoFocus />
              </div>
            </Field>
            <button className="btn primary block" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Send code</button>
          </form>
        </>
      ) : (
        <>
          <h2>Enter the code</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Sent to <b>{email}</b>. It expires in 10 minutes.</p>
          <form className="stack" onSubmit={reset}>
            <ErrorBox>{error}</ErrorBox>
            <Field label="6-digit code">
              <div className="input-wrap">
                <KeyRound size={17} />
                <input className="input" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoFocus value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} placeholder="123456" style={{ letterSpacing: '0.4em', fontWeight: 700 }} />
              </div>
            </Field>
            <Field label="New password" hint="8+ characters with upper, lower case and a digit">
              <input className="input" type="password" required value={form.newPassword} autoComplete="new-password"
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            </Field>
            <Field label="Confirm new password">
              <input className="input" type="password" required value={form.confirm} autoComplete="new-password"
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </Field>
            <button className="btn primary block" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Update password</button>
            <button type="button" className="btn ghost block" onClick={sendCode} disabled={busy}>Resend code</button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
