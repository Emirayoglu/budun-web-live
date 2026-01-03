'use client'

import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react'
import { supabase, type Police, type Musteri } from '@/lib/supabase'

export default function FinansPage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    toplamPrim: 0,
    tahsilEdilen: 0,
    kalanBorc: 0
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

      // Nakit ödemeli poliçeleri yükle
      const { data: policeData, error } = await supabase
        .from('policeler')
        .select('*')
        .eq('odeme_sekli', 'Nakit')
        .order('kayit_tarihi', { ascending: false })
      
      if (error) throw error
      setPoliceler(policeData || [])

      // İstatistikleri hesapla
      const toplamPrim = policeData?.reduce((sum, p) => sum + (p.prim_tutari || 0), 0) || 0
      const tahsilEdilen = policeData?.reduce((sum, p) => sum + (p.odenen_tutar || 0), 0) || 0
      const kalanBorc = policeData?.reduce((sum, p) => {
        const borc = (p.prim_tutari || 0) - (p.odenen_tutar || 0)
        return sum + Math.max(0, borc)
      }, 0) || 0

      setStats({ toplamPrim, tahsilEdilen, kalanBorc })
    } catch (err: any) {
      console.error('Finans yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  // Müşteri adını bul
  const getMusteriAdi = (musteriId: number) => {
    const musteri = musteriler.find(m => m.id === musteriId)
    return musteri?.ad_soyad || 'Bilinmiyor'
  }

  // Müşteri telefonunu bul
  const getMusteriTelefon = (musteriId: number) => {
    const musteri = musteriler.find(m => m.id === musteriId)
    return musteri?.telefon || '-'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
        <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-green-900">Finans Yönetimi</h1>
              <p className="text-gray-600">Tahsilat ve borç takibi</p>
            </div>
          </div>
          <button 
            onClick={loadData}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-semibold">Yenile</span>
          </button>
        </div>

        {/* Finans Özeti */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Toplam Prim</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-blue-900">
                  {stats.toplamPrim.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                </p>
                <p className="text-sm text-gray-500 mt-2">Nakit ödemeli poliçeler</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Tahsil Edilen</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-green-900">
                  {stats.tahsilEdilen.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                </p>
                <p className="text-sm text-gray-500 mt-2">Toplam ödenen tutar</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Kalan Borç</h3>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            ) : (
              <>
                <p className="text-3xl font-black text-red-900">
                  {stats.kalanBorc.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                </p>
                <p className="text-sm text-gray-500 mt-2">Tahsil edilecek tutar</p>
              </>
            )}
          </div>
        </div>

        {/* Borç Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Nakit Ödemeli Poliçeler ({policeler.length})</h3>
          
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : policeler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Nakit ödemeli poliçe bulunmuyor</p>
              <p className="text-sm mt-2">Nakit ödeme şekli ile eklenen poliçeler burada görünecek</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Poliçe No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tür</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Şirket</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Prim (₺)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Borç (₺)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Ödenen (₺)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Kalan (₺)</th>
                  </tr>
                </thead>
                <tbody>
                  {policeler.map((police) => {
                    const borc = police.prim_tutari || 0
                    const odenen = police.odenen_tutar || 0
                    const kalan = borc - odenen
                    
                    return (
                      <tr key={police.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm">{police.police_no}</td>
                        <td className="py-3 px-4">{getMusteriAdi(police.musteri_id)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{getMusteriTelefon(police.musteri_id)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            {police.sigorta_turu}
                          </span>
                        </td>
                        <td className="py-3 px-4">{police.sirket}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {borc.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {borc.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {odenen.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${kalan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
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
