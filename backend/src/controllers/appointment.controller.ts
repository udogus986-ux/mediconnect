import { Request, Response } from 'express'
import Appointment from '../models/appointment'
import Doctor from '../models/doctor'
import User from '../models/user'
import Conversation from '../models/conversation'
import {
  sendNewAppointmentToDoctor,
  sendAppointmentConfirmationToPatient,
  sendAppointmentRejectedToPatient,
} from '../config/mailer'

// RANDEVU OLUŞTUR
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user.userId
    const { doctorId, date, time, notes } = req.body

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Doktor, tarih ve saat zorunludur' })
    }

    const doctor = await Doctor.findById(doctorId).populate('userId')
    if (!doctor) {
      return res.status(404).json({ message: 'Doktor bulunamadı' })
    }

    const existing = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $in: ['PENDING', 'APPROVED'] },
    })
    if (existing) {
      return res.status(400).json({ message: 'Bu saat dolu' })
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      time,
      notes,
    })

    try {
      const patient = await User.findById(patientId)
      const doctorUser = doctor.userId as any
      const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
      if (patient) {
        await sendNewAppointmentToDoctor(
          doctorUser.email, doctorUser.name, patient.name,
          formattedDate, time, notes
        )
      }
    } catch (mailError) {
      console.error('Doktora mail gönderilemedi:', mailError)
    }

    return res.status(201).json({ message: 'Randevu oluşturuldu', appointment })
  } catch (error) {
    console.error('createAppointment hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// KENDİ RANDEVULARIM
export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const role = (req as any).user.role

    let appointments

    if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId })
      if (!doctor) return res.status(404).json({ message: 'Doktor profili bulunamadı' })
      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'name email avatar')
        .sort({ date: 1 })
    } else {
      appointments = await Appointment.find({ patientId: userId })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email avatar' },
        })
        .sort({ date: 1 })
    }

    return res.status(200).json({ appointments })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// RANDEVU DURUMU GÜNCELLE (doktor)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' })
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' })
    }

    if (status === 'APPROVED') {
      const doctor = await Doctor.findById(appointment.doctorId)
      if (doctor) {
        const existingConversation = await Conversation.findOne({
          participants: { $all: [appointment.patientId, doctor.userId] },
        })
        if (!existingConversation) {
          await Conversation.create({
            participants: [appointment.patientId, doctor.userId],
            appointmentId: appointment._id,
          })
        }
      }
    }

    try {
      const patient = await User.findById(appointment.patientId)
      const doctor = await Doctor.findById(appointment.doctorId).populate('userId')
      if (patient && doctor) {
        const doctorUser = doctor.userId as any
        const formattedDate = new Date(appointment.date).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        if (status === 'APPROVED') {
          await sendAppointmentConfirmationToPatient(
            patient.email, patient.name, doctorUser.name,
            formattedDate, appointment.time, doctor.specialty
          )
        } else if (status === 'REJECTED') {
          await sendAppointmentRejectedToPatient(
            patient.email, patient.name, doctorUser.name,
            formattedDate, appointment.time
          )
        }
      }
    } catch (mailError) {
      console.error('Mail gönderilemedi:', mailError)
    }

    return res.status(200).json({ message: 'Randevu güncellendi', appointment })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// RANDEVU İPTAL ET (hasta)
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.userId

    const appointment = await Appointment.findOne({
      _id: id,
      patientId: userId,
      status: { $in: ['PENDING', 'APPROVED'] },
    })

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı veya iptal edilemez' })
    }

    appointment.status = 'CANCELLED'
    await appointment.save()

    return res.status(200).json({ message: 'Randevu iptal edildi' })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}