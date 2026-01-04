'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kullaniciGiris, kullaniciKaydet, kullaniciOku } from '@/lib/auth'
import { Loader2, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [sifre, setSifre] = useState('')
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState('')
  const [checking, setChecking] = useState(true)

  // Zaten giriş yapmış kullanıcıyı kontrol et
  useEffect(() => {
    const mevcutKullanici = kullaniciOku()
    if (mevcutKullanici) {
      router.push('/')
    } else {
      setChecking(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')
    setLoading(true)

    try {
      const result = await kullaniciGiris(kullaniciAdi.trim(), sifre)
      
      if (result.success && result.kullanici) {
        kullaniciKaydet(result.kullanici)
        router.push('/')
        router.refresh()
      } else {
        setHata('Kullanıcı adı veya şifre hatalı!')
        setSifre('')
      }
    } catch (error) {
      console.error('Giriş hatası:', error)
      setHata('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-black text-3xl">B</span>
          </div>
          <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight">
            BUDUN
          </h1>
          <p className="text-lg text-gray-600">Sigorta Yönetim Sistemi</p>
          <p className="text-sm text-gray-500 mt-2">Kullanıcı Girişi</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kullanıcı Adı */}
            <div>
              <label htmlFor="kullanici_adi" className="block text-sm font-semibold text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kullanici_adi"
                  type="text"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="sifre" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="sifre"
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && kullaniciAdi && sifre) {
                      handleSubmit(e as any)
                    }
                  }}
                />
              </div>
            </div>

            {/* Hata Mesajı */}
            {hata && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {hata}
              </div>
            )}

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading || !kullaniciAdi || !sifre}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 BUDUN Sigorta Yönetim Sistemi</p>
        </div>
      </div>
    </div>
  )
}


