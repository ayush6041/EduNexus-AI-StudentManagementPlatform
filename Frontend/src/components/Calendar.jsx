import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (n) => String(n).padStart(2, '0')

/** events: [{ date: 'YYYY-MM-DD', label, type: holiday|exam|present|absent|late }] */
export default function Calendar({ events = [], legend = [] }) {
  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [dir, setDir] = useState(1)

  const first = new Date(cursor.y, cursor.m, 1)
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const byDate = {}
  events.forEach((e) => { (byDate[e.date] ||= []).push(e) })

  const move = (delta) => {
    setDir(delta)
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  return (
    <div>
      <div className="cal-head">
        <h3>{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
        <div className="row">
          <button className="btn sm icon" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button className="btn sm" onClick={() => { setDir(1); setCursor({ y: now.getFullYear(), m: now.getMonth() }) }}>Today</button>
          <button className="btn sm icon" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${cursor.y}-${cursor.m}`} className="cal-grid" style={{ marginTop: 6 }}
          initial={{ opacity: 0, x: 30 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 * dir }} transition={{ duration: 0.22 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`b${i}`} className="cal-day off" />
            const key = `${cursor.y}-${pad(cursor.m + 1)}-${pad(day)}`
            const list = byDate[key] || []
            return (
              <div key={key} className={`cal-day ${key === todayKey ? 'today' : ''}`} title={list.map((e) => e.label).join(', ')}>
                <span>{day}</span>
                {list.slice(0, 2).map((e, j) => <span key={j} className={`tag ${e.type}`}>{e.label}</span>)}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
      {legend.length > 0 && (
        <div className="legend">
          {legend.map((l) => <span key={l.label}><i style={{ background: l.color }} />{l.label}</span>)}
        </div>
      )}
    </div>
  )
}
