import cron from 'node-cron'
import Appointment from '../models/appointment'
import Doctor from '../models/doctor'
import User from '../models/user'
import { sendAppointmentConfirmationToPatient } from './mailer'

// Her 5 dakikada bir çalışır
// 2 saat içinde onaylanmayan randevuları otomatik onaylar
export const startScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

      // 2 saatten fazla bekleyen randevuları bul
      const pendingAppointments = await Appointment.find({
        status: 'PENDING',
        createdAt: { $lte: twoHoursAgo },
      })

      for (const appointment of pendingAppointments) {
        // Otomatik onayla
        appointment.status = 'APPROVED'
        await appointment.save()

        // Hasta bilgilerini al
        const patient = await User.findById(appointment.patientId)
        const doctor = await Doctor.findById(appointment.doctorId).populate('userId')

        if (patient && doctor) {
          const doctorUser = doctor.userId as any
          const formattedDate = new Date(appointment.date).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })

          // Hastaya otomatik onay maili gönder
          await sendAppointmentConfirmationToPatient(
            patient.email,
            patient.name,
            doctorUser.name,
            formattedDate,
            appointment.time,
            doctor.specialty
          )

          console.log(`⏰ Otomatik onay: ${patient.name} - ${formattedDate} ${appointment.time}`)
        }
      }
    } catch (error) {
      console.error('Scheduler hatası:', error)
    }
  })

  console.log('✅ Otomatik onay scheduler başlatıldı (her 5 dakikada çalışır)')
}