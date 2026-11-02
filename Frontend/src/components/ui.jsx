import { useEffect } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Inbox, Loader2, X } from 'lucide-react'
import { pctClass, initials } from '../utils'
import { fadeUp } from '../animations'

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  )
}

export function Card({ children, className = '', pad = true, index = 0, ...rest }) {
  return (
    <motion.div
      className={`card ${pad ? 'pad' : ''} ${className}`}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

function Counter({ value, decimals = 0 }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => v.toFixed(decimals))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, mv])
  return <motion.span>{text}</motion.span>
}

export function Stat({ icon: Icon, label, value, suffix = '', decimals = 0, index = 0 }) {
  return (
    <motion.div className="card stat" variants={fadeUp} initial="hidden" animate="show" custom={index} whileHover={{ y: -4 }}>
      <div className="icon-bubble"><Icon size={20} /></div>
      <div className="value">
        {value === null || value === undefined ? '–' : <><Counter value={value} decimals={decimals} />{suffix}</>}
      </div>
      <div className="label">{label}</div>
    </motion.div>
  )
}

export function Modal({ open, title, subtitle, onClose, children, width }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div className="modal" role="dialog" aria-modal="true" style={width ? { maxWidth: width } : undefined}
            initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2>{title}</h2>
                {subtitle && <p className="sub">{subtitle}</p>}
              </div>
              <button className="btn ghost icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmModal({ open, title, text, confirmLabel = 'Confirm', danger = true, busy, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} width={440}>
      <p className="muted" style={{ marginTop: 6 }}>{text}</p>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />}{confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export const Skeleton = ({ h = 18, w = '100%', style }) => <div className="skeleton" style={{ height: h, width: w, ...style }} />

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="stack" style={{ padding: 18 }}>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={44} />)}
    </div>
  )
}

export function Empty({ icon: Icon = Inbox, title = 'Nothing here yet', text }) {
  return (
    <div className="empty">
      <Icon size={44} />
      <h3 style={{ color: 'var(--text)', marginBottom: 4 }}>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  )
}

export const ErrorBox = ({ children }) => (children ? <div className="error-box" role="alert">{children}</div> : null)

export const Badge = ({ tone = '', children }) => <span className={`badge ${tone}`}>{children}</span>

export const Avatar = ({ name, size = '' }) => <div className={`avatar ${size}`}>{initials(name)}</div>

export function Meter({ value }) {
  const v = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className={`meter ${pctClass(v)}`} title={`${v}%`}>
      <motion.i initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
    </div>
  )
}

export function Ring({ value = 0, size = 168, stroke = 14, label = 'attendance' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = value >= 90 ? '#10b981' : value >= 75 ? '#f59e0b' : '#ef4444'
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(value, 100) / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="ring-label"><b><Counter value={value} decimals={1} />%</b><span>{label}</span></div>
    </div>
  )
}

export function Pagination({ page, totalPages, total, onPage }) {
  return (
    <div className="pagination">
      <span className="muted small">{total} result{total === 1 ? '' : 's'}</span>
      <div className="row">
        <button className="btn sm icon" disabled={page <= 0} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
        <span className="small" style={{ fontWeight: 700 }}>Page {totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
        <button className="btn sm icon" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}
