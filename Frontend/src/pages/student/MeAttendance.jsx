import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import Calendar from '../../components/Calendar'
import { Card, ErrorBox, PageHeader, Ring, Skeleton } from '../../components/ui'

export default function MeAttendance() {
  const { data, loading, error } = useFetch(MeApi.attendance)

  if (loading) return <Skeleton h={420} style={{ borderRadius: 18 }} />

  const total = data?.length || 0
  const attended = (data || []).filter((r) => r.status !== 'ABSENT').length
  const late = (data || []).filter((r) => r.status === 'LATE').length
  const percent = total ? Math.round((attended * 1000) / total) / 10 : 0
  const events = (data || []).map((r) => ({ date: r.date, label: r.status[0] + r.status.slice(1).toLowerCase(), type: r.status.toLowerCase() }))

  return (
    <>
      <PageHeader title="My attendance" subtitle="Read-only - marked by your teachers." />
      <ErrorBox>{error}</ErrorBox>
      <div className="grid split">
        <Card>
          <Calendar events={events} legend={[
            { label: 'Present', color: 'var(--success)' }, { label: 'Late', color: 'var(--warn)' }, { label: 'Absent', color: 'var(--danger)' },
          ]} />
        </Card>
        <Card index={1} style={{ alignSelf: 'start' }}>
          <h3>Summary</h3>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}><Ring value={percent} /></div>
          <div className="row between"><span className="muted">Days recorded</span><b>{total}</b></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="muted">Attended</span><b style={{ color: 'var(--success)' }}>{attended}</b></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="muted">Late arrivals</span><b style={{ color: 'var(--warn)' }}>{late}</b></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="muted">Absent</span><b style={{ color: 'var(--danger)' }}>{total - attended}</b></div>
        </Card>
      </div>
    </>
  )
}
