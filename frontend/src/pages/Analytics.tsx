import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

interface AnalyticsData {
  totalAppointments: number
  completedAppointments: number
  totalRevenue: number
  monthlyRevenue: number
  totalReviews: number
  avgRating: number
  last7Days: { day: string; count: number }[]
  last6Months: { month: string; revenue: number }[]
  statusDistribution: {
    PENDING: number
    APPROVED: number
    COMPLETED: number
    CANCELLED: number
    REJECTED: number
  }
}

const Analytics = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'DOCTOR') { navigate('/dashboard'); return }

    const fetch = async () => {
      try {
        const res = await analyticsAPI.getDoctorAnalytics()
        setData(res.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [user])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">emergency</span>
        <p className="text-on-surface-variant mt-2">Yükleniyor...</p>
      </div>
    </div>
  )

  if (!data) return null

  const maxCount = Math.max(...data.last7Days.map(d => d.count), 1)
  const maxRevenue = Math.max(...data.last6Months.map(d => d.revenue), 1)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 md:px-16 max-w-6xl mx-auto pb-12">

        {/* Başlık */}
        <div className="mb-8 fade-up fade-up-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>analytics</span>
            <h1 className="font-headline text-3xl font-bold text-on-surface">Analitik</h1>
          </div>
          <p className="text-on-surface-variant text-sm">Performans ve gelir istatistikleriniz</p>
        </div>

        {/* Ana istatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 fade-up fade-up-2">
          {[
            { label: 'Toplam Gelir', value: `₺${data.totalRevenue.toLocaleString('tr-TR')}`, icon: 'payments', color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Bu Ay Gelir', value: `₺${data.monthlyRevenue.toLocaleString('tr-TR')}`, icon: 'trending_up', color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Toplam Randevu', value: data.totalAppointments, icon: 'calendar_month', color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Tamamlanan', value: data.completedAppointments, icon: 'check_circle', color: 'text-teal-500', bg: 'bg-teal-50' },
            { label: 'Ortalama Puan', value: data.avgRating || '—', icon: 'star', color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Değerlendirme', value: data.totalReviews, icon: 'rate_review', color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={s.label} className={`glass-card rounded-xl p-5 fade-up fade-up-${Math.min(i+1, 4)}`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${s.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
              </div>
              <div className="font-headline text-2xl font-bold text-on-surface">{s.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Son 7 gün randevu grafiği */}
          <div className="glass-card rounded-2xl p-6 fade-up fade-up-2">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Son 7 Gün Randevu
            </h3>
            <div className="flex items-end gap-2 h-40">
              {data.last7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-primary">{d.count > 0 ? d.count : ''}</span>
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all duration-500"
                    style={{ height: `${(d.count / maxCount) * 120}px`, minHeight: d.count > 0 ? '8px' : '2px', opacity: d.count > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-xs text-on-surface-variant text-center leading-tight">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Son 6 ay gelir grafiği */}
          <div className="glass-card rounded-2xl p-6 fade-up fade-up-3">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">trending_up</span>
              Son 6 Ay Gelir
            </h3>
            <div className="flex items-end gap-2 h-40">
              {data.last6Months.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-green-600">
                    {d.revenue > 0 ? `₺${(d.revenue/1000).toFixed(0)}k` : ''}
                  </span>
                  <div
                    className="w-full bg-green-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(d.revenue / maxRevenue) * 120}px`, minHeight: d.revenue > 0 ? '8px' : '2px', opacity: d.revenue > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-xs text-on-surface-variant">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Randevu durum dağılımı */}
        <div className="glass-card rounded-2xl p-6 fade-up fade-up-3">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">donut_large</span>
            Randevu Durumları
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'COMPLETED', label: 'Tamamlanan', color: '#0B6E7A', bg: '#CCFBF1' },
              { key: 'APPROVED', label: 'Onaylanan', color: '#059669', bg: '#D1FAE5' },
              { key: 'PENDING', label: 'Bekleyen', color: '#D97706', bg: '#FEF3C7' },
              { key: 'CANCELLED', label: 'İptal', color: '#6B7280', bg: '#F3F4F6' },
              { key: 'REJECTED', label: 'Reddedilen', color: '#DC2626', bg: '#FEE2E2' },
            ].map(s => (
              <div key={s.key} className="text-center p-4 rounded-xl" style={{ background: s.bg }}>
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>
                  {data.statusDistribution[s.key as keyof typeof data.statusDistribution]}
                </div>
                <div className="text-xs font-medium" style={{ color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Analytics