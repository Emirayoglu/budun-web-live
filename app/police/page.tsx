'use client'

import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { FileText, Plus, Loader2, Save, X } from 'lucide-react'
import { supabase, type Police, type Musteri, type Satisci } from '@/lib/supabase'

// Komisyon oranı cache (performans için)
let komisyonOranlariCache: { [key: string]: number } | null = null

// Komisyon oranı hesaplama fonksiyonu (veritabanından okur)
async function getKomisyonOrani(sigortaTuru: string): Promise<number> {
  // Cache yoksa yükle
  if (!komisyonOranlariCache) {
    try {
      const { data, error } = await supabase
        .from('komisyon_oranlari')
        .select('*')
      
      if (!error && data) {
        komisyonOranlariCache = {}
        data.forEach((item: any) => {
          // Veritabanındaki yüzde değerini ondalığa çevir (örn: 15.00 -> 0.15)
          komisyonOranlariCache![item.sigorta_turu] = (item.komisyon_orani || 15.00) / 100.0
        })
      }
    } catch (err) {
      console.error('Komisyon oranları yüklenirken hata:', err)
    }
  }
  
  // Cache'den oku
  if (komisyonOranlariCache && komisyonOranlariCache[sigortaTuru] !== undefined) {
    return komisyonOranlariCache[sigortaTuru]
  }
  
  // Varsayılan değerler (fallback)
  const varsayilanOranlar: { [key: string]: number } = {
    "Kasko": 0.15,
    "Trafik": 0.10,
    "Konut": 0.15,
    "İşyeri": 0.15,
    "Sağlık": 0.18,
    "Hayat": 0.22,
    "Dask": 0.10,
    "Seyahat": 0.17,
    "Ferdi Kaza": 0.16,
  }
  return varsayilanOranlar[sigortaTuru] || 0.15
}

// Cache'i temizle (yenileme için)
function clearKomisyonOranlariCache() {
  komisyonOranlariCache = null
}

