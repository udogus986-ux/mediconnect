import { Router } from 'express'
import { getDoctors, getDoctor, createDoctorProfile, updateDoctorProfile, getNearbyDoctors } from '../controllers/doctor.controller'
import { authenticate, authorizeDoctor } from '../middleware/auth.middleware'
import Doctor from '../models/doctor'

const router = Router()

// /my — :id'den önce gelmeli
router.get('/my', authenticate, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const doctor = await Doctor.findOne({ userId }).populate('userId', 'name email avatar isOnline lastSeen')
    if (!doctor) return res.status(404).json({ message: 'Profil bulunamadı' })
    return res.status(200).json({ doctor })
  } catch {
    return res.status(500).json({ message: 'Sunucu hatası' })
  }
})

router.get('/', getDoctors)
router.get('/nearby', getNearbyDoctors)
router.get('/:id', getDoctor)
router.post('/', authenticate, authorizeDoctor, createDoctorProfile)
router.put('/', authenticate, authorizeDoctor, updateDoctorProfile)

export default router