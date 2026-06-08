import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/user'
import { sendPasswordResetMail } from '../config/mailer'

const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )
}

// KAYIT OL
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
    })

    const token = generateToken(user._id.toString(), user.role)

    return res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Register hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// GİRİŞ YAP
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre zorunludur' })
    }

    const user = await User.findOne({ email })
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' })
    }

    await User.findByIdAndUpdate(user._id, { isOnline: true })

    const token = generateToken(user._id.toString(), user.role)

    return res.status(200).json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Login hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// BENİ KİM
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires')
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// ÇIKIŞ
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() })
    return res.status(200).json({ message: 'Çıkış başarılı' })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// ŞİFRE SIFIRLAMA İSTEĞİ
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email zorunludur' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Güvenlik: kullanıcı yoksa da aynı mesajı ver
      return res.status(200).json({ message: 'Mail gönderildi' })
    }

    // Token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Veritabanına kaydet (1 saat geçerli)
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    })

    // Mail gönder
    await sendPasswordResetMail(user.email, user.name, resetToken)

    return res.status(200).json({ message: 'Şifre sıfırlama maili gönderildi' })
  } catch (error) {
    console.error('forgotPassword hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// ŞİFRE SIFIRLA
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token ve şifre zorunludur' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' })
    }

    // Token'ı hash'le ve veritabanında ara
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Token geçersiz veya süresi dolmuş' })
    }

    // Şifreyi güncelle
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    })

    return res.status(200).json({ message: 'Şifre başarıyla sıfırlandı' })
  } catch (error) {
    console.error('resetPassword hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}