export default function PolicePage() {
  const [policeler, setPoliceler] = useState<Police[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [satiscilar, setSatiscilar] = useState<Satisci[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    ad_soyad: '',
    tc_no: '',
    telefon: '',
    email: '',
    police_no: '',
    sigorta_turu: '',
    sirket: '',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    prim_tutari: '',
    komisyon_tutari: '',
        odeme_sekli: '',
        satisci_id: '',
        aciklama: '',
        plaka: '',
        belge_seri: ''
      })

  // Poliçeleri yükle
  useEffect(() => {
    loadPoliceler()
    loadMusteriler()
    loadSatiscilar()
    
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

  const loadSatiscilar = async () => {
    try {
      const { data, error } = await supabase
        .from('satiscilar')
        .select('*')
        .eq('durum', 'Aktif')
        .order('ad_soyad', { ascending: true })
      
      if (error) throw error
      setSatiscilar(data || [])
    } catch (err: any) {
      console.error('Satışçı yükleme hatası:', err)
    }
  }

  // Komisyon otomatik hesapla (sigorta türüne göre)
  useEffect(() => {
    const hesaplaKomisyon = async () => {
      if (formData.prim_tutari && formData.sigorta_turu && formData.sigorta_turu !== '' && formData.sigorta_turu !== 'Sigorta Türü Seçin *') {
        const prim = parseFloat(formData.prim_tutari.replace(/\./g, '').replace(',', '.')) || 0
        const komisyonOrani = await getKomisyonOrani(formData.sigorta_turu)
        const komisyon = prim * komisyonOrani
        setFormData(prev => ({ ...prev, komisyon_tutari: komisyon.toFixed(2) }))
      } else {
        setFormData(prev => ({ ...prev, komisyon_tutari: '' }))
      }
    }
    hesaplaKomisyon()
  }, [formData.prim_tutari, formData.sigorta_turu])

  // Bitiş tarihini otomatik ayarla
  useEffect(() => {
    if (formData.baslangic_tarihi) {
      const baslangic = new Date(formData.baslangic_tarihi)
      const bitis = new Date(baslangic)
      bitis.setFullYear(bitis.getFullYear() + 1)
      setFormData(prev => ({ ...prev, bitis_tarihi: bitis.toISOString().split('T')[0] }))
    }
  }, [formData.baslangic_tarihi])

  // Müşteri adını bul
  const getMusteriAdi = (musteriId: number) => {
    const musteri = musteriler.find(m => m.id === musteriId)
    return musteri?.ad_soyad || 'Bilinmiyor'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validasyon
      if (!formData.ad_soyad || !formData.tc_no || !formData.police_no || !formData.sigorta_turu || !formData.sirket) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun!')
      }

      if (formData.tc_no.length !== 11) {
        throw new Error('TC No 11 haneli olmalıdır!')
      }

      // Önce müşteriyi ekle veya bul
      let musteriId: number | null = null
      
      // Mevcut müşteriyi kontrol et
      const existingMusteri = musteriler.find(m => m.tc_no === formData.tc_no)
      
      if (existingMusteri) {
        musteriId = existingMusteri.id
      } else {
        // Yeni müşteri ekle
        const { data: newMusteri, error: musteriError } = await supabase
          .from('musteriler')
          .insert({
            ad_soyad: formData.ad_soyad,
            tc_no: formData.tc_no,
            telefon: formData.telefon || null,
            email: formData.email || null,
            adres: null
          })
          .select()
          .single()

        if (musteriError) throw musteriError
        musteriId = newMusteri.id
      }

      // Prim tutarını temizle ve parse et
      const prim = parseFloat(formData.prim_tutari.replace(/\./g, '').replace(',', '.')) || 0
      const komisyon = parseFloat(formData.komisyon_tutari.replace(/\./g, '').replace(',', '.')) || 0

      // Poliçeyi ekle
      const { error: policeError } = await supabase
        .from('policeler')
        .insert({
          musteri_id: musteriId,
          police_no: formData.police_no,
          sigorta_turu: formData.sigorta_turu,
          sirket: formData.sirket,
          baslangic_tarihi: formData.baslangic_tarihi,
          bitis_tarihi: formData.bitis_tarihi,
          prim_tutari: prim,
          komisyon_tutari: komisyon,
          odeme_sekli: formData.odeme_sekli || 'Nakit',
          satisci_id: formData.satisci_id ? parseInt(formData.satisci_id) : null,
          aciklama: formData.aciklama || null,
          plaka: formData.plaka || null,
          belge_seri: formData.belge_seri || null,
          yenileme_durumu: 'Süreç devam ediyor'
        })

      if (policeError) throw policeError

      // Başarılı - formu temizle ve listeyi yenile
      setFormData({
        ad_soyad: '',
        tc_no: '',
        telefon: '',
        email: '',
        police_no: '',
        sigorta_turu: '',
        sirket: '',
        baslangic_tarihi: '',
        bitis_tarihi: '',
        prim_tutari: '',
        komisyon_tutari: '',
        odeme_sekli: '',
        satisci_id: '',
        aciklama: '',
        plaka: '',
        belge_seri: ''
      })
      setShowForm(false)
      loadPoliceler()
      loadMusteriler()
      alert('Poliçe başarıyla kaydedildi! ✅')
    } catch (err: any) {
      console.error('Kayıt hatası:', err)
      setError(err.message || 'Poliçe kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const sigortaSirketleri = [
    'Aksigorta',
    'Allianz Sigorta',
    'Anadolu Sigorta',
    'AXA Sigorta',
    'Corpus Sigorta',
    'HDI Sigorta',
    'Mapfre Sigorta',
    'Neova Sigorta',
    'Quick Sigorta',
    'Ray Sigorta',
    'Türk Nippon Sigorta',
    'Türkiye Sigorta',
    'Unico Sigorta'
  ]

  const sigortaTurleri = [
    'Kasko',
    'Trafik',
    'YeşilKart',
    'İMM',
    'Konut',
    'İşyeri',
    'Dask',
    'TSS',
    'ÖSS',
    'Hayat',
    'YTS',
    'FFL',
    'CMR',
    'Mesleki Sorumluluk',
    'Nakliyat'
  ]

  return (
    <ProtectedRoute>
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
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="font-semibold">{showForm ? 'İptal' : 'Yeni Poliçe'}</span>
          </button>
        </div>

        {/* Form Bölümü */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Müşteri Bilgileri */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black">1</span>
                    <span>Müşteri Bilgileri</span>
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Müşteri Adı Soyadı *"
                      value={formData.ad_soyad}
                      onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="TC No (11 haneli) *"
                      maxLength={11}
                      value={formData.tc_no}
                      onChange={(e) => setFormData({ ...formData, tc_no: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Telefon"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Poliçe Bilgileri */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-black">2</span>
                    <span>Poliçe Bilgileri</span>
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Poliçe No *"
                      value={formData.police_no}
                      onChange={(e) => setFormData({ ...formData, police_no: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      required
                      value={formData.sigorta_turu}
                      onChange={(e) => setFormData({ ...formData, sigorta_turu: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sigorta Türü Seçin *</option>
                      {sigortaTurleri.map(tur => (
                        <option key={tur} value={tur}>{tur}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={formData.sirket}
                      onChange={(e) => setFormData({ ...formData, sirket: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sigorta Şirketi Seçin *</option>
                      {sigortaSirketleri.map(sirket => (
                        <option key={sirket} value={sirket}>{sirket}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Plaka"
                      value={formData.plaka}
                      onChange={(e) => setFormData({ ...formData, plaka: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Belge Seri"
                      value={formData.belge_seri}
                      onChange={(e) => setFormData({ ...formData, belge_seri: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="date"
                      required
                      placeholder="Başlangıç Tarihi"
                      value={formData.baslangic_tarihi}
                      onChange={(e) => setFormData({ ...formData, baslangic_tarihi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="date"
                      required
                      placeholder="Bitiş Tarihi"
                      value={formData.bitis_tarihi}
                      onChange={(e) => setFormData({ ...formData, bitis_tarihi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Ödeme Bilgileri */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black">3</span>
                    <span>Ödeme Bilgileri</span>
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Prim Tutarı (₺) *"
                      value={formData.prim_tutari}
                      onChange={(e) => setFormData({ ...formData, prim_tutari: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      readOnly
                      placeholder="Komisyon Tutarı (₺) - Otomatik"
                      value={formData.komisyon_tutari}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                    <select
                      value={formData.odeme_sekli}
                      onChange={(e) => setFormData({ ...formData, odeme_sekli: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Nakit">Nakit</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Havale">Havale</option>
                      <option value="Çek">Çek</option>
                    </select>
                    <select
                      value={formData.satisci_id}
                      onChange={(e) => setFormData({ ...formData, satisci_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Satışçı Seçin</option>
                      {satiscilar.map(satisci => (
                        <option key={satisci.id} value={satisci.id}>{satisci.ad_soyad}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Açıklama"
                      value={formData.aciklama}
                      onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span className="font-semibold">{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

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
    </ProtectedRoute>
  )
}
