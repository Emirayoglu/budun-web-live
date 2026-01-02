import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Musteri {
  id: number
  ad_soyad: string
  tc_no?: string
  telefon?: string
  email?: string
  adres?: string
  kayit_tarihi: string
}

export interface Satisci {
  id: number
  ad_soyad: string
  telefon?: string
  email?: string
  komisyon_orani: number
  durum: string
}

export interface Police {
  id: number
  musteri_id: number
  satisci_id?: number
  police_no: string
  sigorta_turu: string
  sirket: string
  baslangic_tarihi: string
  bitis_tarihi: string
  prim_tutari: number
  komisyon_tutari: number
  odeme_sekli: string
  aciklama?: string
  yenileme_durumu: string
  odenen_tutar?: number
  odeme_tarihi?: string
  kayit_tarihi: string
}

