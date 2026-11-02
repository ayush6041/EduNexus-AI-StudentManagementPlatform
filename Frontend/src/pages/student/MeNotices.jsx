import { Megaphone } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, ErrorBox, PageHeader, Skeleton } from '../../components/ui'
import { fmtDateTime } from '../../utils'

export default function MeNotices() {
  const { data, loading, error } = useFetch(MeApi.notices)

  return (
    <>
      <PageHeader title="Notices" subtitle="Announcements from your school." />
      <ErrorBox>{error}</ErrorBox>
      {loading ? <Skeleton h={200} style={{ borderRadius: 18 }} /> : data?.length === 0 ? (
        <Card><Empty icon={Megaphone} title="No notices" /></Card>
      ) : (
        <div className="stack">
          {data?.map((n, i) => (
            <Card key={n.id} index={i}>
              <h3 style={{ marginBottom: 6 }}>{n.title}</h3>
              <div className="row small muted" style={{ gap: 10 }}><span className="badge info">{n.className}</span><span>{fmtDateTime(n.createdAt)}</span></div>
              <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{n.body}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
