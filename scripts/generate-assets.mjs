/**
 * Generate semua aset gambar aplikasi "Hitung Zakat" dari logo master.
 *
 * Logo master (assets/images/logo-master.png) memiliki latar terang polos.
 * Script ini:
 *  1. Mengangkat latar menjadi transparan (emblem berwarna).
 *  2. Membuat varian siluet putih + aksen emas (untuk header/icon hijau).
 *  3. Membuat varian monokrom putih (adaptive icon monochrome).
 *  4. Menyusun icon aplikasi di atas gradasi hijau cerah.
 *  5. Merender icon tab (home / book / sliders) dari SVG.
 *
 * Jalankan: node scripts/generate-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IMG = path.resolve('assets/images');
const MASTER = path.join(IMG, 'logo-master.png');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Gradasi hijau cerah vertikal: #4ADE80 -> #22C55E -> #15803D */
function gradientBuffer(size) {
  const stops = [
    [0, hexToRgb('#4ADE80')],
    [0.45, hexToRgb('#22C55E')],
    [1, hexToRgb('#15803D')],
  ];
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    let c0 = stops[0];
    let c1 = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i][0] && t <= stops[i + 1][0]) {
        c0 = stops[i];
        c1 = stops[i + 1];
        break;
      }
    }
    const lt = (t - c0[0]) / Math.max(1e-6, c1[0] - c0[0]);
    const r = lerp(c0[1][0], c1[1][0], lt);
    const g = lerp(c0[1][1], c1[1][1], lt);
    const b = lerp(c0[1][2], c1[1][2], lt);
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      buf[o] = r;
      buf[o + 1] = g;
      buf[o + 2] = b;
      buf[o + 3] = 255;
    }
  }
  return buf;
}

