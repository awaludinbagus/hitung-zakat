/**
 * Mesin perhitungan zakat — definisi jenis zakat, field input, dan rumus fiqih.
 *
 * Referensi nisab & kadar (ringkasan pendapat yang umum dipakai di Indonesia):
 *  - Zakat fitrah: 1 sha' ≈ 2,5 kg makanan pokok per jiwa.
 *  - Zakat maal/penghasilan/perdagangan/emas: nisab 85 gram emas, kadar 2,5%, haul 1 tahun.
 *  - Zakat pertanian: nisab 5 wasq ≈ 653 kg gabah/beras; 10% tadah hujan, 5% irigasi.
 *  - Zakat perak: nisab 595 gram, kadar 2,5%.
 *  - Zakat ternak: tabel klasik unta, sapi/kerbau, kambing/domba.
 *  - Zakat rikaz: 20%, tanpa nisab & haul.
 */
import { formatKg, formatNumber, formatPercent, formatRupiah, toBoolean, toNumber, toStringValue } from './format';
import type { Settings } from './settings';

export type Values = Record<string, number | string | boolean>;

export type NumberField = {
  kind: 'number';
  key: string;
  label: string;
  suffix?: string;
  defaultValue: number;
  help?: string;
};

export type SegmentField = {
  kind: 'segment';
  key: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue: string;
  help?: string;
};

export type SwitchField = {
  kind: 'switch';
  key: string;
  label: string;
  defaultValue: boolean;
  help?: string;
};

export type Field = NumberField | SegmentField | SwitchField;

export type ResultLine = { label: string; value: string };

export type ZakatResult = {
  /** True bila sudah memenuhi syarat wajib (nisab/haul dll). */
  wajib: boolean;
  /** Nilai utama yang ditampilkan besar, mis. "Rp 2.500.000" atau "2,5 kg". */
  headline: string;
  headlineLabel: string;
  lines: ResultLine[];
  notes: string[];
};

export type ZakatGuide = {
  pengertian: string;
  dalil: string;
  nisab: string;
  kadar: string;
};

export type ZakatType = {
  id: string;
  name: string;
  tagline: string;
  /** Nama glyph MaterialCommunityIcons. */
  icon: string;
  fields: Field[];
  compute: (values: Values, settings: Settings) => ZakatResult;
  guide: ZakatGuide;
};

/** Nisab emas (gram) & perak (gram) yang dipakai seluruh kalkulator. */
export const NISAB_EMAS_GRAM = 85;
export const NISAB_PERAK_GRAM = 595;
/** Nisab hasil pertanian (kg, 5 wasq). */
export const NISAB_PERTANIAN_KG = 653;

const RATE_ZAKAT_MAL = 0.025;

function belumWajib(headlineLabel: string, notes: string[], lines: ResultLine[] = []): ZakatResult {
  return { wajib: false, headline: 'Belum wajib', headlineLabel, lines, notes };
}

/* ---------------------------------- Zakat Fitrah ---------------------------------- */

