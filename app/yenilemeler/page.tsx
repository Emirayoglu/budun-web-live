'use client'

import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { RefreshCw, Filter, Loader2, AlertCircle } from 'lucide-react'
import { supabase, type Police, type Musteri } from '@/lib/supabase'

export default function YenilemelerPage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      loadData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Müşterileri yükle
      const { data: musteriData } = await supabase
        .from('musteriler')
        .select('*')
      
      if (musteriData) setMusteriler(musteriData)

      // Bugünün tarihi
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 5 gün geçen (bugünden 5 gün önce)
      const gecmisTarih = new Date(today)
      gecmisTarih.setDate(today.getDate() - 5)
      
      // 18 gün kalan (bugünden 18 gün sonra)
      const gelecekTarih = new Date(today)
      gelecekTarih.setDate(today.getDate() + 18)

      // Poliçeleri yükle - sadece 18 gün kalan ve 5 gün geçen yenilemeler
      const { data: policeData, error } = await supabase
        .from('policeler')
        .select('*')
        .gte('bitis_tarihi', gecmisTarih.toISOString().split('T')[0])
        .lte('bitis_tarihi', gelecekTarih.toISOString().split('T')[0])
        .order('bitis_tarihi', { ascending: true })
      
      if (error) throw error
      setPoliceler(policeData || [])
    } catch (err: any) {
      console.error('Yenileme yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  // Müşteri adını bul
  const getMusteriAdi = (musteriId: number) => {
    const musteri = musteriler.find(m => m.id === musteriId)
    return musteri?.ad_soyad || 'Bilinmiyor'
  }

  // Kalan günü hesapla
  const getKalanGun = (bitisTarihi: string) => {
    const bitis = new Date(bitisTarihi)
    const today = new Date()
    const diff = Math.ceil((bitis.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  // Durum rengi
  const getDurumRenk = (kalanGun: number) => {
    if (kalanGun < 0) return 'bg-red-50 border-red-200 text-red-700' // Geçmiş
    if (kalanGun <= 18) return 'bg-orange-50 border-orange-200 text-orange-700' // 18 gün içinde
    return 'bg-green-50 border-green-200 text-green-700'
  }

  // İstatistikler
  const gecmis = policeler.filter(p => getKalanGun(p.bitis_tarihi) < 0).length // 5 gün geçen
  const yaklasan = policeler.filter(p => getKalanGun(p.bitis_tarihi) >= 0 && getKalanGun(p.bitis_tarihi) <= 18).length // 18 gün kalan

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
        <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-orange-900">Yenileme Takibi</h1>
              <p className="text-gray-600">18 gün kalan ve 5 gün geçen poliçeleri takip edin</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Yenile</span>
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold mb-1">GEÇMİŞ (5 Gün Geçen)</p>
                <p className="text-4xl font-black text-red-700">{gecmis}</p>
              </div>
              <div className="text-5xl">🔴</div>
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-semibold mb-1">YAKLAŞAN (18 Gün Kalan)</p>
                <p className="text-4xl font-black text-orange-700">{yaklasan}</p>
              </div>
              <div className="text-5xl">🟠</div>
            </div>
          </div>
        </div>

        {/* Yenileme Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Yenileme Listesi ({policeler.length} poliçe)</h3>
          
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-orange-600" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : policeler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Yenilenecek poliçe bulunmuyor</p>
              <p className="text-sm mt-2">Seçilen süre içinde bitiş tarihi olan poliçe yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Poliçe No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tür</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Şirket</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bitiş Tarihi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kalan Gün</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Prim (₺)</th>
                  </tr>
                </thead>
                <tbody>
                  {policeler.map((police) => {
                    const kalanGun = getKalanGun(police.bitis_tarihi)
                    return (
                      <tr key={police.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{getMusteriAdi(police.musteri_id)}</td>
                        <td className="py-3 px-4 font-mono text-sm">{police.police_no}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            {police.sigorta_turu}
                          </span>
                        </td>
                        <td className="py-3 px-4">{police.sirket}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(police.bitis_tarihi).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getDurumRenk(kalanGun)}`}>
                            {kalanGun < 0 ? `${Math.abs(kalanGun)} gün geçti` : `${kalanGun} gün`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                            {police.yenileme_durumu || 'Süreç devam ediyor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {police.prim_tutari?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}
