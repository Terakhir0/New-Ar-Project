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

  // Model 3D dimuat saat marker terdeteksi, jadi beri umpan balik saat selesai/gagal
  if (stageModel) {
    stageModel.addEventListener('model-loaded', () => {
      if (activeDino) {
        showToast(`✅ ${activeDino.name} siap`, 1800);
        scheduleStageLayout(50);
      }
    });
    stageModel.addEventListener('model-error', () => {
      if (activeDino) showToast(`⚠️ Gagal memuat model ${activeDino.name}`, 3000);
    });
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

  /**
   * AR.js memakai matriks proyeksi kamera kalibrasi 4:3. Di layar portrait,
   * rasio itu membuat model gepeng dan posisinya melenceng. Samakan komponen
   * horizontal proyeksi dengan rasio kanvas; operasi ini idempoten sehingga
   * aman dipanggil berkala dan tidak menumpuk.
   * @returns {boolean} true jika matriks baru saja disesuaikan
   */
  function syncCameraProjection() {
    const sceneEl = document.querySelector('a-scene');
    const cam = sceneEl && sceneEl.camera;
    if (!cam || !cam.projectionMatrix) return false;

    const m = cam.projectionMatrix.elements;
    if (!m[5]) return false;

    const viewAspect = window.innerWidth / Math.max(1, window.innerHeight);
    const targetP00 = m[5] / viewAspect;
    if (Math.abs(m[0] - targetP00) < 0.001) return false;

    m[0] = targetP00;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    return true;
  }

  window.addEventListener('resize', () => {
    enforceFullscreenCamera();
    syncCameraProjection();
    scheduleStageLayout(150);
  });
  window.addEventListener('orientationchange', () => {
    enforceFullscreenCamera();
    setTimeout(() => {
      syncCameraProjection();
      scheduleStageLayout(150);
    }, 300);
  });
  setInterval(() => {
    enforceFullscreenCamera();
    if (syncCameraProjection() && activeDino) scheduleStageLayout(0);
  }, 200);

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
   * Memutar klip animasi pada entitas 3D.
   * Komponen animation-mixer dihapus dan dipasang ulang agar mixer selalu dibuat
   * baru. Ini penting karena A-Frame tidak memanggil update() jika data komponen
   * sama persis, sehingga animasi yang sudah selesai (clampWhenFinished) tidak
   * akan pernah diputar ulang.
   */
  function playDinoClip(entity, requestedClip, options = {}) {
    if (!entity || !requestedClip) return;
    const config = {
      clip: resolveClipName(entity, requestedClip),
      loop: options.loop || 'repeat',
      clampWhenFinished: !!options.clampWhenFinished,
      crossFadeDuration: options.crossFadeDuration !== undefined ? options.crossFadeDuration : 0.2
    };
    entity.removeAttribute('animation-mixer');
    requestAnimationFrame(() => {
      if (!activeDino) return;
      entity.setAttribute('animation-mixer', config);
    });
  }

  /**
   * Kembalikan model ke animasi idle (dipakai saat suara dihentikan manual)
   */
  function restoreIdleAnimation(dino, entity) {
    if (!dino || !entity) return;
    playDinoClip(entity, dino.model.idleAnimation, { loop: 'repeat', crossFadeDuration: 0.2 });
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
  // PENEMPATAN MODEL RESPONSIF (PORTRAIT / LANDSCAPE)
  // ==========================================================================

  // Posisi dasar cameraStage dari index.html; jadi acuan sebelum digeser.
  const stageBasePosition = { x: 0, y: -0.35, z: -1.8 };
  if (cameraStage) {
    const basePos = cameraStage.getAttribute('position');
    if (basePos) {
      stageBasePosition.x = basePos.x;
      stageBasePosition.y = basePos.y;
      stageBasePosition.z = basePos.z;
    }
  }

  let layoutTimer = null;

  // Faktor skala hanya boleh mengecil dalam satu sesi tampilan. Pose animasi
  // (walk/idle) bisa melebar dan menyempit, jadi beberapa sampel pose diambil
  // dan faktor terkecil yang dipakai agar model tidak pernah terpotong.
  const fitGuard = { dinoId: null, factor: 1, w: 0, h: 0 };

  function resetFitGuard(dinoId) {
    fitGuard.dinoId = dinoId;
    fitGuard.factor = 1;
    fitGuard.w = window.innerWidth;
    fitGuard.h = window.innerHeight;
  }

  function scheduleStageLayout(delay = 0) {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(() => {
      layoutActiveStage();
      // Ulangi sekali lagi setelah AR.js selesai menyesuaikan proyeksi kamera.
      setTimeout(layoutActiveStage, 300);
    }, delay);
  }

  function parseScale(value) {
    if (typeof value === 'string') {
      const n = value.trim().split(/\s+/).map(Number);
      const s = isFinite(n[0]) && n[0] !== 0 ? n[0] : 1;
      return {
        x: s,
        y: isFinite(n[1]) ? n[1] : s,
        z: isFinite(n[2]) ? n[2] : s
      };
    }
    if (value && typeof value === 'object') {
      const s = value.x || 1;
      return { x: s, y: value.y || s, z: value.z || s };
    }
    return { x: 1, y: 1, z: 1 };
  }

  /**
   * Area layar yang tidak tertutup HUD atas maupun kartu dinosaurus bawah.
   */
  function getSafeScreenArea() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const hudTop = document.querySelector('.hud-top');
    const overlay = document.querySelector('.ar-overlay');

    let top = hudTop ? hudTop.getBoundingClientRect().bottom + 12 : h * 0.1;
    let bottom = h - 12;

    if (dinoCard) {
      const pad = overlay ? parseFloat(getComputedStyle(overlay).paddingBottom) || 0 : 0;
      bottom = h - pad - dinoCard.offsetHeight - 20;
    }

    top = Math.max(8, top);
    bottom = Math.min(h - 8, bottom);
    if (bottom - top < h * 0.3) bottom = Math.min(h - 8, top + h * 0.3);

    const side = Math.max(12, w * 0.04);
    return { left: side, right: w - side, top, bottom };
  }

  /**
   * Baca vektor posisi/rotasi dari string A-Frame ("x y z") atau objek.
   */
  function parseVec3(value, fallback) {
    if (typeof value === 'string') {
      const n = value.trim().split(/\s+/).map(Number);
      return {
        x: isFinite(n[0]) ? n[0] : fallback.x,
        y: isFinite(n[1]) ? n[1] : fallback.y,
        z: isFinite(n[2]) ? n[2] : fallback.z
      };
    }
    if (value && typeof value === 'object') {
      return {
        x: isFinite(value.x) ? value.x : fallback.x,
        y: isFinite(value.y) ? value.y : fallback.y,
        z: isFinite(value.z) ? value.z : fallback.z
      };
    }
    return { x: fallback.x, y: fallback.y, z: fallback.z };
  }

  /**
   * Ukur kotak siluet model yang benar-benar tampil di layar.
   *
   * Bounding box geometri tidak bisa dipakai untuk mesh skinned: vertex aslinya
   * berada di ruang bind-pose yang bisa ratusan kali lebih besar dari hasil
   * skinning (mis. Spinosaurus 14.000 unit vs tinggi asli < 2 unit), sehingga
   * perhitungan fit selalu salah dan model mengecil berlebihan.
   *
   * Solusinya: render adegan sekali ke render target kecil berlatar transparan,
   * lalu pindai kanal alpha. Hasilnya identik dengan piksel yang terlihat di
   * kanvas, termasuk pose animasi yang sedang berjalan.
   */
  let measureTarget = null;

  /**
   * @param {number} zoom - 1 = FOV normal; >1 = FOV diperlebar agar model yang
   *   lebih besar dari layar tetap terukur utuh (tidak terpotong tepi kanvas).
   */
  function measureStageRect(zoom = 1) {
    const sceneEl = document.querySelector('a-scene');
    const renderer = sceneEl && sceneEl.renderer;
    const cam = sceneEl && sceneEl.camera;
    const THREE = window.THREE;
    if (!renderer || !cam || !THREE) return null;

    const w = window.innerWidth;
    const h = window.innerHeight;
    // Resolusi buffer mengikuti lebar layar agar hasil ukur tetap presisi,
    // tanpa membuat readback mahal di perangkat lambat.
    const mw = Math.min(320, Math.max(160, Math.round(w * 0.5)));
    const mh = Math.max(1, Math.round(mw * h / w));

    if (!measureTarget || measureTarget.width !== mw || measureTarget.height !== mh) {
      if (measureTarget) measureTarget.dispose();
      measureTarget = new THREE.WebGLRenderTarget(mw, mh);
    }

    const prevTarget = renderer.getRenderTarget();
    const prevClearColor = renderer.getClearColor(new THREE.Color());
    const prevClearAlpha = renderer.getClearAlpha();
    const prevAutoClear = renderer.autoClear;
    const prevProjection = cam.projectionMatrix.clone();

    sceneEl.object3D.updateMatrixWorld(true);
    cam.updateMatrixWorld(true);

    if (zoom !== 1) {
      cam.projectionMatrix.elements[0] /= zoom;
      cam.projectionMatrix.elements[5] /= zoom;
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    }

    renderer.setRenderTarget(measureTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;
    renderer.clear(true, true, true);
    renderer.render(sceneEl.object3D, cam);

    const buffer = new Uint8Array(mw * mh * 4);
    renderer.readRenderTargetPixels(measureTarget, 0, 0, mw, mh, buffer);

    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClearColor, prevClearAlpha);
    renderer.autoClear = prevAutoClear;
    if (zoom !== 1) {
      cam.projectionMatrix.copy(prevProjection);
      cam.projectionMatrixInverse.copy(prevProjection).invert();
    }

    let minX = mw;
    let minY = mh;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < mh; y++) {
      const row = y * mw * 4;
      for (let x = 0; x < mw; x++) {
        if (buffer[row + x * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;

    // Kembalikan koordinat buffer (baris dimulai dari bawah) ke piksel layar
    // dengan memperhitungkan FOV yang diperlebar.
    const toScreenX = (px) => (zoom * (2 * (px / mw) - 1) * 0.5 + 0.5) * w;
    const toScreenY = (py) => (0.5 - zoom * (2 * (py / mh) - 1) * 0.5) * h;

    return {
      minX: toScreenX(minX),
      maxX: toScreenX(maxX + 1),
      minY: toScreenY(maxY + 1),
      maxY: toScreenY(minY)
    };
  }

  /**
   * Geser cameraStage berdasarkan selisih piksel di layar.
   */
  function shiftStageByPixels(dxPx, dyPx) {
    if (!cameraStage || !activeDino) return;

    const sceneEl = document.querySelector('a-scene');
    const cam = sceneEl && sceneEl.camera;
    if (!cam || !cam.projectionMatrix) return;

    const m = cam.projectionMatrix.elements;
    if (!m[0] || !m[5]) return;

    const modelPos = parseVec3(activeDino.model.position, { x: 0, y: 0, z: 0 });
    const depth = Math.max(0.1, -(stageBasePosition.z + modelPos.z));
    const pos = cameraStage.getAttribute('position');
    const nextX = pos.x + (dxPx * 2 / window.innerWidth) * (depth / m[0]);
    const nextY = pos.y - (dyPx * 2 / window.innerHeight) * (depth / m[5]);

    cameraStage.setAttribute('position', `${nextX} ${nextY} ${pos.z}`);
    cameraStage.object3D.updateMatrixWorld(true);
    cam.updateMatrixWorld(true);
  }

  /**
   * Sesuaikan ukuran dan posisi model aktif agar selalu berada di area layar
   * yang terlihat, baik di HP portrait maupun laptop landscape.
   */
  function layoutActiveStage() {
    if (!activeDino || !cameraStage || !stageModel) return;

    const baseScale = parseScale(activeDino.model.scale);
    const basePos = parseVec3(activeDino.model.position, { x: 0, y: 0, z: 0 });

    // Kembalikan ke transform kalibrasi sebelum diukur ulang.
    cameraStage.setAttribute('position', `${stageBasePosition.x} ${stageBasePosition.y} ${stageBasePosition.z}`);
    stageModel.setAttribute('position', `${basePos.x} ${basePos.y} ${basePos.z}`);
    stageModel.setAttribute('scale', `${baseScale.x} ${baseScale.y} ${baseScale.z}`);
    cameraStage.object3D.updateMatrixWorld(true);

    // Ukur dengan FOV diperlebar agar model raksasa (Brachiosaurus,
    // Pterodactyl) tetap terukur utuh meski melebihi lebar layar.
    let rect = measureStageRect(4);
    if (!rect || rect.maxX <= rect.minX || rect.maxY <= rect.minY) return;

    const safe = getSafeScreenArea();
    const availW = Math.max(1, safe.right - safe.left);
    const availH = Math.max(1, safe.bottom - safe.top);

    // Sisakan ruang untuk variasi pose animasi (walk/roar) agar tidak terpotong.
    const fit = Math.min(
      1,
      (availW * 0.92) / (rect.maxX - rect.minX),
      (availH * 0.88) / (rect.maxY - rect.minY)
    );

    // Ukuran layar berubah (rotasi/resize) = mulai hitungan baru.
    if (fitGuard.w !== window.innerWidth || fitGuard.h !== window.innerHeight) {
      resetFitGuard(activeDino.id);
    }
    if (fit < fitGuard.factor) fitGuard.factor = fit;

    if (fitGuard.factor < 0.999) {
      const f = fitGuard.factor;
      stageModel.setAttribute('scale', `${baseScale.x * f} ${baseScale.y * f} ${baseScale.z * f}`);
      cameraStage.object3D.updateMatrixWorld(true);
    }

    // Setelah muat, FOV normal cukup untuk pengukuran presisi.
    rect = measureStageRect(1) || measureStageRect(4) || rect;

    const portrait = window.innerHeight > window.innerWidth;

    const computeDelta = (r) => {
      if (portrait) {
        // Portrait: pusatkan siluet di ruang bebas antara HUD atas dan kartu bawah.
        return {
          dx: (safe.left + safe.right) / 2 - (r.minX + r.maxX) / 2,
          dy: (safe.top + safe.bottom) / 2 - (r.minY + r.maxY) / 2
        };
      }
      // Landscape: pertahankan posisi kalibrasi, geser hanya jika keluar area.
      let dx = 0;
      let dy = 0;
      if (r.minX < safe.left) dx = safe.left - r.minX;
      else if (r.maxX > safe.right) dx = safe.right - r.maxX;
      if (r.minY < safe.top) dy = safe.top - r.minY;
      else if (r.maxY > safe.bottom) dy = safe.bottom - r.maxY;
      return { dx, dy };
    };

    // Penggeseran berbasis kedalaman pusat bersifat pendekatan; ukur ulang
    // sekali atau dua kali agar sisa pergeseran benar-benar nol.
    for (let i = 0; i < 2; i++) {
      const d = computeDelta(rect);
      if (Math.abs(d.dx) < 0.5 && Math.abs(d.dy) < 0.5) break;
      shiftStageByPixels(d.dx, d.dy);
      const next = measureStageRect();
      if (!next) break;
      rect = next;
    }
  }

  // AR.js dapat mengganti matriks proyeksi beberapa kali saat kamera siap.
  const arSceneEl = document.querySelector('a-scene');
  if (arSceneEl) {
    arSceneEl.addEventListener('renderstart', () => {
      syncCameraProjection();
      scheduleStageLayout(200);
    });
  }

  // ==========================================================================
  // MANAJEMEN DINOSAURUS & 3D MODEL
  // ==========================================================================

  /**
   * Mengaktifkan Dinosaurus (Saat Marker / QR Berhasil Discan atau Disimulasikan)
   * Model selalu ditampilkan di cameraStage (menempel di layar) agar terlihat
   * dari depan dan tidak bergantung pada posisi/sudut QR code.
   * @param {string} dinoId
   */
  function activateDinosaur(dinoId) {
    const dino = dinoMap.get(dinoId);
    if (!dino) return;

    // Cek jika marker ini baru saja ditutup (cooldown aktif)
    if (dismissedCooldown && dismissedDinoId === dinoId) {
      return;
    }

    // Jika dinosaurus yang sama sudah aktif, abaikan
    if (activeDino && activeDino.id === dinoId) {
      return;
    }

    activeDino = dino;
    dismissedDinoId = null;

    // Hentikan suara dinosaurus sebelumnya agar tidak tumpang tindih
    window.DinoAudio.stop();
    btnSound.classList.remove('playing');

    console.log(`[AR] Dinosaurus aktif: ${dino.name} (Mode: pinned)`);

    // Tampilkan model di anchor kamera sehingga selalu menghadap layar
    if (cameraStage && stageModel) {
      cameraStage.setAttribute('visible', true);
      stageModel.setAttribute('visible', true);
      stageModel.setAttribute('gltf-model', dino.model.url);
      stageModel.setAttribute('scale', dino.model.scale);
      stageModel.setAttribute('position', dino.model.position);
      stageModel.setAttribute('rotation', dino.model.rotation);

      if (dino.model.idleAnimation) {
        playDinoClip(stageModel, dino.model.idleAnimation, { loop: 'repeat', crossFadeDuration: 0.3 });
      }

      // Sesuaikan posisi model dengan layar HP / laptop setelah model termuat.
      resetFitGuard(dino.id);
      scheduleStageLayout(50);
      // Sampel beberapa pose animasi awal: faktor terkecil dipakai agar siluet
      // yang melebar tidak keluar layar setelah beberapa detik.
      [900, 1800, 3000].forEach((delay) => setTimeout(layoutActiveStage, delay));
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

    showToast(`🦕 ${dino.name} terdeteksi, memuat model...`);
  }

  /**
   * Mengambil entitas 3D yang sedang aktif (selalu camera-anchored)
   */
  function getActiveEntity() {
    if (!activeDino) return null;
    return stageModel;
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
   * Memutar Suara Roar & Animasi Roar
   */
  function triggerRoar() {
    if (!activeDino) return;

    const dino = activeDino;
    const entity = getActiveEntity();

    // Tekan kedua saat suara masih berbunyi: hentikan suara dan kembalikan model
    // ke animasi idle agar tidak tertinggal kaku di pose terakhir roar.
    if (window.DinoAudio.isPlaying) {
      window.DinoAudio.stop();
      btnSound.classList.remove('playing');
      restoreIdleAnimation(dino, entity);
      return;
    }

    // 1. Mulai suara roar
    window.DinoAudio.playRoar(
      dino.sound,
      // onStart callback
      () => {
        if (activeDino !== dino) return;
        btnSound.classList.add('playing');
        showToast(`🔊 ${dino.name} Mengaum!`, 2000);

        // 2. Jalankan animasi Roar pada model 3D
        if (dino.model.roarAnimation) {
          playDinoClip(entity, dino.model.roarAnimation, {
            loop: 'once',
            clampWhenFinished: true,
            crossFadeDuration: 0.15
          });
        }
      },
      // onEnd callback
      () => {
        if (activeDino !== dino) return;
        btnSound.classList.remove('playing');

        // Kembalikan ke animasi Idle santai
        restoreIdleAnimation(dino, entity);
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
        activateDinosaur(id);
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
      // Marker hanya memicu tampil; model selalu muncul menempel di layar.
      activateDinosaur(dinoId);
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
                activateDinosaur(id);
                return;
              }
            }
          }
        } catch (err) {}
      }, 1000);
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
      activateDinosaur(requestedDino);
    }, 1200);
  }
});
