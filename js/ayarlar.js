// =====================================================================
//  OYUN AYARLARI
//  Oyunda değiştirmek isteyeceğin her şey bu dosyada.
//  Kaydedip sayfayı yenilemen yeterli.
// =====================================================================

const AYARLAR = {

    baslik: "VIPERTEAM",
    altBaslik: "Var mısın Yok musun?",

    // Her turda açılacak kasa sayısı. Her turdan sonra Hamdi Bey arar.
    // Toplamı (kasa sayısı - 2) olursa sonda masada 1 kasa kalır.
    turlar: [5, 4, 4, 4, 3, 3],

    // -----------------------------------------------------------------
    //  OYUNCUNUN KENDİ KASASINDAN ÇIKACAK ÖDÜLÜN OLASILIKLARI (%)
    //  Oyuncu kasasını seçtiği anda içindeki ödülün hangi renkten
    //  olacağı bu oranlara göre belirlenir. 0 = hiç çıkmaz.
    //  Toplamı 100 olsun (olmazsa oranlar birbirine göre hesaplanır).
    //  Aynı renkteki ödüller kendi aralarında eşit şanslıdır.
    //
    //  Şu anki ayar: her zaman sarı (100TL - 900TL arası 9 ödülden biri)
    // -----------------------------------------------------------------
    oranlar: {
        "beyaz":       0,   // Tekrar Oyna (1 ödül)
        "acik-mavi":   0,   // 1TL - 5TL (3 ödül)
        "mavi":        0,   // 10TL - 75TL (5 ödül)
        "sari":      100,   // 100TL - 900TL (9 ödül)
        "kirmizi":     0,   // 1000TL - 5000TL (6 ödül)
        "yesil":       0,   // Viper Özel Teklif (1 ödül)
    },

    // Genel ses seviyesi. 1 = eski siteyle aynı, 1.5 = daha yüksek, 0.5 = daha kısık
    sesSeviyesi: 1,

    // -----------------------------------------------------------------
    //  ÖDÜLLER (ödül tablosunda bu sırayla, yukarıdan aşağı görünür)
    //  ad: skin adı · deger: ekranda yazan değer · renk: oranlar'daki renk
    //  resim: img klasöründeki dosya adı
    // -----------------------------------------------------------------
    oduller: [
        { ad: "Tekrar Oyna",                     deger: "🔄",     renk: "beyaz",     resim: "0.jpg" },
        { ad: "PP-Bizon | Wood Block Camo",      deger: "1TL",    renk: "acik-mavi", resim: "1.png" },
        { ad: "P250 | Facility Draft",           deger: "2TL",    renk: "acik-mavi", resim: "2.png" },
        { ad: "P90 | Freight",                   deger: "5TL",    renk: "acik-mavi", resim: "5.png" },
        { ad: "P2000 | Red Wing",                deger: "10TL",   renk: "mavi",      resim: "10.png" },
        { ad: "SSG 08 | Abyss",                  deger: "15TL",   renk: "mavi",      resim: "15.png" },
        { ad: "MP9 | Cobalt Paisley",            deger: "25TL",   renk: "mavi",      resim: "25.png" },
        { ad: "MAC-10 | Cat Fight",              deger: "50TL",   renk: "mavi",      resim: "50.png" },
        { ad: "Dual Berettas | Flora Carnivora", deger: "75TL",   renk: "mavi",      resim: "75.png" },
        { ad: "M4A1-S | Solitude",               deger: "100TL",  renk: "sari",      resim: "100.png" },
        { ad: "Galil AR | Stone Cold",           deger: "200TL",  renk: "sari",      resim: "200.png" },
        { ad: "Glock-18 | Shinobu",              deger: "300TL",  renk: "sari",      resim: "300.png" },
        { ad: "MP7 | Abyssal Apparition",        deger: "400TL",  renk: "sari",      resim: "400.png" },
        { ad: "FAMAS | Rapid Eye Movement",      deger: "500TL",  renk: "sari",      resim: "500.png" },
        { ad: "USP-S | Jawbreaker",              deger: "600TL",  renk: "sari",      resim: "600.png" },
        { ad: "M4A1-S | Black Lotus",            deger: "700TL",  renk: "sari",      resim: "700.png" },
        { ad: "M4A4 | Desolate Space",           deger: "800TL",  renk: "sari",      resim: "800.png" },
        { ad: "Desert Eagle | Crimson Web",      deger: "900TL",  renk: "sari",      resim: "900.png" },
        { ad: "AK-47 | Frontside Misty",         deger: "1000TL", renk: "kirmizi",   resim: "1000.png" },
        { ad: "AWP | Chromatic Aberration",      deger: "1500TL", renk: "kirmizi",   resim: "1500.png" },
        { ad: "M4A4 | Temukau",                  deger: "2000TL", renk: "kirmizi",   resim: "2000.png" },
        { ad: "AWP | Hyper Beast",               deger: "2500TL", renk: "kirmizi",   resim: "2500.png" },
        { ad: "AK-47 | Neon Rider",              deger: "3000TL", renk: "kirmizi",   resim: "3000.png" },
        { ad: "Rare Special Item",               deger: "5000TL", renk: "kirmizi",   resim: "5000.png" },
        { ad: "Viper Özel Teklif",               deger: "???TL",  renk: "yesil",     resim: "16.jpg" },
    ],

    // Açılınca "büyük ödül gitti" efekti (sarsıntı + üzgün ses) veren renkler
    buyukRenkler: ["kirmizi", "yesil"],
    // Açılınca "küçük ödül gitti" efekti (sevinç sesi) veren renkler
    kucukRenkler: ["acik-mavi"],
};
