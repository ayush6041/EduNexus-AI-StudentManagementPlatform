import { GraduationCap, Printer, Ticket } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, PageHeader, Skeleton } from '../../components/ui'
import { fmtDate, fmtTime } from '../../utils'

export default function AdmitCard() {
  const { data, loading, error } = useFetch(MeApi.admitCard)

  if (loading) return <Skeleton h={420} style={{ borderRadius: 18 }} />

  return (
    <>
      <div className="no-print">
        <PageHeader title="Admit card" subtitle="Print this and carry it to every paper.">
          {data && <button className="btn primary" onClick={() => window.print()}><Printer size={16} /> Print / Save as PDF</button>}
        </PageHeader>
      </div>
      {error || !data ? (
        <Card className="no-print"><Empty icon={Ticket} title="Not available yet" text={error} /></Card>
      ) : (
        <div className="admit">
          <div className="admit-head">
            <div className="row" style={{ justifyContent: 'center', gap: 10 }}><GraduationCap size={30} color="var(--primary)" /><b style={{ fontSize: 20 }}>EduCore School</b></div>
            <h2>Admit Card</h2>
            <div className="muted">{data.examName}</div>
          </div>
          <dl>
            <div><dt>Student</dt><dd>{data.student.name}</dd></div>
            <div><dt>Admission no.</dt><dd>{data.student.admissionNo}</dd></div>
            <div><dt>Class</dt><dd>{data.student.className}</dd></div>
            <div><dt>Email</dt><dd style={{ fontSize: 14 }}>{data.student.email}</dd></div>
          </dl>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 0 }}>
              <thead><tr><th>Date</th><th>Subject</th><th>Time</th><th>Room</th></tr></thead>
              <tbody>
                {data.papers.map((p) => (
                  <tr key={p.id}><td>{fmtDate(p.examDate)}</td><td><b>{p.subject}</b></td><td>{fmtTime(p.startTime)} – {fmtTime(p.endTime)}</td><td>{p.room || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 18 }}>Bring a valid school ID. Electronic devices are not permitted in the examination hall.</p>
        </div>
      )}
    </>
  )
}
