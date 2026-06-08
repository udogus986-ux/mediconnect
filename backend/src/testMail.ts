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

transporter.sendMail({
  from: process.env.MAIL_FROM,
  to: process.env.MAIL_USER,
  subject: 'Test Mail',
  text: 'MediConnect mail çalışıyor!',
}).then(() => {
  console.log('✅ Mail gönderildi!')
}).catch((err) => {
  console.error('❌ Mail hatası:', err.message)
})