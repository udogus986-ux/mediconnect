import { Router } from 'express'
import {
  getDoctors, getDoctor, createDoctorProfile,
  updateDoctorProfile, getNearbyDoctors,
} from '../controllers/doctor.controller'
import { authenticate, authorizeDoctor } from '../middleware/auth.middleware'

const router = Router()

// Opsiyonel auth — token varsa kullan, yoksa da çalışsın
router.get('/', getDoctors)
router.get('/nearby', getNearbyDoctors)
router.get('/:id', getDoctor)
router.post('/', authenticate, authorizeDoctor, createDoctorProfile)
router.put('/', authenticate, authorizeDoctor, updateDoctorProfile)

export default router