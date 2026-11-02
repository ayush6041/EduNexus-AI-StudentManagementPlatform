import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { homePath } from './utils'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/staff/Dashboard'
import Students from './pages/staff/Students'
import StudentDetail from './pages/staff/StudentDetail'
import Classes from './pages/staff/Classes'
import Teachers from './pages/staff/Teachers'
import Attendance from './pages/staff/Attendance'
import Exams from './pages/staff/Exams'
import Marks from './pages/staff/Marks'
import Notices from './pages/staff/Notices'
import Holidays from './pages/staff/Holidays'
import Audit from './pages/staff/Audit'
import MeDashboard from './pages/student/MeDashboard'
import MeAttendance from './pages/student/MeAttendance'
import MeMarks from './pages/student/MeMarks'
import MeExams from './pages/student/MeExams'
import AdmitCard from './pages/student/AdmitCard'
import MeNotices from './pages/student/MeNotices'
import MeHolidays from './pages/student/MeHolidays'
import MeProfile from './pages/student/MeProfile'

const STAFF = ['SUPER_ADMIN', 'TEACHER']

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homePath(user.role)} replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute allowUnverified />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route element={<ProtectedRoute roles={STAFF} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/holidays" element={<Holidays />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
        <Route element={<Layout />}>
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/audit" element={<Audit />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['STUDENT']} />}>
        <Route element={<Layout />}>
          <Route path="/me" element={<MeDashboard />} />
          <Route path="/me/attendance" element={<MeAttendance />} />
          <Route path="/me/marks" element={<MeMarks />} />
          <Route path="/me/exams" element={<MeExams />} />
          <Route path="/me/admit-card" element={<AdmitCard />} />
          <Route path="/me/notices" element={<MeNotices />} />
          <Route path="/me/holidays" element={<MeHolidays />} />
          <Route path="/me/profile" element={<MeProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homePath(user.role) : '/login'} replace />} />
    </Routes>
  )
}
