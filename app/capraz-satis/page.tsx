'use client'

import Navbar from '@/components/Navbar'
import { Users, Target } from 'lucide-react'

export default function CaprazSatisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-pink-900">Çapraz Satış</h1>
              <p className="text-gray-600">Ek ürün satış fırsatları</p>
            </div>
          </div>
        </div>

        {/* Fırsatlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              musteri: 'Ahmet Yılmaz',
              mevcut: 'Kasko',
              oneri: ['Trafik', 'Ferdi Kaza'],
              color: 'blue',
            },
            {
              musteri: 'Ayşe Demir',
              mevcut: 'Konut',
              oneri: ['Dask', 'Deprem'],
              color: 'green',
            },
            {
              musteri: 'Mehmet Kaya',
              mevcut: 'Sağlık',
              oneri: ['Hayat', 'Ferdi Kaza'],
              color: 'purple',
            },
          ].map((firsat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{firsat.musteri}</h3>
                  <p className="text-sm text-gray-500">Mevcut: {firsat.mevcut}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Önerilen Ürünler:</p>
                <div className="flex flex-wrap gap-2">
                  {firsat.oneri.map((urun, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                    >
                      {urun}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                Teklif Gönder
              </button>
            </div>
          ))}
        </div>

        {/* Boş Durum */}
        {false && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-center py-16 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Çapraz satış fırsatı bulunmuyor</p>
              <p className="text-sm mt-2">Mevcut müşterilere önerilecek ürünler burada görünecek</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}




