import { Request, Response } from 'express'
import Appointment from '../models/appointment'
import Doctor from '../models/doctor'
import Review from '../models/review'

// DOKTOR ANALİTİK
export const getDoctorAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const doctor = await Doctor.findOne({ userId })
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor profili bulunamadı' })
    }

    const doctorId = doctor._id

    // Tüm randevular
    const appointments = await Appointment.find({ doctorId })

    // Toplam gelir (tamamlanan randevular)
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')
    const totalRevenue = completedAppointments.length * doctor.consultationFee

    // Bu ayki gelir
    const now = new Date()
    const thisMonth = appointments.filter(a => {
      const d = new Date(a.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && a.status === 'COMPLETED'
    })
    const monthlyRevenue = thisMonth.length * doctor.consultationFee

    // Son 7 günlük randevu dağılımı
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' })
      const count = appointments.filter(a => {
        const d = new Date(a.date)
        return d.toDateString() === date.toDateString()
      }).length
      last7Days.push({ day: dayStr, count })
    }

    // Son 6 aylık gelir
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleDateString('tr-TR', { month: 'short' })
      const revenue = appointments.filter(a => {
        const d = new Date(a.date)
        return d.getMonth() === date.getMonth() &&
               d.getFullYear() === date.getFullYear() &&
               a.status === 'COMPLETED'
      }).length * doctor.consultationFee
      last6Months.push({ month: monthStr, revenue })
    }

    // Durum dağılımı
    const statusDistribution = {
      PENDING: appointments.filter(a => a.status === 'PENDING').length,
      APPROVED: appointments.filter(a => a.status === 'APPROVED').length,
      COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
      REJECTED: appointments.filter(a => a.status === 'REJECTED').length,
    }

    // Değerlendirmeler
    const reviews = await Review.find({ doctorId })
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.averageRating, 0) / reviews.length
      : 0

    return res.status(200).json({
      totalAppointments: appointments.length,
      completedAppointments: completedAppointments.length,
      totalRevenue,
      monthlyRevenue,
      totalReviews: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      last7Days,
      last6Months,
      statusDistribution,
    })
  } catch (error) {
    console.error('getDoctorAnalytics hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}