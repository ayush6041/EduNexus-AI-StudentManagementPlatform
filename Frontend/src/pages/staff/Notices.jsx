import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Megaphone, Send, Trash2 } from 'lucide-react'
import { ClassApi, NoticeApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import { Card, ConfirmModal, Empty, ErrorBox, Field, PageHeader, Skeleton } from '../../components/ui'
import { fmtDateTime } from '../../utils'

export default function Notices() {
  const toast = useToast()
  const classes = useFetch(ClassApi.list)
  const { data, loading, error, reload } = useFetch(NoticeApi.list)
  const [form, setForm] = useState({ title: '', body: '', classId: '' })
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(null)

  const post = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await NoticeApi.create({ title: form.title, body: form.body, classId: form.classId ? Number(form.classId) : null })
      toast.success('Notice published')
      setForm({ title: '', body: '', classId: '' })
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await NoticeApi.remove(removing.id)
      toast.success('Notice deleted')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
      setRemoving(null)
    }
  }

  return (
    <>
      <PageHeader title="Notices" subtitle="Announcements appear on the student dashboards." />
      <div className="grid split">
        <div className="stack">
          <ErrorBox>{error}</ErrorBox>
          {loading ? <Skeleton h={180} style={{ borderRadius: 18 }} /> : data.length === 0 ? (
            <Card><Empty icon={Megaphone} title="No notices yet" /></Card>
          ) : (
            <AnimatePresence>
              {data.map((n, i) => (
                <Card key={n.id} index={i} exit={{ opacity: 0, x: 40 }} layout>
                  <div className="row between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ marginBottom: 6 }}>{n.title}</h3>
                      <div className="row small muted" style={{ gap: 10 }}>
                        <span className="badge info">{n.className}</span><span>{fmtDateTime(n.createdAt)}</span><span>by {n.createdBy}</span>
                      </div>
                    </div>
                    <button className="btn sm icon" onClick={() => setRemoving(n)} title="Delete"><Trash2 size={15} color="var(--danger)" /></button>
                  </div>
                  <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{n.body}</p>
                </Card>
              ))}
            </AnimatePresence>
          )}
        </div>
        <motion.form className="card pad stack" onSubmit={post} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'start' }}>
          <h3 style={{ margin: 0 }}>Post a notice</h3>
          <Field label="Title"><input className="input" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Audience">
            <select className="select" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">All classes</option>
              {(classes.data || []).map((c) => <option key={c.id} value={c.id}>Class {c.displayName}</option>)}
            </select>
          </Field>
          <Field label="Message"><textarea className="textarea" required maxLength={4000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <button className="btn primary" disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Publish</button>
        </motion.form>
      </div>
      <ConfirmModal open={Boolean(removing)} title="Delete notice?" confirmLabel="Delete" busy={busy}
        text={removing ? `"${removing.title}" will disappear for everyone.` : ''} onConfirm={remove} onClose={() => setRemoving(null)} />
    </>
  )
}
