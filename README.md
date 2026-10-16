# Hitung Zakat 

Aplikasi kalkulator zakat untuk Android, iOS, dan web — dibangun dengan **Expo SDK 58 + Expo Router**,
bertema hijau cerah dengan aksen emas sesuai identitas aplikasi zakat.

## Fitur

- **9 kalkulator zakat** dengan rumus fiqih (nisab, kadar, haul) yang lengkap:
  1. **Zakat Fitrah** — per jiwa, keluaran beras/makanan pokok atau uang.
  2. **Zakat Maal** — tabungan & kekayaan simpanan (nisab 85 g emas, 2,5%).
  3. **Zakat Penghasilan** — gaji bulanan/tahunan (nisab setara 85 g emas).
  4. **Zakat Perdagangan** — kas + stok + piutang dikurangi utang.
  5. **Zakat Pertanian** — nisab 5 wasq (653 kg); 10% tadah hujan, 5% irigasi, 7,5% campuran.
  6. **Zakat Emas & Perak** — nisab 85 g emas / 595 g perak, kadar 2,5%.
  7. **Zakat Peternakan** — tabel klasik unta, sapi/kerbau (tabi'/musinnah), kambing/domba.
  8. **Zakat Rikaz** — harta temuan, kadar 20% tanpa nisab & haul.
  9. **Fidyah Puasa** — takaran 1 mud (±0,675 kg) atau 1,5 kg per hari.
- **Hasil langsung** (live) dalam kartu gradasi hijau: status nisab, rincian, dan catatan fiqih.
- **Panduan zakat** — pengertian, nisab, kadar, dalil (Al-Qur'an & hadits), 8 asnaf, syarat wajib.
- **Pengaturan harga** — harga emas, perak, beras, dan takaran fitrah tersimpan permanen
  (AsyncStorage / localStorage) dan dipakai seluruh kalkulator.
- **Mode terang & gelap**, responsif untuk ponsel maupun web.

## Logo & tema

Logo aplikasi (bulan sabit + kubah masjid + tangan memberi koin + bintang delapan) dominan
**hijau cerah** (`#22C55E`, `#4ADE80`, `#16A34A`) dengan aksen emas (`#F59E0B`).
Berkas master: `assets/images/logo-master.png`; seluruh turunan (icon, adaptive icon, splash,
favicon, logo putih/berwarna, icon tab) dihasilkan otomatis:

```bash
node scripts/generate-assets.mjs   # membutuhkan: npm i -D sharp
```

## Menjalankan aplikasi

```bash
npm install
npm start          # metro dev server (tekan w untuk web, a untuk Android, i untuk iOS)
npm run web        # langsung mode web
```

## Uji & kualitas

```bash
npm test           # uji rumus perhitungan zakat (28 pemeriksaan)
npm run lint       # ESLint (eslint-config-expo)
npx tsc --noEmit   # typecheck TypeScript
```

## Struktur kode

```
src/
  app/                  # rute Expo Router
    (tabs)/             #   Beranda, Panduan, Pengaturan
    kalkulator/[jenis]  #   layar kalkulator dinamis per jenis zakat
  components/           # komponen UI (kartu hasil, input, segmented, logo, tab)
  constants/theme.ts    # palet hijau cerah + mode gelap
  lib/
    zakat.ts            # mesin perhitungan: definisi jenis, field, rumus fiqih
    settings.tsx        # pengaturan harga tersimpan (AsyncStorage)
    format.ts           # format rupiah/angka locale Indonesia
scripts/
  generate-assets.mjs   # pipeline aset logo (sharp)
  test-zakat.ts         # uji rumus zakat (tsx)
```

## Catatan fiqih

Perhitungan mengikuti pendapat yang umum dipakai di Indonesia (mis. nisab emas 85 g,
fitrah 2,5 kg). Rincian perbedaan pendapat dijelaskan pada tab **Panduan**.
Penunaian zakat disarankan melalui amil resmi (BAZNAS/LAZ).
