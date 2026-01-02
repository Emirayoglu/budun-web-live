'use client'

import Navbar from '@/components/Navbar'
import { RefreshCw, Filter } from 'lucide-react'

export default function YenilemelerPage() {
  return (
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
              <p className="text-gray-600">Süresi dolacak poliçeleri takip edin</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg">
            <Filter className="w-5 h-5" />
            <span className="font-semibold">Filtrele</span>
          </button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold mb-1">ACİL (30 Gün)</p>
                <p className="text-4xl font-black text-red-700">0</p>
              </div>
              <div className="text-5xl">🔴</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-semibold mb-1">YAKIN (60 Gün)</p>
                <p className="text-4xl font-black text-yellow-700">0</p>
              </div>
              <div className="text-5xl">🟡</div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold mb-1">NORMAL (90+ Gün)</p>
                <p className="text-4xl font-black text-green-700">0</p>
              </div>
              <div className="text-5xl">🟢</div>
            </div>
          </div>
        </div>

        {/* Yenileme Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Yenileme Listesi</h3>
          
          <div className="text-center py-16 text-gray-400">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Yenilenecek poliçe bulunmuyor</p>
            <p className="text-sm mt-2">Süresi dolacak poliçeler burada görünecek</p>
          </div>
        </div>
      </main>
    </div>
  )
}

