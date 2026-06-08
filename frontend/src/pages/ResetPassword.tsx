import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
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
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Yeni Şifre</h2>
          <p className="text-on-surface-variant text-sm">Yeni şifrenizi belirleyin</p>
        </div>

        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">
          {success ? (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-5xl text-green-500 mb-4 block" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Şifre Sıfırlandı!</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <Link to="/login" className="text-primary font-semibold hover:underline text-sm">
                Hemen giriş yap
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
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
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
                    <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Kaydediliyor...</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">check_circle</span>Şifremi Sıfırla</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword