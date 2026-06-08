import { Request, Response } from 'express'
import Review from '../models/review'
import Appointment from '../models/appointment'
import Doctor from '../models/doctor'

// DEĞERLENDIRME OLUŞTUR
export const createReview = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.userId
    const { appointmentId, communicationRating, expertiseRating, punctualityRating } = req.body

    if (!appointmentId || !communicationRating || !expertiseRating || !punctualityRating) {
      return res.status(400).json({ message: 'Tüm puanlar zorunludur' })
    }

    // Randevu tamamlandı mı kontrol et
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      status: 'COMPLETED',
    })

    if (!appointment) {
      return res.status(403).json({ message: 'Sadece tamamlanan randevular değerlendirilebilir' })
    }

    // Daha önce değerlendirme yapılmış mı?
    const existing = await Review.findOne({ appointmentId })
    if (existing) {
      return res.status(400).json({ message: 'Bu randevu için zaten değerlendirme yapıldı' })
    }

    // Ortalama hesapla
    const averageRating = (communicationRating + expertiseRating + punctualityRating) / 3

    const review = await Review.create({
      doctorId: appointment.doctorId,
      patientId,
      appointmentId,
      communicationRating,
      expertiseRating,
      punctualityRating,
      averageRating: Math.round(averageRating * 10) / 10,
    })

    // Doktorun ortalama puanını güncelle
    const allReviews = await Review.find({ doctorId: appointment.doctorId })
    const totalAvg = allReviews.reduce((sum, r) => sum + r.averageRating, 0) / allReviews.length

    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      rating: Math.round(totalAvg * 10) / 10,
      reviewCount: allReviews.length,
    })

    return res.status(201).json({ message: 'Değerlendirme kaydedildi', review })
  } catch (error) {
    console.error('createReview hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// DOKTORUN DEĞERLENDİRMELERİ
export const getDoctorReviews = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name avatar')
      .sort({ createdAt: -1 })

    // Ortalamalar
    const stats = {
      total: reviews.length,
      averageRating: 0,
      communicationAvg: 0,
      expertiseAvg: 0,
      punctualityAvg: 0,
    }

    if (reviews.length > 0) {
      stats.averageRating = Math.round(reviews.reduce((s, r) => s + r.averageRating, 0) / reviews.length * 10) / 10
      stats.communicationAvg = Math.round(reviews.reduce((s, r) => s + r.communicationRating, 0) / reviews.length * 10) / 10
      stats.expertiseAvg = Math.round(reviews.reduce((s, r) => s + r.expertiseRating, 0) / reviews.length * 10) / 10
      stats.punctualityAvg = Math.round(reviews.reduce((s, r) => s + r.punctualityRating, 0) / reviews.length * 10) / 10
    }

    return res.status(200).json({ reviews, stats })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// DEĞERLENDİRME YAPABİLECEĞİM RANDEVULAR
export const getReviewableAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.userId

    // Tamamlanan randevular
    const completedAppointments = await Appointment.find({
      patientId,
      status: 'COMPLETED',
    }).populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' },
    })

    // Daha önce değerlendirilen randevuları çıkar
    const reviewedAppointmentIds = await Review.find({ patientId }).distinct('appointmentId')

    const reviewable = completedAppointments.filter(
      app => !reviewedAppointmentIds.some(id => id.toString() === app._id.toString())
    )

    return res.status(200).json({ appointments: reviewable })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}