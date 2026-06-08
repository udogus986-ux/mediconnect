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

// Türkiye illeri
app.get('/api/cities', async (req, res) => {
  try {
    const query = `[out:json][timeout:30];area["ISO3166-1"="TR"]["admin_level"="2"]->.tr;relation["admin_level"="4"](area.tr);out tags;`
    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    if (text.trim().startsWith('<')) return res.json({ cities: [] })
    const data = JSON.parse(text) as any
    const cities = (data.elements || [])
      .map((el: any) => el.tags?.name)
      .filter(Boolean)
      .sort()
    res.json({ cities })
  } catch (error) {
    console.error('Cities hatası:', error)
    res.json({ cities: [] })
  }
})

// İlçeler
app.get('/api/districts', async (req, res) => {
  try {
    const { city } = req.query
    if (!city) return res.json({ districts: [] })
    const query = `[out:json][timeout:30];area["name"="${city}"]["admin_level"="4"]->.il;relation["admin_level"="6"](area.il);out tags;`
    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    if (text.trim().startsWith('<')) return res.json({ districts: [] })
    const data = JSON.parse(text) as any
    const districts = (data.elements || [])
      .map((el: any) => el.tags?.name)
      .filter(Boolean)
      .sort()
    res.json({ districts })
  } catch (error) {
    console.error('Districts hatası:', error)
    res.json({ districts: [] })
  }
})

// Hastane/klinik arama
app.get('/api/hospitals', async (req, res) => {
  try {
    const { city, district } = req.query
    if (!city) return res.json({ hospitals: [] })
    const searchArea = district || city
    const query = `[out:json][timeout:25];area["name"="${searchArea}"]["admin_level"~"4|6"]->.searchArea;(node["amenity"="hospital"](area.searchArea);way["amenity"="hospital"](area.searchArea);node["amenity"="clinic"](area.searchArea);way["amenity"="clinic"](area.searchArea););out center;`
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
      .map((el: any) => ({ id: el.id, name: el.tags.name, type: el.tags.amenity || 'hospital' }))
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
    const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng});way["amenity"="clinic"](around:${radius},${lat},${lng}););out center;`
    const response = await nodeFetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const text = await response.text()
    if (text.trim().startsWith('<')) return res.json({ elements: [] })
    const data = JSON.parse(text)
    res.json(data)
  } catch (error) {
    console.error('Nearby hatası:', error)
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