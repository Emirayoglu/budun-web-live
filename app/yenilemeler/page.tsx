'use client'

import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { RefreshCw, Calendar, Loader2, X } from 'lucide-react'
import { supabase, type Police, type Musteri } from '@/lib/supabase'

export default function YenilemelerPage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [loading, setLoading] = useState(true)
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [baslangicTarih, setBaslangicTarih] = useState<string>('')
  const [bitisTarih, setBitisTarih] = useState<string>('')

  // İlk yüklemede varsayılan tarihleri ayarla
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 5 gün geçen (bugünden 5 gün önce)
    const gecmisTarih = new Date(today)
    gecmisTarih.setDate(today.getDate() - 5)
    
    // 18 gün kalan (bugünden 18 gün sonra)
    const gelecekTarih = new Date(today)
    gelecekTarih.setDate(today.getDate() + 18)
    
    setBaslangicTarih(gecmisTarih.toISOString().split('T')[0])
    setBitisTarih(gelecekTarih.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (baslangicTarih && bitisTarih) {
      loadData()
    }
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      if (baslangicTarih && bitisTarih) {
        loadData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [baslangicTarih, bitisTarih])

  const loadData = async () => {
    if (!baslangicTarih || !bitisTarih) return
    
    try {
      setLoading(true)
      
      // Müşterileri yükle
      const { data: musteriData } = await supabase
        .from('musteriler')
        .select('*')
      
      if (musteriData) setMusteriler(musteriData)

      // Poliçeleri yükle - seçilen tarih aralığındaki yenilemeler
      const { data: policeData, error } = await supabase
        .from('policeler')
        .select('*')
        .gte('bitis_tarihi', baslangicTarih)
        .lte('bitis_tarihi', bitisTarih)
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

  const handleDateChange = () => {
    if (baslangicTarih && bitisTarih) {
      loadData()
      setShowDateDialog(false)
    }
  }

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
              <p className="text-gray-600">
                {baslangicTarih && bitisTarih ? (
                  <>
                    {new Date(baslangicTarih).toLocaleDateString('tr-TR')} - {new Date(bitisTarih).toLocaleDateString('tr-TR')} tarihleri arasındaki poliçeler
                  </>
                ) : (
                  'Tarih aralığını seçin'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowDateDialog(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Tarih Değiştir</span>
            </button>
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Yenile</span>
            </button>
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

      {/* Tarih Seçim Dialogu */}
      {showDateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tarih Aralığı Seç</h2>
              <button
                onClick={() => setShowDateDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={baslangicTarih}
                  onChange={(e) => setBaslangicTarih(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={bitisTarih}
                  onChange={(e) => setBitisTarih(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const gecmisTarih = new Date(today)
                    gecmisTarih.setDate(today.getDate() - 5)
                    const gelecekTarih = new Date(today)
                    gelecekTarih.setDate(today.getDate() + 18)
                    setBaslangicTarih(gecmisTarih.toISOString().split('T')[0])
                    setBitisTarih(gelecekTarih.toISOString().split('T')[0])
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Varsayılan (18 gün kalan, 5 gün geçen)
                </button>
                <button
                  onClick={handleDateChange}
                  disabled={!baslangicTarih || !bitisTarih}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
