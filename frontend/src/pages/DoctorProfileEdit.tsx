import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const SPECIALTIES = ['Kardiyoloji', 'Nöroloji', 'Dermatoloji', 'Pediatri', 'Ortopedi', 'Göz Hastalıkları', 'Psikiyatri', 'Genel Dahiliye', 'Kulak Burun Boğaz', 'Üroloji', 'Jinekologi', 'Diğer']
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Diğer']
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const DoctorProfileEdit = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    specialty: '',
    experience: '',
    bio: '',
    hospital: '',
    consultationFee: '',
    city: '',
    district: '',
    address: '',
    workingHours: DAYS.map(day => ({
      day,
      start: '09:00',
      end: '17:00',
      isAvailable: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].includes(day),
    })),
  })

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') { navigate('/dashboard'); return }
    const fetchProfile = async () => {
      try {
        // Kendi doktor profilini getir
        const res = await doctorAPI.getAll()
        // Mevcut kullanıcının profilini bul
        const myProfile = res.data.doctors.find((d: any) => d.userId._id === user.id || d.userId === user.id)
        if (myProfile) {
          setForm({
            specialty: myProfile.specialty || '',
            experience: String(myProfile.experience || ''),
            bio: myProfile.bio || '',
            hospital: myProfile.hospital || '',
            consultationFee: String(myProfile.consultationFee || ''),
            city: myProfile.location?.city || '',
            district: myProfile.location?.district || '',
            address: myProfile.location?.address || '',
            workingHours: myProfile.workingHours?.length > 0 ? myProfile.workingHours : DAYS.map(day => ({
              day, start: '09:00', end: '17:00',
              isAvailable: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].includes(day),
            })),
          })
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchProfile()
  }, [user])

  const updateForm = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }))

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...form.workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setForm(p => ({ ...p, workingHours: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      await doctorAPI.updateProfile({
        specialty: form.specialty,
        experience: Number(form.experience),
        bio: form.bio,
        hospital: form.hospital,
        consultationFee: Number(form.consultationFee),
        location: {
          city: form.city,
          district: form.district,
          address: form.address,
          coordinates: { lat: 0, lng: 0 },
        },
        workingHours: form.workingHours,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil güncellenemedi')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">emergency</span>
        <p className="text-on-surface-variant mt-2">Yükleniyor...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 md:px-16 max-w-3xl mx-auto pb-12">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Geri
          </button>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Profilimi Düzenle</h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>{error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm fade-up">
            <span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
            Profil başarıyla güncellendi!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Temel Bilgiler */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>stethoscope</span>
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Uzmanlık</label>
                <select value={form.specialty} onChange={e => updateForm('specialty', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Seçin</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Deneyim (Yıl)</label>
                <input type="number" min="0" value={form.experience} onChange={e => updateForm('experience', e.target.value)}
                  placeholder="10" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Hastane / Klinik</label>
                <input type="text" value={form.hospital} onChange={e => updateForm('hospital', e.target.value)}
                  placeholder="Acıbadem Hastanesi" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Konsültasyon Ücreti (₺)</label>
                <input type="number" min="0" value={form.consultationFee} onChange={e => updateForm('consultationFee', e.target.value)}
                  placeholder="500" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Biyografi</label>
                <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)}
                  placeholder="Kendinizi hastalara tanıtın..." rows={4}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Konum */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>location_on</span>
              Konum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Şehir</label>
                <select value={form.city} onChange={e => updateForm('city', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Seçin</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">İlçe</label>
                <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)}
                  placeholder="Kadıköy" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Açık Adres</label>
                <textarea value={form.address} onChange={e => updateForm('address', e.target.value)}
                  placeholder="Mahalle, cadde, bina no..." rows={2}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>schedule</span>
              Çalışma Saatleri
            </h2>
            <div className="space-y-3">
              {form.workingHours.map((wh, i) => (
                <div key={wh.day} className={`p-4 rounded-xl border transition-all ${wh.isAvailable ? 'border-primary/30 bg-primary/5' : 'border-outline-variant bg-surface-container-low opacity-60'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={wh.isAvailable}
                          onChange={e => updateWorkingHour(i, 'isAvailable', e.target.checked)}
                          className="sr-only peer" />
                        <div className="w-10 h-6 bg-outline-variant peer-checked:bg-primary rounded-full transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </label>
                      <span className="font-medium text-sm text-on-surface">{wh.day}</span>
                    </div>
                    {wh.isAvailable && (
                      <div className="flex items-center gap-2">
                        <input type="time" value={wh.start} onChange={e => updateWorkingHour(i, 'start', e.target.value)}
                          className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        <span className="text-on-surface-variant text-sm">—</span>
                        <input type="time" value={wh.end} onChange={e => updateWorkingHour(i, 'end', e.target.value)}
                          className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-container transition-colors shadow-glass active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? (
              <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Kaydediliyor...</>
            ) : (
              <><span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>save</span>Değişiklikleri Kaydet</>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}

export default DoctorProfileEdit