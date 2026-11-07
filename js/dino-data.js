/**
 * ============================================================================
 * KONFIGURASI DATA DINOSAURUS & PLACEHOLDER AR (dino-data.js)
 * ============================================================================
 * File ini berisi semua data placeholder yang dapat Anda ubah dan ganti sendiri:
 * - Nama & Nama Ilmiah Dinosaurus
 * - Model 3D (.gltf / .glb)
 * - Animasi Idle & Animasi Roar
 * - Suara Audio Roar (.mp3 / .wav)
 * - QR Code / AR Marker (Hiro, Kanji, Barcode, Pattern .patt)
 * - Sejarah Singkat & Fakta Menarik
 * 
 * CARA MENGGANTI PLACEHOLDER:
 * 1. Menambah/Mengganti 3D Model:
 *    Simpan file .gltf atau .glb Anda ke folder `assets/NamaDino/`, lalu ubah
 *    properti `modelUrl` di bawah ini.
 * 2. Mengganti Animasi:
 *    Ubah nilai `idleAnimation` dan `roarAnimation` sesuai nama clip di model 3D Anda.
 * 3. Mengganti Suara:
 *    Simpan file suara (.mp3 / .wav) ke `assets/sounds/` lalu ubah `soundUrl`.
 * 4. Mengganti Marker / QR:
 *    Bisa menggunakan preset AR.js ('hiro', 'kanji'), barcode matrix, atau
 *    file pattern kustom `.patt` di folder `assets/qr/`.
 * ============================================================================
 */

