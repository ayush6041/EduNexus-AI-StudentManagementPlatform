import { Link } from 'react-router-dom'
import { Hash, KeyRound, Mail, Phone, School, User } from 'lucide-react'
import { MeApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { Avatar, Card, ErrorBox, PageHeader, Skeleton } from '../../components/ui'

export default function MeProfile() {
  const { data, loading, error } = useFetch(MeApi.profile)

  if (loading) return <Skeleton h={300} style={{ borderRadius: 18 }} />
  if (error) return <ErrorBox>{error}</ErrorBox>

  const rows = [
    [User, 'Username', data.username],
    [Hash, 'Admission number', data.admissionNo],
    [School, 'Class', data.className],
    [Mail, 'Email', data.email],
    [Phone, 'Mobile', data.mobileNumber || '-'],
  ]

  return (
    <>
      <PageHeader title="My profile" subtitle="Details are managed by your school. Contact your teacher to correct anything." />
      <Card style={{ maxWidth: 640 }}>
        <div className="row" style={{ gap: 18, marginBottom: 22 }}>
          <Avatar name={data.name} size="lg" />
          <div><h2>{data.name}</h2><span className="badge info">Class {data.className}</span></div>
        </div>
        <div className="stack" style={{ gap: 14 }}>
          {rows.map(([Icon, label, value]) => (
            <div key={label} className="row between" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <span className="muted row" style={{ gap: 10 }}><Icon size={16} />{label}</span><b>{value}</b>
            </div>
          ))}
        </div>
        <Link to="/change-password" className="btn" style={{ marginTop: 22 }}><KeyRound size={16} /> Change password</Link>
      </Card>
    </>
  )
}
