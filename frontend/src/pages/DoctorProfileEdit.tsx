import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorAPI, hospitalAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getCities, getDistricts } from '../data/Turkey'

const SPECIALTIES = ['Kardiyoloji','Nöroloji','Dermatoloji','Pediatri','Ortopedi','Göz Hastalıkları','Psikiyatri','Genel Dahiliye','Kulak Burun Boğaz','Üroloji','Jinekoloji','Diğer']
const DAYS = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar']

interface Hospital { id: number; name: string; type: string; address?: string }

const DoctorProfileEdit = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarChanged, setAvatarChanged] = useState(false)
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
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [workingHours, setWorkingHours] = useState(
    DAYS.map(day => ({ day, start: '09:00', end: '17:00', isAvailable: ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma'].includes(day) }))
  )

  // Refs for field error scroll
  const specialtyRef = useRef<HTMLDivElement>(null)
  const bioRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)
  const hospitalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') { navigate('/dashboard'); return }
    const fetchProfile = async () => {
      try {
        const res = await doctorAPI.getMyProfile()
        const myProfile = res.data.doctor
        if (myProfile) {
          setSpecialty(myProfile.specialty || '')
          setExperience(String(myProfile.experience || ''))
          setBio(myProfile.bio || '')
          setConsultationFee(String(myProfile.consultationFee || ''))
          const profileCity = myProfile.location?.city || ''
          const profileDistrict = myProfile.location?.district || ''
          setCity(profileCity)
          setDistrict(profileDistrict)
          setAddress(myProfile.location?.address || '')
          setHospital(myProfile.hospital || '')
          if (myProfile.workingHours?.length > 0) setWorkingHours(myProfile.workingHours)
          const userAvatar = (myProfile.userId as any)?.avatar
          if (userAvatar) setAvatar(userAvatar)
          if (profileCity) {
            setLoadingHospitals(true)
            hospitalAPI.search(profileCity, profileDistrict || undefined)
              .then(r => setHospitals(r.data.hospitals || []))
              .catch(() => setHospitals([]))
              .finally(() => setLoadingHospitals(false))
          }
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchProfile()
  }, [user])

  // Hata olunca scroll
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  // Alan hataları
  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return
    const firstErrorKey = Object.keys(fieldErrors)[0]
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      specialty: specialtyRef,
      bio: bioRef,
      city: cityRef,
      hospital: hospitalRef,
    }
    const ref = refMap[firstErrorKey]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [fieldErrors])

  const handleCityChange = (val: string) => {
    setCity(val); setDistrict(''); setHospital(''); setHospitals([])
    setFieldErrors(prev => ({ ...prev, city: '' }))
    if (!val) return
    setLoadingHospitals(true)
    hospitalAPI.search(val)
      .then(r => setHospitals(r.data.hospitals || []))
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHospitals(false))
  }

  const handleDistrictChange = (val: string) => {
    setDistrict(val); setHospital('')
    if (!city) return
    setLoadingHospitals(true)
    hospitalAPI.search(city, val || undefined)
      .then(r => setHospitals(r.data.hospitals || []))
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHospitals(false))
  }

  const handleHospitalChange = (val: string) => {
    setHospital(val)
    setFieldErrors(prev => ({ ...prev, hospital: '' }))
    const selected = hospitals.find(h => h.name === val)
    if (selected?.address) setAddress(selected.address)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Fotoğraf 5MB\'dan küçük olmalı'); return }
    setAvatarChanged(true)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setWorkingHours(updated)
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!specialty) errors.specialty = 'Uzmanlık alanı zorunludur'
    if (!bio) errors.bio = 'Biyografi zorunludur'
    if (!city) errors.city = 'Şehir zorunludur'
    if (!hospitalNotFound && !hospital) errors.hospital = 'Hastane seçiniz veya manuel giriniz'
    if (hospitalNotFound && !hospitalManual) errors.hospital = 'Hastane adını giriniz'
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSaving(true)
    try {
      const payload: any = {
        specialty, experience: Number(experience), bio,
        hospital: hospitalNotFound ? hospitalManual : hospital,
        consultationFee: Number(consultationFee),
        location: { city, district, address, coordinates: { lat: 0, lng: 0 } },
        workingHours,
      }
      if (avatarChanged && avatar) payload.avatarBase64 = avatar

      await doctorAPI.updateProfile(payload)

      // Avatar güncellendiyse AuthContext'te de güncelle
      if (avatarChanged && avatar) updateUser({ avatar })

      // Dashboard'a git, bildirim göster
      navigate('/dashboard', { state: { successMessage: 'Profiliniz başarıyla güncellendi! 🎉' } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">emergency</span>
        <p className="text-on-surface-variant mt-2">Yükleniyor...</p>
      </div>
    </div>
  )

  const cities = getCities()
  const districts = city ? getDistricts(city) : []

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 md:px-8 max-w-3xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>Geri
          </button>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Profilimi Düzenle</h1>
        </div>

        {/* Genel hata */}
        {error && (
          <div ref={errorRef} className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm fade-up">
            <span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profil Fotoğrafı */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>account_circle</span>
              Profil Fotoğrafı
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/30" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-primary-container flex items-center justify-center text-3xl font-bold text-on-primary-container border-2 border-primary/30">
                    {user?.name.charAt(0)}
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface mb-1">Fotoğraf Yükle</p>
                <p className="text-xs text-on-surface-variant mb-3">JPG, PNG · Maks 5MB</p>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-full text-xs font-medium hover:bg-surface-container-low transition-colors">
                  Dosya Seç
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>stethoscope</span>
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div ref={specialtyRef}>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Uzmanlık *</label>
                <select value={specialty} onChange={e => { setSpecialty(e.target.value); setFieldErrors(p => ({...p, specialty: ''})) }}
                  className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${fieldErrors.specialty ? 'border-error ring-1 ring-error' : 'border-outline-variant'}`}>
                  <option value="">Seçin</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {fieldErrors.specialty && <p className="text-xs text-error mt-1 fade-up">{fieldErrors.specialty}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Deneyim (Yıl)</label>
                <input type="number" min="0" value={experience} onChange={e => setExperience(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Konsültasyon Ücreti (₺)</label>
                <input type="number" min="0" value={consultationFee} onChange={e => setConsultationFee(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>

              <div ref={bioRef} className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Biyografi *</label>
                <textarea value={bio} onChange={e => { setBio(e.target.value); setFieldErrors(p => ({...p, bio: ''})) }} rows={4}
                  placeholder="Kendinizi hastalara tanıtın..."
                  className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${fieldErrors.bio ? 'border-error ring-1 ring-error' : 'border-outline-variant'}`} />
                {fieldErrors.bio && <p className="text-xs text-error mt-1 fade-up">{fieldErrors.bio}</p>}
              </div>
            </div>
          </div>

          {/* Konum & Hastane */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>location_on</span>
              Konum & Hastane
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div ref={cityRef}>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Şehir *</label>
                <select value={city} onChange={e => handleCityChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${fieldErrors.city ? 'border-error ring-1 ring-error' : 'border-outline-variant'}`}>
                  <option value="">Seçin</option>
                  {cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                {fieldErrors.city && <p className="text-xs text-error mt-1 fade-up">{fieldErrors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">İlçe</label>
                <select value={district} onChange={e => handleDistrictChange(e.target.value)}
                  disabled={!city}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                  <option value="">Seçin</option>
                  {districts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div ref={hospitalRef} className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Hastane / Klinik *
                  {loadingHospitals && <span className="ml-2 text-primary normal-case font-normal text-xs">Yükleniyor...</span>}
                </label>
                {!hospitalNotFound ? (
                  <select value={hospital} onChange={e => handleHospitalChange(e.target.value)}
                    disabled={!city}
                    className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 ${fieldErrors.hospital ? 'border-error ring-1 ring-error' : 'border-outline-variant'}`}>
                    <option value="">Seçin</option>
                    {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    {hospital && !hospitals.find(h => h.name === hospital) && (
                      <option value={hospital}>{hospital}</option>
                    )}
                  </select>
                ) : (
                  <input type="text" value={hospitalManual} onChange={e => { setHospitalManual(e.target.value); setFieldErrors(p => ({...p, hospital: ''})) }}
                    placeholder="Hastane veya klinik adını yazın..."
                    className={`w-full px-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${fieldErrors.hospital ? 'border-error ring-1 ring-error' : 'border-outline-variant'}`} />
                )}
                {fieldErrors.hospital && <p className="text-xs text-error mt-1 fade-up">{fieldErrors.hospital}</p>}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={hospitalNotFound}
                    onChange={e => { setHospitalNotFound(e.target.checked); if (!e.target.checked) setHospitalManual('') }}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-on-surface-variant">Listede kliniğim veya hastanem yok, manuel gireceğim</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Açık Adres</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
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