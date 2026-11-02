import { useState } from 'react'
import { Clock, FileText, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { ClassApi, ExamApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import { Card, ConfirmModal, Empty, ErrorBox, Field, Modal, PageHeader, Skeleton } from '../../components/ui'
import { dayParts, fmtTime } from '../../utils'

const EMPTY = { name: '', subject: '', classId: '', examDate: '', startTime: '10:00', endTime: '13:00', room: '', maxMarks: 100 }

function ExamForm({ exam, classes, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(exam ? { ...exam, classId: String(exam.classId), startTime: exam.startTime.slice(0, 5), endTime: exam.endTime.slice(0, 5), room: exam.room || '' } : EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { name: form.name, subject: form.subject, examDate: form.examDate, startTime: form.startTime, endTime: form.endTime,
      classId: Number(form.classId), maxMarks: Number(form.maxMarks), room: form.room || null }
    try {
      if (exam) await ExamApi.update(exam.id, body)
      else await ExamApi.create(body)
      toast.success(exam ? 'Exam updated' : 'Exam scheduled')
      onSaved()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={exam ? 'Edit exam paper' : 'Schedule exam paper'} subtitle="Papers with the same exam name are grouped together (and share an admit card).">
      <form className="stack" onSubmit={submit} style={{ marginTop: 16 }}>
        <ErrorBox>{error}</ErrorBox>
        <div className="form-grid">
          <Field label="Exam name"><input className="input" required placeholder="Mid-term 2026" value={form.name} onChange={set('name')} /></Field>
          <Field label="Subject"><input className="input" required value={form.subject} onChange={set('subject')} /></Field>
          <Field label="Class">
            <select className="select" required value={form.classId} onChange={set('classId')}>
              <option value="">Select class…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </Field>
          <Field label="Date"><input className="input" type="date" required value={form.examDate} onChange={set('examDate')} /></Field>
          <Field label="Start time"><input className="input" type="time" required value={form.startTime} onChange={set('startTime')} /></Field>
          <Field label="End time"><input className="input" type="time" required value={form.endTime} onChange={set('endTime')} /></Field>
          <Field label="Room / venue"><input className="input" value={form.room} onChange={set('room')} /></Field>
          <Field label="Maximum marks"><input className="input" type="number" min="1" required value={form.maxMarks} onChange={set('maxMarks')} /></Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />}{exam ? 'Save changes' : 'Schedule'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Exams() {
  const toast = useToast()
  const classes = useFetch(ClassApi.list)
  const [classId, setClassId] = useState('')
  const { data, loading, error, reload } = useFetch(() => ExamApi.list(classId || undefined), [classId])
  const [form, setForm] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const groups = Object.values((data || []).reduce((acc, e) => {
    const key = `${e.name}|${e.classId}`
    ;(acc[key] ||= { key, name: e.name, className: e.className, papers: [] }).papers.push(e)
    return acc
  }, {}))

  const remove = async () => {
    setBusy(true)
    try {
      await ExamApi.remove(removing.id)
      toast.success('Exam paper deleted')
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
      <PageHeader title="Exam schedule" subtitle="Schedules appear instantly on every student's dashboard and admit card.">
        <select className="select" style={{ width: 170 }} value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All classes</option>
          {(classes.data || []).map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
        </select>
        <button className="btn primary" onClick={() => setForm({ exam: null })}><Plus size={16} /> Schedule paper</button>
      </PageHeader>
      <ErrorBox>{error}</ErrorBox>
      {loading ? <Skeleton h={200} style={{ borderRadius: 18 }} /> : groups.length === 0 ? (
        <Card><Empty icon={FileText} title="No exams scheduled" text="Schedule the first paper to get started." /></Card>
      ) : (
        <div className="stack">
          {groups.map((g, gi) => (
            <Card key={g.key} index={gi}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <h3 style={{ margin: 0 }}>{g.name}</h3>
                <span className="badge info">Class {g.className}</span>
              </div>
              {g.papers.map((p) => {
                const d = dayParts(p.examDate)
                return (
                  <div className="list-item" key={p.id}>
                    <div className="date-tile"><b>{d.day}</b><span>{d.mon}</span></div>
                    <div style={{ flex: 1 }}>
                      <b>{p.subject}</b>
                      <div className="muted small row" style={{ gap: 14, marginTop: 4 }}>
                        <span className="row" style={{ gap: 5 }}><Clock size={14} />{fmtTime(p.startTime)} – {fmtTime(p.endTime)}</span>
                        {p.room && <span className="row" style={{ gap: 5 }}><MapPin size={14} />{p.room}</span>}
                        <span>Max {p.maxMarks}</span>
                      </div>
                    </div>
                    <button className="btn sm icon" onClick={() => setForm({ exam: p })} title="Edit"><Pencil size={15} /></button>
                    <button className="btn sm icon" onClick={() => setRemoving(p)} title="Delete"><Trash2 size={15} color="var(--danger)" /></button>
                  </div>
                )
              })}
            </Card>
          ))}
        </div>
      )}
      {form && <ExamForm exam={form.exam} classes={classes.data || []} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload() }} />}
      <ConfirmModal open={Boolean(removing)} title="Delete exam paper?" confirmLabel="Delete" busy={busy}
        text={removing ? `${removing.name} · ${removing.subject}. Any marks entered for it are deleted too.` : ''} onConfirm={remove} onClose={() => setRemoving(null)} />
    </>
  )
}
