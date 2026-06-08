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
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } })
const PORT = process.env.PORT || 5001

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.includes('vercel.app') || origin.includes('localhost')) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
connectDB()
startScheduler()

app.get('/health', (req, res) => res.json({ status: 'OK' }))

// Hastane/klinik arama — şehir+ilçe bazlı
app.get('/api/hospitals', async (req, res) => {
  try {
    const { city, district } = req.query
    if (!city) return res.json({ hospitals: [] })

    // İlçe varsa ilçeyle, yoksa şehirle ara
    const areaName = district || city

    const query = `
[out:json][timeout:30];
area["name"="${areaName}"]["admin_level"~"4|6|7|8"]->.searchArea;
(
  node["amenity"="hospital"](area.searchArea);
  node["amenity"="clinic"](area.searchArea);
  node["healthcare"="hospital"](area.searchArea);
  node["healthcare"="clinic"](area.searchArea);
  way["amenity"="hospital"](area.searchArea);
  way["amenity"="clinic"](area.searchArea);
);
out center tags;`

    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    if (text.trim().startsWith('<')) return res.json({ hospitals: [] })

    const data = JSON.parse(text) as any
    const hospitals = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.healthcare || 'hospital',
        address: [
          el.tags['addr:street'],
          el.tags['addr:housenumber'],
        ].filter(Boolean).join(' ') || '',
        lat: el.lat || el.center?.lat || null,
        lng: el.lon || el.center?.lon || null,
      }))
      .filter((h: any, i: number, arr: any[]) =>
        arr.findIndex((x: any) => x.name === h.name) === i
      ) // Tekrar edenleri kaldır

    res.json({ hospitals })
  } catch (error) {
    console.error('Hospitals hatası:', error)
    res.json({ hospitals: [] })
  }
})

// Overpass yakın yerler proxy
app.get('/api/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query
    if (!lat || !lng) return res.status(400).json({ message: 'lat ve lng gerekli' })
    const radius = 5000
    const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng});way["amenity"="clinic"](around:${radius},${lat},${lng}););out center tags;`
    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    if (text.trim().startsWith('<')) return res.json({ elements: [] })
    res.json(JSON.parse(text))
  } catch (error) {
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
httpServer.listen(PORT, () => console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`))

export { io }
export default app