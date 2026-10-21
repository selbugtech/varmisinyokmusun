// =====================================================================
//  SESLER (Web Audio API ile üretilir, ses dosyası gerekmez)
//    sec: kendi kasanı seçtin · ac: kasa açılıyor · buyuk: büyük ödül gitti
//    kucuk: küçük ödül gitti · telefon: Hamdi Bey arıyor · tik: buton · final: oyun sonu
//  ton(frekans Hz, başlangıç sn, süre sn, yükseklik 0-1, seçenekler)
// =====================================================================

const Ses = (() => {
    let ctx = null;
    let ana = null;
    let acik = true;

    function baglam() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Genel ses seviyesi (ayarlar.js → sesSeviyesi). Kompresör yüksek seste cızırtıyı önler.
            const sikistir = ctx.createDynamicsCompressor();
            sikistir.threshold.value = -6;
            sikistir.knee.value = 6;
            ana = ctx.createGain();
            ana.gain.value = AYARLAR.sesSeviyesi ?? 1;
            ana.connect(sikistir).connect(ctx.destination);
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    // Seçenekler: dalga, f2 (bitiş frekansı), kayma (f2'ye varış süresi), atak (yükselme süresi),
    //   sert (sonunda aniden kes)
    function ton(frekans, bas, sure, yukseklik, o = {}) {
        const c = baglam();
        const t0 = c.currentTime + bas;
        const osc = c.createOscillator();
        osc.type = o.dalga || "sine";
        osc.frequency.setValueAtTime(frekans, t0);
        if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.kayma ?? sure * 0.6));

        const gain = c.createGain();
        if (o.atak) {
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(yukseklik, t0 + o.atak);
        } else {
            gain.gain.setValueAtTime(yukseklik, t0);
        }
        if (o.sert) gain.gain.setValueAtTime(0, t0 + sure);
        else gain.gain.exponentialRampToValueAtTime(0.001, t0 + sure);

        osc.connect(gain).connect(ana);
        osc.start(t0);
        osc.stop(t0 + sure + 0.05);
    }

    // Kendiliğinden sönen beyaz gürültü (klik sesi)
    function gurultu(sure, yukseklik, sonum) {
        const c = baglam();
        const buf = c.createBuffer(1, Math.floor(c.sampleRate * sure), c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * sonum));
        const src = c.createBufferSource();
        const gain = c.createGain();
        src.buffer = buf;
        gain.gain.value = yukseklik;
        src.connect(gain).connect(ana);
        src.start();
    }

    const sesler = {
        // Kısa tiz bip (800Hz → 1200Hz)
        sec: () => ton(800, 0, 0.3, 0.15, { f2: 1200, kayma: 0.1 }),

        // Mekanik klik + yükselen ton
        ac: () => {
            gurultu(0.15, 0.25, 0.03);
            ton(300, 0, 0.2, 0.1, { f2: 600, kayma: 0.15 });
        },

        // Alçalan üzgün üç nota
        buyuk: () => [[700, 0], [620, 0.22], [520, 0.45]]
            .forEach(([f, t]) => ton(f, t, 1.1, 0.22, { atak: 0.04, f2: f * 0.92, kayma: 0.35 })),

        // Sevinçli arpej (Do Mi Sol Do)
        kucuk: () => [523.25, 659.25, 783.99, 1046.5]
            .forEach((f, i) => ton(f, i * 0.07, 0.45, 0.25, { dalga: "triangle", atak: 0.02 })),

        // 3 kez çalan çift tonlu zil
        telefon: () => {
            for (let r = 0; r < 3; r++) [440, 480].forEach(f => ton(f, r * 0.4, 0.15, 0.06, { sert: true }));
        },

        // Kısa tık
        tik: () => ton(600, 0, 0.08, 0.1),

        // Zafer fanfarı
        final: () => [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51]
            .forEach((f, i) => ton(f, i * 0.12, 1.2 - i * 0.12, 0.15, { dalga: "triangle", atak: 0.04 })),
    };

    return {
        cal(ad) {
            if (!acik || !sesler[ad]) return;
            try { sesler[ad](); } catch (e) { /* ses çalınamazsa oyun devam etsin */ }
        },
        degistir() { acik = !acik; return acik; },
        get acik() { return acik; },
    };
})();
