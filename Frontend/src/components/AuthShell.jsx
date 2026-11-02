import { motion } from 'framer-motion'
import { CalendarCheck, GraduationCap, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AuthShell({ children }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="orb" style={{ width: 280, height: 280, top: -60, right: -60 }} />
        <div className="orb" style={{ width: 160, height: 160, bottom: 120, left: -40, animationDelay: '-3s' }} />
        <div className="orb" style={{ width: 90, height: 90, top: '45%', right: '18%', animationDelay: '-6s' }} />
        <div className="brand" style={{ position: 'relative', zIndex: 1 }}>
          <div className="brand-logo" style={{ background: 'rgba(255,255,255,0.22)' }}><GraduationCap size={22} /></div>
          <span>EduCore</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            One place for every classroom.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            Attendance, marks, exam schedules, admit cards and notices - secure for teachers, simple for students.
          </motion.p>
        </div>
        <div className="hero-pills">
          <span><ShieldCheck size={16} /> Role-based access</span>
          <span><CalendarCheck size={16} /> Live attendance</span>
          <span><Sparkles size={16} /> Instant results</span>
        </div>
      </div>
      <div className="auth-panel">
        <button className="btn icon no-print" onClick={toggle} aria-label="Toggle theme" style={{ position: 'fixed', top: 18, right: 18 }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <motion.div className="card auth-card" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
