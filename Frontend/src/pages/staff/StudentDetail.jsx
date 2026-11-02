import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Hash, Mail, Phone, School } from 'lucide-react'
import { StudentApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Avatar, Card, Empty, ErrorBox, Meter, Ring, Skeleton } from '../../components/ui'
import { fmtDate } from '../../utils'

const COLOR = { PRESENT: '#10b981', ABSENT: '#ef4444', LATE: '#f59e0b' }

export default function StudentDetail() {
  const { id } = useParams()
  const { data, loading, error } = useFetch(() => StudentApi.overview(id), [id])

  if (loading) return <Skeleton h={420} style={{ borderRadius: 18 }} />
  if (error) return <><Link to="/students" className="btn"><ArrowLeft size={16} /> Back</Link><div style={{ marginTop: 16 }}><ErrorBox>{error}</ErrorBox></div></>

  const { profile, attendance, recentAttendance, marks } = data

  return (
    <>
      <Link to="/students" className="btn ghost" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> All students</Link>
      <div className="grid c2" style={{ marginBottom: 18 }}>
        <Card>
          <div className="row" style={{ gap: 18, alignItems: 'center' }}>
            <Avatar name={profile.name} size="lg" />
            <div>
              <h2>{profile.name}</h2>
              <span className="badge info" style={{ marginTop: 6 }}>{profile.className}</span>
            </div>
          </div>
          <div className="stack" style={{ marginTop: 22, gap: 12 }}>
            <div className="row"><Hash size={16} className="muted" /> {profile.admissionNo}</div>
            <div className="row"><Mail size={16} className="muted" /> {profile.email}</div>
            {profile.mobileNumber && <div className="row"><Phone size={16} className="muted" /> {profile.mobileNumber}</div>}
            <div className="row"><School size={16} className="muted" /> Username: <b>{profile.username || '-'}</b></div>
          </div>
        </Card>
        <Card index={1}>
          <h3>Attendance</h3>
          <div className="row" style={{ gap: 28, justifyContent: 'space-around' }}>
            <Ring value={attendance.percent} size={150} stroke={13} />
            <div className="stack" style={{ gap: 10 }}>
              <div><b style={{ fontSize: 22 }}>{attendance.total}</b><div className="muted small">days recorded</div></div>
              <div><b style={{ fontSize: 22, color: 'var(--success)' }}>{attendance.attended}</b><div className="muted small">attended</div></div>
              <div><b style={{ fontSize: 22, color: 'var(--danger)' }}>{attendance.absent}</b><div className="muted small">absent</div></div>
            </div>
          </div>
        </Card>
      </div>

      <Card index={2} style={{ marginBottom: 18 }}>
        <h3>Recent attendance <span className="muted small">(newest first)</span></h3>
        {recentAttendance.length === 0 ? <p className="muted">No attendance recorded yet.</p> : (
          <div className="row" style={{ gap: 6 }}>
            {recentAttendance.map((r, i) => (
              <motion.span key={r.date} title={`${fmtDate(r.date)} - ${r.status}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }}
                style={{ width: 22, height: 22, borderRadius: 7, background: COLOR[r.status] }} />
            ))}
          </div>
        )}
      </Card>

      <Card pad={false} index={3}>
        <div style={{ padding: '22px 22px 0' }}><h3>Marks</h3></div>
        {marks.length === 0 ? <Empty title="No marks yet" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Score</th><th /></tr></thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m.examId}>
                    <td>{m.examName}</td><td>{m.subject}</td><td>{fmtDate(m.examDate)}</td>
                    <td><b>{m.marks}</b> / {m.maxMarks}</td>
                    <td style={{ width: 160 }}><Meter value={(m.marks / m.maxMarks) * 100} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
