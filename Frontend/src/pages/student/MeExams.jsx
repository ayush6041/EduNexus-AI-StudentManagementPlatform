import { Clock, FileText, MapPin } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, ErrorBox, PageHeader, Skeleton } from '../../components/ui'
import { dayParts, fmtDate, fmtTime, todayIso } from '../../utils'

export default function MeExams() {
  const { data, loading, error } = useFetch(MeApi.exams)
  const today = todayIso()

  if (loading) return <Skeleton h={300} style={{ borderRadius: 18 }} />

  const groups = Object.values((data || []).reduce((acc, e) => {
    (acc[e.name] ||= { name: e.name, papers: [] }).papers.push(e)
    return acc
  }, {}))

  return (
    <>
      <PageHeader title="Exam schedule" subtitle="Your class's timetable." />
      <ErrorBox>{error}</ErrorBox>
      {groups.length === 0 ? <Card><Empty icon={FileText} title="No exams scheduled" /></Card> : (
        <div className="stack">
          {groups.map((g, gi) => (
            <Card key={g.name} index={gi}>
              <h3>{g.name}</h3>
              {g.papers.map((p) => {
                const d = dayParts(p.examDate)
                const over = p.examDate < today
                return (
                  <div className="list-item" key={p.id} style={{ opacity: over ? 0.55 : 1 }}>
                    <div className="date-tile"><b>{d.day}</b><span>{d.mon}</span></div>
                    <div style={{ flex: 1 }}>
                      <b>{p.subject}</b>
                      <div className="muted small row" style={{ gap: 14, marginTop: 4 }}>
                        <span>{fmtDate(p.examDate, { weekday: 'long' })}</span>
                        <span className="row" style={{ gap: 5 }}><Clock size={14} />{fmtTime(p.startTime)} – {fmtTime(p.endTime)}</span>
                        {p.room && <span className="row" style={{ gap: 5 }}><MapPin size={14} />{p.room}</span>}
                      </div>
                    </div>
                    <span className="badge">{p.maxMarks} marks</span>
                  </div>
                )
              })}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
