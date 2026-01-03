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

  useEffect(() => {
    // Login sayfasında kontrol yapma
    if (pathname === '/login') {
      setLoading(false)
      return
    }

    // Kullanıcı kontrolü
    const kullanici = kullaniciOku()
    
    if (!kullanici) {
      // Giriş yapılmamış, login sayfasına yönlendir
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      setLoading(false)
    }
  }, [pathname, router])

  // Login sayfasında direkt render et
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Yükleniyor durumu
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

  // Giriş yapılmamışsa hiçbir şey gösterme (yönlendirme yapılacak)
  if (!isAuthenticated) {
    return null
  }

  // Giriş yapılmışsa içeriği göster
  return <>{children}</>
}