const fitrah: ZakatType = {
  id: 'fitrah',
  name: 'Zakat Fitrah',
  tagline: 'Per jiwa, beras atau uang',
  icon: 'rice',
  fields: [
    { kind: 'number', key: 'jiwa', label: 'Jumlah jiwa', suffix: 'jiwa', defaultValue: 1 },
    {
      kind: 'segment',
      key: 'bentuk',
      label: 'Bentuk pembayaran',
      options: [
        { value: 'beras', label: 'Beras/makanan pokok' },
        { value: 'uang', label: 'Uang' },
      ],
      defaultValue: 'beras',
    },
  ],
  compute: (v, s) => {
    const jiwa = Math.max(0, Math.round(toNumber(v.jiwa)));
    const bentuk = toStringValue(v.bentuk, 'beras');
    const totalKg = jiwa * s.fitrahKgPerPerson;
    const rupiah = totalKg * s.ricePerKg;
    const lines: ResultLine[] = [
      { label: 'Jumlah jiwa', value: `${formatNumber(jiwa)} jiwa` },
      { label: 'Takaran per jiwa', value: formatKg(s.fitrahKgPerPerson, 2) },
      { label: 'Total makanan pokok', value: formatKg(totalKg, 2) },
      { label: 'Setara uang', value: `${formatRupiah(rupiah)} (beras ${formatRupiah(s.ricePerKg)}/kg)` },
    ];
    if (jiwa <= 0) {
      return belumWajib('Zakat fitrah', ['Isi jumlah jiwa terlebih dahulu.'], lines);
    }
    return {
      wajib: true,
      headline: bentuk === 'uang' ? formatRupiah(rupiah) : formatKg(totalKg, 2),
      headlineLabel: bentuk === 'uang' ? 'Zakat fitrah berupa uang' : 'Zakat fitrah berupa beras',
      lines,
      notes: [
        'Ditunaikan sebelum shalat Idul Fitri; makruh setelahnya dan haram bila setelah hari tasyrik tanpa uzur.',
        'Mayoritas ulama membolehkan membayar dengan uang senilai makanan pokok; Syafi\'iyah mewajibkan berupa makanan pokok.',
      ],
    };
  },
  guide: {
    pengertian:
      'Zakat fitrah adalah zakat jiwa yang wajib ditunaikan setiap muslim pada akhir Ramadhan untuk menyucikan orang yang berpuasa dan memberi makan orang miskin.',
    dalil:
      '"Rasulullah ﷺ mewajibkan zakat fitrah Ramadhan berupa satu sha\' kurma atau satu sha\' gandum atas setiap muslim, merdeka maupun budak, laki-laki maupun perempuan." (HR. Bukhari & Muslim)',
    nisab: 'Tidak ada nisab; wajib atas setiap muslim yang memiliki makanan pokok melebihi kebutuhan keluarganya pada malam & hari raya.',
    kadar: '1 sha\' ≈ 2,5–3,0 kg makanan pokok per jiwa (di Indonesia umum dipakai 2,5 kg atau 3,5 liter).',
  },
};

/* ---------------------------------- Zakat Maal ---------------------------------- */

const maal: ZakatType = {
  id: 'maal',
  name: 'Zakat Maal',
  tagline: 'Tabungan & kekayaan simpanan',
  icon: 'wallet',
  fields: [
    { kind: 'number', key: 'tunai', label: 'Uang tunai & tabungan', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'investasi', label: 'Deposito & investasi', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'logam', label: 'Nilai emas & perak simpanan', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'lainnya', label: 'Harta lain (properti dll)', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'utang', label: 'Utang jatuh tempo', suffix: 'Rp', defaultValue: 0 },
    { kind: 'switch', key: 'haul', label: 'Sudah dimiliki 1 tahun (haul)', defaultValue: true },
  ],
  compute: (v, s) => {
    const harta =
      toNumber(v.tunai) + toNumber(v.investasi) + toNumber(v.logam) + toNumber(v.lainnya);
    const utang = toNumber(v.utang);
    const bersih = Math.max(0, harta - utang);
    const nisab = NISAB_EMAS_GRAM * s.goldPerGram;
    const lines: ResultLine[] = [
      { label: 'Total harta', value: formatRupiah(harta) },
      { label: 'Dikurangi utang', value: formatRupiah(utang) },
      { label: 'Harta bersih', value: formatRupiah(bersih) },
      { label: `Nisab (85 g emas × ${formatRupiah(s.goldPerGram)})`, value: formatRupiah(nisab) },
      { label: 'Kadar', value: formatPercent(2.5) },
    ];
    if (!toBoolean(v.haul, true)) {
      return belumWajib('Zakat maal', ['Harta belum mencapai haul (kepemilikan 1 tahun qamariah).'], lines);
    }
    if (bersih < nisab) {
      return belumWajib('Zakat maal', ['Harta bersih belum mencapai nisab 85 gram emas.'], lines);
    }
    return {
      wajib: true,
      headline: formatRupiah(bersih * RATE_ZAKAT_MAL),
      headlineLabel: 'Zakat maal yang ditunaikan',
      lines,
      notes: ['Dihitung dari harta bersih (setelah dikurangi utang jatuh tempo) yang telah mencapai haul.'],
    };
  },
  guide: {
    pengertian:
      'Zakat maal adalah zakat atas kekayaan yang disimpan dan berkembang (uang, tabungan, deposito, emas, properti investasi, dll) yang telah mencapai nisab dan haul.',
    dalil:
      '"Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan menyucikan mereka." (QS. At-Taubah: 103)',
    nisab: 'Setara 85 gram emas murni.',
    kadar: '2,5% dari harta bersih setelah haul 1 tahun qamariah.',
  },
};

