# 🚀 BUDUN Web - Vercel'e Deploy Rehberi

## ✅ YÖNTEM 1: Vercel CLI (Terminal)

1. Terminal'de şu komutu çalıştırın:
```bash
cd C:\Users\kmc38\Desktop\budun-web
vercel
```

2. İlk defa kullanıyorsanız:
   - Email ile giriş yapın
   - Projeyi onaylayın
   - Deploy başlayacak!

3. Deploy bitince size link verecek:
```
https://budun-web-xxx.vercel.app
```

## ✅ YÖNTEM 2: Vercel Web Dashboard (Tarayıcı)

1. https://vercel.com/new adresine gidin
2. GitHub hesabınızla giriş yapın
3. "Import Git Repository" tıklayın
4. `budun-web` klasörünü seçin (veya GitHub'a yükleyin)
5. Environment Variables ekleyin:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://iivinxqtiyrtznjqkzin.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdmlueHF0aXlydHpuanFremluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODA3NjMsImV4cCI6MjA4Mjg1Njc2M30.IiBTk5HsudUt4wB3sgiJTwgV6MzfBnZ0YZYftuee5_4
   ```
6. "Deploy" butonuna tıklayın!

## 🌍 Deploy Sonrası

✅ Her yerden erişim (tüm dünya)
✅ HTTPS otomatik
✅ Mobil uyumlu
✅ Hızlı CDN
✅ Otomatik güncelleme

## 📱 Link Paylaşımı

Deploy sonrası aldığınız linki:
- Çalışanlarınızla paylaşın
- Telefonunuza kaydedin
- Bookmark yapın

Örnek: https://budun-sigorta.vercel.app

## 🔄 Güncelleme

Kod değiştiğinde:
```bash
git add .
git commit -m "Güncelleme"
vercel --prod
```

Otomatik deploy olur!

## 💡 İpucu

Vercel ücretsiz plan:
- ✅ Sınırsız deploy
- ✅ HTTPS
- ✅ CDN
- ✅ Analytics
- ✅ 100GB bandwidth/ay

Yeterli olacaktır! 🎉

