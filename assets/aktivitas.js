/* Logika halaman aktivitas: pemutar penjelasan, kuis, pencatat mengaji,
   pengatur waktu qailulah, tombol dengarkan, dan latihan hafalan. */
(function () {
  "use strict";

  /* =====================================================================
     PENGATURAN — bagian yang boleh diubah.
     Ubah teks di antara tanda kutip saja; jangan hapus koma di akhir baris.
     ===================================================================== */
  var SETELAN = {
    // Gambar maskot di kotak jawaban kuis. Kalau berkasnya belum ada,
    // dipakai potongan wajah dari gambar sampul.
    maskot: "gambar/maskot.png",
    // Kecepatan suara otomatis (1 = normal).
    kecepatanPenjelasan: 0.95,
    kecepatanArab: 0.8,
    // Nilai kuis minimal (dalam persen) untuk mendapat 2 bintang. 3 bintang = semua benar.
    duaBintang: 60,
    // Lama tidur siang yang terpilih saat halaman dibuka (menit).
    tidurSiangAwal: 20
  };

  var TEKS = {
    // Pemutar penjelasan
    putar: "Putar penjelasan",
    jeda: "Jeda penjelasan",
    posisi: "Posisi penjelasan",
    matikanSuara: "Matikan suara",
    nyalakanSuara: "Nyalakan suara",
    pakaiSuaraOtomatis: "Rekaman suara penulis belum tersedia. Untuk sementara, penjelasan dibacakan oleh suara otomatis perangkat.",
    rekamanRusak: "Rekaman tidak bisa diputar. Coba muat ulang halaman ini.",
    tanpaAudio: "Audio belum tersedia di perangkat ini. Silakan baca teks penjelasannya bersama Abi atau Umi.",
    suaraOtomatisGagal: "Suara otomatis tidak bisa diputar di perangkat ini. Silakan baca teks penjelasannya.",

    // Kuis
    benar: "Betul, Adik-adik!",
    salah: "Belum tepat, coba lagi ya!",
    petunjukUmum: "Ayo, coba pilih jawaban yang lain.",
    lanjut: "Lanjut ke Pertanyaan {n}",
    lihatHasil: "Lihat Hasil",
    selesai: "Selesai",
    hasil3: "MasyaAllah, hebat sekali!",
    hasil2: "Bagus sekali!",
    hasil1: "Terus semangat belajar, ya!",
    hasilKalimat: "Adik-adik menjawab {benar} dari {jumlah} pertanyaan dengan benar pada percobaan pertama.",
    nilaiTerbaik: "Nilai terbaik: {nilai} dari {jumlah}",
    ulangiKuis: "Ulangi Kuis",
    kembali: "Kembali ke Daftar",
    soalRusak: "Soal kuis belum bisa ditampilkan. Periksa tanda koma dan tanda kutip pada daftar soal di halaman ini.",

    // Pencatat mengaji (pesan dipilih menurut jumlah hari yang ditandai)
    mengaji0: "Yuk, mulai mengaji hari ini lalu tandai harinya!",
    mengajiAwal: "Bagus! Terus lanjutkan, ya.",           // 1–9 hari
    mengajiTengah: "MasyaAllah, sudah lebih dari sepertiga Ramadan!", // 10–19 hari
    mengajiAkhir: "Sedikit lagi! Semangat sampai akhir Ramadan.",     // 20 hari sampai sebelum penuh
    mengajiPenuh: "Alhamdulillah, Adik-adik mengaji setiap hari selama Ramadan!",
    hapusCatatan: "Hapus semua catatan mengaji?",
    hariKe: "Hari ke-{n}",

    // Pengatur waktu qailulah
    mulaiTidur: "Mulai Tidur Siang",
    lanjutkan: "Lanjutkan",
    jedaTidur: "Jeda",
    sedangTidur: "Selamat beristirahat... Nanti ada bunyi saat waktunya bangun.",
    dijeda: "Dijeda.",
    bangun: "Waktunya bangun! Baca doa bangun tidur, lalu cuci muka, ya.",

    // Tombol "Dengarkan" teks Arab
    dengarkan: "Dengarkan",
    berhenti: "Berhenti",
    suaraTidakAda: "Suara tidak tersedia",
    suaraArabTidakAda: "Suara bahasa Arab belum ada di perangkat ini",

    // Latihan hafalan
    sudahHafal: "Alhamdulillah, sudah hafal!",
    tandaiHafal: "Aku sudah hafal!",
    kataTersembunyi: "Kata tersembunyi, ketuk untuk melihat"
  };
  /* ======================= akhir bagian pengaturan ===================== */

  // Mengisi {nama} di dalam teks, misalnya isi(TEKS.lanjut, { n: 2 }).
  function isi(teks, nilai) {
    return teks.replace(/\{(\w+)\}/g, function (m, k) { return k in nilai ? nilai[k] : m; });
  }

  var hasSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* penyimpanan diblokir */ }
    }
  };

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
  }

  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.5" fill="currentColor"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.5" fill="currentColor"/></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3.5l4.5 4.5V5L7 9.5z" fill="currentColor"/><path d="M15 8.5a5 5 0 0 1 0 7M18 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3.5l4.5 4.5V5L7 9.5z" fill="currentColor"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.5-6.2 3.5 1.4-7L1.8 9.1l7-.8z" fill="#FFC42E" stroke="#F0A000" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };

  /* Hanya satu suara yang berbunyi pada satu waktu. */
  var STOP_EVENT = "bsbp:stop";
  function claimSound(owner) {
    document.dispatchEvent(new CustomEvent(STOP_EVENT, { detail: owner }));
  }
  function onOtherSound(owner, fn) {
    document.addEventListener(STOP_EVENT, function (e) { if (e.detail !== owner) fn(); });
  }

  function findVoice(lang) {
    if (!hasSpeech) return null;
    var want = lang.toLowerCase();
    var base = want.split("-")[0];
    var exact = null, loose = null;
    speechSynthesis.getVoices().forEach(function (v) {
      var l = (v.lang || "").toLowerCase().replace("_", "-");
      if (l === want) exact = exact || v;
      else if (l.split("-")[0] === base) loose = loose || v;
    });
    return exact || loose;
  }

  function whenVoicesReady(cb) {
    if (!hasSpeech || speechSynthesis.getVoices().length) { cb(); return; }
    var done = false;
    function go() { if (!done) { done = true; cb(); } }
    speechSynthesis.addEventListener("voiceschanged", go);
    setTimeout(go, 1500);
  }

  function stopSpeaking() {
    if (hasSpeech && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  }

  /* ---------- Pemutar penjelasan ----------
     Memutar rekaman dari data-audio. Kalau berkasnya belum ada, teks
     penjelasan dibacakan suara otomatis perangkat, kalimat demi kalimat. */
  function initPlayer(card) {
    var mount = card.querySelector("[data-player]");
    var note = card.querySelector(".player-note");
    var src = card.getAttribute("data-audio");
    var textEl = card.querySelector(".transcript-text");
    var text = textEl ? textEl.textContent.replace(/\s+/g, " ").trim() : "";

    mount.innerHTML =
      '<button class="play" type="button"></button>' +
      '<div class="player-main">' +
        '<div class="wave" aria-hidden="true"></div>' +
        '<div class="time-row"><span class="time">0:00 / --:--</span>' +
        '<input class="seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="' + TEKS.posisi + '"></div>' +
      "</div>" +
      '<button class="mute" type="button" aria-label="' + TEKS.matikanSuara + '">' + ICON.volume + "</button>";

    var playBtn = mount.querySelector(".play");
    var wave = mount.querySelector(".wave");
    var timeEl = mount.querySelector(".time");
    var seek = mount.querySelector(".seek");
    var muteBtn = mount.querySelector(".mute");

    var BARS = 34;
    var bars = [];
    for (var k = 0; k < BARS; k++) {
      var bar = document.createElement("i");
      bar.style.height = 28 + Math.round(72 * Math.abs(Math.sin(k * 1.9) * Math.cos(k * 0.45))) + "%";
      wave.appendChild(bar);
      bars.push(bar);
    }

    var mode = null; // "file" | "tts" | "none"
    var audio = null;
    var speech = null;
    var playing = false;
    var muted = false;
    var wantPlay = false;
    var dragging = false;

    function showNote(msg) {
      note.textContent = msg;
      note.hidden = false;
    }

    function render(cur, total) {
      var frac = total ? Math.min(cur / total, 1) : 0;
      bars.forEach(function (b, i) { b.classList.toggle("on", (i + 0.5) / BARS <= frac); });
      timeEl.textContent = fmt(cur) + " / " + (total ? fmt(total) : "--:--");
      if (!dragging) {
        seek.max = total || 100;
        seek.value = cur;
      }
      seek.setAttribute("aria-valuetext", fmt(cur) + " dari " + (total ? fmt(total) : "belum diketahui"));
    }

    function setPlaying(p) {
      playing = p;
      playBtn.innerHTML = p ? ICON.pause : ICON.play;
      playBtn.setAttribute("aria-label", p ? TEKS.jeda : TEKS.putar);
      card.classList.toggle("is-playing", p);
    }

    function useFile() {
      audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", function () {
        mode = "file";
        render(0, audio.duration);
        if (wantPlay) play();
      });
      audio.addEventListener("timeupdate", function () { render(audio.currentTime, audio.duration); });
      audio.addEventListener("play", function () { setPlaying(true); });
      audio.addEventListener("pause", function () { setPlaying(false); });
      audio.addEventListener("error", function () {
        if (mode === "file") {
          setPlaying(false);
          showNote(TEKS.rekamanRusak);
          return;
        }
        audio = null;
        useSpeech();
      });
      audio.src = src;
    }

    function useSpeech() {
      if (!hasSpeech || !text) {
        mode = "none";
        wantPlay = false;
        playBtn.disabled = true;
        seek.disabled = true;
        muteBtn.disabled = true;
        showNote(TEKS.tanpaAudio);
        return;
      }
      var parts = (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text])
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      // Perkiraan lama tiap kalimat, sekitar 14 huruf per detik.
      var durs = parts.map(function (s) { return Math.max(1.5, s.length / 14); });
      var offs = [];
      var total = 0;
      durs.forEach(function (d) { offs.push(total); total += d; });
      speech = { parts: parts, durs: durs, offs: offs, total: total, idx: 0, run: 0, startedAt: 0, timer: 0 };
      mode = "tts";
      showNote(TEKS.pakaiSuaraOtomatis);
      render(0, total);
      if (wantPlay) play();
    }

    function speechNow() {
      var inSentence = (performance.now() - speech.startedAt) / 1000;
      return speech.offs[speech.idx] + Math.min(inSentence, speech.durs[speech.idx] * 0.97);
    }

    function speakCurrent() {
      var run = ++speech.run;
      stopSpeaking();
      var u = new SpeechSynthesisUtterance(speech.parts[speech.idx]);
      u.lang = "id-ID";
      var voice = findVoice("id-ID");
      if (voice) u.voice = voice;
      u.rate = SETELAN.kecepatanPenjelasan;
      u.pitch = 1.05;
      u.volume = muted ? 0 : 1;
      u.onstart = function () { if (run === speech.run) speech.startedAt = performance.now(); };
      u.onend = function () {
        if (run !== speech.run) return;
        speech.idx++;
        if (speech.idx < speech.parts.length) speakCurrent();
        else finishSpeech();
      };
      u.onerror = function (e) {
        if (run !== speech.run || e.error === "interrupted" || e.error === "canceled") return;
        pauseSpeech();
        // "not-allowed": peramban menolak suara yang tidak dipicu ketukan; cukup minta ketuk lagi.
        if (e.error !== "not-allowed") {
          showNote(TEKS.suaraOtomatisGagal);
        }
      };
      speech.startedAt = performance.now();
      speechSynthesis.speak(u);
    }

    function startSpeech() {
      clearInterval(speech.timer);
      speech.timer = setInterval(function () { render(speechNow(), speech.total); }, 200);
      setPlaying(true);
      speakCurrent();
    }

    // Saat dilanjutkan, kalimat yang terpotong dibaca ulang dari awal.
    function pauseSpeech() {
      speech.run++;
      clearInterval(speech.timer);
      stopSpeaking();
      setPlaying(false);
      render(speech.offs[speech.idx], speech.total);
    }

    function finishSpeech() {
      speech.run++;
      clearInterval(speech.timer);
      setPlaying(false);
      render(speech.total, speech.total);
      speech.idx = 0;
    }

    function play() {
      wantPlay = false;
      claimSound(card);
      if (mode === "file") audio.play().catch(function () {});
      else if (mode === "tts") startSpeech();
      else if (mode === null) wantPlay = true; // rekaman masih diperiksa
    }

    function pause() {
      wantPlay = false;
      if (mode === "file") audio.pause();
      else if (mode === "tts") pauseSpeech();
    }

    playBtn.addEventListener("click", function () {
      if (playing || wantPlay) pause();
      else play();
    });

    seek.addEventListener("pointerdown", function () { dragging = true; });
    seek.addEventListener("input", function () {
      var v = parseFloat(seek.value);
      if (mode === "file") {
        audio.currentTime = v;
      } else if (mode === "tts") {
        var i = 0;
        while (i + 1 < speech.offs.length && speech.offs[i + 1] <= v) i++;
        speech.idx = i;
        if (!playing) render(speech.offs[i], speech.total);
      }
    });
    seek.addEventListener("change", function () {
      dragging = false;
      if (mode === "tts" && playing) speakCurrent();
    });

    muteBtn.addEventListener("click", function () {
      muted = !muted;
      muteBtn.innerHTML = muted ? ICON.muted : ICON.volume;
      muteBtn.setAttribute("aria-label", muted ? TEKS.nyalakanSuara : TEKS.matikanSuara);
      if (audio) audio.muted = muted;
      if (mode === "tts" && playing) speakCurrent();
    });

    onOtherSound(card, function () { if (playing) pause(); });

    setPlaying(false);
    if (src) useFile();
    else useSpeech();
  }

  /* ---------- Kuis ----------
     Jawaban salah boleh dicoba lagi; nilai dihitung dari jawaban benar
     pada percobaan pertama. */
  function initQuiz(section) {
    var countEl = section.querySelector(".quiz-count");
    var body = section.querySelector(".quiz-body");
    var qs;
    try {
      qs = JSON.parse(section.querySelector(".quiz-data").textContent).questions;
      if (!qs.length) throw new Error("kosong");
    } catch (e) {
      // Biasanya karena koma atau tanda kutip yang hilang saat soal diedit.
      body.textContent = TEKS.soalRusak;
      countEl.textContent = "";
      if (window.console) console.error("Soal kuis tidak terbaca:", e);
      return;
    }
    var n = qs.length;
    var uid = section.id || "kuis";

    var stage = document.createElement("div");
    var live = document.createElement("div");
    live.setAttribute("aria-live", "polite");
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn-primary";
    nextBtn.hidden = true;
    var dotsEl = document.createElement("div");
    dotsEl.className = "dots";
    dotsEl.setAttribute("aria-hidden", "true");
    body.textContent = "";
    body.append(stage, live, nextBtn, dotsEl);

    var current = 0;
    var score = 0;
    var missed = false;

    function renderDots() {
      dotsEl.textContent = "";
      for (var i = 0; i < n; i++) {
        var d = document.createElement("span");
        if (i === current) d.className = "on";
        else if (i < current) d.className = "done";
        dotsEl.appendChild(d);
      }
    }

    function showQuestion(index, moveFocus) {
      current = index;
      missed = false;
      var q = qs[index];
      countEl.textContent = index + 1 + " dari " + n;

      var head = document.createElement("div");
      head.className = "q";
      var num = document.createElement("span");
      num.className = "q-num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = index + 1;
      var title = document.createElement("h3");
      title.className = "q-text";
      title.id = uid + "-soal";
      title.tabIndex = -1;
      title.textContent = q.text;
      head.append(num, title);

      var opts = document.createElement("div");
      opts.className = "opts";
      opts.setAttribute("role", "group");
      opts.setAttribute("aria-labelledby", title.id);
      q.options.forEach(function (label, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.innerHTML = '<span class="dot" aria-hidden="true"></span>';
        var t = document.createElement("span");
        t.textContent = label;
        b.appendChild(t);
        b.addEventListener("click", function () { choose(b, i); });
        opts.appendChild(b);
      });

      stage.textContent = "";
      stage.append(head, opts);
      live.textContent = "";
      nextBtn.hidden = true;
      renderDots();
      if (moveFocus) title.focus();
    }

    function feedback(ok, msg) {
      live.innerHTML =
        '<div class="feedback ' + (ok ? "ok" : "bad") + '">' +
        '<span class="mascot" aria-hidden="true"></span>' +
        "<div><h3>" + (ok ? TEKS.benar : TEKS.salah) + "</h3><p></p></div></div>";
      live.querySelector("p").textContent = msg;
    }

    function mark(btn, label) {
      var s = document.createElement("span");
      s.className = "sr-only";
      s.textContent = " (" + label + ")";
      btn.appendChild(s);
    }

    function choose(btn, i) {
      var q = qs[current];
      if (i === q.answer) {
        btn.classList.add("is-correct");
        mark(btn, "jawaban benar");
        stage.querySelectorAll(".opt").forEach(function (o) { o.disabled = true; });
        if (!missed) score++;
        feedback(true, q.explain);
        nextBtn.innerHTML = "<span>" + (current < n - 1 ? isi(TEKS.lanjut, { n: current + 2 }) : TEKS.lihatHasil) + "</span>" + ICON.arrow;
        nextBtn.hidden = false;
        nextBtn.focus();
      } else {
        missed = true;
        btn.classList.add("is-wrong");
        btn.disabled = true;
        mark(btn, "belum tepat");
        feedback(false, q.hint || TEKS.petunjukUmum);
        var other = stage.querySelector(".opt:not(:disabled)");
        if (other) other.focus();
      }
    }

    function showResult() {
      current = n;
      countEl.textContent = TEKS.selesai;
      renderDots();
      var stars = score === n ? 3 : score / n >= SETELAN.duaBintang / 100 ? 2 : 1;
      var key = "bsbp-kuis-" + uid;
      var best = Math.max(store.get(key, 0), score);
      store.set(key, best);

      var starHtml = "";
      for (var i = 0; i < 3; i++) starHtml += '<span class="' + (i < stars ? "" : "off") + '">' + ICON.star + "</span>";
      stage.innerHTML =
        '<div class="result">' +
        '<span class="mascot" aria-hidden="true"></span>' +
        '<div class="stars" role="img" aria-label="' + stars + ' dari 3 bintang">' + starHtml + "</div>" +
        '<h3 tabindex="-1"></h3><p class="result-text"></p><p class="result-best"></p>' +
        '<button class="btn-primary restart" type="button"></button>' +
        '<a class="btn-ghost" href="halaman_utama.html"></a>' +
        "</div>";
      var title = stage.querySelector("h3");
      title.textContent = stars === 3 ? TEKS.hasil3 : stars === 2 ? TEKS.hasil2 : TEKS.hasil1;
      stage.querySelector(".result-text").textContent =
        isi(TEKS.hasilKalimat, { benar: score, jumlah: n });
      stage.querySelector(".result-best").textContent = isi(TEKS.nilaiTerbaik, { nilai: best, jumlah: n });
      stage.querySelector(".restart").textContent = TEKS.ulangiKuis;
      stage.querySelector(".result .btn-ghost").textContent = TEKS.kembali;
      stage.querySelector(".restart").addEventListener("click", function () {
        score = 0;
        showQuestion(0, true);
      });
      live.textContent = "";
      nextBtn.hidden = true;
      title.focus();
    }

    nextBtn.addEventListener("click", function () {
      if (current < n - 1) showQuestion(current + 1, true);
      else showResult();
    });

    showQuestion(0, false);
  }

  /* ---------- Pencatat mengaji ----------
     Jumlah hari diambil dari data-days (bawaan 30). */
  function initTracker(root) {
    var key = root.getAttribute("data-key");
    var total = parseInt(root.getAttribute("data-days"), 10) || 30;
    var done = store.get(key, []);
    if (!Array.isArray(done)) done = [];

    var grid = root.querySelector(".days");
    var countEl = root.querySelector(".track-count");
    var bar = root.querySelector(".meter span");
    var msg = root.querySelector(".track-msg");
    var reset = root.querySelector(".track-reset");
    var buttons = [];

    for (var d = 1; d <= total; d++) {
      (function (day) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "day";
        b.setAttribute("aria-label", isi(TEKS.hariKe, { n: day }));
        b.addEventListener("click", function () {
          var at = done.indexOf(day);
          if (at === -1) done.push(day);
          else done.splice(at, 1);
          update();
        });
        grid.appendChild(b);
        buttons.push(b);
      })(d);
    }

    function update() {
      buttons.forEach(function (b, i) {
        var on = done.indexOf(i + 1) !== -1;
        b.setAttribute("aria-pressed", String(on));
        b.innerHTML = on ? ICON.star : String(i + 1);
      });
      var c = done.length;
      countEl.textContent = c;
      bar.style.width = (c / total) * 100 + "%";
      msg.textContent =
        c === 0 ? TEKS.mengaji0 :
        c < 10 ? TEKS.mengajiAwal :
        c < 20 ? TEKS.mengajiTengah :
        c < total ? TEKS.mengajiAkhir :
        TEKS.mengajiPenuh;
      store.set(key, done);
    }

    reset.addEventListener("click", function () {
      if (done.length && window.confirm(TEKS.hapusCatatan)) {
        done = [];
        update();
      }
    });

    update();
  }

  /* ---------- Pengatur waktu qailulah ---------- */
  function initNap(root) {
    var ring = root.querySelector(".ring-fg");
    var timeEl = root.querySelector(".ring-time");
    var status = root.querySelector(".nap-status");
    var startBtn = root.querySelector(".nap-start");
    var resetBtn = root.querySelector(".nap-reset");
    var choices = root.querySelectorAll("[data-min]");
    var C = 2 * Math.PI * parseFloat(ring.getAttribute("r"));
    ring.style.strokeDasharray = C;

    var totalMs = 0;
    var leftMs = 0;
    var endAt = 0;
    var running = false;
    var timer = 0;
    var ctx = null;

    function render(ms) {
      timeEl.textContent = fmt(Math.ceil(ms / 1000));
      ring.style.strokeDashoffset = C * (1 - ms / totalMs);
    }

    function ui() {
      var started = leftMs < totalMs;
      startBtn.innerHTML = running
        ? ICON.pause + "<span>" + TEKS.jedaTidur + "</span>"
        : ICON.play + "<span>" + (started ? TEKS.lanjutkan : TEKS.mulaiTidur) + "</span>";
      choices.forEach(function (c) { c.disabled = running || started; });
    }

    function choose(min) {
      totalMs = leftMs = min * 60000;
      choices.forEach(function (c) { c.setAttribute("aria-pressed", String(+c.getAttribute("data-min") === min)); });
      root.classList.remove("is-done");
      render(leftMs);
      ui();
    }

    function unlockSound() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === "suspended") ctx.resume();
    }

    function chime() {
      if (!ctx) return;
      var t0 = ctx.currentTime + 0.05;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        for (var rep = 0; rep < 3; rep++) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          var s = t0 + rep * 1.8 + i * 0.28;
          o.type = "sine";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, s);
          g.gain.exponentialRampToValueAtTime(0.3, s + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, s + 0.9);
          o.connect(g).connect(ctx.destination);
          o.start(s);
          o.stop(s + 1);
        }
      });
    }

    function tick() {
      var ms = endAt - Date.now();
      if (ms <= 0) finish();
      else render(ms);
    }

    function start() {
      unlockSound();
      endAt = Date.now() + leftMs;
      running = true;
      root.classList.remove("is-done");
      clearInterval(timer);
      timer = setInterval(tick, 250);
      status.textContent = TEKS.sedangTidur;
      ui();
    }

    function pause() {
      leftMs = Math.max(0, endAt - Date.now());
      running = false;
      clearInterval(timer);
      status.textContent = TEKS.dijeda;
      ui();
    }

    function finish() {
      running = false;
      clearInterval(timer);
      leftMs = totalMs;
      render(0);
      root.classList.add("is-done");
      status.textContent = TEKS.bangun;
      chime();
      ui();
    }

    startBtn.addEventListener("click", function () {
      if (running) pause();
      else start();
    });

    resetBtn.addEventListener("click", function () {
      running = false;
      clearInterval(timer);
      leftMs = totalMs;
      root.classList.remove("is-done");
      status.textContent = "";
      render(leftMs);
      ui();
    });

    choices.forEach(function (c) {
      c.addEventListener("click", function () { choose(+c.getAttribute("data-min")); });
    });

    document.addEventListener("visibilitychange", function () { if (running) tick(); });

    choose(SETELAN.tidurSiangAwal);
  }

  /* ---------- Tombol "Dengarkan" untuk teks Arab ---------- */
  function initSay(btn) {
    var target = document.getElementById(btn.getAttribute("data-say"));
    var lang = btn.getAttribute("data-lang") || "ar-SA";
    var label = btn.querySelector("span");
    var speaking = false;
    var run = 0;

    btn.insertAdjacentHTML("afterbegin", ICON.volume);

    function idle() {
      speaking = false;
      btn.classList.remove("is-playing");
      label.textContent = TEKS.dengarkan;
    }

    function unavailable(msg) {
      btn.disabled = true;
      label.textContent = msg;
    }

    if (!hasSpeech || !target) {
      unavailable(TEKS.suaraTidakAda);
      return;
    }

    whenVoicesReady(function () {
      if (!findVoice(lang)) unavailable(TEKS.suaraArabTidakAda);
    });

    btn.addEventListener("click", function () {
      if (speaking) {
        run++;
        stopSpeaking();
        idle();
        return;
      }
      claimSound(btn);
      var r = ++run;
      stopSpeaking();
      var u = new SpeechSynthesisUtterance(target.textContent.replace(/\s+/g, " ").trim());
      u.lang = lang;
      var voice = findVoice(lang);
      if (voice) u.voice = voice;
      u.rate = SETELAN.kecepatanArab;
      u.onend = u.onerror = function () { if (r === run) idle(); };
      speaking = true;
      btn.classList.add("is-playing");
      label.textContent = TEKS.berhenti;
      speechSynthesis.speak(u);
    });

    onOtherSound(btn, function () {
      if (speaking) {
        run++;
        idle();
      }
    });
  }

  /* ---------- Latihan hafalan ---------- */
  function initHafalan(root) {
    var lines = Array.prototype.map.call(root.querySelectorAll("[data-words]"), function (node) {
      return { node: node, words: node.textContent.trim().split(/\s+/) };
    });
    var levelBtns = root.querySelectorAll("[data-level]");
    var doneBtn = root.querySelector(".hafal-done");
    var key = root.getAttribute("data-key");

    function apply(level) {
      levelBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(+b.getAttribute("data-level") === level));
      });
      lines.forEach(function (line) {
        line.node.textContent = "";
        line.words.forEach(function (w, i) {
          if (i) line.node.append(" ");
          var hide = level === 2 || (level === 1 && i % 2 === 1);
          if (!hide) {
            line.node.append(w);
            return;
          }
          var b = document.createElement("button");
          b.type = "button";
          b.className = "blank";
          b.textContent = w;
          b.setAttribute("aria-label", TEKS.kataTersembunyi);
          b.addEventListener("click", function () {
            var shown = b.classList.toggle("shown");
            if (shown) b.removeAttribute("aria-label");
            else b.setAttribute("aria-label", TEKS.kataTersembunyi);
          });
          line.node.appendChild(b);
        });
      });
    }

    function renderDone(on) {
      doneBtn.setAttribute("aria-pressed", String(on));
      doneBtn.innerHTML = ICON.star + "<span>" + (on ? TEKS.sudahHafal : TEKS.tandaiHafal) + "</span>";
    }

    levelBtns.forEach(function (b) {
      b.addEventListener("click", function () { apply(+b.getAttribute("data-level")); });
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", function () {
        var on = doneBtn.getAttribute("aria-pressed") !== "true";
        store.set(key, on);
        renderDone(on);
      });
      renderDone(store.get(key, false) === true);
    }

    apply(0);
  }

  /* ---------- Gambar sendiri ----------
     Gambar tokoh dari data-img dan maskot dari SETELAN.maskot dipakai kalau
     berkasnya ada. Kalau belum ada, tetap tampil potongan gambar sampul. */
  function useOwnImage(src, apply) {
    if (!src) return;
    var url = new URL(src, document.baseURI).href;
    var img = new Image();
    img.onload = function () { apply('url("' + url.replace(/"/g, "%22") + '")'); };
    img.src = url;
  }

  document.querySelectorAll(".act-hero-art[data-img]").forEach(function (el) {
    useOwnImage(el.getAttribute("data-img"), function (css) {
      el.style.setProperty("--own-img", css);
      el.classList.add("own-img");
    });
  });

  // Maskot kuis dibuat ulang tiap kali menjawab, jadi gambarnya dipasang di <html>.
  useOwnImage(SETELAN.maskot, function (css) {
    document.documentElement.style.setProperty("--mascot-img", css);
    document.documentElement.classList.add("own-mascot");
  });

  document.querySelectorAll(".audio-card").forEach(initPlayer);
  document.querySelectorAll(".quiz").forEach(initQuiz);
  document.querySelectorAll(".tracker").forEach(initTracker);
  document.querySelectorAll(".nap").forEach(initNap);
  document.querySelectorAll(".hafalan").forEach(initHafalan);
  document.querySelectorAll("[data-say]").forEach(initSay);

  // Hentikan suara otomatis saat pindah halaman; sebagian peramban tetap membacakan.
  window.addEventListener("pagehide", stopSpeaking);
})();
