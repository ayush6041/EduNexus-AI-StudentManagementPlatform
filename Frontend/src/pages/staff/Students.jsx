import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Eye, Loader2, Mail, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { ClassApi, StudentApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useDebounced, useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Avatar, Card, ConfirmModal, Empty, ErrorBox, Field, Meter, Modal, PageHeader, Pagination, TableSkeleton } from '../../components/ui'
import { downloadBlob } from '../../utils'

const PRESETS = [
  { label: 'All', min: '', max: '' },
  { label: '≥ 90%', min: '90', max: '' },
  { label: '75 – 90%', min: '75', max: '90' },
  { label: 'Below 75%', min: '', max: '75' },
]

const EMPTY = { name: '', email: '', admissionNo: '', mobileNumber: '', classId: '' }

function StudentForm({ student, classes, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(() => (student ? { ...student, classId: String(student.classId) } : EMPTY))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editing = Boolean(student)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { name: form.name, email: form.email, admissionNo: form.admissionNo, mobileNumber: form.mobileNumber || null, classId: Number(form.classId) }
    try {
      if (editing) await StudentApi.update(student.id, body)
      else await StudentApi.create(body)
      toast.success(editing ? 'Student updated' : `Student added - login details emailed to ${form.email}`)
      onSaved()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={editing ? 'Edit student' : 'Add student'}
      subtitle={editing ? undefined : 'A username and temporary password are emailed to the student automatically.'}>
      <form onSubmit={submit} className="stack" style={{ marginTop: 16 }}>
        <ErrorBox>{error}</ErrorBox>
        <div className="form-grid">
          <Field label="Full name" className="full"><input className="input" required value={form.name} onChange={set('name')} /></Field>
          <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
          <Field label="Admission number" hint={editing ? 'Cannot be changed' : undefined}>
            <input className="input" required disabled={editing} value={form.admissionNo} onChange={set('admissionNo')} />
          </Field>
          <Field label="Mobile"><input className="input" value={form.mobileNumber || ''} onChange={set('mobileNumber')} /></Field>
          <Field label="Class">
            <select className="select" required value={form.classId} onChange={set('classId')}>
              <option value="">Select class…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />}{editing ? 'Save changes' : 'Add student'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Students() {
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [classId, setClassId] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [page, setPage] = useState(0)
  const [form, setForm] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const dq = useDebounced(q)
  const dmin = useDebounced(min, 500)
  const dmax = useDebounced(max, 500)

  const params = { q: dq || undefined, classId: classId || undefined, minAttendance: dmin || undefined, maxAttendance: dmax || undefined }
  const classes = useFetch(ClassApi.list)
  const { data, loading, error, reload } = useFetch(() => StudentApi.search({ ...params, page, size: 10 }), [dq, classId, dmin, dmax, page])

  const filter = (setter) => (e) => { setter(e.target.value); setPage(0) }
  const preset = (p) => { setMin(p.min); setMax(p.max); setPage(0) }

  const exportCsv = async () => {
    try {
      downloadBlob(await StudentApi.exportCsv(params), 'students.csv')
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await StudentApi.remove(removing.id)
      toast.success('Student deleted')
      setRemoving(null)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async (s) => {
    try {
      toast.success((await StudentApi.resend(s.id)).message)
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  return (
    <>
      <PageHeader title="Students" subtitle="Search, filter by class or attendance, and manage accounts.">
        <button className="btn" onClick={exportCsv}><Download size={16} /> Export CSV</button>
        <button className="btn primary" onClick={() => setForm({ student: null })}><Plus size={16} /> Add student</button>
      </PageHeader>

      <Card pad={false}>
        <div className="toolbar">
          <Field label="Search" className="grow">
            <div className="input-wrap"><Search size={16} />
              <input className="input" placeholder="Name, email, username or admission no." value={q} onChange={filter(setQ)} />
            </div>
          </Field>
          <Field label="Class">
            <select className="select" value={classId} onChange={filter(setClassId)}>
              <option value="">All classes</option>
              {(classes.data || []).map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </Field>
          <Field label="Attendance min %"><input className="input" type="number" min="0" max="100" value={min} onChange={filter(setMin)} style={{ width: 110 }} /></Field>
          <Field label="Attendance max %"><input className="input" type="number" min="0" max="100" value={max} onChange={filter(setMax)} style={{ width: 110 }} /></Field>
        </div>
        <div className="toolbar" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="chips">
            {PRESETS.map((p) => <button key={p.label} className={`chip ${min === p.min && max === p.max ? 'on' : ''}`} onClick={() => preset(p)}>{p.label}</button>)}
          </div>
          <span className="hint">Attendance filters only include students with recorded attendance.</span>
        </div>

        {error && <div style={{ padding: 16 }}><ErrorBox>{error}</ErrorBox></div>}
        {loading ? <TableSkeleton /> : data?.items.length === 0 ? (
          <Empty icon={Users} title="No students found" text="Try changing the filters or add a new student." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Admission no.</th><th>Class</th><th>Attendance</th><th /></tr></thead>
              <tbody>
                {data?.items.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td><div className="cell-user"><Avatar name={s.name} /><div>{s.name}<small>{s.email}</small></div></div></td>
                    <td>{s.admissionNo}</td>
                    <td><span className="badge info">{s.className}</span></td>
                    <td>
                      {s.attendancePercent == null ? <span className="muted">-</span> : (
                        <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}><Meter value={s.attendancePercent} /><b className="small">{s.attendancePercent}%</b></div>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <Link className="btn sm icon" to={`/students/${s.id}`} title="View"><Eye size={15} /></Link>
                        <button className="btn sm icon" title="Edit" onClick={() => setForm({ student: s })}><Pencil size={15} /></button>
                        <button className="btn sm icon" title="Resend login details" onClick={() => resend(s)}><Mail size={15} /></button>
                        {user.role === 'SUPER_ADMIN' && <button className="btn sm icon" title="Delete" onClick={() => setRemoving(s)}><Trash2 size={15} color="var(--danger)" /></button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.totalElements} onPage={setPage} />}
      </Card>

      {form && <StudentForm student={form.student} classes={classes.data || []} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload() }} />}
      <ConfirmModal open={Boolean(removing)} title="Delete student?" busy={busy} confirmLabel="Delete"
        text={`This permanently removes ${removing?.name}, their login, attendance and marks.`}
        onConfirm={confirmDelete} onClose={() => setRemoving(null)} />
    </>
  )
}
