import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { doctorAPI } from '../api'
import Navbar from '../components/Navbar'

interface Doctor {
  _id: string
  specialty: string
  rating: number
  consultationFee: number
  hospital: string
  experience: number
  isAvailable: boolean
  location: { city: string; district: string }
  userId: { _id: string; name: string; avatar?: string; isOnline: boolean }
}

const SPECIALTIES = ['Tümü', 'Kardiyoloji', 'Nöroloji', 'Dermatoloji', 'Pediatri', 'Ortopedi', 'Göz Hastalıkları', 'Psikiyatri']

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tümü')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const s = searchParams.get('search') || ''
    const sp = searchParams.get('specialty') || 'Tümü'
    setSearch(s)
    setSelectedSpecialty(sp || 'Tümü')
  }, [searchParams])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params: any = {}
        if (search) params.search = search
        if (selectedSpecialty !== 'Tümü') params.specialty = selectedSpecialty
        if (city) params.city = city
        const res = await doctorAPI.getAll(params)
        setDoctors(res.data.doctors)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [search, selectedSpecialty, city])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 md:px-16 max-w-7xl mx-auto pb-12">

        {/* Başlık */}
        <section className="mb-8 fade-up fade-up-1">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-2">Uzman Bul</h1>
          <p className="text-on-surface-variant text-base max-w-2xl">
            İhtiyacınıza özel dünya standartlarında sağlık uzmanlarıyla bağlanın.
          </p>
        </section>

        {/* Arama */}
        <div className="glass-card p-5 rounded-xl shadow-[0_8px_32px_rgba(11,110,122,0.06)] flex flex-col md:flex-row gap-4 mb-6 fade-up fade-up-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person_search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-transparent focus:border-primary rounded-xl text-sm text-on-surface transition-all outline-none"
              placeholder="Uzmanlık veya doktor adı..."
              type="text"
            />
          </div>
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-transparent focus:border-primary rounded-xl text-sm text-on-surface transition-all outline-none"
              placeholder="Şehir..."
              type="text"
            />
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-95">
            <span className="material-symbols-outlined">search</span>
            Ara
          </button>
        </div>

        {/* Uzmanlık filtreleri */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 fade-up fade-up-2">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                selectedSpecialty === s
                  ? 'bg-secondary-container text-primary'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sonuç sayısı */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{doctors.length}</span> doktor bulundu
          </p>
        </div>

        {/* Doktor listesi */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-surface-container flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-surface-container rounded w-32 mb-2" />
                  <div className="h-3 bg-surface-container rounded w-24 mb-4" />
                  <div className="h-3 bg-surface-container rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">person_search</span>
            <h3 className="font-headline text-xl text-on-surface mb-2">Doktor Bulunamadı</h3>
            <p className="text-on-surface-variant text-sm">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {doctors.map((doctor, i) => (
              <div key={doctor._id} className={`glass-card rounded-xl p-6 border-l-4 border-l-primary flex gap-5 hover:shadow-card transition-all duration-300 fade-up fade-up-${Math.min(i+1, 4)}`}>
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {doctor.userId.avatar ? (
  <img src={doctor.userId.avatar} alt="" className="w-24 h-24 rounded-xl object-cover" />
) : (
  <div className="w-24 h-24 rounded-xl bg-primary-container flex items-center justify-center text-3xl font-bold text-on-primary-container">
    {doctor.userId.name.charAt(0)}
  </div>
)}
                  {doctor.userId.isOnline && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white pulse-online" />
                  )}
                </div>

                {/* Bilgiler */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-headline text-lg font-bold text-on-surface">{doctor.userId.name}</h3>
                        <span className="material-symbols-outlined text-primary text-base" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                      </div>
                      <span className="px-3 py-1 bg-secondary-container/50 text-primary rounded-full text-xs font-semibold inline-block">
                        {doctor.specialty}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500 justify-end">
                        <span className="material-symbols-outlined text-base" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                        <span className="text-sm font-bold">{doctor.rating || '4.8'}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">({doctor.experience} yıl)</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">local_hospital</span>
                      <span className="text-xs">{doctor.hospital || 'Özel Klinik'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      <span className="text-xs">₺{doctor.consultationFee} / seans</span>
                    </div>
                    {doctor.location?.city && (
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-xs">{doctor.location.district}, {doctor.location.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link to={`/doctors/${doctor._id}`}
                      className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-full text-center hover:bg-primary-container transition-colors active:scale-95">
                      Randevu Al
                    </Link>
                    <Link to={`/doctors/${doctor._id}`}
                      className="px-4 py-2 border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Doctors