import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const SPECIALTIES = ['Kardiyoloji', 'Nöroloji', 'Dermatoloji', 'Pediatri', 'Ortopedi', 'Göz Hastalıkları', 'Psikiyatri', 'Genel Dahiliye', 'Kulak Burun Boğaz', 'Üroloji', 'Jinekologi', 'Ortopedi', 'Diğer']
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Diğer']
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const DoctorSetup = () => {
  const { } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const totalSteps = 4

  const updateForm = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }))

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...form.workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setForm(p => ({ ...p, workingHours: updated }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await doctorAPI.createProfile({
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
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 1) return form.specialty && form.experience && form.hospital
    if (step === 2) return form.bio
    if (step === 3) return form.city && form.district && form.address
    return true
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 max-w-2xl mx-auto pb-12">

        {/* Başlık */}
        <div className="text-center mb-8 fade-up fade-up-1">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">
            Doktor Profilinizi Oluşturun
          </h1>
          <p className="text-on-surface-variant text-sm">
            Hastalar sizi daha kolay bulabilsin
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 fade-up fade-up-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-primary text-white' :
                'bg-surface-container text-on-surface-variant'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-12 h-1 rounded transition-all ${step > i + 1 ? 'bg-green-500' : 'bg-outline-variant'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Kart */}
        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">

          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* ADIM 1 — Temel Bilgiler */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>stethoscope</span>
                Temel Bilgiler
              </h2>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Uzmanlık Alanı *</label>
                <select value={form.specialty} onChange={e => updateForm('specialty', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Seçin</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Deneyim (Yıl) *</label>
                <input type="number" min="0" max="60" value={form.experience}
                  onChange={e => updateForm('experience', e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Hastane / Klinik *</label>
                <input type="text" value={form.hospital}
                  onChange={e => updateForm('hospital', e.target.value)}
                  placeholder="Acıbadem Hastanesi"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Konsültasyon Ücreti (₺) *</label>
                <input type="number" min="0" value={form.consultationFee}
                  onChange={e => updateForm('consultationFee', e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
          )}

          {/* ADIM 2 — Hakkında */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                Hakkınızda
              </h2>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Biyografi *
                  <span className="normal-case ml-2 text-on-surface-variant font-normal">Kendinizi hastalara tanıtın</span>
                </label>
                <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)}
                  placeholder="Uzmanlık alanlarınız, eğitiminiz ve deneyimleriniz hakkında bilgi verin..."
                  rows={6}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
                <p className="text-xs text-on-surface-variant mt-1">{form.bio.length} karakter</p>
              </div>
            </div>
          )}

          {/* ADIM 3 — Konum */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>location_on</span>
                Konum Bilgileri
              </h2>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Şehir *</label>
                <select value={form.city} onChange={e => updateForm('city', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Seçin</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">İlçe *</label>
                <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)}
                  placeholder="Kadıköy"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Açık Adres *</label>
                <textarea value={form.address} onChange={e => updateForm('address', e.target.value)}
                  placeholder="Mahalle, cadde, sokak, bina no..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
            </div>
          )}

          {/* ADIM 4 — Çalışma Saatleri */}
          {step === 4 && (
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
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
                          <input type="time" value={wh.start}
                            onChange={e => updateWorkingHour(i, 'start', e.target.value)}
                            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          <span className="text-on-surface-variant text-sm">—</span>
                          <input type="time" value={wh.end}
                            onChange={e => updateWorkingHour(i, 'end', e.target.value)}
                            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1 as any)}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                ← Geri
              </button>
            )}

            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1 as any)}
                disabled={!canNext()}
                className="flex-1 bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 active:scale-95">
                Devam Et →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Kaydediliyor...</>
                ) : (
                  <><span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>Profili Tamamla</>
                )}
              </button>
            )}
          </div>

          {/* Atla */}
          {step === 1 && (
            <p className="text-center text-xs text-on-surface-variant mt-4">
              <button onClick={() => navigate('/dashboard')} className="hover:underline">
                Şimdilik atla, daha sonra tamamla
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default DoctorSetup