async function main() {
  const { data, info } = await sharp(MASTER).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Warna latar = rata-rata 4 sudut
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const [x, y] of corners) {
    const o = (y * width + x) * 4;
    br += data[o];
    bg += data[o + 1];
    bb += data[o + 2];
  }
  const back = [br / 4, bg / 4, bb / 4];

  const isGold = (r, g, b) => r > 150 && g > 95 && b < 150 && r - b > 55 && g - b > 25;

  const emblem = Buffer.alloc(width * height * 4); // warna asli, latar transparan
  const whiteGold = Buffer.alloc(width * height * 4); // putih + emas
  const mono = Buffer.alloc(width * height * 4); // putih semua
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const r = data[o],
      g = data[o + 1],
      b = data[o + 2];
    const dist = Math.sqrt((r - back[0]) ** 2 + (g - back[1]) ** 2 + (b - back[2]) ** 2);
    const alpha = clamp((dist - 10) / 45, 0, 1);
    if (alpha > 0.08) {
      const x = i % width,
        y = (i / width) | 0;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    emblem[o] = r;
    emblem[o + 1] = g;
    emblem[o + 2] = b;
    emblem[o + 3] = alpha * 255;
    const gold = isGold(r, g, b);
    whiteGold[o] = gold ? r : 255;
    whiteGold[o + 1] = gold ? g : 255;
    whiteGold[o + 2] = gold ? b : 255;
    whiteGold[o + 3] = alpha * 255;
    mono[o] = 255;
    mono[o + 1] = 255;
    mono[o + 2] = 255;
    mono[o + 3] = alpha * 255;
  }

  const bw = maxX - minX + 1,
    bh = maxY - minY + 1;
  const crop = { left: minX, top: minY, width: bw, height: bh };

  const emblemPng = await sharp(emblem, { raw: { width, height, channels: 4 } }).extract(crop).png().toBuffer();
  const whiteGoldPng = await sharp(whiteGold, { raw: { width, height, channels: 4 } }).extract(crop).png().toBuffer();
  const monoPng = await sharp(mono, { raw: { width, height, channels: 4 } }).extract(crop).png().toBuffer();

  const resize = async (buf, size) =>
    sharp(buf).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  const composeOnGradient = async (size, emblemSize) => {
    const grad = gradientBuffer(size);
    const em = await resize(whiteGoldPng, emblemSize);
    const off = Math.round((size - emblemSize) / 2);
    return sharp(grad, { raw: { width: size, height: size, channels: 4 } })
      .png()
      .composite([{ input: em, left: off, top: off }])
      .toBuffer();
  };

  const write = async (name, buf) => {
    fs.writeFileSync(path.join(IMG, name), buf);
    console.log('  ✓', name, `${buf.length >> 10} KB`);
  };

  console.log('Membuat aset gambar...');

  // Icon utama & turunan
  await write('icon.png', await composeOnGradient(1024, 780));
  await write('favicon.png', await composeOnGradient(64, 50));
  await write(
    'android-icon-background.png',
    await sharp(gradientBuffer(432), { raw: { width: 432, height: 432, channels: 4 } }).png().toBuffer(),
  );
  await write(
    'android-icon-foreground.png',
    await (async () => {
      const em = await resize(whiteGoldPng, 268); // safe-zone 66% dari 432
      return sharp({ create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: em, left: 82, top: 82 }])
        .png()
        .toBuffer();
    })(),
  );
  await write(
    'android-icon-monochrome.png',
    await (async () => {
      const em = await resize(monoPng, 268);
      return sharp({ create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: em, left: 82, top: 82 }])
        .png()
        .toBuffer();
    })(),
  );
  await write('splash-icon.png', await resize(whiteGoldPng, 512));

  // Logo untuk pemakaian di dalam aplikasi
  await write('logo-color.png', await resize(emblemPng, 512)); // emblem berwarna (latar terang)
  await write('logo-white.png', await resize(whiteGoldPng, 512)); // siluet putih (latar hijau/gelap)

  // Icon tab (monokrom, renderingMode template)
  const tabSvg = (body) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96"><g fill="#ffffff">${body}</g></svg>`,
    );
  const tabs = {
    home: '<path d="M12 2.4 21.6 11h-2.9v9.6h-5.1v-6.3h-3.2v6.3H5.3V11H2.4Z"/>',
    book: '<path fill-rule="evenodd" d="M12 6.1C10.1 4.7 7.5 4.1 4 4.1c-.6 0-1.1.5-1.1 1.1v12.7c0 .6.5 1.1 1.1 1.1 3.3 0 5.7.6 7.4 1.8.4.2.8.2 1.2 0 1.7-1.2 4.1-1.8 7.4-1.8.6 0 1.1-.5 1.1-1.1V5.2c0-.6-.5-1.1-1.1-1.1-3.5 0-6.1.6-8 2Zm0 2.5c1.5-1 3.6-1.6 6.4-1.8v10.5c-2.6.2-4.7.8-6.4 1.7-1.7-.9-3.8-1.5-6.4-1.7V6.8c2.8.2 4.9.8 6.4 1.8Z"/>',
    sliders:
      '<rect x="3" y="5" width="18" height="2" rx="1"/><circle cx="9" cy="6" r="3.1"/><rect x="3" y="11" width="18" height="2" rx="1"/><circle cx="15" cy="12" r="3.1"/><rect x="3" y="17" width="18" height="2" rx="1"/><circle cx="7" cy="18" r="3.1"/>',
  };
  fs.mkdirSync(path.join(IMG, 'tabIcons'), { recursive: true });
  for (const [name, body] of Object.entries(tabs)) {
    const svg = tabSvg(body);
    await write(`tabIcons/${name}.png`, await sharp(svg).resize(48, 48).png().toBuffer());
    await write(`tabIcons/${name}@2x.png`, await sharp(svg).resize(96, 96).png().toBuffer());
    await write(`tabIcons/${name}@3x.png`, await sharp(svg).resize(144, 144).png().toBuffer());
  }

  console.log('Selesai.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
