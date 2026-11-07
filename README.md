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

## 🚀 Cara Menjalankan & Mengaktifkan Kamera

Karena Web AR memerlukan izin akses kamera (`navigator.mediaDevices.getUserMedia`), semua browser modern (Chrome, Edge, Safari, Firefox) **memblokir kamera jika file dibuka langsung melalui `file:///...`**. Kamera **HANYA bisa menyala** jika dibuka melalui **`http://localhost`** atau **`HTTPS`**.

### Cara 1: Menggunakan `start-server.bat` (Paling Praktis di Windows):
1. Cukup **klik dua kali (double-click)** file **`start-server.bat`** di folder proyek ini.
2. Script ini akan secara otomatis:
   - Menjalankan server lokal Python di port 8000.
   - Membuka browser Anda langsung ke `http://localhost:8000`.
3. Klik tombol **"Nyalakan Kamera & Mulai AR"** dan pilih **"Izinkan / Allow"** pada pop-up izin kamera browser.

### Cara 2: Menggunakan Terminal / Command Prompt:
```bash
python -m http.server 8000
```
Lalu buka browser Anda ke: `http://localhost:8000`

### Menguji di Smartphone:
1. Pastikan laptop dan ponsel Anda terhubung ke jaringan Wi-Fi yang sama, atau gunakan tunnel HTTPS seperti **ngrok** (`ngrok http 8000`) atau deploy ke GitHub Pages / Vercel / Netlify (gratis HTTPS).
2. Buka link tersebut di browser ponsel (Chrome di Android atau Safari di iOS).
3. Izinkan akses kamera ketika pop-up izin muncul.
4. Buka [`print-markers.html`](file:///c:/Users/UseR/Desktop/New%20Ar%20Project/print-markers.html) di laptop untuk mencetak atau menampilkan marker, lalu arahkan kamera HP ke layar monitor / kertas cetak!

