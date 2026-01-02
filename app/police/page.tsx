'use client'

import Navbar from '@/components/Navbar'
import { useState, useEffect } from 'react'
import { FileText, Plus, Loader2 } from 'lucide-react'
import { supabase, type Police, type Musteri } from '@/lib/supabase'

export default function PolicePage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Poliçeleri yükle
  useEffect(() => {
    loadPoliceler()
    loadMusteriler()
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      loadPoliceler()
      loadMusteriler()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadPoliceler = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('policeler')
        .select('*')
        .order('kayit_tarihi', { ascending: false })
      
      if (error) throw error
      setPoliceler(data || [])
    } catch (err: any) {
      console.error('Poliçe yükleme hatası:', err)
      setError(err.message || 'Poliçeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadMusteriler = async () => {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .order('ad_soyad', { ascending: true })
      
      if (error) throw error
      setMusteriler(data || [])
    } catch (err: any) {
      console.error('Müşteri yükleme hatası:', err)
    }
  }

  // Müşteri adını bul
  const getMusteriAdi = (musteriId: number) => {
    const musteri = musteriler.find(m => m.id === musteriId)
    return musteri?.ad_soyad || 'Bilinmiyor'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-blue-900">Poliçe Girişi</h1>
              <p className="text-gray-600">Yeni poliçe ekleyin ve mevcut poliçeleri yönetin</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Yeni Poliçe</span>
          </button>
        </div>

        {/* Form Bölümü */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Müşteri Bilgileri */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black">1</span>
              <span>Müşteri Bilgileri</span>
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Müşteri Adı Soyadı"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="TC No"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Telefon"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Poliçe Bilgileri */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-black">2</span>
              <span>Poliçe Bilgileri</span>
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Poliçe No"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Sigorta Türü Seçin</option>
                <option>Kasko</option>
                <option>Trafik</option>
                <option>Konut</option>
                <option>Dask</option>
                <option>Sağlık</option>
              </select>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Sigorta Şirketi</option>
                <option>Anadolu Sigorta</option>
                <option>Allianz</option>
                <option>Axa</option>
              </select>
            </div>
          </div>

          {/* Ödeme Bilgileri */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black">3</span>
              <span>Ödeme Bilgileri</span>
            </h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Prim Tutarı"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Komisyon Tutarı"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Ödeme Şekli</option>
                <option>Nakit</option>
                <option>Kredi Kartı</option>
                <option>Havale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Poliçe Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Mevcut Poliçeler</h3>
            <button 
              onClick={loadPoliceler}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Yenile
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <p className="text-lg font-semibold">Hata!</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : policeler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Henüz poliçe eklenmemiş</p>
              <p className="text-sm mt-2">EXE'den veya web sitesinden yeni poliçe ekleyebilirsiniz</p>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Başlangıç</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bitiş</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Prim (₺)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Komisyon (₺)</th>
                  </tr>
                </thead>
                <tbody>
                  {policeler.map((police) => (
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
                        {new Date(police.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(police.bitis_tarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {police.prim_tutari?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {police.komisyon_tutari?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

