'use client'

import Navbar from '@/components/Navbar'
import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'

export default function PolicePage() {
  const [policeler, setPoliceler] = useState([])

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
          <h3 className="text-xl font-bold text-gray-800 mb-6">Mevcut Poliçeler</h3>
          
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Henüz poliçe eklenmemiş</p>
            <p className="text-sm mt-2">Yukarıdaki formu doldurup "Yeni Poliçe" butonuna tıklayın</p>
          </div>
        </div>
      </main>
    </div>
  )
}

