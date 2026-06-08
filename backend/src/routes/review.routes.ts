import { Router } from 'express'
import { createReview, getDoctorReviews, getReviewableAppointments } from '../controllers/review.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, createReview)
router.get('/reviewable', authenticate, getReviewableAppointments)
router.get('/doctor/:doctorId', getDoctorReviews)

export default router