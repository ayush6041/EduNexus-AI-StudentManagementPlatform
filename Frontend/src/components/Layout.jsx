import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Award, CalendarCheck, CalendarDays, ClipboardList, FileText, GraduationCap, LayoutDashboard, LogOut,
  Megaphone, Menu, Moon, School, ScrollText, Search, Sun, Ticket, User, UserCog, Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CommandPalette from './CommandPalette'
import { Avatar } from './ui'

const STAFF = [
  { label: 'Overview', items: [{ to: '/dashboard', text: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'People',
    items: [
      { to: '/students', text: 'Students', icon: Users },
      { to: '/classes', text: 'Classes', icon: School },
      { to: '/teachers', text: 'Teachers', icon: UserCog, roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { to: '/attendance', text: 'Attendance', icon: CalendarCheck },
      { to: '/exams', text: 'Exam schedule', icon: FileText },
      { to: '/marks', text: 'Marks', icon: ClipboardList },
    ],
  },
  {
    label: 'Campus',
    items: [
      { to: '/notices', text: 'Notices', icon: Megaphone },
      { to: '/holidays', text: 'Holiday calendar', icon: CalendarDays },
      { to: '/audit', text: 'Audit log', icon: ScrollText, roles: ['SUPER_ADMIN'] },
    ],
  },
]

const STUDENT = [
  {
    label: 'My space',
    items: [
      { to: '/me', text: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/me/attendance', text: 'Attendance', icon: CalendarCheck },
      { to: '/me/marks', text: 'My marks', icon: Award },
      { to: '/me/exams', text: 'Exam schedule', icon: FileText },
      { to: '/me/admit-card', text: 'Admit card', icon: Ticket },
    ],
  },
  {
    label: 'Campus',
    items: [
      { to: '/me/notices', text: 'Notices', icon: Megaphone },
      { to: '/me/holidays', text: 'Holiday calendar', icon: CalendarDays },
      { to: '/me/profile', text: 'Profile', icon: User },
    ],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const isStaff = user.role !== 'STUDENT'
  const sections = (isStaff ? STAFF : STUDENT)
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || i.roles.includes(user.role)) }))
    .filter((s) => s.items.length)

  useEffect(() => {
    if (!isStaff) return undefined
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isStaff])

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="aurora"><span /><span /><span /></div>
      <div className="shell">
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="brand">
            <div className="brand-logo"><GraduationCap size={22} /></div>
            <span>Edu<span className="grad-text">Core</span></span>
          </div>
          {sections.map((section) => (
            <div key={section.label}>
              <div className="nav-label">{section.label}</div>
              {section.items.map(({ to, text, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}>
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <Icon size={19} /><span>{text}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="sidebar-foot">
            <div className="me-chip">
              <Avatar name={user.name} />
              <div><b>{user.name}</b><small>{user.role.replace('_', ' ').toLowerCase()}</small></div>
            </div>
            <button className="btn ghost block" onClick={signOut}><LogOut size={16} /> Sign out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <button className="btn icon menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu"><Menu size={18} /></button>
            {isStaff && (
              <button className="btn" onClick={() => setPaletteOpen(true)}>
                <Search size={16} /> <span className="muted">Search students</span> <kbd>Ctrl K</kbd>
              </button>
            )}
            <div className="spacer" />
            <button className="btn icon" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
          <main className="content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {outlet}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      {isStaff && <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />}
    </>
  )
}
