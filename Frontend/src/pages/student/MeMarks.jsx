import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, ErrorBox, Meter, PageHeader, Skeleton, Stat } from '../../components/ui'
import { fmtDate } from '../../utils'

const AXIS = { fill: '#9a98c4', fontSize: 12 }

export default function MeMarks() {
  const { data, loading, error } = useFetch(MeApi.marks)

  if (loading) return <Skeleton h={380} style={{ borderRadius: 18 }} />

  const groups = Object.values((data || []).reduce((acc, m) => {
    (acc[m.examName] ||= { name: m.examName, rows: [] }).rows.push(m)
    return acc
  }, {}))

  return (
    <>
      <PageHeader title="My marks" subtitle="Results published by your teachers." />
      <ErrorBox>{error}</ErrorBox>
      {groups.length === 0 ? <Card><Empty icon={Award} title="No marks published yet" /></Card> : (
        <div className="stack">
          {groups.map((g, gi) => {
            const got = g.rows.reduce((s, r) => s + r.marks, 0)
            const max = g.rows.reduce((s, r) => s + r.maxMarks, 0)
            const pct = Math.round((got / max) * 1000) / 10
            const chart = g.rows.map((r) => ({ subject: r.subject, percent: Math.round((r.marks / r.maxMarks) * 100) }))
            return (
              <div key={g.name} className="grid split">
                <Card index={gi} pad={false}>
                  <div style={{ padding: '22px 22px 0' }}><h3>{g.name}</h3></div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Subject</th><th>Date</th><th>Score</th><th /></tr></thead>
                      <tbody>
                        {g.rows.map((r) => (
                          <tr key={r.examId}>
                            <td><b>{r.subject}</b></td><td>{fmtDate(r.examDate)}</td>
                            <td><b>{r.marks}</b> / {r.maxMarks}</td>
                            <td style={{ width: 140 }}><Meter value={(r.marks / r.maxMarks) * 100} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <div className="stack">
                  <Stat icon={Award} label={`Total · ${got} / ${max}`} value={pct} suffix="%" decimals={1} index={gi} />
                  <Card index={gi + 1}>
                    <div style={{ height: 170 }}>
                      <ResponsiveContainer>
                        <BarChart data={chart} margin={{ left: -24, right: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(154,152,196,0.25)" vertical={false} />
                          <XAxis dataKey="subject" tick={AXIS} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: 12 }} formatter={(v) => [`${v}%`, 'Score']} />
                          <Bar dataKey="percent" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
