import { Request, Response } from 'express'
import Doctor from '../models/doctor'
import User from '../models/user'

// TÜM DOKTORLARI GETİR
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { specialty, city, search } = req.query

    const filter: any = {}
    if (specialty) filter.specialty = specialty
    if (city) filter['location.city'] = city

    // Eğer giriş yapmış kullanıcı doktorsa kendini listeden çıkar
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken')
        const token = authHeader.split(' ')[1]
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET as string) as any
        if (decoded.role === 'DOCTOR') {
          const requesterDoctor = await Doctor.findOne({ userId: decoded.userId })
          if (requesterDoctor) {
            filter._id = { $ne: requesterDoctor._id }
          }
        }
      } catch {}
    }

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email avatar isOnline lastSeen')
      .sort({ rating: -1 })

    const filtered = search
      ? doctors.filter(d => {
          const user = d.userId as any
          return (
            user.name.toLowerCase().includes((search as string).toLowerCase()) ||
            d.specialty.toLowerCase().includes((search as string).toLowerCase()) ||
            d.hospital?.toLowerCase().includes((search as string).toLowerCase())
          )
        })
      : doctors

    return res.status(200).json({ doctors: filtered })
  } catch (error) {
    console.error('getDoctors hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// TEK DOKTOR GETİR
export const getDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const doctor = await Doctor.findById(id)
      .populate('userId', 'name email avatar isOnline lastSeen')
    if (!doctor) return res.status(404).json({ message: 'Doktor bulunamadı' })
    return res.status(200).json({ doctor })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// DOKTOR PROFİLİ OLUŞTUR
export const createDoctorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { specialty, experience, bio, hospital, location, workingHours, consultationFee } = req.body

    const existing = await Doctor.findOne({ userId })
    if (existing) return res.status(400).json({ message: 'Doktor profili zaten mevcut' })

    const doctor = await Doctor.create({
      userId, specialty, experience, bio,
      hospital, location, workingHours, consultationFee,
    })

    return res.status(201).json({ message: 'Profil oluşturuldu', doctor })
  } catch (error) {
    console.error('createDoctorProfile hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// DOKTOR PROFİLİ GÜNCELLE
export const updateDoctorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const doctor = await Doctor.findOneAndUpdate(
      { userId },
      { ...req.body },
      { new: true }
    ).populate('userId', 'name email avatar isOnline')

    if (!doctor) return res.status(404).json({ message: 'Doktor profili bulunamadı' })
    return res.status(200).json({ message: 'Profil güncellendi', doctor })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}

// YAKINDAKI DOKTORLAR
export const getNearbyDoctors = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 10 } = req.query

    if (!lat || !lng) return res.status(400).json({ message: 'Koordinat gerekli' })

    const doctors = await Doctor.find({
      'location.coordinates.lat': {
        $gte: Number(lat) - Number(radius) / 111,
        $lte: Number(lat) + Number(radius) / 111,
      },
      'location.coordinates.lng': {
        $gte: Number(lng) - Number(radius) / 111,
        $lte: Number(lng) + Number(radius) / 111,
      },
    }).populate('userId', 'name email avatar isOnline')

    return res.status(200).json({ doctors })
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
}