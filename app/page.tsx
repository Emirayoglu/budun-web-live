'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { 
  FileText, 
  RefreshCw, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { supabase, type Police } from '@/lib/supabase'

export default function Home() {
  const [stats, setStats] = useState({
    totalPoliceler: 0,
    yenilemeBekleyen: 0,
    toplamPrim: 0,
    toplamBorc: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      loadStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Tüm poliçeleri çek
      const { data: policeler, error } = await supabase
        .from('policeler')
        .select('*')
      
      if (error) throw error

      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)

      // İstatistikleri hesapla
      const totalPoliceler = policeler?.length || 0
      
      // 30 gün içinde bitenler
      const yenilemeBekleyen = policeler?.filter(p => {
        const bitis = new Date(p.bitis_tarihi)
        return bitis >= today && bitis <= thirtyDaysLater
      }).length || 0

      // Toplam prim
      const toplamPrim = policeler?.reduce((sum, p) => sum + (p.prim_tutari || 0), 0) || 0

      // Toplam borç (prim - ödenen)
      const toplamBorc = policeler?.reduce((sum, p) => {
        const borc = (p.prim_tutari || 0) - (p.odenen_tutar || 0)
        return sum + Math.max(0, borc)
      }, 0) || 0

      setStats({
        totalPoliceler,
        yenilemeBekleyen,
        toplamPrim,
        toplamBorc
      })
    } catch (err: any) {
      console.error('İstatistik yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-black text-blue-900 mb-4 tracking-tight">
            BUDUN
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern Sigorta Yönetim Sistemi
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Sistem Aktif</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Toplam Poliçeler */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <span className="text-3xl font-black text-blue-900">{stats.totalPoliceler}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Toplam Poliçe</h3>
            <p className="text-xs text-gray-500">Aktif poliçe sayısı</p>
          </div>

          {/* Yenileme Bekleyen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              ) : (
                <span className="text-3xl font-black text-orange-900">{stats.yenilemeBekleyen}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Yenileme Bekleyen</h3>
            <p className="text-xs text-gray-500">30 gün içinde biten</p>
          </div>

          {/* Toplam Prim */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              ) : (
                <span className="text-3xl font-black text-green-900">
                  {stats.toplamPrim.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Toplam Prim</h3>
            <p className="text-xs text-gray-500">TL cinsinden</p>
          </div>

          {/* Toplam Borç */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              ) : (
                <span className="text-3xl font-black text-red-900">
                  {stats.toplamBorc.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Toplam Borç</h3>
            <p className="text-xs text-gray-500">Tahsil edilecek</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Poliçe Gir */}
          <Link href="/police">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Yeni Poliçe</h3>
              <p className="text-blue-100">Poliçe kayıt ve düzenleme</p>
            </div>
          </Link>

          {/* Yenileme Takibi */}
          <Link href="/yenilemeler">
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Yenileme Takibi</h3>
              <p className="text-orange-100">Süresi dolacak poliçeler</p>
            </div>
          </Link>

          {/* Finans */}
          <Link href="/finans">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Finans Yönetimi</h3>
              <p className="text-green-100">Borç ve ödeme takibi</p>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 BUDUN Sigorta Yönetim Sistemi - Tüm hakları saklıdır</p>
          <p className="mt-2">Web + Mobil + Desktop - Her yerden erişin 🌐</p>
        </div>
      </main>
    </div>
  )
}
