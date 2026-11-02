import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, Megaphone } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import { Card, Empty, ErrorBox, PageHeader, Ring, Skeleton } from '../../components/ui'
import { dayParts, fmtDateTime, fmtTime } from '../../utils'

export default function MeDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useFetch(MeApi.summary)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return <div className="grid c2"><Skeleton h={260} style={{ borderRadius: 18 }} /><Skeleton h={260} style={{ borderRadius: 18 }} /></div>
  if (error) return <ErrorBox>{error}</ErrorBox>

  const { profile, attendance, upcomingExams, latestNotices, nextHoliday } = data
  const low = attendance.total > 0 && attendance.percent < 75

  return (
    <>
      <PageHeader title={<>{greeting}, <span className="grad-text">{user.name.split(' ')[0]}</span></>} subtitle={`Class ${profile.className} · Admission no. ${profile.admissionNo}`} />
      <div className="grid c2" style={{ marginBottom: 18 }}>
        <Card>
          <h3>My attendance</h3>
          <div className="row" style={{ justifyContent: 'space-around', gap: 24 }}>
            <Ring value={attendance.percent} />
            <div className="stack" style={{ gap: 10 }}>
              <div><b style={{ fontSize: 24 }}>{attendance.attended}</b><div className="muted small">days attended</div></div>
              <div><b style={{ fontSize: 24 }}>{attendance.total}</b><div className="muted small">days recorded</div></div>
            </div>
          </div>
          {low && <div className="error-box" style={{ marginTop: 16 }}>Your attendance is below 75%. Please speak to your class teacher.</div>}
          <Link to="/me/attendance" className="btn ghost sm" style={{ marginTop: 12 }}>View calendar <ArrowRight size={14} /></Link>
        </Card>

        <Card index={1}>
          <h3>Upcoming exams</h3>
          {upcomingExams.length === 0 ? <Empty icon={Clock} title="No upcoming exams" /> : upcomingExams.map((e) => {
            const d = dayParts(e.examDate)
            return (
              <div className="list-item" key={e.id}>
                <div className="date-tile"><b>{d.day}</b><span>{d.mon}</span></div>
                <div><b>{e.subject}</b><div className="muted small">{e.name} · {fmtTime(e.startTime)}{e.room ? ` · ${e.room}` : ''}</div></div>
              </div>
            )
          })}
          <Link to="/me/exams" className="btn ghost sm" style={{ marginTop: 8 }}>Full schedule <ArrowRight size={14} /></Link>
        </Card>
      </div>

      <div className="grid c2">
        <Card index={2}>
          <h3>Latest notices</h3>
          {latestNotices.length === 0 ? <Empty icon={Megaphone} title="No notices" /> : latestNotices.map((n) => (
            <div className="list-item" key={n.id}>
              <Megaphone size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
              <div><b>{n.title}</b><div className="muted small">{fmtDateTime(n.createdAt)}</div></div>
            </div>
          ))}
          <Link to="/me/notices" className="btn ghost sm" style={{ marginTop: 8 }}>All notices <ArrowRight size={14} /></Link>
        </Card>
        <Card index={3}>
          <h3>Next holiday</h3>
          {nextHoliday ? (
            <div className="list-item">
              <div className="date-tile"><b>{dayParts(nextHoliday.date).day}</b><span>{dayParts(nextHoliday.date).mon}</span></div>
              <div><b>{nextHoliday.name}</b>{nextHoliday.description && <div className="muted small">{nextHoliday.description}</div>}</div>
            </div>
          ) : <Empty icon={CalendarDays} title="No upcoming holidays" />}
          <Link to="/me/holidays" className="btn ghost sm" style={{ marginTop: 8 }}>Holiday calendar <ArrowRight size={14} /></Link>
        </Card>
      </div>
    </>
  )
}
