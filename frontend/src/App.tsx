import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Doctors from './pages/Doctors'
import DoctorProfile from './pages/DoctorProfile'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Analytics from './pages/Analytics'
import type { JSX } from 'react/jsx-runtime'
import DoctorSetup from './pages/Doctorsetup'
import DoctorProfileEdit from './pages/DoctorProfileEdit'


// Korumalı route — giriş yapılmamışsa login'e yönlendir
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" />
}

// Doktor ana sayfası — giriş yapmış doktoru dashboard'a yönlendir
const HomeRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role === 'DOCTOR') return <Navigate to="/dashboard" />
  return <Landing />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorProfile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/chat/:conversationId" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/doctor-setup" element={<PrivateRoute><DoctorSetup /></PrivateRoute>} />
      <Route path="/doctor-edit" element={<PrivateRoute><DoctorProfileEdit /></PrivateRoute>} />

    </Routes>
  )
}

export default App