// =====================================================================
//  OYUN MANTIĞI
//  Durumlar: secim (kendi kasanı seç) → acma (kasa aç) → teklif → ... → bitti
// =====================================================================

(() => {
    const A = AYARLAR;
    const $ = s => document.querySelector(s);

    const masaEl = $("#masa");
    const mesajEl = $("#mesaj");
    const turlarEl = $("#turlar");
    const benimEl = $("#benim-kasa");
    const teklifEl = $("#teklif");
    const sonucEl = $("#sonuc");
    const sahneEl = $("#sahne");
    const yazilanEl = $("#yazilan");

    let kasalar = [];      // { no, odul, acik }
    let benim = null;      // oyuncunun kasasının indeksi
    let tur = 0;
    let kalan = 0;         // bu turda açılacak kasa sayısı
    let durum = "secim";
    let kilit = false;     // animasyon sürerken tıklamayı engeller
    let oyunNo = 0;        // tekrar oynayınca eski zamanlayıcıları geçersiz kılar

    // ----- Yardımcılar -----
    function karistir(dizi) {
        for (let i = dizi.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dizi[i], dizi[j]] = [dizi[j], dizi[i]];
        }
        return dizi;
    }

    function bekle(ms) {
        const no = oyunNo;
        return new Promise((ok, iptal) => setTimeout(() => (no === oyunNo ? ok() : iptal("yeni oyun")), ms));
    }

    function agirlikliRenk() {
        const mevcut = new Set(kasalar.map(k => k.odul.renk));
        const secenekler = Object.entries(A.oranlar).filter(([renk, oran]) => oran > 0 && mevcut.has(renk));
        if (!secenekler.length) return null;
        const toplam = secenekler.reduce((t, [, o]) => t + o, 0);
        let r = Math.random() * toplam;
        for (const [renk, oran] of secenekler) {
            if ((r -= oran) < 0) return renk;
        }
        return secenekler[secenekler.length - 1][0];
    }

    // Kaç oyun oynandığı (ilkOyunlar sırası için). Sayfa yenilense de saklanır.
    function oynananOyun() {
        try { return parseInt(localStorage.getItem("oynananOyun"), 10) || 0; } catch (e) { return 0; }
    }
    function oynananOyunYaz(n) {
        try { localStorage.setItem("oynananOyun", n); } catch (e) {}
    }

    function hedefRenk() {
        const n = oynananOyun();
        oynananOyunYaz(n + 1);
        const sira = A.ilkOyunlar || [];
        return n < sira.length ? sira[n] : agirlikliRenk();
    }

    function bildirim(metin) {
        const el = $("#bildirim");
        el.textContent = metin;
        el.classList.remove("goster");
        void el.offsetWidth;
        el.classList.add("goster");
    }

    function mesaj(html, sars = false) {
        mesajEl.innerHTML = html;
        mesajEl.classList.remove("yeni", "uyari");
        void mesajEl.offsetWidth;
        mesajEl.classList.add(sars ? "uyari" : "yeni");
    }

    function odulEtiketi(o) {
        return `<b class="renk-${o.renk}">${o.ad}</b> <span class="mesaj-deger">${o.deger}</span>`;
    }

    // ----- Çizim -----
    function odulListesiCiz() {
        const sol = $("#liste-sol");
        const sag = $("#liste-sag");
        sol.innerHTML = sag.innerHTML = "";
        const yari = Math.ceil(A.oduller.length / 2);
        A.oduller.forEach((o, i) => {
            const d = document.createElement("div");
            d.className = `odul renk-${o.renk}`;
            d.dataset.i = i;
            d.innerHTML = `
                <img class="odul-resim" src="img/${o.resim}" alt="">
                <span class="odul-ad">${o.ad}</span>
                <span class="odul-deger">${o.deger}</span>`;
            (i < yari ? sol : sag).appendChild(d);
        });
    }

    function masaCiz() {
        masaEl.innerHTML = "";
        kasalar.forEach((k, i) => {
            const b = document.createElement("button");
            b.className = `kasa renk-${k.odul.renk}`;
            b.innerHTML = `
                <div class="kasa-ic">
                    <div class="kasa-on"><span class="kasa-no">${k.no}</span><span class="kasa-etiket">SENİN</span></div>
                    <div class="kasa-arka">
                        <img src="img/${k.odul.resim}" alt="">
                        <span class="kasa-ad">${k.odul.ad}</span>
                        <span class="kasa-deger">${k.odul.deger}</span>
                    </div>
                </div>`;
            b.addEventListener("click", () => kasaTikla(i));
            masaEl.appendChild(b);
        });
    }

    // Kasa içerikleri değişebildiği için (oran ayarı) arka yüzü günceller
    function kasaArkaGuncelle(i) {
        const k = kasalar[i];
        const b = masaEl.children[i];
        b.className = b.className.replace(/renk-\S+/, `renk-${k.odul.renk}`);
        b.querySelector(".kasa-arka img").src = `img/${k.odul.resim}`;
        b.querySelector(".kasa-ad").textContent = k.odul.ad;
        b.querySelector(".kasa-deger").textContent = k.odul.deger;
    }

    function turlarCiz() {
        turlarEl.innerHTML = A.turlar.map((adet, i) => {
            let cls = "tur";
            if (i < tur || durum === "bitti") cls += " bitti";
            else if (i === tur && durum !== "secim") cls += " aktif";
            return `<div class="${cls}" title="Tur ${i + 1}"><span>${adet}</span></div>`;
        }).join("");
    }

    function benimCiz() {
        benimEl.innerHTML = benim === null
            ? `<span class="benim-bos">?</span>`
            : `<span class="benim-no">${kasalar[benim].no}</span>`;
        benimEl.parentElement.classList.toggle("dolu", benim !== null);
    }

    // ----- Oyun akışı -----
    function baslat() {
        oyunNo++;
        kasalar = karistir([...A.oduller]).map((odul, i) => ({ no: i + 1, odul, acik: false }));
        benim = null;
        tur = 0;
        kalan = A.turlar[0];
        durum = "secim";
        kilit = false;
        teklifEl.classList.remove("goster");
        sonucEl.classList.remove("goster");
        sahneEl.classList.remove("teklif-var", "sonuc-var");
        odulListesiCiz();
        masaCiz();
        turlarCiz();
        benimCiz();
        mesaj("Sona saklayacağın <b>kendi kasanı</b> seç");
    }

    function kasaTikla(i) {
        if (kilit || durum === "teklif" || durum === "bitti" || kasalar[i].acik) return;

        if (durum === "secim") return kendiKasaniSec(i);

        if (i === benim) {
            mesaj("Bu <b>senin kasan</b>, en sonda açılacak!", true);
            masaEl.children[i].classList.remove("titre");
            void masaEl.children[i].offsetWidth;
            masaEl.children[i].classList.add("titre");
            return;
        }

        kasaAc(i).catch(() => {});
    }

    function kendiKasaniSec(i) {
        // Oyuncunun kasasındaki ödülü önce ilkOyunlar sırasına, sonra oranlara göre belirle
        const hedef = hedefRenk();
        if (hedef && kasalar[i].odul.renk !== hedef) {
            const adaylar = kasalar.filter((k, j) => j !== i && k.odul.renk === hedef);
            if (adaylar.length) {
                const secilen = adaylar[Math.floor(Math.random() * adaylar.length)];
                [kasalar[i].odul, secilen.odul] = [secilen.odul, kasalar[i].odul];
                kasaArkaGuncelle(i);
                kasaArkaGuncelle(kasalar.indexOf(secilen));
            }
        }

        benim = i;
        durum = "acma";
        masaEl.children[i].classList.add("benim");
        Ses.cal("sec");
        benimCiz();
        turlarCiz();
        mesaj(`Kendi kasanı ayırdın! Şimdi masadan <b>${kalan}</b> kasa aç`);
    }

    async function kasaAc(i) {
        kilit = true;
        const b = masaEl.children[i];
        const o = kasalar[i].odul;

        b.classList.add("aciliyor");
        Ses.cal("ac");
        await bekle(550);

        kasalar[i].acik = true;
        b.classList.remove("aciliyor");
        b.classList.add("acik");
        kalan--;

        const satir = document.querySelector(`.odul[data-i="${A.oduller.indexOf(o)}"]`);
        satir.classList.add("elendi", "yeni-elendi");

        if (A.buyukRenkler.includes(o.renk)) {
            Ses.cal("buyuk");
            sahneEl.classList.remove("sars");
            void sahneEl.offsetWidth;
            sahneEl.classList.add("sars");
        } else if (A.kucukRenkler.includes(o.renk)) {
            Ses.cal("kucuk");
        }

        mesaj(`GİDEN: ${odulEtiketi(o)}<small>${kalan > 0 ? `Bu turda açılacak <b>${kalan}</b> kasa kaldı` : "Telefon çalıyor..."}</small>`);
        kilit = false;

        if (kalan === 0) {
            durum = "teklif";
            await bekle(1400);
            teklifGoster();
        }
    }

    function teklifGoster() {
        Ses.cal("telefon");
        $("#teklif-tur").textContent = `${tur + 1}. TEKLİF`;
        teklifEl.classList.add("goster");
        sahneEl.classList.add("teklif-var");
    }

    function teklifiKapat() {
        teklifEl.classList.remove("goster");
        sahneEl.classList.remove("teklif-var");
    }

    function varim() {
        if (durum !== "teklif") return;
        Ses.cal("tik");
        teklifiKapat();
        bitir(true).catch(() => {});
    }

    function yokum() {
        if (durum !== "teklif") return;
        Ses.cal("tik");
        teklifiKapat();
        tur++;
        const kapali = kasalar.filter((k, i) => !k.acik && i !== benim).length;
        if (tur < A.turlar.length && kapali > 0) {
            kalan = Math.min(A.turlar[tur], kapali);
            durum = "acma";
            turlarCiz();
            mesaj(`Teklif reddedildi! Bu turda <b>${kalan}</b> kasa daha aç`);
        } else {
            bitir(false).catch(() => {});
        }
    }

    async function bitir(anlasma) {
        durum = "bitti";
        kilit = true;
        turlarCiz();
        mesaj(anlasma ? "<b>ANLAŞMA SAĞLANDI!</b> Kasalar açılıyor..." : "Tüm teklifleri reddettin! Kasalar açılıyor...");

        // Masada kalan kasaları sırayla aç, en son oyuncunun kasası
        const kalanlar = kasalar.map((k, i) => i).filter(i => !kasalar[i].acik && i !== benim);
        for (const i of kalanlar) {
            masaEl.children[i].classList.add("acik", "sonradan");
            Ses.cal("ac");
            await bekle(260);
        }
        await bekle(500);
        masaEl.children[benim].classList.add("acik");
        Ses.cal("sec");
        await bekle(900);

        const o = kasalar[benim].odul;
        $("#sonuc-baslik").textContent = anlasma ? "ANLAŞMA SAĞLANDI!" : "OYUN BİTTİ!";
        $("#sonuc-alt").textContent = anlasma
            ? "Sunucunun teklifini kabul ettin. Anlaşmasaydın kasandan bu çıkacaktı:"
            : "Tüm teklifleri reddettin. Baştan beri sakladığın kasadan çıkan:";
        const kart = $("#sonuc-kart");
        kart.className = `sonuc-kart renk-${o.renk}`;
        kart.innerHTML = `
            <span class="sonuc-no">KASA ${kasalar[benim].no}</span>
            <img src="img/${o.resim}" alt="">
            <span class="sonuc-ad">${o.ad}</span>
            <span class="sonuc-deger">${o.deger}</span>`;
        sonucEl.classList.add("goster");
        sahneEl.classList.add("sonuc-var");
        mesaj(`Kasa ${kasalar[benim].no}: ${odulEtiketi(o)}`);
        Ses.cal("final");
        Konfeti.at();
        kilit = false;
    }

    // ----- Klavye kısayolları (yayıncı için) -----
    //  Rakam yaz → o numaralı kasa açılır · V: Var · Y: Yok · R: Tekrar oyna · M: Ses
    //  P: ilkOyunlar sırasını baştan başlat
    let yazilan = "";
    let yazmaZamani = null;

    function yazilaniGoster() {
        yazilanEl.textContent = yazilan;
        yazilanEl.classList.toggle("goster", yazilan !== "");
    }

    function yazilaniUygula() {
        clearTimeout(yazmaZamani);
        const no = parseInt(yazilan, 10);
        yazilan = "";
        yazilaniGoster();
        const i = kasalar.findIndex(k => k.no === no);
        if (i >= 0) kasaTikla(i);
    }

    document.addEventListener("keydown", e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.key.toLowerCase();

        if (/^[0-9]$/.test(t)) {
            yazilan += t;
            yazilaniGoster();
            clearTimeout(yazmaZamani);
            const enBuyuk = kasalar.length;
            // Başına başka rakam eklenemeyecekse hemen aç, yoksa kısa süre bekle
            if (parseInt(yazilan + "0", 10) > enBuyuk) yazilaniUygula();
            else yazmaZamani = setTimeout(yazilaniUygula, 900);
            return;
        }
        if (t === "enter" && yazilan) return yazilaniUygula();
        if (t === "escape" || t === "backspace") { yazilan = ""; yazilaniGoster(); return; }
        if (t === "v") return varim();
        if (t === "y") return yokum();
        if (t === "r" && durum === "bitti" && !kilit) { Ses.cal("tik"); return baslat(); }
        if (t === "m") return sesDugmesi();
        if (t === "p") { oynananOyunYaz(0); return bildirim("Resetlendi"); }
    });

    // ----- Butonlar -----
    function sesDugmesi() {
        $("#ses").classList.toggle("kapali", !Ses.degistir());
    }
    $("#ses").addEventListener("click", sesDugmesi);
    $("#btn-var").addEventListener("click", varim);
    $("#btn-yok").addEventListener("click", yokum);
    $("#btn-tekrar").addEventListener("click", () => { Ses.cal("tik"); baslat(); });

    // ----- Sahneyi pencereye sığdır (1920x1080 tasarım) -----
    function olcekle() {
        const s = Math.min(innerWidth / 1920, innerHeight / 1080);
        sahneEl.style.transform = `translate(-50%, -50%) scale(${s})`;
    }
    addEventListener("resize", olcekle);
    olcekle();

    $("#baslik-ana").textContent = A.baslik;
    $("#baslik-alt").textContent = A.altBaslik;
    baslat();
})();
