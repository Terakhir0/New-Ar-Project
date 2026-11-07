# 🦕 AR Dinosaur Explorer - Web AR Statis Interaktif

Aplikasi Web Augmented Reality (AR) berbasis web statis (HTML, CSS, JavaScript) menggunakan framework **A-Frame** dan **AR.js**. Pengguna dapat mengarahkan kamera ke marker / QR code untuk memunculkan objek 3D dinosaurus, mendengarkan suara raungan beserta animasinya, membaca sejarah singkatnya, serta menutup objek dengan tombol silang (X) untuk memindai marker lainnya.

---

## 🌟 Fitur Utama

1. **Pemindaian Marker / QR Code Kamera AR:**
   - Mendeteksi marker secara langsung melalui kamera HP / webcam laptop.
   - Mendukung preset Hiro, Kanji, Matrix Barcode, dan file custom Pattern `.patt`.
2. **Objek 3D Beranimasi:**
   - Menampilkan model 3D realistis dengan animasi *Idle* (santai) yang berputar secara otomatis.
   - Interaksi sentuh/mouse drag untuk memutar (rotasi) objek 3D di layar.
3. **Tombol Suara & Animasi Roar:**
   - Tombol suara dengan visualizer gelombang audio.
   - Menjalankan efek suara raungan (*roar sound*) sekaligus memicu animasi mengaum (*roar animation*) pada dinosaurus 3D.
   - Dilengkapi *Synthesizer Web Audio API bawaan* sebagai cadangan otomatis jika file suara belum diisi.
4. **Nama & Sejarah Singkat Dinosaurus:**
   - Menampilkan kartu identitas dinosaurus (Nama, Nama Ilmiah, Periode Era, Makanan, Ukuran, dan Bobot).
   - Tombol **Sejarah Singkat** membuka modal informasi detail dan fakta-fakta menarik.
5. **Tombol Silang (✖ / Close Button):**
   - Menghilangkan objek 3D yang sedang aktif dan menghentikan suara.
   - Mengaktifkan kembali mode bidik kamera untuk memindai marker dinosaurus lainnya tanpa jitter.
6. **Modal Contoh Marker & Simulasi Scan:**
   - Tombol menu grid marker di kanan atas menampilkan semua marker yang dapat diunduh, dicetak, atau dibuka di HP lain.
   - Tombol **Simulasi Scan** memungkinkan pengujian langsung di layar monitor tanpa perlu mencetak kertas marker.

---

## 📁 Struktur Direktori

```text
New Ar Project/
├── index.html              # Halaman web AR utama
├── print-markers.html      # Halaman cetak semua marker (siap print A4)
├── start-server.bat        # [1-KLIK] Script otomatis jalankan server & buka browser
├── css/
│   └── style.css           # Tampilan HUD modern, glassmorphism, & modal responsif
├── js/
│   ├── dino-data.js        # [PENTING] Tempat konfigurasi placeholder data dinosaurus
│   ├── audio-synth.js      # Pemutar audio & synthesizer raungan Web Audio API
│   └── app.js              # Pengendali logika AR, izin kamera, UI, & animasi
├── assets/
│   ├── sounds/             # Folder file suara (.wav / .mp3)
│   ├── qr/                 # Folder gambar marker & file pattern (.patt)
│   ├── T-Rex/              # Model 3D Tyrannosaurus Rex (.gltf + textures)
│   ├── Spinosaur/          # Model 3D Spinosaurus (.gltf + textures)
│   ├── Velociraptor/       # Model 3D Velociraptor (.gltf + textures)
│   └── Brachiosaur/        # Model 3D Brachiosaurus (.gltf + textures)
└── README.md               # Dokumentasi panduan
```

---

## 🛠️ Panduan Mengganti & Menyesuaikan Placeholder

Semua konfigurasi placeholder dapat Anda ubah dengan mudah pada file **`js/dino-data.js`**.

### 1. Mengganti Objek 3D (.gltf / .glb)
1. Salin folder model 3D baru Anda ke dalam folder `assets/NamaDinosaurus/`.
2. Buka `js/dino-data.js` dan sesuaikan properti `modelUrl`:
   ```javascript
   model: {
     url: "assets/NamaFolder/scene.gltf", // atau file .glb
     scale: "0.1 0.1 0.1",              // sesuaikan ukuran objek
     position: "0 0 0",
     rotation: "0 0 0",
     ...
   }
   ```
3. Jika menggunakan `<a-assets>` di `index.html`, pastikan tag `<a-asset-item>` mengarah ke file model tersebut.

### 2. Mengganti Nama Animasi (Idle & Roar)
Pada file `js/dino-data.js`:
```javascript
idleAnimation: "nama_animasi_santai", // Animasi berulang saat diam
roarAnimation: "nama_animasi_mengaum"  // Animasi saat tombol suara ditekan
```
> **Tips:** Untuk mengetahui daftar nama animasi di dalam file GLTF Anda, Anda dapat membuka file `.gltf` dengan text editor dan mencari kata kunci `"animations": [ {"name": ...} ]`.

