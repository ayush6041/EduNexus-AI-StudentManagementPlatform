import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Mail, Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { TeacherApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import { Avatar, Card, ConfirmModal, Empty, ErrorBox, Field, Modal, PageHeader, TableSkeleton } from '../../components/ui'

const EMPTY = { name: '', email: '', mobileNumber: '', department: '' }

function TeacherForm({ teacher, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(teacher ? { ...EMPTY, ...teacher, mobileNumber: teacher.mobileNumber || '', department: teacher.department || '' } : EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { name: form.name, email: form.email, mobileNumber: form.mobileNumber || null, department: form.department || null }
    try {
      if (teacher) await TeacherApi.update(teacher.id, body)
      else await TeacherApi.create(body)
      toast.success(teacher ? 'Teacher updated' : `Teacher added - login details emailed to ${form.email}`)
      onSaved()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={teacher ? 'Edit teacher' : 'Add teacher'}
      subtitle={teacher ? undefined : 'They receive a username and temporary password by email and must change it on first login.'}>
      <form className="stack" onSubmit={submit} style={{ marginTop: 16 }}>
        <ErrorBox>{error}</ErrorBox>
        <div className="form-grid">
          <Field label="Full name" className="full"><input className="input" required value={form.name} onChange={set('name')} /></Field>
          <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
          <Field label="Mobile"><input className="input" value={form.mobileNumber} onChange={set('mobileNumber')} /></Field>
          <Field label="Department / subject" className="full"><input className="input" value={form.department} onChange={set('department')} /></Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />}{teacher ? 'Save changes' : 'Add teacher'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Teachers() {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch(TeacherApi.list)
  const [form, setForm] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    setBusy(true)
    try {
      await TeacherApi.remove(removing.id)
      toast.success('Teacher removed')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
      setRemoving(null)
    }
  }

  const resend = async (t) => {
    try {
      toast.success((await TeacherApi.resend(t.id)).message)
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  return (
    <>
      <PageHeader title="Teachers" subtitle="Only the super admin can add or remove teachers.">
        <button className="btn primary" onClick={() => setForm({ teacher: null })}><Plus size={16} /> Add teacher</button>
      </PageHeader>
      <ErrorBox>{error}</ErrorBox>
      <Card pad={false}>
        {loading ? <TableSkeleton rows={4} /> : data.length === 0 ? (
          <Empty icon={UserCog} title="No teachers yet" text="Add the first teacher to give them access." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Teacher</th><th>Username</th><th>Department</th><th>Mobile</th><th /></tr></thead>
              <tbody>
                {data.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td><div className="cell-user"><Avatar name={t.name} /><div>{t.name}<small>{t.email}</small></div></div></td>
                    <td>{t.username || '-'}</td>
                    <td>{t.department || '-'}</td>
                    <td>{t.mobileNumber || '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn sm icon" title="Edit" onClick={() => setForm({ teacher: t })}><Pencil size={15} /></button>
                        <button className="btn sm icon" title="Resend login details" onClick={() => resend(t)}><Mail size={15} /></button>
                        <button className="btn sm icon" title="Delete" onClick={() => setRemoving(t)}><Trash2 size={15} color="var(--danger)" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {form && <TeacherForm teacher={form.teacher} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload() }} />}
      <ConfirmModal open={Boolean(removing)} title="Remove teacher?" confirmLabel="Remove" busy={busy}
        text={`${removing?.name} will lose access immediately.`} onConfirm={remove} onClose={() => setRemoving(null)} />
    </>
  )
}
