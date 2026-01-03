'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { kullaniciOku } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Login sayfası için kontrol yapma
    if (pathname === '/login') {
      // Login sayfasında zaten giriş yapmış kullanıcıyı ana sayfaya yönlendir
      const kullanici = kullaniciOku()
      if (kullanici) {
        router.replace('/')
        return
      }
      setIsChecking(false)
      setShouldRender(true)
      return
    }

    // Diğer sayfalar için kullanıcı kontrolü
    const kullanici = kullaniciOku()
    
    if (!kullanici) {
      // Kullanıcı yoksa login'e yönlendir
      router.replace('/login')
      setIsChecking(false)
      setShouldRender(false)
    } else {
      setIsChecking(false)
      setShouldRender(true)
    }
  }, [pathname, router])

  // Kontrol edilirken loading göster
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Render edilmeli mi kontrol et
  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}
