'use client'

import Navbar from '@/components/Navbar'
import { BarChart3, Download } from 'lucide-react'

export default function RaporlarPage() {
  return (
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
          <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg">
            <Download className="w-5 h-5" />
            <span className="font-semibold">Excel İndir</span>
          </button>
        </div>

        {/* Rapor Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Aylık Satış Raporu', color: 'blue', icon: '📊' },
            { title: 'Komisyon Raporu', color: 'green', icon: '💰' },
            { title: 'Yenileme Raporu', color: 'orange', icon: '🔄' },
            { title: 'Müşteri Analizi', color: 'purple', icon: '👥' },
            { title: 'Şirket Bazlı Rapor', color: 'red', icon: '🏢' },
            { title: 'Ürün Bazlı Rapor', color: 'yellow', icon: '📈' },
          ].map((rapor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-4">{rapor.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{rapor.title}</h3>
              <p className="text-sm text-gray-500 mb-4">Detaylı analiz görüntüle</p>
              <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all font-semibold">
                Raporu Görüntüle
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

