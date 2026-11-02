import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Loader2, Save } from 'lucide-react'
import { ClassApi, ExamApi, MarkApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import { Avatar, Card, Empty, ErrorBox, Field, PageHeader, TableSkeleton } from '../../components/ui'
import { fmtDate } from '../../utils'

export default function Marks() {
  const toast = useToast()
  const classes = useFetch(ClassApi.list)
  const [classId, setClassId] = useState('')
  const [examId, setExamId] = useState('')
  const [edits, setEdits] = useState({})
  const [busy, setBusy] = useState(false)

  const activeClass = classId || (classes.data?.[0] ? String(classes.data[0].id) : '')
  const exams = useFetch(() => (activeClass ? ExamApi.list(activeClass) : Promise.resolve([])), [activeClass])
  const examList = exams.data || []
  const exam = examList.find((e) => String(e.id) === examId) || examList[0]
  const roster = useFetch(() => (exam ? MarkApi.roster(exam.id) : Promise.resolve([])), [exam?.id])
  const rows = roster.data || []

  const value = (r) => edits[r.studentId] ?? (r.marks ?? '')

  const save = async () => {
    const entries = []
    for (const r of rows) {
      if (edits[r.studentId] === undefined) continue
      const raw = String(edits[r.studentId]).trim()
      if (raw === '') { entries.push({ studentId: r.studentId, marks: null }); continue }
      const num = Number(raw)
      if (Number.isNaN(num) || num < 0 || num > exam.maxMarks) return toast.error(`${r.name}: marks must be between 0 and ${exam.maxMarks}`)
      entries.push({ studentId: r.studentId, marks: num })
    }
    if (entries.length === 0) return toast.error('No changes to save')
    setBusy(true)
    try {
      toast.success((await MarkApi.save(exam.id, { entries })).message)
      setEdits({})
      roster.reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Marks" subtitle="Pick a class and exam paper, then enter marks for the whole class." />
      <Card pad={false}>
        <div className="toolbar">
          <Field label="Class">
            <select className="select" value={activeClass} onChange={(e) => { setClassId(e.target.value); setExamId(''); setEdits({}) }}>
              {(classes.data || []).map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </Field>
          <Field label="Exam paper" className="grow">
            <select className="select" value={exam?.id ?? ''} onChange={(e) => { setExamId(e.target.value); setEdits({}) }} disabled={examList.length === 0}>
              {examList.length === 0 && <option>No exams for this class</option>}
              {examList.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.subject} · {fmtDate(e.examDate)}</option>)}
            </select>
          </Field>
          <button className="btn primary" onClick={save} disabled={busy || rows.length === 0}>
            {busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save marks
          </button>
        </div>
        <ErrorBox>{roster.error || exams.error}</ErrorBox>
        {roster.loading ? <TableSkeleton /> : !exam ? (
          <Empty icon={ClipboardList} title="Schedule an exam first" text="Marks are entered per exam paper." />
        ) : rows.length === 0 ? (
          <Empty icon={ClipboardList} title="No students in this class" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Admission no.</th><th style={{ width: 180 }}>Marks (out of {exam.maxMarks})</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr key={r.studentId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.025 }}>
                    <td><div className="cell-user"><Avatar name={r.name} />{r.name}</div></td>
                    <td>{r.admissionNo}</td>
                    <td>
                      <input className="input" type="number" step="0.5" min="0" max={exam.maxMarks} value={value(r)} aria-label={`Marks for ${r.name}`}
                        onChange={(e) => setEdits({ ...edits, [r.studentId]: e.target.value })} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