### 3. Mengganti Suara Audio Roar
1. Letakkan file audio baru Anda (format `.mp3` atau `.wav`) di dalam folder `assets/sounds/`.
2. Buka `js/dino-data.js` dan ubah properti `sound.url`:
   ```javascript
   sound: {
     url: "assets/sounds/suara-kustom-anda.mp3",
     synthType: "trex"
   }
   ```

### 4. Mengganti Marker / QR Code
- **Preset Hiro / Kanji:** Cukup tetapkan `preset: "hiro"` atau `preset: "kanji"`.
- **Barcode Matrix:** Gunakan `type: "barcode"` dan nomor `barcodeValue: 0, 1, 2, ...`.
- **Custom Pattern (.patt):**
  1. Siapkan file pola kustom `.patt` di `assets/qr/`.
  2. Ubah `type: "pattern"` dan `patternUrl: "assets/qr/nama-file.patt"`.

### 5. Mengganti Nama & Sejarah Singkat
Ubah properti teks pada `js/dino-data.js`:
```javascript
name: "Nama Dinosaurus",
scientificName: "Nama Ilmiah",
subtitle: "Julukan Singkat",
era: "Periode Geologis",
diet: "Karnivora / Herbivora / Omnivora",
size: "Dimensi Panjang & Tinggi",
weight: "Perkiraan Berat",
history: `Paragraf sejarah singkat dinosaurus...`,
funFacts: [
  "Fakta menarik 1",
  "Fakta menarik 2"
]
```

---

## 🌐 Cara Publikasi ke GitHub Pages (Akses Online Tanpa Server Lokal)

Aplikasi Web AR ini dirancang murni berbasis **Web Statis (HTML/CSS/JS)** tanpa memerlukan backend server sama sekali. Anda dapat meng-hostingnya secara **gratis di GitHub Pages** dengan dukungan **HTTPS otomatis**, sehingga izin kamera langsung aktif di semua smartphone (Android dan iPhone) maupun laptop.

### Langkah-langkah Unggah ke GitHub & Mengaktifkan GitHub Pages:

#### 1. Buat Repository Baru di GitHub
1. Buka [github.com/new](https://github.com/new) di browser Anda.
2. Berikan nama repository, misalnya: `ar-dinosaurus`.
3. Pilih **Public**.
4. Jangan centang "Add a README file" (karena sudah ada di folder lokal).
5. Klik **Create repository**.

#### 2. Sambungkan & Unggah Kode ke GitHub
Buka terminal / Command Prompt di folder proyek ini (`C:\Users\UseR\Desktop\New Ar Project`), lalu jalankan perintah berikut (ganti `<username>` dan `<repo-name>` dengan milik Anda):

```bash
git add .
git commit -m "Update AR Dinosaurus dengan 5 Dinosaurus & Audio Asli"
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

#### 3. Aktifkan Fitur GitHub Pages
1. Pada halaman repository GitHub Anda, klik menu tab **Settings** (Pengaturan) di bagian atas.
2. Di sidebar sebelah kiri, klik menu **Pages** (di bawah kategori *Code and automation*).
3. Pada bagian **Build and deployment**:
   - **Source**: Pilih **Deploy from a branch**.
   - **Branch**: Pilih **main** dan folder **/(root)**.
   - Klik tombol **Save**.
4. Tunggu sekitar 1–2 menit, refresh halaman Settings -> Pages tersebut.
5. Anda akan mendapatkan URL live resmi, misalnya:
   ```text
   https://<username>.github.io/<repo-name>/
   ```

---

## 📱 Cara Menggunakan di Smartphone:

1. Buka tautan GitHub Pages Anda (`https://<username>.github.io/<repo-name>/`) di browser ponsel (Google Chrome di Android atau Safari di iPhone).
2. Klik **"Nyalakan Kamera & Mulai AR"**, lalu pilih **"Izinkan / Allow"** pada pop-up izin akses kamera.
3. Buka halaman [`print-markers.html`](file:///c:/Users/UseR/Desktop/New%20Ar%20Project/print-markers.html) di layar monitor laptop untuk menampilkan marker, atau cetak di kertas A4.
4. Arahkan kamera ponsel Anda ke gambar marker:
   - **Marker Hiro** ➔ Memunculkan **Tyrannosaurus Rex**
   - **Marker Kanji** ➔ Memunculkan **Spinosaurus**
   - **Barcode Matrix 2** ➔ Memunculkan **Velociraptor**
   - **Barcode Matrix 3** ➔ Memunculkan **Brachiosaurus**
   - **Barcode Matrix 4** ➔ Memunculkan **Pterodactyl**
5. Tekan tombol **🔊 Suara Roar** untuk mendengarkan raungan asli dan animasi gerak mengaum.
6. Tekan tombol **📖 Sejarah Singkat** untuk melihat fakta dan sejarah lengkapnya.
7. Tekan tombol **✖ Silang** di kanan atas untuk menghilangkan objek dan memindai dinosaurus lain!

