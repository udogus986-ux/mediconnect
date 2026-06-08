import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export const sendAppointmentConfirmationToPatient = async (
  patientEmail: string, patientName: string, doctorName: string,
  date: string, time: string, specialty: string
) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: patientEmail,
    subject: '✅ Randevunuz Onaylandı — MediConnect',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f7fafa;padding:32px;border-radius:16px;">
        <h1 style="color:#00545e;text-align:center;">🏥 MediConnect</h1>
        <div style="background:white;border-radius:12px;padding:32px;border-left:4px solid #00545e;">
          <h2 style="color:#181c1d;margin-top:0;">Randevunuz Onaylandı! ✅</h2>
          <p>Merhaba <strong>${patientName}</strong>,</p>
          <p>Randevunuz başarıyla onaylandı:</p>
          <div style="background:#f1f4f5;border-radius:8px;padding:20px;margin:20px 0;">
            <p><strong>Doktor:</strong> ${doctorName}</p>
            <p><strong>Uzmanlık:</strong> ${specialty}</p>
            <p><strong>Tarih:</strong> ${date}</p>
            <p><strong>Saat:</strong> ${time}</p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00545e;color:white;padding:12px 32px;border-radius:24px;text-decoration:none;font-weight:600;">
              Dashboard'a Git
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export const sendNewAppointmentToDoctor = async (
  doctorEmail: string, doctorName: string, patientName: string,
  date: string, time: string, notes?: string
) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: doctorEmail,
    subject: '📅 Yeni Randevu Talebi — MediConnect',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f7fafa;padding:32px;border-radius:16px;">
        <h1 style="color:#00545e;text-align:center;">🏥 MediConnect</h1>
        <div style="background:white;border-radius:12px;padding:32px;border-left:4px solid #d97706;">
          <h2 style="color:#181c1d;margin-top:0;">Yeni Randevu Talebi 📅</h2>
          <p>Merhaba <strong>${doctorName}</strong>,</p>
          <p><strong>⚠️ 2 saat içinde onaylamazsanız otomatik onaylanacaktır.</strong></p>
          <div style="background:#fef3c7;border-radius:8px;padding:20px;margin:20px 0;">
            <p><strong>Hasta:</strong> ${patientName}</p>
            <p><strong>Tarih:</strong> ${date}</p>
            <p><strong>Saat:</strong> ${time}</p>
            ${notes ? `<p><strong>Not:</strong> ${notes}</p>` : ''}
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00545e;color:white;padding:12px 32px;border-radius:24px;text-decoration:none;font-weight:600;">
              Onayla / Reddet
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export const sendAppointmentRejectedToPatient = async (
  patientEmail: string, patientName: string, doctorName: string,
  date: string, time: string
) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: patientEmail,
    subject: '❌ Randevu Talebi Reddedildi — MediConnect',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f7fafa;padding:32px;border-radius:16px;">
        <div style="background:white;border-radius:12px;padding:32px;border-left:4px solid #dc2626;">
          <h2>Randevu Talebi Reddedildi ❌</h2>
          <p>Merhaba <strong>${patientName}</strong>,</p>
          <p><strong>${doctorName}</strong> ile ${date} tarihli ${time} saatindeki randevu talebiniz reddedildi.</p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.CLIENT_URL}/doctors" style="background:#00545e;color:white;padding:12px 32px;border-radius:24px;text-decoration:none;font-weight:600;">
              Doktor Bul
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export const sendPasswordResetMail = async (
  email: string, name: string, resetToken: string
) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: '🔐 Şifre Sıfırlama — MediConnect',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f7fafa;padding:32px;border-radius:16px;">
        <div style="background:white;border-radius:12px;padding:32px;border-left:4px solid #00545e;">
          <h2>Şifre Sıfırlama 🔐</h2>
          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. <strong style="color:#dc2626;">Link 1 saat geçerlidir.</strong></p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${resetUrl}" style="background:#00545e;color:white;padding:12px 32px;border-radius:24px;text-decoration:none;font-weight:600;">
              Şifremi Sıfırla
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export default transporter