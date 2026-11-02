import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { StudentApi } from '../api/endpoints'
import { useDebounced } from '../hooks/useFetch'
import { Avatar } from './ui'

/** Ctrl/Cmd + K - jump to any student by name, email, username or admission number. */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [sel, setSel] = useState(0)
  const term = useDebounced(q.trim(), 250)

  useEffect(() => {
    if (!open || term.length < 2) return undefined
    let alive = true
    StudentApi.search({ q: term, size: 6 })
      .then((page) => {
        if (!alive) return
        setResults(page.items)
        setSel(0)
      })
      .catch(() => alive && setResults([]))
    return () => { alive = false }
  }, [term, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  const close = () => { setQ(''); setResults([]); onClose() }
  const go = (s) => { close(); navigate(`/students/${s.id}`) }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && results[sel]) go(results[sel])
  }

  const visible = term.length >= 2 ? results : []

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <motion.div className="cmdk" initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
              placeholder="Search students by name, email, username or admission no…" aria-label="Search students" />
            {visible.length === 0 ? (
              <div className="empty" style={{ padding: 28 }}>
                <Search size={28} />
                <p>{term.length < 2 ? 'Type at least 2 characters' : 'No matching students'}</p>
              </div>
            ) : (
              visible.map((s, i) => (
                <button key={s.id} className={`cmdk-item ${i === sel ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => go(s)}>
                  <Avatar name={s.name} />
                  <span><b>{s.name}</b><br /><span className="muted small">{s.admissionNo} · {s.className} · {s.email}</span></span>
                </button>
              ))
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
