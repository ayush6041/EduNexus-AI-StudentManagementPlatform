import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, FileText, Megaphone, School, TrendingUp, UserCog, Users } from 'lucide-react'
import { StatsApi } from '../../api/endpoints'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import { Card, ErrorBox, PageHeader, Skeleton, Stat } from '../../components/ui'
import { fadeUp } from '../../animations'
import { fmtDate } from '../../utils'

const AXIS = { fill: '#9a98c4', fontSize: 12 }
const TOOLTIP = { background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useFetch(StatsApi.stats)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const trend = (data?.attendanceTrend || []).map((p) => ({ day: fmtDate(p.date, { day: 'numeric', month: 'short' }), percent: p.percent }))
  const classes = (data?.classBreakdown || []).map((c) => ({ name: c.displayName, students: c.studentCount }))

  const actions = [
    { to: '/attendance', icon: CalendarCheck, text: 'Mark attendance' },
    { to: '/marks', icon: TrendingUp, text: 'Enter marks' },
    { to: '/exams', icon: FileText, text: 'Schedule exam' },
    { to: '/notices', icon: Megaphone, text: 'Post notice' },
  ]

  return (
    <>
      <PageHeader title={<>{greeting}, <span className="grad-text">{user.name.split(' ')[0]}</span></>} subtitle="Here is what is happening across your school today." />
      <ErrorBox>{error}</ErrorBox>

      <div className="grid c4" style={{ marginBottom: 18 }}>
        {loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={140} style={{ borderRadius: 18 }} />) : (
          <>
            <Stat index={0} icon={Users} label="Students" value={data.students} />
            {user.role === 'SUPER_ADMIN' && <Stat index={1} icon={UserCog} label="Teachers" value={data.teachers} />}
            <Stat index={2} icon={School} label="Classes" value={data.classes} />
            <Stat index={3} icon={FileText} label="Upcoming exam papers" value={data.upcomingExams} />
            <Stat index={4} icon={CalendarCheck} label="Today's attendance" value={data.todayAttendancePercent} suffix="%" decimals={1} />
          </>
        )}
      </div>

      <div className="grid split" style={{ marginBottom: 18 }}>
        <Card index={2}>
          <h3>Attendance - last 7 days</h3>
          <div style={{ height: 270 }}>
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(154,152,196,0.25)" vertical={false} />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={TOOLTIP} formatter={(v) => [`${v}%`, 'Present']} />
                <Area type="monotone" dataKey="percent" stroke="#6366f1" strokeWidth={3} fill="url(#att)" connectNulls isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card index={3}>
          <h3>Quick actions</h3>
          <div className="stack" style={{ gap: 10 }}>
            {actions.map(({ to, icon: Icon, text }, i) => (
              <motion.div key={to} variants={fadeUp} initial="hidden" animate="show" custom={i + 4} whileHover={{ x: 6 }}>
                <Link to={to} className="btn block" style={{ justifyContent: 'flex-start' }}><Icon size={18} /> {text}</Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <Card index={4}>
        <h3>Students per class</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={classes} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="bars" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(154,152,196,0.25)" vertical={false} />
              <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="students" fill="url(#bars)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  )
}
