# Viperteam · Var mısın Yok musun?

Yayın (OBS) için 1920x1080 tasarlanmış kasa açma oyunu. Pencere boyutuna göre kendini ölçekler.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç veya klasörde bir sunucu başlat:

```
python -m http.server 8080
```

OBS'te **Tarayıcı Kaynağı** ekle, adres `http://localhost:8080`, boyut 1920x1080.

## Ayarlar

Ödüller, olasılık oranları ve tur sayıları `js/ayarlar.js` dosyasında.

## Kısayollar

| Tuş | İşlev |
|---|---|
| Rakamlar | O numaralı kasayı açar (örn. `1` `2` → 12 numara) |
| `V` / `Y` | Teklif: Var / Yok |
| `R` | Oyun bitince tekrar oyna |
| `M` | Sesi aç/kapat |
| `P` | İlk oyun sırasını sıfırla (sonraki oyun yine baştan başlar). Sıra baştayken sağ alttaki ses tuşu sarı görünür |
