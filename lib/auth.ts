// Authentication utilities
import { supabase } from './supabase'

export interface Kullanici {
  id: number
  kullanici_adi: string
  ad_soyad: string
  durum: string
}

// Şifre hash fonksiyonu (EXE ile aynı - browser için Web Crypto API kullanıyoruz)
async function hashSifre(sifre: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(sifre)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Kullanıcı giriş kontrolü
export async function kullaniciGiris(kullaniciAdi: string, sifre: string): Promise<{ success: boolean; kullanici?: Kullanici }> {
  try {
    // Kullanıcı adına göre kullanıcıyı bul
    const { data: kullanicilar, error } = await supabase
      .from('kullanicilar')
      .select('*')
      .eq('kullanici_adi', kullaniciAdi)
      .limit(1)

    if (error) throw error

    if (!kullanicilar || kullanicilar.length === 0) {
      return { success: false }
    }

    const kullanici = kullanicilar[0]

    // Durum kontrolü
    if (kullanici.durum !== 'Aktif') {
      return { success: false }
    }

    // Şifre kontrolü
    const sifreHash = await hashSifre(sifre)
    if (kullanici.sifre_hash === sifreHash) {
      // Şifre doğru - kullanıcı bilgilerini döndür (sifre_hash hariç)
      const kullaniciBilgisi: Kullanici = {
        id: kullanici.id,
        kullanici_adi: kullanici.kullanici_adi,
        ad_soyad: kullanici.ad_soyad,
        durum: kullanici.durum
      }
      return { success: true, kullanici: kullaniciBilgisi }
    }

    return { success: false }
  } catch (error) {
    console.error('Giriş hatası:', error)
    return { success: false }
  }
}

// Kullanıcı bilgisini localStorage'a kaydet
export function kullaniciKaydet(kullanici: Kullanici): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('budun_kullanici', JSON.stringify(kullanici))
  }
}

// Kullanıcı bilgisini localStorage'dan oku
export function kullaniciOku(): Kullanici | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('budun_kullanici')
    if (stored) {
      return JSON.parse(stored) as Kullanici
    }
  } catch (error) {
    console.error('Kullanıcı okuma hatası:', error)
  }
  
  return null
}

// Kullanıcı çıkışı
export function kullaniciCikis(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('budun_kullanici')
  }
}

