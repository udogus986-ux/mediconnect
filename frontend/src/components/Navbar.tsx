import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-card shadow-glass py-3' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <img src="/img/logo.png" alt="MediConnect" style={{ height: '52px', width: 'auto', mixBlendMode: 'multiply' }} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/doctors" className={`text-sm font-medium transition-colors ${
            isActive('/doctors') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
          }`}>
            Doktorlar
          </Link>

          {user?.role === 'DOCTOR' && (
            <Link to="/analytics" className={`text-sm font-medium transition-colors ${
              isActive('/analytics') ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
            }`}>
              Analitik
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}>
                Dashboard
              </Link>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-on-surface max-w-24 truncate">{user.name}</span>
                  <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-card overflow-hidden z-50">
                    <div className="p-3 border-b border-outline-variant/30">
                      <p className="text-xs font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    {user.role === 'DOCTOR' && (
                      <Link to="/doctor-edit" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-lg text-primary">edit</span>
                        Profilimi Düzenle
                      </Link>
                    )}
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined text-lg text-primary">dashboard</span>
                      Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Giriş Yap
              </Link>
              <Link to="/register"
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors shadow-glass active:scale-95">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-card mx-4 mt-2 rounded-2xl p-4 space-y-2 shadow-card">
          <Link to="/doctors" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">search</span>
            <span className="text-sm font-medium text-on-surface">Doktorlar</span>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-primary">dashboard</span>
                <span className="text-sm font-medium text-on-surface">Dashboard</span>
              </Link>
              {user.role === 'DOCTOR' && (
                <>
                  <Link to="/analytics" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <span className="text-sm font-medium text-on-surface">Analitik</span>
                  </Link>
                  <Link to="/doctor-edit" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    <span className="text-sm font-medium text-on-surface">Profilimi Düzenle</span>
                  </Link>
                </>
              )}
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-error/5 transition-colors">
                <span className="material-symbols-outlined text-error">logout</span>
                <span className="text-sm font-medium text-error">Çıkış Yap</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-primary">login</span>
                <span className="text-sm font-medium text-on-surface">Giriş Yap</span>
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-white">person_add</span>
                <span className="text-sm font-medium text-white">Kayıt Ol</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Overlay */}
      {menuOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}

export default Navbar