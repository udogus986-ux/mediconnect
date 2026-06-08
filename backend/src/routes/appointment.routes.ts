import { Router } from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointment.controller';
import { authenticate, authorizeDoctor } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.put('/:id/status', authorizeDoctor, updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

export default router;