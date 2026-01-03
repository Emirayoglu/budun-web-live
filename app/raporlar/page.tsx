'use client'

import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { BarChart3, Download, Loader2, TrendingUp, DollarSign, Users, Building } from 'lucide-react'
import { supabase, type Police, type Musteri } from '@/lib/supabase'

export default function RaporlarPage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    toplamPoliceler: 0,
    toplamPrim: 0,
    toplamKomisyon: 0,
    toplamMusteriler: 0,
    sirketBazli: {} as Record<string, number>,
    turBazli: {} as Record<string, number>
  })

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

      // Tüm poliçeleri yükle
      const { data: policeData, error } = await supabase
        .from('policeler')
        .select('*')
        .order('kayit_tarihi', { ascending: false })
      
      if (error) throw error
      setPoliceler(policeData || [])

      // İstatistikleri hesapla
      const toplamPoliceler = policeData?.length || 0
      const toplamPrim = policeData?.reduce((sum, p) => sum + (p.prim_tutari || 0), 0) || 0
      const toplamKomisyon = policeData?.reduce((sum, p) => sum + (p.komisyon_tutari || 0), 0) || 0
      const toplamMusteriler = new Set(policeData?.map(p => p.musteri_id) || []).size

      // Şirket bazlı istatistikler
      const sirketBazli: Record<string, number> = {}
      policeData?.forEach(p => {
        const sirket = p.sirket || 'Bilinmiyor'
        sirketBazli[sirket] = (sirketBazli[sirket] || 0) + 1
      })

      // Tür bazlı istatistikler
      const turBazli: Record<string, number> = {}
      policeData?.forEach(p => {
        const tur = p.sigorta_turu || 'Bilinmiyor'
        turBazli[tur] = (turBazli[tur] || 0) + 1
      })

      setStats({
        toplamPoliceler,
        toplamPrim,
        toplamKomisyon,
        toplamMusteriler,
        sirketBazli,
        turBazli
      })
    } catch (err: any) {
      console.error('Rapor yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    // Basit CSV export
    const headers = ['Poliçe No', 'Müşteri', 'Tür', 'Şirket', 'Prim', 'Komisyon', 'Başlangıç', 'Bitiş']
    const rows = policeler.map(p => [
      p.police_no,
      musteriler.find(m => m.id === p.musteri_id)?.ad_soyad || 'Bilinmiyor',
      p.sigorta_turu,
      p.sirket,
      p.prim_tutari || 0,
      p.komisyon_tutari || 0,
      new Date(p.baslangic_tarihi).toLocaleDateString('tr-TR'),
      new Date(p.bitis_tarihi).toLocaleDateString('tr-TR')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `budun-rapor-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-purple-900">Raporlar</h1>
              <p className="text-gray-600">Detaylı analizler ve istatistikler</p>
            </div>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Excel İndir</span>
          </button>
        </div>

        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-blue-900">{stats.toplamPoliceler}</p>
                <p className="text-sm text-gray-600 mt-1">Toplam Poliçe</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-green-900">
                  {stats.toplamPrim.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
                <p className="text-sm text-gray-600 mt-1">Toplam Prim</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-purple-900">
                  {stats.toplamKomisyon.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
                <p className="text-sm text-gray-600 mt-1">Toplam Komisyon</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-orange-900">{stats.toplamMusteriler}</p>
                <p className="text-sm text-gray-600 mt-1">Toplam Müşteri</p>
              </>
            )}
          </div>
        </div>

        {/* Detaylı Raporlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Şirket Bazlı Rapor */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <Building className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Şirket Bazlı Dağılım</h3>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              </div>
            ) : Object.keys(stats.sirketBazli).length === 0 ? (
              <p className="text-gray-400 text-center py-8">Veri bulunamadı</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.sirketBazli)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sirket, sayi]) => (
                    <div key={sirket} className="flex items-center justify-between">
                      <span className="text-gray-700">{sirket}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(sayi / stats.toplamPoliceler) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{sayi}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Tür Bazlı Rapor */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Sigorta Türü Dağılımı</h3>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-600" />
              </div>
            ) : Object.keys(stats.turBazli).length === 0 ? (
              <p className="text-gray-400 text-center py-8">Veri bulunamadı</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.turBazli)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tur, sayi]) => (
                    <div key={tur} className="flex items-center justify-between">
                      <span className="text-gray-700">{tur}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(sayi / stats.toplamPoliceler) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{sayi}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Rapor Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Aylık Satış Raporu', color: 'blue', icon: '📊', desc: 'Aylık bazda satış analizi' },
            { title: 'Komisyon Raporu', color: 'green', icon: '💰', desc: 'Komisyon detayları' },
            { title: 'Yenileme Raporu', color: 'orange', icon: '🔄', desc: 'Yenilenecek poliçeler' },
            { title: 'Müşteri Analizi', color: 'purple', icon: '👥', desc: 'Müşteri bazlı analiz' },
            { title: 'Şirket Bazlı Rapor', color: 'red', icon: '🏢', desc: 'Şirket performansı' },
            { title: 'Ürün Bazlı Rapor', color: 'yellow', icon: '📈', desc: 'Ürün bazlı istatistikler' },
          ].map((rapor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-4">{rapor.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{rapor.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{rapor.desc}</p>
              <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all font-semibold">
                Raporu Görüntüle
              </button>
            </div>
          ))}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}
