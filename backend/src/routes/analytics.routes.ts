import { Router } from 'express'
import { getDoctorAnalytics } from '../controllers/analytics.controller'
import { authenticate, authorizeDoctor } from '../middleware/auth.middleware'

const router = Router()

router.get('/doctor', authenticate, authorizeDoctor, getDoctorAnalytics)

export default router