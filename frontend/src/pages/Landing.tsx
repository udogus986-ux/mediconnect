import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doctorAPI } from '../api'
import Navbar from '../components/Navbar'
import NearbyMap from '../components/NearbyMap'

interface Doctor {
  _id: string
  specialty: string
  rating: number
  consultationFee: number
  hospital: string
  isAvailable: boolean
  userId: {
    _id: string
    name: string
    avatar?: string
    isOnline: boolean
  }
}

const SPECIALTIES = ['Tümü', 'Kardiyoloji', 'Nöroloji', 'Dermatoloji', 'Pediatri', 'Ortopedi', 'Göz Hastalıkları']

const Landing = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await doctorAPI.getAll()
        setDoctors(res.data.doctors)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/doctors?search=${search}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-32 px-4 md:px-16 max-w-7xl mx-auto">

        {/* Hero */}
        <section className="mb-20 fade-up fade-up-1">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-6">
                <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                <span className="text-xs font-semibold text-primary">2.400+ Doğrulanmış Doktor</span>
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 leading-tight">
                Doktorunuzu <span className="text-primary">Bulun,</span> Sağlığınıza Kavuşun
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Uzman doktorlarla saniyeler içinde randevu alın. Güvenli mesajlaşma ve 7/24 destek ile yanınızdayız.
              </p>

              {/* Arama */}
              <form onSubmit={handleSearch} className="relative w-full mb-6">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">person_search</span>
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-14 pl-12 pr-32 bg-white border-none rounded-xl shadow-lg ring-1 ring-black/5 focus:ring-2 focus:ring-primary transition-all text-body-md outline-none"
                  placeholder="İsim, uzmanlık veya hastalık ara..."
                  type="text"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-lg text-sm font-semibold active:scale-95 transition-transform hover:bg-primary-container">
                  Ara
                </button>
              </form>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: 'verified', label: 'Doğrulanmış Doktorlar' },
                  { icon: 'lock', label: 'Güvenli Mesajlaşma' },
                  { icon: 'schedule', label: '7/24 Destek' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>{icon}</span>
                    <span className="text-xs font-semibold text-primary">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ görsel */}
            <div className="hidden md:flex flex-col gap-4">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-primary fade-up fade-up-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-xl font-bold text-on-primary-container">A</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white pulse-online"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-semibold text-on-surface">Dr. Ayşe Kaya</h4>
                      <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Kardiyoloji • Acıbadem</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                      ))}
                      <span className="text-xs text-on-surface-variant ml-1">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-secondary-container rounded-full text-xs font-medium text-on-surface-variant">Pazartesi</span>
                  <span className="px-2 py-1 bg-secondary-container rounded-full text-xs font-medium text-on-surface-variant">Çarşamba</span>
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary border border-primary/20">Bugün Müsait</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 fade-up fade-up-3">
                {[
                  { value: '2.4K+', label: 'Doktor', icon: 'stethoscope' },
                  { value: '98%', label: 'Memnuniyet', icon: 'thumb_up' },
                  { value: '50K+', label: 'Hasta', icon: 'people' },
                ].map(s => (
                  <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-1" style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
                    <div className="font-headline text-xl font-bold text-on-surface">{s.value}</div>
                    <div className="text-xs text-on-surface-variant">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Uzmanlık alanları */}
        <section className="mb-16 fade-up fade-up-2">
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-6">Uzmanlık Alanları</h3>
          <div className="flex gap-3 flex-wrap">
            {SPECIALTIES.map(s => (
              <button key={s} onClick={() => navigate(`/doctors?specialty=${s === 'Tümü' ? '' : s}`)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-surface-container-low border border-outline-variant hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95">
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Öne çıkan doktorlar */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">Öne Çıkan Uzmanlar</h3>
            <Link to="/doctors" className="text-sm font-semibold text-primary hover:underline">Tümünü Gör →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-surface-container mx-auto mb-3" />
                  <div className="h-3 bg-surface-container rounded mx-auto w-24 mb-2" />
                  <div className="h-2 bg-surface-container rounded mx-auto w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {doctors.slice(0, 4).map((doctor, i) => (
                <Link key={doctor._id} to={`/doctors/${doctor._id}`}
                  className={`glass-card rounded-xl p-4 border-l-4 border-l-primary flex flex-col items-center text-center hover:shadow-card transition-shadow fade-up fade-up-${Math.min(i+1,4)}`}>
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-on-primary-container border-2 border-white shadow-sm">
                      {doctor.userId.name.charAt(0)}
                    </div>
                    {doctor.userId.isOnline && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white pulse-online"/>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <h4 className="text-sm font-medium text-on-surface truncate max-w-[100px]">{doctor.userId.name}</h4>
                    <span className="material-symbols-outlined text-primary text-xs" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-2">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                    <span className="text-xs font-bold">{doctor.rating || '4.8'}</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-primary">₺{doctor.consultationFee}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
{/* Yakındaki Sağlık Kurumları */}
<section className="mb-16 fade-up fade-up-3">
  <h3 className="font-headline text-2xl font-bold text-on-surface mb-6">
    Yakınımdaki Sağlık Kurumları
  </h3>
  <NearbyMap />
</section>
        {/* CTA */}
        <section className="rounded-3xl p-12 text-center bg-gradient-to-br from-primary-container to-primary border-none shadow-card fade-up">
          <h3 className="font-headline text-3xl font-bold text-white mb-3">Hemen Başlayın</h3>
          <p className="text-on-primary-container mb-8 text-base">
            MediConnect'e güvenen binlerce hastaya katılın.
          </p>
          <Link to="/register" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-semibold shadow-xl active:scale-95 transition-transform hover:shadow-2xl">
            Ücretsiz Kaydol
          </Link>
        </section>
      </main>
    </div>
  )
}

export default Landing