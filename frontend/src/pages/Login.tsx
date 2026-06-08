import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılamadı')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 fade-up fade-up-1">
         <div className="flex justify-center mb-4">
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
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Hoş Geldiniz</h2>
          <p className="text-on-surface-variant text-sm">Hesabınıza giriş yapın</p>
        </div>

        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-full font-semibold text-sm hover:bg-primary-container transition-colors shadow-glass active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Giriş Yap
                </>
              )}
            </button>
          </form>
              <div className="text-right mt-1">
  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
    Şifremi unuttum
  </Link>
</div>
          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant">veya</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-full text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors active:scale-95">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </button>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login