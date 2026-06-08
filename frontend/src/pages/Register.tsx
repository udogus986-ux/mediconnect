import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setError('')
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    setLoading(true)
    try {
      await register(name, email, password, role)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt olunamadı')
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
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Hesap Oluştur</h2>
          <p className="text-on-surface-variant text-sm">MediConnect'e katılın</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6 fade-up fade-up-1">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
              }`}>{s}</div>
              {s < 2 && <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-primary' : 'bg-outline-variant'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 fade-up fade-up-2">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Rol seçimi */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">
                    Hesap Türü
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'PATIENT', label: 'Hasta', icon: 'person', desc: 'Doktor ara ve randevu al' },
                      { value: 'DOCTOR', label: 'Doktor', icon: 'stethoscope', desc: 'Hasta kabul et ve yönet' },
                    ].map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value as 'PATIENT' | 'DOCTOR')}
                        className={`p-4 rounded-xl border-2 text-left transition-all active:scale-95 ${
                          role === r.value
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl mb-2 block ${role === r.value ? 'text-primary' : 'text-on-surface-variant'}`} style={{fontVariationSettings:"'FILL' 1"}}>
                          {r.icon}
                        </span>
                        <div className={`font-semibold text-sm ${role === r.value ? 'text-primary' : 'text-on-surface'}`}>{r.label}</div>
                        <div className="text-xs text-on-surface-variant mt-1">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Ad Soyad</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" required
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" required
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-on-surface">{name}</p>
                    <p className="text-xs text-on-surface-variant">{email} · {role === 'DOCTOR' ? 'Doktor' : 'Hasta'}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-primary hover:underline">Düzenle</button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Şifre</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="En az 6 karakter" required
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-full font-semibold text-sm hover:bg-primary-container transition-colors shadow-glass active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Kayıt olunuyor...</>
              ) : step === 1 ? (
                <>Devam Et <span className="material-symbols-outlined text-lg">arrow_forward</span></>
              ) : (
                <><span className="material-symbols-outlined text-lg">check_circle</span>Kayıt Ol</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register