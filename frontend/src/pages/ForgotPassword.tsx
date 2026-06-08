import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-up fade-up-1">
          <div className="inline-flex items-center gap-2 mb-4">
            <img 
  src="/img/logo.png" 
  alt="MediConnect" 
  style={{ 
    height: '56px', 
    width: 'auto',
    mixBlendMode: 'multiply'  // Siyah arka planı şeffaf gösterir
  }} 
/>
          </div>
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Şifremi Unuttum</h2>
          <p className="text-on-surface-variant text-sm">Email adresinize sıfırlama linki göndereceğiz</p>
        </div>

        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">
          {sent ? (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-5xl text-green-500 mb-4 block" style={{fontVariationSettings:"'FILL' 1"}}>mark_email_read</span>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Mail Gönderildi!</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik. Lütfen mail kutunuzu kontrol edin.
              </p>
              <Link to="/login" className="text-primary font-semibold hover:underline text-sm">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                    Email Adresi
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-full font-semibold text-sm hover:bg-primary-container transition-colors shadow-glass active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Gönderiliyor...</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">send</span>Sıfırlama Linki Gönder</>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-on-surface-variant mt-6">
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  ← Giriş sayfasına dön
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword