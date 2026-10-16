/** Utilitas format angka & mata uang (locale Indonesia). */

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const numberFormatter = (digits: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

/** Format rupiah tanpa desimal, mis. Rp 2.500.000 */
export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return idrFormatter.format(0);
  return idrFormatter.format(Math.round(value));
}

/** Format angka ribuan, mis. 1.234.567 */
export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return numberFormatter(digits).format(0);
  return numberFormatter(digits).format(value);
}

/** Format kilogram, mis. 2,5 kg */
export function formatKg(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} kg`;
}

/** Format persen, mis. 2,5% */
export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

/** Ambil angka dari input pengguna (string/number/boolean) dengan aman. */
export function toNumber(value: number | string | boolean | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function toStringValue(value: number | string | boolean | undefined, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function toBoolean(value: number | string | boolean | undefined, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
