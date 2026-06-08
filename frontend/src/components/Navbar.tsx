import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-surface/80 backdrop-blur-lg fixed top-0 w-full z-50 border-b border-white/20 shadow-[0_4px_30px_rgba(11,110,122,0.08)]">
      <div className="flex justify-between items-center px-4 md:px-16 h-16 w-full max-w-7xl mx-auto">

        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
  <img src="/img/logo.png" alt="MediConnect" style={{ height: '35px', width: 'auto' }} />
</Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { to: '/', label: 'Ana Sayfa' },
            { to: '/doctors', label: 'Doktorlar' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className={`text-sm font-medium transition-colors ${
              isActive(to) ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
            }`}>
              {label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
              }`}>Dashboard</Link>
              <Link to="/chat" className={`text-sm font-medium transition-colors ${
                isActive('/chat') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
              }`}>Mesajlar</Link>
            </>
          )}
          {user?.role === 'DOCTOR' && (
  <Link to="/analytics" className={`text-sm font-medium transition-colors ${
    isActive('/analytics') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
  }`}>
    Analitik
  </Link>
)}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-2xl">notifications</button>
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full hover:shadow-card transition-shadow">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-primary-container">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white pulse-online" />
                  </div>
                  <span className="text-sm font-medium text-on-surface hidden sm:block">{user.name}</span>
                  <span className="material-symbols-outlined text-outline text-lg">expand_more</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl py-2 shadow-card">
                    <div className="px-4 py-2 border-b border-outline-variant/30">
                      <p className="text-sm font-medium text-on-surface">{user.name}</p>
                      <p className="text-xs text-on-surface-variant">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary/5 transition-colors">
                Giriş Yap
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary-container transition-colors shadow-glass">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar