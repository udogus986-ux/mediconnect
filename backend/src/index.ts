import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import messageRoutes from './routes/message.routes';
import { initSocket } from './socket';
import { startScheduler } from './config/scheduler'
import reviewRoutes from './routes/review.routes'
import analyticsRoutes from './routes/analytics.routes'
dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'https://mediconnect-l9up9lqui-udogus986-uxs-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}))
app.use(express.json());

connectDB();
startScheduler()
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediConnect çalışıyor!' });
});
app.use('/api/reviews', reviewRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes)
initSocket(io);

httpServer.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

export { io };
export default app;