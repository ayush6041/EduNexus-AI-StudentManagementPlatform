import { useState } from 'react'
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react'
import { HolidayApi } from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../context/ToastContext'
import Calendar from '../../components/Calendar'
import { Card, ConfirmModal, Empty, ErrorBox, Field, Modal, PageHeader, Skeleton } from '../../components/ui'
import { dayParts } from '../../utils'

export default function Holidays() {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch(HolidayApi.list)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(null)

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await HolidayApi.create({ name: form.name, date: form.date, description: form.description || null })
      toast.success('Holiday added')
      setOpen(false)
      setForm({ name: '', date: '', description: '' })
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await HolidayApi.remove(removing.id)
      toast.success('Holiday removed')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
      setRemoving(null)
    }
  }

  const events = (data || []).map((h) => ({ date: h.date, label: h.name, type: 'holiday' }))

  return (
    <>
      <PageHeader title="Holiday calendar" subtitle="Visible to every student.">
        <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16} /> Add holiday</button>
      </PageHeader>
      <ErrorBox>{error}</ErrorBox>
      {loading ? <Skeleton h={380} style={{ borderRadius: 18 }} /> : (
        <div className="grid split">
          <Card><Calendar events={events} legend={[{ label: 'Holiday', color: 'var(--accent)' }]} /></Card>
          <Card index={1}>
            <h3>All holidays</h3>
            {data.length === 0 ? <Empty icon={CalendarDays} title="No holidays added" /> : data.map((h) => {
              const d = dayParts(h.date)
              return (
                <div key={h.id} className="list-item">
                  <div className="date-tile"><b>{d.day}</b><span>{d.mon}</span></div>
                  <div style={{ flex: 1 }}><b>{h.name}</b>{h.description && <div className="muted small">{h.description}</div>}</div>
                  <button className="btn sm icon" onClick={() => setRemoving(h)} title="Delete"><Trash2 size={15} color="var(--danger)" /></button>
                </div>
              )
            })}
          </Card>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add holiday" width={460}>
        <form className="stack" onSubmit={add} style={{ marginTop: 16 }}>
          <Field label="Name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Date"><input className="input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Note (optional)"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Add</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal open={Boolean(removing)} title="Remove holiday?" confirmLabel="Remove" busy={busy}
        text={removing ? `${removing.name} will be removed from the calendar.` : ''} onConfirm={remove} onClose={() => setRemoving(null)} />
    </>
  )
}
