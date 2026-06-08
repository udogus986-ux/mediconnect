import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PatientDashboard from './PatientDashboard'
import DoctorDashboard from './DoctorDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  if (!user) return null

  return user.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />
}

export default Dashboard