'use client'

import Navbar from '@/components/Navbar'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function FinansPage() {
  return (
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
            <p className="text-3xl font-black text-blue-900">0 ₺</p>
            <p className="text-sm text-gray-500 mt-2">Bu ay</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Tahsil Edilen</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-green-900">0 ₺</p>
            <p className="text-sm text-gray-500 mt-2">Bu ay</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Kalan Borç</h3>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-red-900">0 ₺</p>
            <p className="text-sm text-gray-500 mt-2">Toplam</p>
          </div>
        </div>

        {/* Borç Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Borç Listesi</h3>
          
          <div className="text-center py-16 text-gray-400">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Borç kaydı bulunmuyor</p>
            <p className="text-sm mt-2">Nakit ödemeli poliçeler burada görünecek</p>
          </div>
        </div>
      </main>
    </div>
  )
}

