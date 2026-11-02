import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { StatsApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, ErrorBox, PageHeader, Pagination, TableSkeleton } from '../../components/ui'
import { fmtDateTime } from '../../utils'

export default function Audit() {
  const [page, setPage] = useState(0)
  const { data, loading, error } = useFetch(() => StatsApi.audit(page), [page])

  return (
    <>
      <PageHeader title="Audit log" subtitle="Who changed what, and when. Visible to the super admin only." />
      <ErrorBox>{error}</ErrorBox>
      <Card pad={false}>
        {loading ? <TableSkeleton /> : data.items.length === 0 ? <Empty icon={ScrollText} title="Nothing recorded yet" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(a.createdAt)}</td>
                    <td>{a.actor}</td>
                    <td><span className="badge info">{a.action}</span></td>
                    <td className="muted">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.totalElements} onPage={setPage} />}
      </Card>
    </>
  )
}