/* ---------------------------------- Zakat Penghasilan ---------------------------------- */

const penghasilan: ZakatType = {
  id: 'penghasilan',
  name: 'Zakat Penghasilan',
  tagline: 'Gaji & pendapatan rutin',
  icon: 'briefcase',
  fields: [
    { kind: 'number', key: 'bulanan', label: 'Penghasilan kotor per bulan', suffix: 'Rp', defaultValue: 0 },
    {
      kind: 'segment',
      key: 'waktu',
      label: 'Waktu pembayaran',
      options: [
        { value: 'bulan', label: 'Tiap bulan' },
        { value: 'tahun', label: 'Tiap tahun' },
      ],
      defaultValue: 'bulan',
    },
  ],
  compute: (v, s) => {
    const bulanan = toNumber(v.bulanan);
    const tahunan = bulanan * 12;
    const nisabBulan = (NISAB_EMAS_GRAM * s.goldPerGram) / 12;
    const nisabTahun = NISAB_EMAS_GRAM * s.goldPerGram;
    const perBulan = bulanan >= nisabBulan ? bulanan * RATE_ZAKAT_MAL : 0;
    const perTahun = tahunan >= nisabTahun ? tahunan * RATE_ZAKAT_MAL : 0;
    const bayarTahun = toStringValue(v.waktu, 'bulan') === 'tahun';
    const lines: ResultLine[] = [
      { label: 'Penghasilan per bulan', value: formatRupiah(bulanan) },
      { label: 'Nisab per bulan (85 g emas ÷ 12)', value: formatRupiah(nisabBulan) },
      { label: 'Zakat per bulan (2,5%)', value: formatRupiah(perBulan) },
      { label: 'Zakat per tahun', value: formatRupiah(perTahun) },
    ];
    const wajib = bayarTahun ? perTahun > 0 : perBulan > 0;
    if (!wajib) {
      return belumWajib('Zakat penghasilan', ['Penghasilan belum mencapai nisab (setara 85 gram emas per tahun).'], lines);
    }
    return {
      wajib: true,
      headline: formatRupiah(bayarTahun ? perTahun : perBulan),
      headlineLabel: bayarTahun ? 'Zakat penghasilan per tahun' : 'Zakat penghasilan per bulan',
      lines,
      notes: [
        'Dianalogikan pada zakat maal: kadar 2,5% dengan nisab setara 85 gram emas per tahun (dibayar bulanan atau tahunan).',
        'Sebagian ulama memperhitungkan dahulu kebutuhan pokok sebelum dizakati; pilih pendapat yang menenangkan hati.',
      ],
    };
  },
  guide: {
    pengertian:
      'Zakat penghasilan (zakat profesi) adalah zakat atas pendapatan rutin seperti gaji, honor, dan usaha jasa, yang dikeluarkan saat menerima penghasilan.',
    dalil:
      '"Wahai orang-orang yang beriman! Infakkanlah sebagian dari hasil usahamu yang baik-baik…" (QS. Al-Baqarah: 267)',
    nisab: 'Setara 85 gram emas per tahun (dibagi 12 bila dibayarkan bulanan).',
    kadar: '2,5% dari penghasilan kotor.',
  },
};

/* ---------------------------------- Zakat Perdagangan ---------------------------------- */

const perdagangan: ZakatType = {
  id: 'perdagangan',
  name: 'Zakat Perdagangan',
  tagline: 'Usaha & barang dagangan',
  icon: 'store',
  fields: [
    { kind: 'number', key: 'tunai', label: 'Uang tunai & kas usaha', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'barang', label: 'Nilai barang dagangan (stok)', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'piutang', label: 'Piutang lancar', suffix: 'Rp', defaultValue: 0 },
    { kind: 'number', key: 'utang', label: 'Utang jatuh tempo', suffix: 'Rp', defaultValue: 0 },
    { kind: 'switch', key: 'haul', label: 'Usaha berjalan 1 tahun (haul)', defaultValue: true },
  ],
  compute: (v, s) => {
    const modal = toNumber(v.tunai) + toNumber(v.barang) + toNumber(v.piutang);
    const utang = toNumber(v.utang);
    const bersih = Math.max(0, modal - utang);
    const nisab = NISAB_EMAS_GRAM * s.goldPerGram;
    const lines: ResultLine[] = [
      { label: 'Kas + stok + piutang', value: formatRupiah(modal) },
      { label: 'Dikurangi utang', value: formatRupiah(utang) },
      { label: 'Nilai usaha bersih', value: formatRupiah(bersih) },
      { label: 'Nisab (85 g emas)', value: formatRupiah(nisab) },
      { label: 'Kadar', value: formatPercent(2.5) },
    ];
    if (!toBoolean(v.haul, true)) {
      return belumWajib('Zakat perdagangan', ['Usaha belum mencapai haul 1 tahun.'], lines);
    }
    if (bersih < nisab) {
      return belumWajib('Zakat perdagangan', ['Nilai usaha belum mencapai nisab 85 gram emas.'], lines);
    }
    return {
      wajib: true,
      headline: formatRupiah(bersih * RATE_ZAKAT_MAL),
      headlineLabel: 'Zakat perdagangan per tahun',
      lines,
      notes: ['Stok barang dagangan dinilai dengan harga jual pada akhir haul.'],
    };
  },
  guide: {
    pengertian:
      'Zakat perdagangan ditunaikan atas harta usaha yang diputar untuk mencari keuntungan: kas usaha, stok barang, dan piutang, dikurangi utang jatuh tempo.',
    dalil:
      '"…dan dari apa yang Kami keluarkan untukmu dari dalam bumi." serta praktik sahabat menghitung zakat atas harta dagangan (QS. Al-Baqarah: 267; atsarnya diriwayatkan dari Umar & Utsman ra.)',
    nisab: 'Setara 85 gram emas, dihitung pada akhir haul.',
    kadar: '2,5% dari nilai usaha bersih.',
  },
};

/* ---------------------------------- Zakat Pertanian ---------------------------------- */

const pertanian: ZakatType = {
  id: 'pertanian',
  name: 'Zakat Pertanian',
  tagline: 'Hasil panen tumbuhan',
  icon: 'sprout',
  fields: [
    { kind: 'number', key: 'panen', label: 'Hasil panen (gabah/beras)', suffix: 'kg', defaultValue: 0 },
    {
      kind: 'segment',
      key: 'irigasi',
      label: 'Cara pengairan',
      options: [
        { value: 'hujan', label: 'Tadah hujan (10%)' },
        { value: 'irigasi', label: 'Irigasi berbayar (5%)' },
        { value: 'campuran', label: 'Campuran (7,5%)' },
      ],
      defaultValue: 'hujan',
    },
  ],
  compute: (v, s) => {
    const panen = toNumber(v.panen);
    const irigasi = toStringValue(v.irigasi, 'hujan');
    const rate = irigasi === 'irigasi' ? 0.05 : irigasi === 'campuran' ? 0.075 : 0.1;
    const labelRate = irigasi === 'irigasi' ? 'Irigasi berbayar' : irigasi === 'campuran' ? 'Campuran' : 'Tadah hujan';
    const zakatKg = panen >= NISAB_PERTANIAN_KG ? panen * rate : 0;
    const lines: ResultLine[] = [
      { label: 'Hasil panen', value: formatKg(panen, 0) },
      { label: 'Pengairan & kadar', value: `${labelRate} — ${formatPercent(rate * 100)}` },
      { label: 'Nisab (5 wasq)', value: formatKg(NISAB_PERTANIAN_KG, 0) },
      { label: 'Zakat (kg)', value: formatKg(zakatKg, 1) },
      { label: 'Setara uang', value: `${formatRupiah(zakatKg * s.ricePerKg)} (${formatRupiah(s.ricePerKg)}/kg)` },
    ];
    if (panen < NISAB_PERTANIAN_KG) {
      return belumWajib('Zakat pertanian', [`Panen belum mencapai nisab 5 wasq (${formatKg(NISAB_PERTANIAN_KG, 0)}).`], lines);
    }
    return {
      wajib: true,
      headline: formatKg(zakatKg, 1),
      headlineLabel: 'Zakat pertanian saat panen',
      lines,
      notes: ['Dikeluarkan setiap kali panen, tanpa haul.', 'Biaya produksi tidak mengurangi nisab menurut pendapat yang masyhur.'],
    };
  },
  guide: {
    pengertian:
      'Zakat pertanian adalah zakat atas hasil tanaman yang menjadi makanan pokok dan disimpan, seperti padi, jagung, dan gandum, yang dikeluarkan saat panen.',
    dalil:
      '"…dan tunaikanlah haknya (zakatnya) pada waktu memetik hasilnya." (QS. Al-An\'am: 141); "Yang diairi air hujan zakatnya sepersepuluh, yang diairi dengan irigasi seperduapuluh." (HR. Bukhari)',
    nisab: '5 wasq ≈ 653 kg gabah (atau setara makanan pokok).',
    kadar: '10% untuk tadah hujan, 5% untuk irigasi berbiaya, 7,5% bila campuran.',
  },
};

/* ---------------------------------- Zakat Emas & Perak ---------------------------------- */

const emas: ZakatType = {
  id: 'emas',
  name: 'Zakat Emas & Perak',
  tagline: 'Logam mulia simpanan',
  icon: 'gold',
  fields: [
    { kind: 'number', key: 'emasGram', label: 'Emas dimiliki', suffix: 'gram', defaultValue: 0 },
    { kind: 'number', key: 'perakGram', label: 'Perak dimiliki', suffix: 'gram', defaultValue: 0 },
    { kind: 'switch', key: 'haul', label: 'Sudah dimiliki 1 tahun (haul)', defaultValue: true },
  ],
  compute: (v, s) => {
    const g = toNumber(v.emasGram);
    const p = toNumber(v.perakGram);
    const zakatG = g >= NISAB_EMAS_GRAM ? g * RATE_ZAKAT_MAL : 0;
    const zakatP = p >= NISAB_PERAK_GRAM ? p * RATE_ZAKAT_MAL : 0;
    const rupiah = zakatG * s.goldPerGram + zakatP * s.silverPerGram;
    const lines: ResultLine[] = [
      { label: `Emas (nisab ${NISAB_EMAS_GRAM} g)`, value: `${formatNumber(g, 1)} g → zakat ${formatNumber(zakatG, 2)} g` },
      { label: `Perak (nisab ${NISAB_PERAK_GRAM} g)`, value: `${formatNumber(p, 1)} g → zakat ${formatNumber(zakatP, 2)} g` },
      { label: 'Nilai zakat emas', value: formatRupiah(zakatG * s.goldPerGram) },
      { label: 'Nilai zakat perak', value: formatRupiah(zakatP * s.silverPerGram) },
    ];
    if (!toBoolean(v.haul, true)) {
      return belumWajib('Zakat emas & perak', ['Logam mulia belum mencapai haul 1 tahun.'], lines);
    }
    if (rupiah <= 0) {
      return belumWajib('Zakat emas & perak', ['Kepemilikan belum mencapai nisab (85 g emas / 595 g perak).'], lines);
    }
    return {
      wajib: true,
      headline: formatRupiah(rupiah),
      headlineLabel: 'Zakat emas & perak per tahun',
      lines,
      notes: [
        'Emas/perak simpanan dan perhiasan melebihi pemakaian wajar dizakati menurut mayoritas ulama; sebagian ulama mengecualikan perhiasan yang dipakai.',
        'Boleh ditunaikan berupa logam atau uang senilai 2,5%.',
      ],
    };
  },
  guide: {
    pengertian:
      'Zakat emas dan perak dikenakan atas logam mulia yang disimpan (termasuk perhiasan menurut mayoritas ulama) bila mencapai nisab dan haul.',
    dalil:
      '"…dan orang-orang yang menyimpan emas dan perak serta tidak menginfakkannya di jalan Allah, maka berikanlah kabar gembira kepada mereka akan azab yang pedih." (QS. At-Taubah: 34)',
    nisab: 'Emas 85 gram (20 dinar); perak 595 gram (200 dirham).',
    kadar: '2,5% setelah haul 1 tahun.',
  },
};

/* ---------------------------------- Zakat Peternakan ---------------------------------- */

type TernakJenis = 'kambing' | 'sapi' | 'unta';

const kambingTable = (n: number): string | null => {
  if (n < 40) return null;
  if (n <= 120) return '1 ekor kambing/domba';
  if (n <= 200) return '2 ekor kambing/domba';
  if (n <= 300) return '3 ekor kambing/domba';
  if (n <= 400) return '4 ekor kambing/domba';
  return `${4 + Math.ceil((n - 400) / 100)} ekor kambing/domba`;
};

/** Sapi/kerbau: kombinasi kelipatan 30 (tabi') & 40 (musinnah) pada batas rentang. */
const sapiTable = (n: number): string | null => {
  if (n < 30) return null;
  for (let m = n; m >= 30; m--) {
    for (let b = Math.floor(m / 40); b >= 0; b--) {
      if ((m - 40 * b) % 30 === 0) {
        const a = (m - 40 * b) / 30;
        const parts: string[] = [];
        if (a > 0) parts.push(`${a} ekor tabi' (masuk usia 2 th)`);
        if (b > 0) parts.push(`${b} ekor musinnah (masuk usia 3 th)`);
        return parts.join(' + ');
      }
    }
  }
  return null;
};

/** Unta: rentang klasik, lalu >120 kombinasi kelipatan 40 (bintu labun) & 50 (hiqqah). */
const untaTable = (n: number): string | null => {
  if (n < 5) return null;
  if (n <= 9) return '1 ekor kambing/domba';
  if (n <= 14) return '2 ekor kambing/domba';
  if (n <= 19) return '3 ekor kambing/domba';
  if (n <= 24) return '4 ekor kambing/domba';
  if (n <= 35) return "1 ekor bintu makhadh (unta betina masuk 2 th)";
  if (n <= 45) return '1 ekor bintu labun (masuk 3 th)';
  if (n <= 60) return '1 ekor hiqqah (masuk 4 th)';
  if (n <= 75) return "1 ekor jadza'ah (masuk 5 th)";
  if (n <= 90) return '2 ekor bintu labun';
  if (n <= 120) return '2 ekor hiqqah';
  for (let b = Math.floor(n / 50); b >= 0; b--) {
    if ((n - 50 * b) % 40 === 0) {
      const a = (n - 50 * b) / 40;
      const parts: string[] = [];
      if (a > 0) parts.push(`${a} ekor bintu labun`);
      if (b > 0) parts.push(`${b} ekor hiqqah`);
      return parts.join(' + ');
    }
  }
  return null;
};

