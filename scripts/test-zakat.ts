/**
 * Uji cepat rumus perhitungan zakat.
 * Jalankan: npx tsx scripts/test-zakat.ts
 */
import { DEFAULT_SETTINGS } from '../src/lib/settings';
import { ZAKAT_TYPES, getZakatType } from '../src/lib/zakat';
import type { Values } from '../src/lib/zakat';

let failures = 0;

function compute(id: string, values: Values) {
  const type = getZakatType(id);
  if (!type) throw new Error(`Jenis tidak ditemukan: ${id}`);
  return type.compute(values, DEFAULT_SETTINGS);
}

function check(name: string, actual: unknown, expected: unknown) {
  const norm = (v: unknown) => JSON.stringify(v).replace(/ /g, ' ');
  const ok = norm(actual) === norm(expected);
  if (!ok) {
    failures++;
    console.error(`✗ ${name}\n   diharapkan: ${JSON.stringify(expected)}\n   diterima:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

// Fitrah: 4 jiwa × 2,5 kg = 10 kg; uang = 10 × 15.000 = 150.000
const fitrah = compute('fitrah', { jiwa: 4, bentuk: 'beras' });
check('fitrah wajib', fitrah.wajib, true);
check('fitrah headline beras', fitrah.headline, '10 kg');
check('fitrah uang', compute('fitrah', { jiwa: 4, bentuk: 'uang' }).headline, 'Rp 150.000');

// Maal: nisab 85 g × 1.900.000 = 161.500.000
check('maal belum nisab', compute('maal', { tunai: 100_000_000, haul: true }).wajib, false);
check('maal 200jt → 5jt', compute('maal', { tunai: 200_000_000, haul: true }).headline, 'Rp 5.000.000');
check('maal utang', compute('maal', { tunai: 200_000_000, utang: 20_000_000, haul: true }).headline, 'Rp 4.500.000');
check('maal utang besar → belum nisab', compute('maal', { tunai: 200_000_000, utang: 50_000_000, haul: true }).wajib, false);
check('maal tanpa haul', compute('maal', { tunai: 200_000_000, haul: false }).wajib, false);

// Penghasilan: 20 jt/bulan ≥ nisab bulanan (161,5 jt ÷ 12 ≈ 13,46 jt) → 2,5% = 500 rb
check('penghasilan bulanan', compute('penghasilan', { bulanan: 20_000_000, waktu: 'bulan' }).headline, 'Rp 500.000');
check('penghasilan tahunan', compute('penghasilan', { bulanan: 20_000_000, waktu: 'tahun' }).headline, 'Rp 6.000.000');
check('penghasilan bawah nisab', compute('penghasilan', { bulanan: 5_000_000, waktu: 'bulan' }).wajib, false);

// Perdagangan
check(
  'perdagangan',
  compute('perdagangan', { tunai: 50_000_000, barang: 150_000_000, piutang: 20_000_000, utang: 20_000_000, haul: true })
    .headline,
  'Rp 5.000.000',
);

// Pertanian: 1000 kg irigasi → 5%; tadah hujan → 10%
check('pertanian irigasi', compute('pertanian', { panen: 1000, irigasi: 'irigasi' }).headline, '50 kg');
check('pertanian hujan', compute('pertanian', { panen: 1000, irigasi: 'hujan' }).headline, '100 kg');
check('pertanian bawah nisab', compute('pertanian', { panen: 600, irigasi: 'hujan' }).wajib, false);

// Emas & perak
check('emas 100 g', compute('emas', { emasGram: 100, perakGram: 0, haul: true }).headline, 'Rp 4.750.000');
check('perak 600 g', compute('emas', { emasGram: 0, perakGram: 600, haul: true }).headline, 'Rp 300.000');
check('emas bawah nisab', compute('emas', { emasGram: 50, perakGram: 0, haul: true }).wajib, false);

// Ternak
check('kambing 45', compute('ternak', { jenis: 'kambing', jumlah: 45, saumah: true, haul: true }).headline, '1 ekor kambing/domba');
check('kambing 121', compute('ternak', { jenis: 'kambing', jumlah: 121, saumah: true, haul: true }).headline, '2 ekor kambing/domba');
check('kambing 500', compute('ternak', { jenis: 'kambing', jumlah: 500, saumah: true, haul: true }).headline, '5 ekor kambing/domba');
check('sapi 40', compute('ternak', { jenis: 'sapi', jumlah: 40, saumah: true, haul: true }).headline, '1 ekor musinnah (masuk usia 3 th)');
check('sapi 105', compute('ternak', { jenis: 'sapi', jumlah: 105, saumah: true, haul: true }).headline, "2 ekor tabi' (masuk usia 2 th) + 1 ekor musinnah (masuk usia 3 th)");
check('unta 25', compute('ternak', { jenis: 'unta', jumlah: 25, saumah: true, haul: true }).headline, '1 ekor bintu makhadh (unta betina masuk 2 th)');
check('unta 130', compute('ternak', { jenis: 'unta', jumlah: 130, saumah: true, haul: true }).headline, '2 ekor bintu labun + 1 ekor hiqqah');
check('ternak tidak saumah', compute('ternak', { jenis: 'kambing', jumlah: 100, saumah: false, haul: true }).wajib, false);

// Rikaz & fidyah
check('rikaz 10 jt', compute('rikaz', { nilai: 10_000_000 }).headline, 'Rp 2.000.000');
check('fidyah 7 hari', compute('fidyah', { hari: 7, jiwa: 1, takaran: '1.5' }).headline, '10,5 kg');

// Registri lengkap
check('jumlah jenis zakat', ZAKAT_TYPES.length, 9);

if (failures > 0) {
  console.error(`\n${failures} pemeriksaan GAGAL`);
  process.exit(1);
}
console.log('\nSemua pemeriksaan perhitungan zakat LULUS ✓');
