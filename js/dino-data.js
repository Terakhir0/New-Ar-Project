/**
 * ============================================================================
 * KONFIGURASI DATA DINOSAURUS & PLACEHOLDER AR (dino-data.js)
 * ============================================================================
 * File ini berisi semua data dinosaurus:
 * - Nama & Nama Ilmiah Dinosaurus
 * - Model 3D (.glb)
 * - Animasi Idle & Animasi Roar
 * - Suara Audio Roar (.wav / .mp3)
 * - QR Code Marker Pattern (.patt) & Gambar Preview (.png)
 * - Sejarah Singkat & Fakta Menarik
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

    // --- MARKER QR PATTERN ---
    marker: {
      type: "pattern",
      preset: null,
      barcodeValue: null,
      patternUrl: "assets/qr/pattern-T-rex%20qr-code.patt",
      imagePreview: "assets/qr/pattern-T-rex%20qr-code.png",
      description: "Pindai QR Marker T-Rex"
    },

    // --- 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/T-Rex/t-rex.glb",
      scale: "0.16 0.16 0.16",
      position: "0 0.003 0.35",
      rotation: "0 0 0",
      idleAnimation: "idle attack",
      roarAnimation: "Big roar step"
    },

    // --- SUARA AUDIO ---
    sound: {
      url: "assets/Sound/T-Rex Roar.mp3",
      synthType: "trex"
    },

    // --- SEJARAH SINGKAT ---
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

    // --- MARKER QR PATTERN ---
    marker: {
      type: "pattern",
      preset: null,
      barcodeValue: null,
      patternUrl: "assets/qr/pattern-Spinosaurus%20qr-code.patt",
      imagePreview: "assets/qr/pattern-Spinosaurus%20qr-code.png",
      description: "Pindai QR Marker Spinosaurus"
    },

    // --- 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Spinosaur/spinosaur_the_isle_lecasi.glb",
      scale: "0.55 0.55 0.55",
      position: "0 0.45 0.35",
      rotation: "0 0 0",
      idleAnimation: "SK_Spinosaurus.ao|AS_Spino_WalkF",
      roarAnimation: "SK_Spinosaurus.ao|AS_Spino_Emote_Broadcast"
    },

    // --- SUARA AUDIO ---
    sound: {
      url: "assets/Sound/Spinosaurs roar.mp3",
      synthType: "spino"
    },

    // --- SEJARAH SINGKAT ---
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

    // --- MARKER QR PATTERN ---
    marker: {
      type: "pattern",
      preset: null,
      barcodeValue: null,
      patternUrl: "assets/qr/pattern-velociraptor%20qr-code.patt",
      imagePreview: "assets/qr/pattern-velociraptor%20qr-code.png",
      description: "Pindai QR Marker Velociraptor"
    },

    // --- 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Velociraptor/velociraptor_the_isle_lecasi.glb",
      scale: "0.35 0.35 0.35",
      position: "0 0.35 0.21",
      rotation: "0 0 0",
      idleAnimation: "SK_Velociraptor.ao|AS_Velo_Crouch_Idle",
      roarAnimation: "SK_Velociraptor.ao|AS_Velo_Emote_Danger"
    },

    // --- SUARA AUDIO ---
    sound: {
      url: "assets/Sound/Velociraptor call.mp3",
      synthType: "raptor"
    },

    // --- SEJARAH SINGKAT ---
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

    // --- MARKER QR PATTERN ---
    marker: {
      type: "pattern",
      preset: null,
      barcodeValue: null,
      patternUrl: "assets/qr/pattern-brachi%20qr-code.patt",
      imagePreview: "assets/qr/pattern-brachi%20qr-code.png",
      description: "Pindai QR Marker Brachiosaurus"
    },

    // --- 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Brachiosaur/brachiosaurus_ar_card.glb",
      scale: "0.12 0.12 0.12",
      position: "-0.27 0.35 -0.033",
      rotation: "0 0 0",
      idleAnimation: "Bip001|Take 001|BaseLayer",
      roarAnimation: "Bip001|Take 001|BaseLayer"
    },

    // --- SUARA AUDIO ---
    sound: {
      url: "assets/Sound/Brachiosaurs roar.mp3",
      synthType: "brachio"
    },

    // --- SEJARAH SINGKAT ---
    history: `Brachiosaurus adalah sauropoda raksasa yang menjadi ikon dinosaurus berleher panjang. Namanya yang berarti 'kadal lengan' diberikan karena tidak seperti kebanyakan dinosaurus sauropoda lainnya, kaki depan Brachiosaurus jauh lebih panjang daripada kaki belakangnya.

Struktur tubuh tersebut memberikan postur miring ke atas menyerupai jerapah modern, memungkinkan Brachiosaurus meraih pucuk-pucuk pohon runjung (conifer) purba setinggi 9 hingga 12 meter dari permukaan tanah tanpa perlu mengangkat tubuhnya.`,
    
    funFacts: [
      "Jantungnya diperkirakan berbobot ratusan kilogram untuk memompa darah hingga ke ujung kepalanya.",
      "Diperkirakan mengonsumsi hingga 400 kg dedaunan segar setiap harinya.",
      "Lubang hidungnya berada di puncak kepala di atas matanya."
    ]
  },

  {
    id: "pterodactyl",
    name: "Pterodactyl",
    scientificName: "Pterodactylus antiquus",
    subtitle: "Reptil Terbang Purba",
    era: "Jura Akhir (150–148 Juta Tahun Lalu)",
    diet: "Karnivora / Piscivora",
    size: "Bentang Sayap 1.5 - 2.5 m",
    weight: "2 - 5 Kg",

    // --- MARKER QR PATTERN ---
    marker: {
      type: "pattern",
      preset: null,
      barcodeValue: null,
      patternUrl: "assets/qr/pattern-ptero%20qr-code.patt",
      imagePreview: "assets/qr/pattern-ptero%20qr-code.png",
      description: "Pindai QR Marker Pterodactyl"
    },

    // --- 3D OBJECT & ANIMASI ---
    model: {
      url: "assets/Pterodactyl/pterodactyl_reuploaded_and_retextured.glb",
      scale: "0.5 0.5 0.5",
      position: "-0.005 0.7 -0.01",
      rotation: "0 0 0",
      idleAnimation: "loopIdle",
      roarAnimation: "loopFightIdle"
    },

    // --- SUARA AUDIO ---
    sound: {
      url: "assets/Sound/Pterodactyl_Sound.mp3",
      synthType: "raptor"
    },

    // --- SEJARAH SINGKAT ---
    history: `Pterodactylus adalah genus pterosaurus reptil terbang pertama yang fosilnya berhasil diidentifikasi dalam sejarah paleontologi. Hidup pada periode Jura Akhir di wilayah yang sekarang menjadi Bavaria, Jerman.

Memiliki sayap membran elastis yang terbentuk dari kulit dan otot yang membentang dari jari keempat tangannya yang memanjang hingga ke kaki belakangnya. Paruhnya yang panjang dan ramping dipersenjatai dengan sekitar 90 gigi kerucut kecil untuk menyambar ikan kecil di permukaan perairan.`,
    
    funFacts: [
      "Meskipun sering disebut dinosaurus terbang, secara ilmiah pterosaurus adalah reptil terbang kerabat dekat dinosaurus.",
      "Fosil pertamanya ditemukan pada tahun 1784 oleh ilmuwan Italia Cosimo Alessandro Collini.",
      "Memiliki tulang berongga yang sangat ringan untuk membantunya melayang di udara."
    ]
  }
];
