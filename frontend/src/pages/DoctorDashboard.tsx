import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentAPI, messageAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

interface Appointment {
  _id: string
  date: string
  time: string
  status: string
  notes?: string
  patientId?: { _id: string; name: string; email: string }
}

interface Conversation {
  _id: string
  participants: { _id: string; name: string; isOnline: boolean; role: string }[]
  lastMessage?: { content: string }
  updatedAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Bekliyor',     color: '#D97706', bg: '#FEF3C7' },
  APPROVED:  { label: 'Onaylandı',   color: '#059669', bg: '#D1FAE5' },
  REJECTED:  { label: 'Reddedildi',  color: '#DC2626', bg: '#FEE2E2' },
  COMPLETED: { label: 'Tamamlandı',  color: '#0B6E7A', bg: '#CCFBF1' },
  CANCELLED: { label: 'İptal',       color: '#6B7280', bg: '#F3F4F6' },
}

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'messages'>('pending')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, convRes] = await Promise.all([
          appointmentAPI.getMyAppointments(),
          messageAPI.getConversations(),
        ])
        setAppointments(appRes.data.appointments)
        setConversations(convRes.data.conversations)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await appointmentAPI.updateStatus(id, status)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
    } catch (e) { console.error(e) }
  }

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find(p => p._id !== user?.id)

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING')
  const allAppointments = appointments

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
      <main className="pt-24 px-4 md:px-16 max-w-6xl mx-auto pb-12">

        {/* Karşılama */}
        <div className="mb-8 fade-up fade-up-1">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-on-primary-container">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">
                  Hoş Geldiniz, {user?.name}! 👨‍⚕️
                </h1>
                <p className="text-sm text-on-surface-variant">Doktor Paneli</p>
              </div>
            </div>

            {pendingAppointments.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-amber-500 text-lg" style={{fontVariationSettings:"'FILL' 1"}}>notifications_active</span>
                <span className="text-sm font-semibold text-amber-700">
                  {pendingAppointments.length} bekleyen randevu
                </span>
              </div>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-up fade-up-2">
          {[
            { label: 'Toplam Randevu', value: appointments.length, icon: 'calendar_month', color: 'text-primary' },
            { label: 'Bekleyen', value: pendingAppointments.length, icon: 'pending', color: 'text-amber-500' },
            { label: 'Onaylanan', value: appointments.filter(a => a.status === 'APPROVED').length, icon: 'check_circle', color: 'text-green-500' },
            { label: 'Hasta Mesajları', value: conversations.length, icon: 'chat_bubble', color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-5">
              <span className={`material-symbols-outlined text-2xl mb-2 block ${s.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
              <div className="font-headline text-2xl font-bold text-on-surface">{s.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tablar */}
        <div className="flex gap-2 mb-6 flex-wrap fade-up fade-up-2">
          {[
            { key: 'pending', label: `Bekleyen (${pendingAppointments.length})`, icon: 'pending' },
            { key: 'all', label: 'Tüm Randevular', icon: 'calendar_month' },
            { key: 'messages', label: 'Hasta Mesajları', icon: 'chat_bubble' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-primary text-white shadow-glass' : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container'
              }`}>
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bekleyen randevular */}
        {activeTab === 'pending' && (
          <div className="space-y-4 fade-up fade-up-3">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-3 block">check_circle</span>
                <h3 className="font-headline text-lg text-on-surface mb-2">Bekleyen Randevu Yok</h3>
                <p className="text-sm text-on-surface-variant">Tüm randevular işlendi</p>
              </div>
            ) : pendingAppointments.map(app => (
              <div key={app._id} className="glass-card rounded-xl p-5 border-l-4 border-l-amber-400">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-amber-600" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{app.patientId?.name}</h3>
                      <p className="text-xs text-on-surface-variant">{app.patientId?.email}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(app.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {app.time}
                        </span>
                      </div>
                      {app.notes && (
                        <p className="mt-2 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2 max-w-sm">
                          "{app.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(app._id, 'APPROVED')}
                      className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-green-600 transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-sm">check</span>
                      Onayla
                    </button>
                    <button onClick={() => handleStatus(app._id, 'REJECTED')}
                      className="flex items-center gap-1.5 border border-error text-error px-4 py-2 rounded-full text-xs font-semibold hover:bg-error/5 transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-sm">close</span>
                      Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tüm randevular */}
        {activeTab === 'all' && (
          <div className="space-y-3 fade-up fade-up-3">
            {allAppointments.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-3 block">calendar_month</span>
                <h3 className="font-headline text-lg text-on-surface mb-2">Randevu Yok</h3>
              </div>
            ) : allAppointments.map(app => {
              const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING
              return (
                <div key={app._id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container flex-shrink-0">
                    {app.patientId?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{app.patientId?.name}</p>
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                          <span>{new Date(app.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                          <span>{app.time}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mesajlar */}
        {activeTab === 'messages' && (
          <div className="space-y-3 fade-up fade-up-3">
            {conversations.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-3 block">chat_bubble</span>
                <h3 className="font-headline text-lg text-on-surface mb-2">Mesaj Yok</h3>
                <p className="text-sm text-on-surface-variant">Hastalarınızdan henüz mesaj gelmedi</p>
              </div>
            ) : conversations.map(conv => {
              const other = getOtherParticipant(conv)
              return (
                <Link key={conv._id} to={`/chat/${conv._id}`}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 hover:shadow-card transition-all">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                      {other?.name.charAt(0)}
                    </div>
                    {other?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white pulse-online" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-on-surface truncate">{other?.name}</h3>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(conv.updatedAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">
                      {conv.lastMessage?.content || 'Henüz mesaj yok'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default DoctorDashboard