import { useState } from 'react'
import { reviewAPI } from '../api'

interface Props {
  appointmentId: string
  doctorName: string
  onClose: () => void
  onSuccess: () => void
}

const StarRating = ({
  label, value, onChange
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        <span className="text-sm font-bold text-primary">
          {value > 0 ? `${value}/5` : '—'}
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform active:scale-90"
          >
            <span
              className="material-symbols-outlined text-3xl transition-colors"
              style={{
                fontVariationSettings: `'FILL' ${(hovered || value) >= star ? 1 : 0}`,
                color: (hovered || value) >= star ? '#D97706' : '#BEC8CA',
              }}
            >
              star
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

const ReviewModal = ({ appointmentId, doctorName, onClose, onSuccess }: Props) => {
  const [communicationRating, setCommunicationRating] = useState(0)
  const [expertiseRating, setExpertiseRating] = useState(0)
  const [punctualityRating, setPunctualityRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const averageRating = communicationRating && expertiseRating && punctualityRating
    ? ((communicationRating + expertiseRating + punctualityRating) / 3).toFixed(1)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!communicationRating || !expertiseRating || !punctualityRating) {
      setError('Lütfen tüm kategorileri puanlayın')
      return
    }
    setLoading(true)
    setError('')
    try {
      await reviewAPI.create({
        appointmentId,
        communicationRating,
        expertiseRating,
        punctualityRating,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Değerlendirme kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-8 w-full max-w-md scale-in shadow-card">
        
        {/* Kapat */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-outline">close</span>
        </button>

        {/* Başlık */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-amber-500 text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-1">
            Randevuyu Değerlendir
          </h2>
          <p className="text-sm text-on-surface-variant">{doctorName}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-4 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <StarRating
            label="💬 İletişim"
            value={communicationRating}
            onChange={setCommunicationRating}
          />
          <StarRating
            label="🩺 Uzmanlık"
            value={expertiseRating}
            onChange={setExpertiseRating}
          />
          <StarRating
            label="⏰ Dakiklik"
            value={punctualityRating}
            onChange={setPunctualityRating}
          />

          {/* Ortalama */}
          {averageRating && (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl mb-6 border border-amber-100">
              <span className="text-sm font-medium text-on-surface">Genel Puan</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                <span className="text-lg font-bold text-amber-600">{averageRating}</span>
                <span className="text-sm text-on-surface-variant">/5</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Kaydediliyor...</>
              ) : (
                <><span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>star</span>Değerlendir</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal