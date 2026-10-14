# Nasse Biology

Mavi-lacivert-yeşil temalı, mobil uyumlu biyoloji öğrenme oyunu başlangıç projesi. Vite, Three.js ve Firebase Authentication / Cloud Firestore kullanır.

## İçindekiler
- Ana üs, 9/10/11. sınıf görevleri ve bağlam temelli final
- Kodla oluşturulan etkileşimli 3B hücre, nöron, beyin ve omurilik temsilleri
- Fare ve dokunmatik ekranla döndürme, yakınlaştırma ve parça seçme
- Google ve e-posta/şifre ile Firebase girişi
- Öğrenci ilerlemesini Firestore'a kaydetme
- Firebase kurulmadan görsel keşif için misafir modu

> Not: 3B modeller bu başlangıç sürümünde Three.js geometrileriyle oluşturulmuş öğretim amaçlı temsillerdir; tıbbi/anatomik ölçekte birebir modeller değildir. Daha ayrıntılı modeller için lisansı uygun `.glb` dosyaları `public/models/` klasörüne eklenip GLTFLoader ile yüklenebilir.

## 1. Gerekenler
- Node.js'in güncel LTS sürümü
- Visual Studio Code
- İnternet bağlantısı

## 2. Projeyi aç
ZIP dosyasını çıkart. VS Code içinde `nasse-biology` klasörünü aç. Menüden Terminal > New Terminal seç ve şunları çalıştır:

```bash
npm install
npm run dev
```

Terminalde gösterilen yerel adresi aç (genellikle `http://localhost:5173`). `index.html` dosyasını çift tıklayarak açma; Vite sunucusunu kullan.

Üretim derlemesini denemek için:

```bash
npm run build
npm run preview
```

## 3. Firebase kurulumu (giriş ve kalıcı kayıt)
1. Firebase Console'da yeni proje oluştur.
2. Proje ayarlarından bir Web uygulaması ekle ve web yapılandırma bilgilerini al.
3. Proje kökünde `.env.example` dosyasının kopyasını `.env` adıyla oluştur.
4. `.env` içindeki `VITE_FIREBASE_...` değerlerini kendi Firebase web yapılandırmanla değiştir. Örnek değerleri bırakma.
5. Firebase Console > Authentication > Sign-in method bölümünden **Google** ve **E-posta/Şifre** yöntemlerini etkinleştir.
6. Authentication ayarlarında yerel geliştirme alan adının (`localhost`) ve yayınladığın alan adının yetkili olduğundan emin ol.
7. Firebase Console > Firestore Database bölümünden veritabanı oluştur.
8. Firestore Rules sayfasına `firestore.rules` dosyasındaki kuralları ekleyip yayımla.
9. `.env` dosyasını kaydettikten sonra Vite sunucusunu durdurup yeniden `npm run dev` çalıştır.

Firebase web yapılandırma anahtarları istemci tarafında bulunur; erişim güvenliği kimlik doğrulama ve doğru Firestore kurallarıyla sağlanır. Özel sunucu anahtarlarını asla tarayıcı koduna koyma.

## 4. Google girişini etkinleştir
Firebase Console > Authentication > Settings bölümündeki yetkili alan adlarını kontrol et. Google sağlayıcısında gereken proje bilgilerini tamamla. Yerel geliştirmede `localhost` kullan.

## 5. Gerçekçi 3B model ekleme
`public/models/` klasörüne lisansı kullanıma izin veren `.glb` dosyalarını ekleyebilirsin. Şu anki kod, sahneyi her cihazda çalıştırabilmek için temel şekillerle üretir. GLB yüklemek için `GLTFLoader` kullanılabilir; modelin eksenleri, ölçeği, materyalleri ve parça adları kontrol edilmelidir.

## 6. İçerik ve kazanım uyumu
Sorular öğretim amaçlı başlangıç içeriğidir. Yayına almadan önce 9, 10 ve 11. sınıf Türkiye Yüzyılı Maarif Modeli programındaki resmî öğrenme çıktılarıyla öğretmen rehberliğinde karşılaştırılmalıdır. Özellikle nörotransmitterlerin görevleri bağlama bağlıdır; basitleştirici kesin genellemelerden kaçınılmalıdır.

## 7. İlerleme kaydı
İlerleme `studentProgress/{kullanıcı UID}` belgesinde tutulur. Öğrenci yalnızca kendi belgesine erişebilir. Misafir keşif modunda kayıt Firebase'e gönderilmez.

## Resmî kılavuzlar
- Three.js kurulum: https://threejs.org/manual/pages/installation.html
- Firebase web kurulumu: https://firebase.google.com/docs/web/setup
- Firebase Authentication: https://firebase.google.com/docs/auth/web/start
- Google ile giriş: https://firebase.google.com/docs/auth/web/google-signin
- E-posta/şifre girişi: https://firebase.google.com/docs/auth/web/password-auth


## 8. GitHub Pages ile ücretsiz yayınlama

Bu proje için `.github/workflows/deploy.yml` dosyası hazırdır. GitHub Actions, Vite projesini derleyip `dist` klasörünü yayınlar. Depo adı ne olursa olsun temel adresi otomatik ayarlar.

1. GitHub'da **Nasse-Biology** adlı yeni bir depo oluştur.
2. ZIP'ten çıkan `nasse-biology` klasörünün **içindeki tüm dosya ve klasörleri** depoya yükle. `.github` klasörünün de yüklendiğini kontrol et.
3. Depoda **Settings → Pages → Build and deployment → Source** bölümünde **GitHub Actions** seç.
4. Firebase kullanacaksan depoda **Settings → Secrets and variables → Actions → Variables** bölümünde aşağıdaki altı değişkeni oluştur; değerlerini Firebase Console > Project settings > Your apps bölümünden al:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. **Actions** sekmesine git. `Nasse Biology - GitHub Pages` iş akışı tamamlandığında `https://GITHUB-KULLANICI-ADIN.github.io/Nasse-Biology/` adresini aç.
6. Firebase Console > Authentication > Settings > Authorized domains bölümüne `GITHUB-KULLANICI-ADIN.github.io` alan adını ekle (başına `https://` koyma). Authentication > Sign-in method bölümünden Google ve E-posta/Şifre yöntemlerini etkinleştir.
7. Firestore Database oluştur ve `firestore.rules` içeriğini Rules bölümüne yayımla.

**Notlar:** Depo adı `Nasse-Biology` değilse yayın adresindeki depo adı da değişir; iş akışı temel yolu otomatik ayarlar. Firebase değişkenleri eklenmezse site misafir/keşif modunda açılabilir, ancak giriş ve çevrim içi ilerleme kaydı çalışmaz. `.env` dosyasını GitHub'a yükleme. Vite değişkenleri derleme sırasında siteye eklenir; bu nedenle Firebase web yapılandırması gizli anahtar değildir. Verileri koruyan asıl unsur doğru Firestore güvenlik kurallarıdır.
