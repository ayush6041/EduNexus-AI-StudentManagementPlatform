import { CalendarDays } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import Calendar from '../../components/Calendar'
import { Card, Empty, ErrorBox, PageHeader, Skeleton } from '../../components/ui'
import { dayParts, todayIso } from '../../utils'

export default function MeHolidays() {
  const { data, loading, error } = useFetch(MeApi.holidays)
  const upcoming = (data || []).filter((h) => h.date >= todayIso())

  return (
    <>
      <PageHeader title="Holiday calendar" />
      <ErrorBox>{error}</ErrorBox>
      {loading ? <Skeleton h={380} style={{ borderRadius: 18 }} /> : (
        <div className="grid split">
          <Card><Calendar events={(data || []).map((h) => ({ date: h.date, label: h.name, type: 'holiday' }))} legend={[{ label: 'Holiday', color: 'var(--accent)' }]} /></Card>
          <Card index={1} style={{ alignSelf: 'start' }}>
            <h3>Upcoming</h3>
            {upcoming.length === 0 ? <Empty icon={CalendarDays} title="No upcoming holidays" /> : upcoming.map((h) => {
              const d = dayParts(h.date)
              return (
                <div className="list-item" key={h.id}>
                  <div className="date-tile"><b>{d.day}</b><span>{d.mon}</span></div>
                  <div><b>{h.name}</b>{h.description && <div className="muted small">{h.description}</div>}</div>
                </div>
              )
            })}
          </Card>
        </div>
      )}
    </>
  )
}
