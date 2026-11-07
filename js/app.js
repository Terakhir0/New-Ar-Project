/**
 * ============================================================================
 * MAIN AR APPLICATION LOGIC (app.js)
 * ============================================================================
 * Mengatur seluruh alur AR:
 * - Inisialisasi & Izin Kamera (getUserMedia) dengan penanganan protokol aman
 * - Event pendeteksian marker (markerFound & markerLost)
 * - Pemutaran suara & animasi roar dinosaurus
 * - Tampilan HUD nama, era, dan modal sejarah singkat
 * - Tombol silang (X) untuk menghilangkan 3D model & scan ulang marker lain
 * - Kunci Tampilan di Layar (Pin to Screen) vs Mode Marker
 * - Touch drag untuk memutar (rotasi) 3D objek secara interaktif
 * - Modal contoh marker / QR dan simulasi scan untuk pengujian
 * - Pemindai QR Code bawaan (BarcodeDetector) untuk mendeteksi QR Code biasa
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Database dinosaurus dari dino-data.js
  const db = window.DINO_DATABASE || [];

  // State Aplikasi
  let activeDino = null;
  let activeDisplayMode = 'marker'; // 'marker' atau 'stage' (pinned/simulated)
  let dismissedCooldown = false;
  let dismissedDinoId = null;

  // DOM Elements - Camera Prompt
  const cameraPromptOverlay = document.getElementById('cameraPromptOverlay');
  const btnStartCamera = document.getElementById('btnStartCamera');
  const fileProtocolWarning = document.getElementById('fileProtocolWarning');

  // DOM Elements - HUD
  const scannerHud = document.getElementById('scannerHud');
  const dinoCard = document.getElementById('dinoCard');
  const dinoNameEl = document.getElementById('dinoName');
  const dinoSubtitleEl = document.getElementById('dinoSubtitle');
  const dinoDietBadge = document.getElementById('dinoDietBadge');
  const dinoEraBadge = document.getElementById('dinoEraBadge');

  // DOM Buttons
  const btnCloseDino = document.getElementById('btnCloseDino');
  const btnSound = document.getElementById('btnSound');
  const btnHistory = document.getElementById('btnHistory');
  const btnOpenMarkers = document.getElementById('btnOpenMarkers');
  const btnPinScreen = document.getElementById('btnPinScreen');

  // DOM Modals & Stage
  const modalHistory = document.getElementById('modalHistory');
  const modalMarkers = document.getElementById('modalMarkers');
  const toastNotice = document.getElementById('toastNotice');
  const cameraStage = document.getElementById('cameraStage');
  const stageModel = document.getElementById('stageModel');

  // Map untuk akses cepat ke data dinosaurus berdasarkan id
  const dinoMap = new Map();
  db.forEach(d => dinoMap.set(d.id, d));

  /**
   * Tampilkan pesan Toast singkat di layar
   */
  let toastTimer = null;
  function showToast(message, duration = 3000) {
    if (!toastNotice) return;
    toastNotice.querySelector('.toast-text').textContent = message;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, duration);
  }

  // ==========================================================================
  // INSIALISASI & PERMISSION KAMERA
  // ==========================================================================

  // Periksa apakah halaman dibuka menggunakan protokol file://
  if (window.location.protocol === 'file:') {
    if (fileProtocolWarning) fileProtocolWarning.classList.add('show');
  }

  /**
   * Mulai dan minta izin akses kamera
   */
  async function startCameraAccess() {
    if (window.location.protocol === 'file:') {
      alert("Browser memblokir akses kamera pada 'file://'. Harap unggah proyek ini ke GitHub dan buka melalui tautan GitHub Pages (HTTPS) agar kamera langsung aktif di HP atau laptop Anda.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser Anda tidak mendukung akses kamera (getUserMedia) atau koneksi tidak aman (harus localhost atau HTTPS).");
      return;
    }

    try {
      showToast("Mengaktifkan kamera...", 2000);

      // Cari elemen video AR.js yang dibuat oleh A-Frame
      let video = document.querySelector('video') || document.getElementById('arjs-video');

      // Jika belum ada video atau belum punya stream aktif, minta stream getUserMedia
      if (!video || !video.srcObject) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        console.log("[Camera] Izin kamera berhasil didapatkan!");

        // Pasangkan stream ke video AR.js
        if (video) {
          video.srcObject = stream;
        } else {
          video = document.createElement('video');
          video.id = 'arjs-video';
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.muted = true;
          video.autoplay = true;
          video.srcObject = stream;
          document.body.appendChild(video);
        }
      }

      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        try {
          await video.play();
        } catch (e) {
          console.log("[Video] play error:", e);
        }
      }

      // Sembunyikan layar prompt pembuka
      if (cameraPromptOverlay) {
        cameraPromptOverlay.classList.add('hidden');
      }

      showToast("📷 Kamera AR Aktif. Arahkan ke Marker!", 3500);
      ensureVideoPlayback();
    } catch (err) {
      console.error("[Camera] Gagal mengakses kamera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("Akses kamera ditolak. Harap klik ikon gembok/pengaturan di samping alamat URL browser dan pilih 'Izinkan Kamera', lalu muat ulang halaman.");
      } else {
        alert("Gagal mengaktifkan kamera: " + (err.message || err.name));
      }
    }
  }

  // Event listener tombol nyalakan kamera
  if (btnStartCamera) {
    btnStartCamera.addEventListener('click', () => {
      startCameraAccess();
    });
  }

  /**
   * Menjamin video kamera dan canvas 3D selalu menutupi 100vw x 100vh tanpa crop atau bar putih
   */
  function enforceFullscreenCamera() {
    const video = document.querySelector('video') || document.getElementById('arjs-video');
    if (video) {
      video.style.setProperty('position', 'fixed', 'important');
      video.style.setProperty('top', '50%', 'important');
      video.style.setProperty('left', '50%', 'important');
      video.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
      video.style.setProperty('width', '100vw', 'important');
      video.style.setProperty('height', '100vh', 'important');
      video.style.setProperty('min-width', '100vw', 'important');
      video.style.setProperty('min-height', '100vh', 'important');
      video.style.setProperty('max-width', 'none', 'important');
      video.style.setProperty('max-height', 'none', 'important');
      video.style.setProperty('margin', '0', 'important');
      video.style.setProperty('margin-left', '0', 'important');
      video.style.setProperty('margin-top', '0', 'important');
      video.style.setProperty('object-fit', 'cover', 'important');
      video.style.setProperty('z-index', '0', 'important');
      video.style.setProperty('display', 'block', 'important');
    }
    const canvas = document.querySelector('.a-canvas');
    if (canvas) {
      canvas.style.setProperty('position', 'fixed', 'important');
      canvas.style.setProperty('top', '0', 'important');
      canvas.style.setProperty('left', '0', 'important');
      canvas.style.setProperty('width', '100vw', 'important');
      canvas.style.setProperty('height', '100vh', 'important');
      canvas.style.setProperty('min-width', '100vw', 'important');
      canvas.style.setProperty('min-height', '100vh', 'important');
      canvas.style.setProperty('margin', '0', 'important');
      canvas.style.setProperty('margin-left', '0', 'important');
      canvas.style.setProperty('margin-top', '0', 'important');
      canvas.style.setProperty('z-index', '1', 'important');
    }
  }

  window.addEventListener('resize', enforceFullscreenCamera);
  window.addEventListener('orientationchange', enforceFullscreenCamera);
  setInterval(enforceFullscreenCamera, 200);

  /**
   * Helper pencocokan nama klip animasi tanpa terpengaruh huruf besar/kecil
   */
  function resolveClipName(entity, requestedClip) {
    if (!entity || !requestedClip) return requestedClip;
    const mesh = entity.getObject3D('mesh');
    if (mesh && mesh.animations && mesh.animations.length > 0) {
      const match = mesh.animations.find(a => a.name.toLowerCase() === requestedClip.toLowerCase());
      if (match) return match.name;
    }
    return requestedClip;
  }

  /**
   * Memastikan elemen video AR.js berputar (autoplay on mobile)
   */
  function ensureVideoPlayback() {
    const checkVideo = setInterval(() => {
      const video = document.querySelector('video') || document.getElementById('arjs-video');
      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.play().catch(e => console.log("[Video] Auto play wait:", e));

        // Auto-sembunyikan prompt jika video sudah mulai mengalirkan frame
        if (video.readyState >= 2 && cameraPromptOverlay) {
          cameraPromptOverlay.classList.add('hidden');
        }
        enforceFullscreenCamera();
        clearInterval(checkVideo);
      }
    }, 300);

    // Timeout berhenti mengecek setelah 8 detik
    setTimeout(() => clearInterval(checkVideo), 8000);
  }

  // Jalankan pengecekan video di awal jika izin kamera sudah pernah diberikan sebelumnya
  ensureVideoPlayback();

  // ==========================================================================
  // MANAJEMEN DINOSAURUS & 3D MODEL
  // ==========================================================================

  /**
   * Mengaktifkan Dinosaurus (Saat Marker / QR Berhasil Discan atau Disimulasikan)
   * @param {string} dinoId
   * @param {string} mode - 'marker' (pada kertas marker) atau 'stage' (melayang di depan layar)
   */
  function activateDinosaur(dinoId, mode = 'marker') {
    const dino = dinoMap.get(dinoId);
    if (!dino) return;

    // Cek jika marker ini baru saja ditutup (cooldown aktif)
    if (dismissedCooldown && dismissedDinoId === dinoId) {
      return;
    }

    // Jika dinosaurus yang sama sudah aktif dalam mode yang sama, abaikan
    if (activeDino && activeDino.id === dinoId && activeDisplayMode === mode) {
      return;
    }

    activeDino = dino;
    activeDisplayMode = mode;
    dismissedDinoId = null;

    console.log(`[AR] Dinosaurus aktif: ${dino.name} (Mode: ${mode})`);

    if (mode === 'stage') {
      // Tampilkan model di anchor kamera (Melayang di depan layar / Simulasi)
      if (cameraStage && stageModel) {
        cameraStage.setAttribute('visible', true);
        stageModel.setAttribute('visible', true);
        stageModel.setAttribute('gltf-model', `url(${dino.model.url})`);
        stageModel.setAttribute('scale', dino.model.scale);
        stageModel.setAttribute('position', dino.model.position);
        stageModel.setAttribute('rotation', dino.model.rotation);

        if (dino.model.idleAnimation) {
          stageModel.setAttribute('animation-mixer', {
            clip: dino.model.idleAnimation,
            loop: 'repeat',
            crossFadeDuration: 0.3
          });
        }
      }
      if (btnPinScreen) btnPinScreen.classList.add('active');
    } else {
      // Mode marker: AR.js menampilkan model secara otomatis saat marker ditemukan.
      // Kita cukup update animasi idle jika model sudah dimuat.
      if (cameraStage) cameraStage.setAttribute('visible', false);

      const activeEntity = document.getElementById(`model-${dino.id}`);
      console.log(`[AR] Mencari elemen: model-${dino.id}`, activeEntity);
      if (activeEntity) {
        // Pastikan entitas terlihat (AR.js bisa menonaktifkan visibility)
        activeEntity.setAttribute('visible', true);
        activeEntity.object3D.visible = true;

        const applyIdle = () => {
          if (dino.model.idleAnimation) {
            activeEntity.setAttribute('animation-mixer', {
              clip: dino.model.idleAnimation,
              loop: 'repeat',
              crossFadeDuration: 0.3
            });
          }
        };

        // Jika model belum dimuat, tunggu event loaded
        if (activeEntity.getObject3D('mesh')) {
          applyIdle();
        } else {
          activeEntity.addEventListener('model-loaded', applyIdle, { once: true });
        }
      } else {
        console.warn(`[AR] Elemen model-${dino.id} TIDAK ditemukan di DOM!`);
      }
      if (btnPinScreen) btnPinScreen.classList.remove('active');
    }

    // 2. Perbarui HUD Informasi
    dinoNameEl.textContent = dino.name;
    dinoSubtitleEl.textContent = dino.subtitle || dino.scientificName;
    dinoDietBadge.textContent = dino.diet;
    dinoEraBadge.textContent = dino.era.split('(')[0].trim();

    // 3. Tampilkan HUD dan tombol Silang, sembunyikan reticle scanner
    dinoCard.classList.add('visible');
    btnCloseDino.style.display = 'flex';
    scannerHud.classList.add('hidden');

    showToast(`🦕 ${dino.name} terdeteksi!`);
  }

  /**
   * Mengambil entitas 3D yang sedang aktif (marker atau stage)
   */
  function getActiveEntity() {
    if (!activeDino) return null;
    if (activeDisplayMode === 'stage') {
      return stageModel;
    }
    // ID sudah sinkron dengan dino.id: model-trex, model-spinosaurus, model-velociraptor, dll.
    return document.getElementById(`model-${activeDino.id}`);
  }

  /**
   * Menghilangkan Objek 3D & Kembali ke Mode Scan (Fungsi Tombol Silang)
   */
  function dismissDinosaur() {
    if (!activeDino) return;

    const previousDinoName = activeDino.name;
    const previousDinoId = activeDino.id;

    console.log(`[AR] Menghilangkan objek: ${previousDinoName}`);

    // 1. Hentikan suara yang sedang berputar
    window.DinoAudio.stop();
    btnSound.classList.remove('playing');

    // 2. Sembunyikan model di cameraStage (simulasi)
    if (cameraStage) cameraStage.setAttribute('visible', false);
    if (stageModel) stageModel.setAttribute('visible', false);

    // 3. Reset state dinosaurus aktif
    activeDino = null;
    activeDisplayMode = 'marker';
    if (btnPinScreen) btnPinScreen.classList.remove('active');

    // 4. Sembunyikan kartu HUD dan tombol silang
    dinoCard.classList.remove('visible');
    btnCloseDino.style.display = 'none';

    // 5. Tutup modal sejarah jika sedang terbuka
    closeModal(modalHistory);

    // 6. Munculkan kembali reticle scanner
    scannerHud.classList.remove('hidden');

    // 7. Berikan cooldown 2.5 detik pada marker sebelumnya agar tidak langsung ter-scan ulang seketika
    dismissedCooldown = true;
    dismissedDinoId = previousDinoId;
    setTimeout(() => {
      dismissedCooldown = false;
      dismissedDinoId = null;
    }, 2500);

    showToast(`Objek dihilangkan. Silakan scan marker/QR lain!`);
  }

  // Event Listener Tombol Silang (X)
  btnCloseDino.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissDinosaur();
  });

  /**
   * Toggle Kunci Tampilan di Layar (Pin to Screen)
   */
  if (btnPinScreen) {
    btnPinScreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeDino) return;

      if (activeDisplayMode === 'marker') {
        // Alihkan ke tampilan mengambang di layar
        activateDinosaur(activeDino.id, 'stage');
        showToast("📌 Objek dikunci di layar (bebas melihat keliling)");
      } else {
        // Kembalikan ke pelacakan marker fisik
        activateDinosaur(activeDino.id, 'marker');
        showToast("📍 Objek mengikuti marker fisik");
      }
    });
  }

  /**
   * Memutar Suara Roar & Animasi Roar
   */
  function triggerRoar() {
    if (!activeDino) return;

    if (window.DinoAudio.isPlaying) {
      window.DinoAudio.stop();
      btnSound.classList.remove('playing');
      return;
    }

    const activeEntity = getActiveEntity();

    // 1. Mulai suara roar
    window.DinoAudio.playRoar(
      activeDino.sound,
      // onStart callback
      () => {
        btnSound.classList.add('playing');
        showToast(`🔊 ${activeDino.name} Mengaum!`, 2000);

        // 2. Jalankan animasi Roar pada model 3D
        if (activeEntity && activeDino.model.roarAnimation) {
          const roarClip = resolveClipName(activeEntity, activeDino.model.roarAnimation);
          activeEntity.setAttribute('animation-mixer', {
            clip: roarClip,
            loop: 'once',
            clampWhenFinished: true,
            crossFadeDuration: 0.2
          });
        }
      },
      // onEnd callback
      () => {
        btnSound.classList.remove('playing');

        // Kembalikan ke animasi Idle santai
        if (activeEntity && activeDino && activeDino.model.idleAnimation) {
          const idleClip = resolveClipName(activeEntity, activeDino.model.idleAnimation);
          activeEntity.setAttribute('animation-mixer', {
            clip: idleClip,
            loop: 'repeat',
            crossFadeDuration: 0.4
          });
        }
      }
    );
  }

  // Event Listener Tombol Suara
  btnSound.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerRoar();
  });

  /**
   * Membuka Modal Sejarah Singkat
   */
  function openHistoryModal() {
    if (!activeDino) return;

    document.getElementById('histDinoName').textContent = activeDino.name;
    document.getElementById('histScientificName').textContent = activeDino.scientificName;
    document.getElementById('histEra').textContent = activeDino.era;
    document.getElementById('histDiet').textContent = activeDino.diet;
    document.getElementById('histSize').textContent = activeDino.size;
    document.getElementById('histWeight').textContent = activeDino.weight;

    // Teks sejarah singkat
    document.getElementById('histDescription').textContent = activeDino.history;

    // Fakta menarik (bullet points)
    const funFactsEl = document.getElementById('histFunFacts');
    funFactsEl.innerHTML = '';
    if (activeDino.funFacts && activeDino.funFacts.length > 0) {
      activeDino.funFacts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        li.style.marginBottom = '6px';
        funFactsEl.appendChild(li);
      });
    }

    openModal(modalHistory);
  }

  btnHistory.addEventListener('click', (e) => {
    e.stopPropagation();
    openHistoryModal();
  });

  /**
   * Helper Modal Dialogs
   */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
  }

  // Pasang close listener ke semua modal
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  /**
   * Modal Buka & Unduh Marker / QR Placeholder
   */
  btnOpenMarkers.addEventListener('click', () => {
    renderMarkersList();
    openModal(modalMarkers);
  });

  function renderMarkersList() {
    const container = document.getElementById('markersListContainer');
    if (!container) return;
    container.innerHTML = '';

    db.forEach(dino => {
      const item = document.createElement('div');
      item.className = 'marker-card-item';
      item.innerHTML = `
        <div class="marker-card-header">
          <strong>${dino.name}</strong>
          <span class="badge-tag">${dino.marker.type.toUpperCase()}</span>
        </div>
        <div class="marker-preview-wrap">
          <img src="${dino.marker.imagePreview}" alt="Marker ${dino.name}" />
        </div>
        <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">${dino.marker.description}</p>
        <div class="marker-item-actions">
          <a href="${dino.marker.imagePreview}" target="_blank" download class="btn-small">Unduh Marker</a>
          <button type="button" class="btn-small btn-primary btn-simulate" data-id="${dino.id}">Simulasi Scan</button>
        </div>
      `;
      container.appendChild(item);
    });

    // Pasang tombol simulasi scan (untuk pengujian instan langsung di depan layar)
    container.querySelectorAll('.btn-simulate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        closeModal(modalMarkers);
        // Buka langsung dalam mode stage (mengambang di depan layar)
        activateDinosaur(id, 'stage');
      });
    });
  }

  /**
   * Hubungkan Event AR.js Marker Found & Lost
   */
  document.querySelectorAll('a-marker').forEach(markerEl => {
    const dinoId = markerEl.getAttribute('data-dino-id');

    markerEl.addEventListener('markerFound', (e) => {
      console.log(`[AR.js] Marker found: ${dinoId}`);
      // Jika saat ini belum di-pin manual ke layar, aktifkan di marker
      if (activeDisplayMode !== 'stage') {
        activateDinosaur(dinoId, 'marker');
      }
    });

    markerEl.addEventListener('markerLost', (e) => {
      console.log(`[AR.js] Marker lost: ${dinoId}`);
    });
  });

  /**
   * Pemindai QR Code Otomatis (BarcodeDetector API bawaan browser modern)
   * Memungkinkan kamera memindai gambar QR Code standar apa pun
   */
  if ('BarcodeDetector' in window) {
    try {
      const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
      setInterval(async () => {
        if (activeDino) return; // Jangan scan jika sudah ada dinosaurus aktif
        const video = document.querySelector('video') || document.getElementById('arjs-video');
        if (!video || video.readyState < 2) return;

        try {
          const barcodes = await barcodeDetector.detect(video);
          for (const barcode of barcodes) {
            const raw = (barcode.rawValue || '').toLowerCase().trim();
            for (const [id, dino] of dinoMap.entries()) {
              if (raw === id || raw.includes(`dino=${id}`) || raw.includes(id)) {
                console.log(`[QR Detector] QR Code dinosaurus terdeteksi: ${dino.name}`);
                activateDinosaur(id, 'stage');
                return;
              }
            }
          }
        } catch (err) {}
      }, 500);
    } catch (e) {
      console.log("[QR Detector] BarcodeDetector tidak aktif:", e);
    }
  }

  /**
   * Touch & Mouse Drag to Rotate 3D Model
   * Memberikan pengalaman interaktif saat melihat dinosaurus
   */
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  window.addEventListener('mousedown', (e) => {
    if (e.target.closest('.ar-overlay') || e.target.closest('.modal-backdrop') || e.target.closest('.camera-prompt-overlay')) return;
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeDino) return;
    const deltaX = e.clientX - previousMousePosition.x;
    previousMousePosition = { x: e.clientX, y: e.clientY };

    const activeEntity = getActiveEntity();
    if (activeEntity) {
      const currentRot = activeEntity.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      activeEntity.setAttribute('rotation', {
        x: currentRot.x,
        y: currentRot.y + deltaX * 0.8,
        z: currentRot.z
      });
    }
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch Drag untuk Smartphone
  window.addEventListener('touchstart', (e) => {
    if (e.target.closest('.ar-overlay') || e.target.closest('.modal-backdrop') || e.target.closest('.camera-prompt-overlay')) return;
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !activeDino || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    const activeEntity = getActiveEntity();
    if (activeEntity) {
      const currentRot = activeEntity.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
      activeEntity.setAttribute('rotation', {
        x: currentRot.x,
        y: currentRot.y + deltaX * 0.8,
        z: currentRot.z
      });
    }
  });

  window.addEventListener('touchend', () => { isDragging = false; });

  /**
   * Cek parameter URL (misal: index.html?dino=trex)
   * Memungkinkan scan QR code kamera biasa langsung membuka dinosaurus terkait!
   */
  const urlParams = new URLSearchParams(window.location.search);
  const requestedDino = urlParams.get('dino');
  if (requestedDino && dinoMap.has(requestedDino)) {
    setTimeout(() => {
      activateDinosaur(requestedDino, 'stage');
    }, 1200);
  }
});
