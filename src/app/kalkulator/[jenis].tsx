import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { InfoNote } from '@/components/ui/info-note';
import { NumberFieldInput } from '@/components/ui/number-field';
import { ResultCard } from '@/components/ui/result-card';
import { SegmentedField } from '@/components/ui/segmented-field';
import { SwitchFieldRow } from '@/components/ui/switch-field';
import { ZakatGlyph } from '@/components/zakat-icon';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/lib/settings';
import { defaultValues, getZakatType } from '@/lib/zakat';
import type { Values } from '@/lib/zakat';

export default function KalkulatorScreen() {
  const params = useLocalSearchParams<{ jenis: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { settings } = useSettings();
  const type = getZakatType(params.jenis);

  const [values, setValues] = useState<Values>(() => (type ? defaultValues(type) : {}));
  const [valuesFor, setValuesFor] = useState<string | undefined>(type?.id);

  // Reset input bila berpindah jenis zakat.
  if (type && type.id !== valuesFor) {
    setValuesFor(type.id);
    setValues(defaultValues(type));
  }

  const result = useMemo(() => (type ? type.compute(values, settings) : null), [type, values, settings]);

  if (!type || !result) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText type="subtitle">Jenis zakat tidak ditemukan</ThemedText>
        <Pressable style={styles.notFoundButton} onPress={() => router.replace('/')}>
          <ThemedText style={styles.notFoundButtonText}>Kembali ke Beranda</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const setValue = (key: string, next: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: next }));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={() => router.back()}
              style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={Brand.white} />
            </Pressable>
            <View style={styles.headerIcon}>
              <ZakatGlyph name={type.icon} size={26} color={Brand.white} />
            </View>
            <View style={styles.headerTexts}>
              <ThemedText style={styles.title}>{type.name}</ThemedText>
              <ThemedText style={styles.subtitle}>{type.tagline}</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ThemedView style={styles.body}>
        <View style={styles.fields}>
          {type.fields.map((field) => {
            if (field.kind === 'number') {
              return (
                <NumberFieldInput
                  key={field.key}
                  label={field.label}
                  suffix={field.suffix}
                  help={field.help}
                  decimal={field.suffix === 'kg' || field.suffix === 'gram'}
                  value={typeof values[field.key] === 'number' ? (values[field.key] as number) : 0}
                  onChange={(next) => setValue(field.key, next)}
                />
              );
            }
            if (field.kind === 'segment') {
              return (
                <SegmentedField
                  key={field.key}
                  label={field.label}
                  options={field.options}
                  help={field.help}
                  value={typeof values[field.key] === 'string' ? (values[field.key] as string) : field.defaultValue}
                  onChange={(next) => setValue(field.key, next)}
                />
              );
            }
            return (
              <SwitchFieldRow
                key={field.key}
                label={field.label}
                help={field.help}
                value={typeof values[field.key] === 'boolean' ? (values[field.key] as boolean) : field.defaultValue}
                onChange={(next) => setValue(field.key, next)}
              />
            );
          })}
        </View>

        <ResultCard result={result} />

        <Collapsible title="Ketentuan fiqih">
          <View style={styles.guideContent}>
            <ThemedText type="small">{type.guide.pengertian}</ThemedText>
            <View style={[styles.guideBox, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold">Nisab</ThemedText>
              <ThemedText type="small">{type.guide.nisab}</ThemedText>
            </View>
            <View style={[styles.guideBox, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold">Kadar</ThemedText>
              <ThemedText type="small">{type.guide.kadar}</ThemedText>
            </View>
            <View style={[styles.dalilBox, { borderColor: Brand.green }]}>
              <ThemedText type="small" style={styles.dalilText}>
                {type.guide.dalil}
              </ThemedText>
            </View>
          </View>
        </Collapsible>

        <InfoNote>
          Hasil perhitungan bersifat estimasi edukatif. Penunaian zakat sebaiknya melalui amil resmi
          (BAZNAS/LAZ) agar tepat sasaran.
        </InfoNote>
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  } as never,
  headerSafe: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Brand.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
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
  fields: {
    gap: Spacing.three,
  },
  guideContent: {
    gap: Spacing.two,
  },
  guideBox: {
    borderRadius: 12,
    padding: Spacing.two,
    gap: 2,
  },
  dalilBox: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dalilText: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  notFoundButton: {
    backgroundColor: Brand.green,
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  notFoundButtonText: {
    color: Brand.white,
    fontWeight: '700',
  },
});
