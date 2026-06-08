import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentAPI, messageAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ReviewModal from '../components/review.modal'

interface Appointment {
  _id: string
  date: string
  time: string
  status: string
  notes?: string
  doctorId?: {
    specialty: string
    hospital: string
    consultationFee: number
    userId: { _id: string; name: string }
  }
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

const PatientDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'appointments' | 'messages'>('appointments')
  const [reviewModal, setReviewModal] = useState<{ appointmentId: string; doctorName: string } | null>(null)

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

  const handleCancel = async (id: string) => {
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return
    try {
      await appointmentAPI.cancel(id)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'CANCELLED' } : a))
    } catch (e) { console.error(e) }
  }

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find(p => p._id !== user?.id)

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
                  Hoş Geldiniz, {user?.name}! 👋
                </h1>
                <p className="text-sm text-on-surface-variant">Hasta Paneli</p>
              </div>
            </div>
            <Link to="/doctors" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors shadow-glass active:scale-95">
              <span className="material-symbols-outlined text-lg">add</span>
              Doktor Bul
            </Link>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-up fade-up-2">
          {[
            { label: 'Toplam Randevu', value: appointments.length, icon: 'calendar_month', color: 'text-primary' },
            { label: 'Bekleyen', value: appointments.filter(a => a.status === 'PENDING').length, icon: 'schedule', color: 'text-amber-500' },
            { label: 'Onaylanan', value: appointments.filter(a => a.status === 'APPROVED').length, icon: 'check_circle', color: 'text-green-500' },
            { label: 'Mesajlar', value: conversations.length, icon: 'chat_bubble', color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-5">
              <span className={`material-symbols-outlined text-2xl mb-2 block ${s.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
              <div className="font-headline text-2xl font-bold text-on-surface">{s.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tablar */}
        <div className="flex gap-2 mb-6 fade-up fade-up-2">
          {[
            { key: 'appointments', label: 'Randevularım', icon: 'calendar_month' },
            { key: 'messages', label: 'Mesajlarım', icon: 'chat_bubble' },
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

        {/* Randevular */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 fade-up fade-up-3">
            {appointments.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-3 block">calendar_month</span>
                <h3 className="font-headline text-lg text-on-surface mb-2">Randevunuz Yok</h3>
                <p className="text-sm text-on-surface-variant mb-4">Hemen bir doktor ile randevu alın</p>
                <Link to="/doctors" className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors">
                  Doktor Bul
                </Link>
              </div>
            ) : appointments.map(app => {
              const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING
              return (
                <div key={app._id} className="glass-card rounded-xl p-5 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>calendar_month</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        {app.doctorId && (
                          <h3 className="font-semibold text-on-surface">{app.doctorId.userId.name}</h3>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {new Date(app.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {app.time}
                          </span>
                        </div>
                        {app.doctorId && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">local_hospital</span>
                            {app.doctorId.specialty} · {app.doctorId.hospital}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                          <button onClick={() => handleCancel(app._id)} className="text-xs text-error hover:underline">
                            İptal
                          </button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <button
                            onClick={() => setReviewModal({
                              appointmentId: app._id,
                              doctorName: app.doctorId?.userId?.name || 'Doktor',
                            })}
                            className="flex items-center gap-1 text-xs text-amber-600 hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                            Değerlendir
                          </button>
                        )}
                      </div>
                    </div>
                    {app.notes && (
                      <p className="mt-2 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2">
                        {app.notes}
                      </p>
                    )}
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
                <h3 className="font-headline text-lg text-on-surface mb-2">Mesajınız Yok</h3>
                <p className="text-sm text-on-surface-variant">Doktorunuzla mesajlaşmaya başlayın</p>
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

      {/* Değerlendirme Modalı */}
      {reviewModal && (
        <ReviewModal
          appointmentId={reviewModal.appointmentId}
          doctorName={reviewModal.doctorName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => setReviewModal(null)}
        />
      )}
    </div>
  )
}

export default PatientDashboard