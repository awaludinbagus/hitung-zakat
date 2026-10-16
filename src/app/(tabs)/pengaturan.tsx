import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InfoNote } from '@/components/ui/info-note';
import { NumberFieldInput } from '@/components/ui/number-field';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DEFAULT_SETTINGS, useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/settings';

export default function PengaturanScreen() {
  const theme = useTheme();
  const { settings, save, reset } = useSettings();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Settings, next: number) => {
    setSaved(false);
    setDraft((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Logo size={56} variant="white" />
            <View style={styles.headerTexts}>
              <ThemedText style={styles.title}>Pengaturan</ThemedText>
              <ThemedText style={styles.subtitle}>
                Sesuaikan harga & takaran agar perhitungan akurat untuk daerah Anda.
              </ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ThemedView style={styles.body}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Harga acuan
          </ThemedText>
          <NumberFieldInput
            label="Harga emas per gram"
            suffix="Rp"
            value={draft.goldPerGram}
            onChange={(n) => set('goldPerGram', n)}
          />
          <NumberFieldInput
            label="Harga perak per gram"
            suffix="Rp"
            value={draft.silverPerGram}
            onChange={(n) => set('silverPerGram', n)}
          />
          <NumberFieldInput
            label="Harga beras per kg"
            suffix="Rp"
            value={draft.ricePerKg}
            onChange={(n) => set('ricePerKg', n)}
          />
          <NumberFieldInput
            label="Takaran fitrah per jiwa"
            suffix="kg"
            decimal
            value={draft.fitrahKgPerPerson}
            onChange={(n) => set('fitrahKgPerPerson', n)}
            help="Umumnya 2,5 kg (1 sha'); sebagian daerah memakai 2,7–3,5 kg."
          />
        </View>

        <View style={styles.buttons}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={async () => {
              await save(draft);
              setSaved(true);
            }}>
            <ThemedText style={styles.saveButtonText}>Simpan perubahan</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.resetButton, { borderColor: theme.backgroundSelected }, pressed && styles.pressed]}
            onPress={async () => {
              await reset();
              setDraft(DEFAULT_SETTINGS);
              setSaved(false);
            }}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Kembalikan bawaan
            </ThemedText>
          </Pressable>
        </View>

        {saved ? <InfoNote tone="gold">Pengaturan tersimpan dan dipakai di semua kalkulator.</InfoNote> : null}

        <InfoNote>
          Nilai bawaan hanyalah contoh. Perbarui harga emas, perak, dan beras mengikuti harga pasar
          atau ketetapan BAZNAS/amil setempat.
        </InfoNote>

        <View style={[styles.about, { backgroundColor: theme.backgroundElement }]}>
          <Logo size={64} variant="color" />
          <ThemedText type="smallBold" style={styles.aboutName}>
            Hitung Zakat v1.0.0
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.aboutText}>
            Kalkulator zakat untuk Android, iOS, dan web. Perhitungan mengikuti pendapat mayoritas
            ulama yang umum dipakai di Indonesia; detail fiqih lihat tab Panduan.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    experimental_backgroundImage: Brand.gradient,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  } as never,
  headerSafe: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Brand.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTitle: {
    marginLeft: Spacing.one,
  },
  buttons: {
    gap: Spacing.two,
  },
  saveButton: {
    backgroundColor: Brand.green,
    borderRadius: 14,
    paddingVertical: Spacing.three - 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Brand.white,
    fontWeight: '800',
    fontSize: 15,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.three - 4,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  about: {
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  aboutName: {
    color: Brand.greenDark,
  },
  aboutText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
