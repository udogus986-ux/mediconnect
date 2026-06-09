import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorAPI, appointmentAPI, messageAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

interface Doctor {
  _id: string
  specialty: string
  rating: number
  consultationFee: number
  hospital: string
  experience: number
  bio: string
  isAvailable: boolean
  location: { city: string; district: string; address: string }
  workingHours: { day: string; start: string; end: string; isAvailable: boolean }[]
  userId: { _id: string; name: string; avatar?: string; isOnline: boolean }
}

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

const DoctorProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await doctorAPI.getOne(id!)
        setDoctor(res.data.doctor)
      } catch { navigate('/doctors') }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  const handleBook = async () => {
    if (!user) { navigate('/login'); return }
    if (!selectedDate || !selectedTime) { setError('Lütfen tarih ve saat seçin'); return }
    setBooking(true); setError('')
    try {
      await appointmentAPI.create({ doctorId: id!, date: selectedDate, time: selectedTime, notes })
      setBookingSuccess(true)
      setTimeout(() => { setShowBooking(false); setBookingSuccess(false) }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Randevu alınamadı')
    } finally { setBooking(false) }
  }

  const handleMessage = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const res = await messageAPI.createConversation(doctor!.userId._id)
      navigate(`/chat/${res.data.conversation._id}`)
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">emergency</span>
        <p className="text-on-surface-variant mt-2">Yükleniyor...</p>
      </div>
    </div>
  )

  if (!doctor) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 md:px-16 max-w-6xl mx-auto pb-12">

        <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6 active:scale-95">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Geri Dön
        </button>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Sol — Profil */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Ana kart */}
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-primary fade-up fade-up-1">
              <div className="flex gap-5 items-start">
                <div className="relative flex-shrink-0">
                  {doctor.userId.avatar ? (
  <img src={doctor.userId.avatar} alt="" className="w-28 h-28 rounded-2xl object-cover border-2 border-primary/20" />
) : (
  <div className="w-28 h-28 rounded-2xl bg-primary-container flex items-center justify-center text-4xl font-bold text-on-primary-container">
    {doctor.userId.name.charAt(0)}
  </div>
)}
                  {doctor.userId.isOnline && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white pulse-online" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-headline text-2xl font-bold text-on-surface">{doctor.userId.name}</h1>
                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                  </div>
                  <span className="px-3 py-1 bg-secondary-container text-primary rounded-full text-xs font-semibold inline-block mb-3">
                    {doctor.specialty}
                  </span>

                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                      <span className="font-semibold text-on-surface">{doctor.rating || '4.8'}</span>
                      <span>puan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">work</span>
                      <span>{doctor.experience} yıl deneyim</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">local_hospital</span>
                      <span>{doctor.hospital}</span>
                    </div>
                    {doctor.location?.city && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{doctor.location.district}, {doctor.location.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-5 pt-5 border-t border-outline-variant/30">
                  <h3 className="font-semibold text-sm text-on-surface mb-2">Hakkında</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </div>

            {/* Çalışma saatleri */}
            {doctor.workingHours?.length > 0 && (
              <div className="glass-card rounded-2xl p-6 fade-up fade-up-2">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  Çalışma Saatleri
                </h3>
                <div className="space-y-2">
                  {doctor.workingHours.map(wh => (
                    <div key={wh.day} className={`flex items-center justify-between p-3 rounded-xl ${wh.isAvailable ? 'bg-surface-container-low' : 'bg-surface-container/50 opacity-50'}`}>
                      <span className="text-sm font-medium text-on-surface">{wh.day}</span>
                      {wh.isAvailable ? (
                        <span className="text-sm text-primary font-semibold">{wh.start} — {wh.end}</span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Kapalı</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ — Randevu */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 fade-up fade-up-2 sticky top-24">
              <div className="text-center mb-6">
                <div className="font-headline text-3xl font-bold text-on-surface">₺{doctor.consultationFee}</div>
                <div className="text-xs text-on-surface-variant">/ seans</div>
              </div>

              {!showBooking ? (
                <div className="space-y-3">
                  <button onClick={() => { if (!user) navigate('/login'); else setShowBooking(true) }}
                    className="w-full bg-primary text-white py-3.5 rounded-full font-semibold text-sm hover:bg-primary-container transition-colors shadow-glass active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                    Randevu Al
                  </button>
                  <button onClick={handleMessage}
                    className="w-full border border-primary text-primary py-3.5 rounded-full font-semibold text-sm hover:bg-primary/5 transition-colors active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    Mesaj Gönder
                  </button>
                </div>
              ) : bookingSuccess ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                  <h3 className="font-semibold text-on-surface mb-1">Randevu Alındı!</h3>
                  <p className="text-xs text-on-surface-variant">{selectedDate} · {selectedTime}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-on-surface">Randevu Bilgileri</h3>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Tarih</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Saat</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} onClick={() => setSelectedTime(t)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                            selectedTime === t ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:bg-secondary-container'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Not (opsiyonel)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Şikayetinizi yazın..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  {error && <p className="text-xs text-error">{error}</p>}

                  <div className="flex gap-2">
                    <button onClick={() => setShowBooking(false)}
                      className="flex-1 border border-outline-variant text-on-surface-variant py-2.5 rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                      İptal
                    </button>
                    <button onClick={handleBook} disabled={booking}
                      className="flex-1 bg-primary text-white py-2.5 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 active:scale-95">
                      {booking ? 'Alınıyor...' : 'Onayla'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 p-3 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-sm text-primary" style={{fontVariationSettings:"'FILL' 1"}}>security</span>
                <span className="text-xs text-on-surface-variant">Güvenli ve şifreli görüşme</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorProfile