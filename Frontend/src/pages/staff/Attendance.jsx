import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, CheckCheck, Loader2, Save } from 'lucide-react'
import { AttendanceApi, ClassApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import { Avatar, Card, Empty, ErrorBox, Field, PageHeader, TableSkeleton } from '../../components/ui'
import { todayIso } from '../../utils'

const OPTIONS = [['PRESENT', 'P'], ['ABSENT', 'A'], ['LATE', 'L']]

export default function Attendance() {
  const toast = useToast()
  const classes = useFetch(ClassApi.list)
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(todayIso())
  const [edits, setEdits] = useState({})
  const [busy, setBusy] = useState(false)

  const activeClass = classId || (classes.data?.[0] ? String(classes.data[0].id) : '')
  const roster = useFetch(() => (activeClass ? AttendanceApi.roster(activeClass, date) : Promise.resolve([])), [activeClass, date])
  const rows = roster.data || []

  const statusOf = (r) => edits[r.studentId] ?? r.status
  const counts = rows.reduce((acc, r) => { const s = statusOf(r); if (s) acc[s] = (acc[s] || 0) + 1; return acc }, {})
  const unmarked = rows.length - Object.values(counts).reduce((a, b) => a + b, 0)

  const change = (setter) => (e) => { setter(e.target.value); setEdits({}) }
  const markAll = (status) => setEdits(Object.fromEntries(rows.map((r) => [r.studentId, status])))

  const save = async () => {
    const records = rows.filter((r) => statusOf(r)).map((r) => ({ studentId: r.studentId, status: statusOf(r) }))
    if (records.length === 0) return toast.error('Mark at least one student first')
    setBusy(true)
    try {
      const res = await AttendanceApi.save(activeClass, { date, records })
      toast.success(res.message)
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
      <PageHeader title="Attendance" subtitle="Mark a whole class in one go. Saving again for the same day updates it." />
      <Card pad={false}>
        <div className="toolbar">
          <Field label="Class">
            <select className="select" value={activeClass} onChange={change(setClassId)}>
              {(classes.data || []).map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </Field>
          <Field label="Date"><input className="input" type="date" max={todayIso()} value={date} onChange={change(setDate)} /></Field>
          <div className="row" style={{ marginLeft: 'auto' }}>
            <button className="btn" onClick={() => markAll('PRESENT')} disabled={rows.length === 0}><CheckCheck size={16} /> All present</button>
            <button className="btn primary" onClick={save} disabled={busy || rows.length === 0}>
              {busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save attendance
            </button>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="toolbar" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <span className="badge success">Present {counts.PRESENT || 0}</span>
            <span className="badge warn">Late {counts.LATE || 0}</span>
            <span className="badge danger">Absent {counts.ABSENT || 0}</span>
            {unmarked > 0 && <span className="badge">Unmarked {unmarked}</span>}
          </div>
        )}
        <ErrorBox>{roster.error}</ErrorBox>
        {roster.loading ? <TableSkeleton /> : rows.length === 0 ? (
          <Empty icon={CalendarCheck} title="No students in this class" text="Add students to the class first." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Admission no.</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr key={r.studentId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.025 }}>
                    <td><div className="cell-user"><Avatar name={r.name} />{r.name}</div></td>
                    <td>{r.admissionNo}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="seg" role="group" aria-label={`Attendance for ${r.name}`}>
                        {OPTIONS.map(([value, letter]) => (
                          <button key={value} className={statusOf(r) === value ? `on-${letter}` : ''} title={value}
                            onClick={() => setEdits({ ...edits, [r.studentId]: value })}>{letter}</button>
                        ))}
                      </div>
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