const ternak: ZakatType = {
  id: 'ternak',
  name: 'Zakat Peternakan',
  tagline: 'Unta, sapi & kambing',
  icon: 'cow',
  fields: [
    {
      kind: 'segment',
      key: 'jenis',
      label: 'Jenis ternak',
      options: [
        { value: 'kambing', label: 'Kambing/domba' },
        { value: 'sapi', label: 'Sapi/kerbau' },
        { value: 'unta', label: 'Unta' },
      ],
      defaultValue: 'kambing',
    },
    { kind: 'number', key: 'jumlah', label: 'Jumlah kepemilikan', suffix: 'ekor', defaultValue: 0 },
    { kind: 'switch', key: 'saumah', label: 'Digembala (saumah)', defaultValue: true },
    { kind: 'switch', key: 'haul', label: 'Dimiliki 1 tahun (haul)', defaultValue: true },
  ],
  compute: (v) => {
    const jenis = toStringValue(v.jenis, 'kambing') as TernakJenis;
    const n = Math.max(0, Math.round(toNumber(v.jumlah)));
    const nama = jenis === 'kambing' ? 'kambing/domba' : jenis === 'sapi' ? 'sapi/kerbau' : 'unta';
    const hasil = jenis === 'kambing' ? kambingTable(n) : jenis === 'sapi' ? sapiTable(n) : untaTable(n);
    const nisabText =
      jenis === 'kambing' ? '40 ekor' : jenis === 'sapi' ? '30 ekor' : '5 ekor';
    const lines: ResultLine[] = [
      { label: 'Jenis', value: nama },
      { label: 'Jumlah', value: `${formatNumber(n)} ekor` },
      { label: 'Nisab', value: nisabText },
    ];
    if (!toBoolean(v.saumah, true)) {
      return belumWajib('Zakat peternakan', ['Ternak tidak digembala (diberi pakan pembelian) sehingga tidak wajib zakat menurut pendapat jumhur.'], lines);
    }
    if (!toBoolean(v.haul, true)) {
      return belumWajib('Zakat peternakan', ['Kepemilikan belum mencapai haul 1 tahun.'], lines);
    }
    if (!hasil) {
      return belumWajib('Zakat peternakan', [`Jumlah ${nama} belum mencapai nisab ${nisabText}.`], lines);
    }
    return {
      wajib: true,
      headline: hasil,
      headlineLabel: 'Zakat yang ditunaikan',
      lines,
      notes: ['Syarat: digembala (saumah), dimiliki 1 haul, dan tidak dipekerjakan untuk membajak/mengangkut.'],
    };
  },
  guide: {
    pengertian:
      'Zakat peternakan dikenakan atas hewan ternak yang digembala (saumah) dan mencapai nisab: unta, sapi/kerbau, serta kambing/domba.',
    dalil:
      'Rincian nisab ternak terdapat dalam surat Nabi ﷺ kepada Muadz bin Jabal dan hadits riwayat Bukhari: "Tidak ada zakat pada kambing kurang dari 40 ekor…"',
    nisab: 'Kambing/domba 40 ekor; sapi/kerbau 30 ekor; unta 5 ekor.',
    kadar: 'Mengikuti tabel jenjang jumlah ternak (mis. kambing 40–120 ekor = 1 ekor kambing).',
  },
};

/* ---------------------------------- Zakat Rikaz ---------------------------------- */

const rikaz: ZakatType = {
  id: 'rikaz',
  name: 'Zakat Rikaz',
  tagline: 'Temuan harta terpendam',
  icon: 'treasure-chest',
  fields: [{ kind: 'number', key: 'nilai', label: 'Nilai harta temuan', suffix: 'Rp', defaultValue: 0 }],
  compute: (v) => {
    const nilai = toNumber(v.nilai);
    const lines: ResultLine[] = [
      { label: 'Nilai temuan', value: formatRupiah(nilai) },
      { label: 'Kadar', value: formatPercent(20) },
    ];
    if (nilai <= 0) {
      return belumWajib('Zakat rikaz', ['Isi nilai harta temuan terlebih dahulu.'], lines);
    }
    return {
      wajib: true,
      headline: formatRupiah(nilai * 0.2),
      headlineLabel: 'Zakat rikaz (seperlima)',
      lines,
      notes: ['Ditunaikan segera saat menemukan, tanpa nisab dan tanpa haul.'],
    };
  },
  guide: {
    pengertian:
      'Rikaz adalah harta terpendam peninggalan masa lalu yang ditemukan seseorang. Zakatnya dikeluarkan sekali saat ditemukan.',
    dalil: '"…dan pada rikaz (harta temuan) zakatnya seperlima." (HR. Bukhari & Muslim)',
    nisab: 'Tidak ada nisab dan tidak disyaratkan haul.',
    kadar: '20% dari nilai harta temuan.',
  },
};

