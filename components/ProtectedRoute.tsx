'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { kullaniciOku } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Login sayfası kontrolü - hemen kontrol et
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    // Login sayfasında kontrol yapma
    if (isLoginPage) {
      setLoading(false)
      return
    }

    // Kullanıcı kontrolü - hemen kontrol et
    const checkAuth = () => {
      const kullanici = kullaniciOku()
      
      if (!kullanici) {
        // Giriş yapılmamış, login sayfasına yönlendir
        router.replace('/login')
        setIsAuthenticated(false)
        setLoading(false)
      } else {
        setIsAuthenticated(true)
        setLoading(false)
      }
    }

    // İlk kontrolü hemen yap
    checkAuth()

    // Storage değişikliklerini dinle (farklı tab'lerde çıkış yapıldığında)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname, router, isLoginPage])

  // Login sayfasında direkt render et
  if (isLoginPage) {
    return <>{children}</>
  }

  // Yükleniyor durumu - hemen göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Giriş yapılmamışsa loading göster (redirect olacak)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  // Giriş yapılmışsa içeriği göster
  return <>{children}</>
}

