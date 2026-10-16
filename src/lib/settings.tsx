/**
 * Pengaturan harga & takaran yang dipakai seluruh kalkulator,
 * disimpan permanen lewat AsyncStorage (localStorage di web).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type Settings = {
  /** Harga emas per gram (rupiah). */
  goldPerGram: number;
  /** Harga perak per gram (rupiah). */
  silverPerGram: number;
  /** Harga beras/makanan pokok per kg (rupiah). */
  ricePerKg: number;
  /** Takaran zakat fitrah per jiwa (kg makanan pokok). */
  fitrahKgPerPerson: number;
};

export const DEFAULT_SETTINGS: Settings = {
  goldPerGram: 1_900_000,
  silverPerGram: 20_000,
  ricePerKg: 15_000,
  fitrahKgPerPerson: 2.5,
};

const STORAGE_KEY = 'hitung-zakat:settings:v1';

type SettingsContextValue = {
  settings: Settings;
  ready: boolean;
  save: (next: Settings) => Promise<void>;
  reset: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) });
          } catch {
            // abaikan data rusak, pakai bawaan
          }
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async (next: Settings) => {
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const reset = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ settings, ready, save, reset }), [settings, ready, save, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings harus digunakan di dalam <SettingsProvider>.');
  return ctx;
}