/* ---------------------------------- Fidyah ---------------------------------- */

const fidyah: ZakatType = {
  id: 'fidyah',
  name: 'Fidyah Puasa',
  tagline: 'Pengganti puasa yang ditinggalkan',
  icon: 'food',
  fields: [
    { kind: 'number', key: 'hari', label: 'Hari puasa ditinggalkan', suffix: 'hari', defaultValue: 1 },
    { kind: 'number', key: 'jiwa', label: 'Jumlah orang', suffix: 'jiwa', defaultValue: 1 },
    {
      kind: 'segment',
      key: 'takaran',
      label: 'Takaran per hari (pendapat ulama)',
      options: [
        { value: '0.675', label: '1 mud ≈ 0,675 kg' },
        { value: '1.5', label: '1,5 kg' },
      ],
      defaultValue: '1.5',
    },
  ],
  compute: (v, s) => {
    const hari = Math.max(0, Math.round(toNumber(v.hari)));
    const jiwa = Math.max(0, Math.round(toNumber(v.jiwa)));
    const takaran = Number.parseFloat(toStringValue(v.takaran, '1.5')) || 1.5;
    const totalKg = hari * jiwa * takaran;
    const rupiah = totalKg * s.ricePerKg;
    const lines: ResultLine[] = [
      { label: 'Hari × jiwa', value: `${formatNumber(hari)} hari × ${formatNumber(jiwa)} jiwa` },
      { label: 'Takaran per hari', value: formatKg(takaran, 3) },
      { label: 'Total makanan pokok', value: formatKg(totalKg, 2) },
      { label: 'Setara uang', value: `${formatRupiah(rupiah)} (${formatRupiah(s.ricePerKg)}/kg)` },
    ];
    if (hari <= 0 || jiwa <= 0) {
      return belumWajib('Fidyah', ['Isi jumlah hari dan jiwa terlebih dahulu.'], lines);
    }
    return {
      wajib: true,
      headline: formatKg(totalKg, 2),
      headlineLabel: 'Total fidyah makanan pokok',
      lines,
      notes: [
        'Fidyah diberikan kepada orang miskin untuk setiap hari puasa yang ditinggalkan.',
        'Takaran berbeda menurut madzhab (1 mud s.d. setengah sha\'); pilih yang diyakini.',
      ],
    };
  },
  guide: {
    pengertian:
      'Fidyah adalah tebusan berupa makanan pokok yang diberikan kepada orang miskin bagi orang yang tidak mampu berpuasa (sakit menahun, usia lanjut, hamil/menyusui menurut sebagian ulama).',
    dalil:
      '"…dan wajib bagi orang-orang yang berat menjalankannya (jika mereka tidak berpuasa) membayar fidyah, (yaitu) memberi makan seorang miskin." (QS. Al-Baqarah: 184)',
    nisab: 'Tidak ada nisab; dihitung per hari puasa yang ditinggalkan.',
    kadar: '1 mud (±0,675 kg) hingga 1,5 kg makanan pokok per hari per jiwa menurut perbedaan pendapat ulama.',
  },
};

export const ZAKAT_TYPES: ZakatType[] = [
  fitrah,
  maal,
  penghasilan,
  perdagangan,
  pertanian,
  emas,
  ternak,
  rikaz,
  fidyah,
];

export function getZakatType(id: string | undefined): ZakatType | undefined {
  return ZAKAT_TYPES.find((t) => t.id === id);
}

/** Nilai awal input dari definisi field. */
export function defaultValues(type: ZakatType): Values {
  const values: Values = {};
  for (const field of type.fields) values[field.key] = field.defaultValue;
  return values;
}