window.DINO_DATABASE = [
  {
    id: "trex",
    name: "Tyrannosaurus Rex",
    scientificName: "Tyrannosaurus rex",
    subtitle: "Raja Kadal Tirani",
    era: "Kapur Akhir (68–66 Juta Tahun Lalu)",
    diet: "Karnivora",
    size: "Panjang 12 m | Tinggi 4 m",
    weight: "8 - 14 Ton",

    // --- PLACEHOLDER MARKER / QR ---
    marker: {
      type: "hiro", // Pilihan: 'hiro', 'kanji', 'barcode', 'pattern'
      preset: "hiro",
      barcodeValue: null,
      patternUrl: null,
      imagePreview: "assets/qr/trex-hiro.svg",
      description: "Pindai Marker Hiro / QR T-Rex"
    },

    // --- PLACEHOLDER 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/T-Rex/scene.gltf",
      scale: "0.0018 0.0018 0.0018",
      position: "0 0 0",
      rotation: "0 0 0",
      idleAnimation: "idle attack", // Klip animasi saat santai (loop)
      roarAnimation: "Big roar step" // Klip animasi saat tombol suara ditekan
    },

    // --- PLACEHOLDER SUARA ---
    sound: {
      url: "assets/sounds/trex-roar.wav",
      synthType: "trex" // Synthesizer Web Audio API otomatis jika file audio belum ada
    },

    // --- PLACEHOLDER SEJARAH SINGKAT ---
    history: `Tyrannosaurus Rex (T-Rex) adalah salah satu dinosaurus predator karnivora darat terbesar dan paling mematikan yang pernah menjelajahi bumi pada akhir periode Kapur. Fosil-fosilnya sebagian besar ditemukan di formasi batuan Amerika Utara bagian barat.

Memiliki tengkorak kokoh berukuran hingga 1,5 meter dengan rahang berdaya gigit mencapai 35.000 hingga 57.000 Newton—cukup kuat untuk meremukkan tulang mangsanya seketika. Meskipun memiliki lengan depan yang sangat kecil dengan hanya dua jari fungsional, lengan tersebut berotot kuat.`,
    
    funFacts: [
      "Gigi T-Rex terbesar mencapai panjang 30 cm termasuk akarnya.",
      "Memiliki indera penciuman tajam yang mirip dengan burung pemakan bangkai modern.",
      "Kecepatan larinya diperkirakan antara 20–27 km/jam."
    ]
  },

  {
    id: "spinosaurus",
    name: "Spinosaurus",
    scientificName: "Spinosaurus aegyptiacus",
    subtitle: "Kadal Berduri Raksasa",
    era: "Kapur (112–93 Juta Tahun Lalu)",
    diet: "Karnivora / Piscivora (Pemakan Ikan)",
    size: "Panjang 14–18 m | Tinggi 5 m",
    weight: "7 - 12 Ton",

    // --- PLACEHOLDER MARKER / QR ---
    marker: {
      type: "kanji",
      preset: "kanji",
      barcodeValue: null,
      patternUrl: null,
      imagePreview: "assets/qr/spino-kanji.svg",
      description: "Pindai Marker Kanji / QR Spinosaurus"
    },

    // --- PLACEHOLDER 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Spinosaur/scene.gltf",
      scale: "0.22 0.22 0.22",
      position: "0 0 0",
      rotation: "0 0 0",
      idleAnimation: "SK_Spinosaurus.ao|AS_Spino_Idle",
      roarAnimation: "SK_Spinosaurus.ao|AS_Spino_Emote_Threaten"
    },

    // --- PLACEHOLDER SUARA ---
    sound: {
      url: "assets/sounds/spino-roar.wav",
      synthType: "spino"
    },

    // --- PLACEHOLDER SEJARAH SINGKAT ---
    history: `Spinosaurus adalah dinosaurus theropoda semi-akuatik yang memegang rekor sebagai predator terpanjang dalam sejarah bumi, melampaui ukuran Tyrannosaurus dan Giganotosaurus. Hidup di daerah rawa dan sungai purba di wilayah yang kini menjadi Afrika Utara.

Ciri paling mencolok adalah sirip/layar tulang punggung raksasa yang tingginya mencapai 1,65 meter. Moncongnya yang panjang dan silinder mirip buaya dipersenjatai gigi kerucut lurus yang sangat efektif untuk mencengkeram ikan purba raksasa seperti Onchopristis.`,
    
    funFacts: [
      "Merupakan dinosaurus pemangsa pertama yang terbukti mampu berenang secara aktif.",
      "Ekornya berbentuk dayung pipih yang berfungsi sebagai pendorong kuat di dalam air.",
      "Fosil aslinya di Munich hancur saat Perang Dunia II pada tahun 1944."
    ]
  },

  {
    id: "velociraptor",
    name: "Velociraptor",
    scientificName: "Velociraptor mongoliensis",
    subtitle: "Pencuri yang Cepat & Gesit",
    era: "Kapur Akhir (75–71 Juta Tahun Lalu)",
    diet: "Karnivora",
    size: "Panjang 2 m | Tinggi 0.5 m",
    weight: "15 - 20 Kg",

    // --- PLACEHOLDER MARKER / QR ---
    marker: {
      type: "barcode",
      preset: null,
      barcodeValue: 2,
      patternUrl: null,
      imagePreview: "assets/qr/velo-barcode2.svg",
      description: "Pindai Marker Barcode 2 / QR Velociraptor"
    },

    // --- PLACEHOLDER 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Velociraptor/scene.gltf",
      scale: "0.85 0.85 0.85",
      position: "0 0 0",
      rotation: "0 0 0",
      idleAnimation: "SK_Velociraptor.ao|AS_Velo_Idle_V2",
      roarAnimation: "SK_Velociraptor.ao|AS_Velo_Emote_Threaten"
    },

    // --- PLACEHOLDER SUARA ---
    sound: {
      url: "assets/sounds/velociraptor-roar.wav",
      synthType: "raptor"
    },

    // --- PLACEHOLDER SEJARAH SINGKAT ---
    history: `Velociraptor adalah dromaeosaurid berukuran kecil namun sangat cerdas, lincah, dan berbahaya yang hidup di Gurun Gobi (Mongolia dan Tiongkok). Meskipun di film fiksi sering digambarkan seukuran manusia dengan kulit bersisik, bukti fosil modern membuktikan bahwa Velociraptor sejati berbulu lebat seperti burung pemangsa.

Senjata mematikan utamanya adalah cakar melengkung besar (sickle claw) sepanjang 6,5 cm pada jari kedua setiap kaki belakangnya, yang digunakan untuk menusuk dan mengunci mangsa saat melompat menyergap.`,
    
    funFacts: [
      "Di dunia nyata, Velociraptor hanya seukuran anjing kalkun besar atau serigala kecil.",
      "Memiliki pergelangan tangan fleksibel yang memungkinkannya melipat tangan ke samping seperti sayap unggas.",
      "Ditemukan fosil terkenal 'Fighting Dinosaurs' yang terkunci dalam pertarungan mati melawan Protoceratops."
    ]
  },

  {
    id: "brachiosaurus",
    name: "Brachiosaurus",
    scientificName: "Brachiosaurus altithorax",
    subtitle: "Kadal Lengan Raksasa",
    era: "Jura Akhir (154–150 Juta Tahun Lalu)",
    diet: "Herbivora",
    size: "Panjang 21 m | Tinggi 12 m",
    weight: "35 - 58 Ton",

    // --- PLACEHOLDER MARKER / QR ---
    marker: {
      type: "barcode",
      preset: null,
      barcodeValue: 3,
      patternUrl: null,
      imagePreview: "assets/qr/brachio-barcode3.svg",
      description: "Pindai Marker Barcode 3 / QR Brachiosaurus"
    },

    // --- PLACEHOLDER 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Brachiosaur/scene.gltf",
      scale: "0.024 0.024 0.024",
      position: "0 0 0",
      rotation: "0 0 0",
      idleAnimation: "Bip001|Take 001|BaseLayer",
      roarAnimation: "Bip001|Take 001|BaseLayer"
    },

    // --- PLACEHOLDER SUARA ---
    sound: {
      url: "assets/sounds/brachio-roar.wav",
      synthType: "brachio"
    },

    // --- PLACEHOLDER SEJARAH SINGKAT ---
    history: `Brachiosaurus adalah sauropoda raksasa yang menjadi ikon dinosaurus berleher panjang. Namanya yang berarti 'kadal lengan' diberikan karena tidak seperti kebanyakan dinosaurus sauropoda lainnya, kaki depan Brachiosaurus jauh lebih panjang daripada kaki belakangnya.

Struktur tubuh tersebut memberikan postur miring ke atas menyerupai jerapah modern, memungkinkan Brachiosaurus meraih pucuk-pucuk pohon runjung (conifer) purba setinggi 9 hingga 12 meter dari permukaan tanah tanpa perlu mengangkat tubuhnya.`,
    
    funFacts: [
      "Jantungnya diperkirakan berbobot ratusan kilogram untuk memompa darah hingga ke ujung kepalanya.",
      "Diperkirakan mengonsumsi hingga 400 kg dedaunan segar setiap harinya.",
      "Lubang hidungnya berada di puncak kepala di atas matanya."
    ]
  }
];

