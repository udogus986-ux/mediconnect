import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import nodeFetch from 'node-fetch'
import connectDB from './config/database'
import authRoutes from './routes/auth.routes'
import doctorRoutes from './routes/doctor.routes'
import appointmentRoutes from './routes/appointment.routes'
import messageRoutes from './routes/message.routes'
import reviewRoutes from './routes/review.routes'
import analyticsRoutes from './routes/analytics.routes'
import { initSocket } from './socket'
import { startScheduler } from './config/scheduler'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

const PORT = process.env.PORT || 5001

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())

connectDB()
startScheduler()

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediConnect çalışıyor!' })
})

app.get('/api/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query
    if (!lat || !lng) return res.status(400).json({ message: 'lat ve lng gerekli' })

    const radius = 5000
    const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng});way["amenity"="clinic"](around:${radius},${lat},${lng});node["healthcare"="hospital"](around:${radius},${lat},${lng});node["healthcare"="clinic"](around:${radius},${lat},${lng}););out center;`

    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    const data = JSON.parse(text)
    res.json(data)
  } catch (error) {
    console.error('Overpass proxy hatası:', error)
    res.status(500).json({ elements: [] })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/analytics', analyticsRoutes)

initSocket(io)

httpServer.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`)
})

export { io }
export default app