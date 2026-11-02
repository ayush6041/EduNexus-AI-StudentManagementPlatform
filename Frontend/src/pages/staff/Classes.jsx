import { useState } from 'react'
import { Loader2, Plus, School, Trash2, Users } from 'lucide-react'
import { ClassApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Card, ConfirmModal, Empty, ErrorBox, Field, Modal, PageHeader, Skeleton } from '../../components/ui'

export default function Classes() {
  const { user } = useAuth()
  const toast = useToast()
  const { data, loading, error, reload } = useFetch(ClassApi.list)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', section: '' })
  const [formError, setFormError] = useState('')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError('')
    try {
      await ClassApi.create(form)
      toast.success('Class created')
      setOpen(false)
      setForm({ name: '', section: '' })
      reload()
    } catch (err) {
      setFormError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await ClassApi.remove(removing.id)
      toast.success('Class deleted')
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
      <PageHeader title="Classes" subtitle="Students are organised by class and section.">
        <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16} /> New class</button>
      </PageHeader>
      <ErrorBox>{error}</ErrorBox>
      {loading ? <Skeleton h={160} style={{ borderRadius: 18 }} /> : data.length === 0 ? (
        <Card><Empty icon={School} title="No classes yet" text="Create a class before adding students." /></Card>
      ) : (
        <div className="grid c4">
          {data.map((c, i) => (
            <Card key={c.id} index={i}>
              <div className="row between">
                <div className="avatar" style={{ width: 52, height: 52, borderRadius: 16, fontSize: 18 }}>{c.displayName}</div>
                {user.role === 'SUPER_ADMIN' && (
                  <button className="btn sm icon ghost" onClick={() => setRemoving(c)} title="Delete class"><Trash2 size={15} color="var(--danger)" /></button>
                )}
              </div>
              <h3 style={{ margin: '16px 0 4px' }}>Class {c.displayName}</h3>
              <div className="muted row" style={{ gap: 6 }}><Users size={15} /> {c.studentCount} student{c.studentCount === 1 ? '' : 's'}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New class" width={440}>
        <form className="stack" onSubmit={create} style={{ marginTop: 16 }}>
          <ErrorBox>{formError}</ErrorBox>
          <Field label="Class / grade" hint="e.g. 10, 11 Science"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Section" hint="e.g. A"><input className="input" required maxLength={10} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></Field>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal open={Boolean(removing)} title="Delete class?" confirmLabel="Delete" busy={busy}
        text={`Class ${removing?.displayName} can only be deleted when it has no students or exams.`}
        onConfirm={remove} onClose={() => setRemoving(null)} />
    </>
  )
}
