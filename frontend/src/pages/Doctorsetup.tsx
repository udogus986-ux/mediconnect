import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorAPI, locationAPI, hospitalAPI } from '../api'
import Navbar from '../components/Navbar'

const SPECIALTIES = ['Kardiyoloji', 'Nöroloji', 'Dermatoloji', 'Pediatri', 'Ortopedi', 'Göz Hastalıkları', 'Psikiyatri', 'Genel Dahiliye', 'Kulak Burun Boğaz', 'Üroloji', 'Jinekoloji', 'Diğer']
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const DoctorSetup = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [avatar, setAvatar] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [consultationFee, setConsultationFee] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [hospital, setHospital] = useState('')
  const [hospitalNotFound, setHospitalNotFound] = useState(false)
  const [hospitalManual, setHospitalManual] = useState('')

  const [cities, setCities] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [hospitals, setHospitals] = useState<{ id: number; name: string }[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingHospitals, setLoadingHospitals] = useState(false)

  const [workingHours, setWorkingHours] = useState(
    DAYS.map(day => ({ day, start: '09:00', end: '17:00', isAvailable: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].includes(day) }))
  )

  const totalSteps = 4

  // İlleri yükle (3. adıma gelinince)
  useEffect(() => {
    if (step === 3 && cities.length === 0) {
      setLoadingCities(true)
      locationAPI.getCities()
        .then(res => setCities(res.data.cities || []))
        .catch(() => setCities([]))
        .finally(() => setLoadingCities(false))
    }
  }, [step])

  const handleCityChange = async (val: string) => {
    setCity(val); setDistrict(''); setDistricts([]); setHospital(''); setHospitals([])
    if (!val) return
    setLoadingDistricts(true)
    locationAPI.getDistricts(val)
      .then(res => setDistricts(res.data.districts || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false))
  }

  const handleDistrictChange = async (val: string) => {
    setDistrict(val); setHospital(''); setHospitals([])
    if (!city) return
    setLoadingHospitals(true)
    hospitalAPI.search(city, val || undefined)
      .then(res => setHospitals(res.data.hospitals || []))
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHospitals(false))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setWorkingHours(updated)
  }

  const canNext = () => {
    if (step === 1) return specialty && experience && consultationFee
    if (step === 2) return bio
    if (step === 3) return city && address && (hospitalNotFound ? hospitalManual : hospital)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      await doctorAPI.createProfile({
        specialty, experience: Number(experience), bio,
        hospital: hospitalNotFound ? hospitalManual : hospital,
        consultationFee: Number(consultationFee),
        location: { city, district, address, coordinates: { lat: 0, lng: 0 } },
        workingHours,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil oluşturulamadı')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 max-w-2xl mx-auto pb-12">

        <div className="text-center mb-8 fade-up fade-up-1">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Profilinizi Oluşturun</h1>
          <p className="text-on-surface-variant text-sm">Hastalar sizi daha kolay bulabilsin</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < totalSteps - 1 && <div className={`w-12 h-1 rounded transition-all ${step > i + 1 ? 'bg-green-500' : 'bg-outline-variant'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>{error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>stethoscope</span>
                Temel Bilgiler
              </h2>

              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-on-surface">Profil Fotoğrafı</p>
                  <p className="text-xs text-on-surface-variant mb-1">Opsiyonel · JPG veya PNG</p>
                  <span className="text-xs text-primary font-semibold">{avatar ? 'Değiştir' : 'Fotoğraf Ekle'}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Uzmanlık *</label>
                <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Seçin</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Deneyim (Yıl) *</label>
                  <input type="number" min="0" value={experience} onChange={e => setExperience(e.target.value)}
                    placeholder="10" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Ücret (₺) *</label>
                  <input type="number" min="0" value={consultationFee} onChange={e => setConsultationFee(e.target.value)}
                    placeholder="500" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                Hakkınızda
              </h2>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Biyografi *</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Uzmanlık alanlarınız, eğitiminiz ve deneyimleriniz hakkında bilgi verin..."
                  rows={8} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
                <p className="text-xs text-on-surface-variant mt-1">{bio.length} karakter</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>location_on</span>
                Konum & Hastane
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                    Şehir * {loadingCities && <span className="text-primary normal-case font-normal">Yükleniyor...</span>}
                  </label>
                  <select value={city} onChange={e => handleCityChange(e.target.value)}
                    disabled={loadingCities}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                    <option value="">Seçin</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                    İlçe {loadingDistricts && <span className="text-primary normal-case font-normal">Yükleniyor...</span>}
                  </label>
                  <select value={district} onChange={e => handleDistrictChange(e.target.value)}
                    disabled={!city || loadingDistricts}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                    <option value="">Seçin</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Açık Adres *</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Mahalle, cadde, bina no..." rows={2}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Hastane / Klinik * {loadingHospitals && <span className="text-primary normal-case font-normal">Yükleniyor...</span>}
                </label>
                {!hospitalNotFound ? (
                  <select value={hospital} onChange={e => setHospital(e.target.value)}
                    disabled={!city}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                    <option value="">Seçin</option>
                    {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                ) : (
                  <input type="text" value={hospitalManual} onChange={e => setHospitalManual(e.target.value)}
                    placeholder="Hastane veya klinik adını yazın..."
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                )}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={hospitalNotFound}
                    onChange={e => { setHospitalNotFound(e.target.checked); if (!e.target.checked) setHospitalManual('') }}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-on-surface-variant">Listede kliniğim veya hastanem yok, manuel gireceğim</span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>schedule</span>
                Çalışma Saatleri
              </h2>
              <div className="space-y-3">
                {workingHours.map((wh, i) => (
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
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as any)}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                ← Geri
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={() => setStep(s => (s + 1) as any)} disabled={!canNext()}
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

          {step === 1 && (
            <p className="text-center text-xs text-on-surface-variant mt-4">
              <button onClick={() => navigate('/dashboard')} className="hover:underline">Şimdilik atla</button>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default DoctorSetup