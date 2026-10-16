import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoNote } from '@/components/ui/info-note';
import { ZakatIconTile } from '@/components/zakat-icon';
import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRupiah } from '@/lib/format';
import { useSettings } from '@/lib/settings';
import { NISAB_EMAS_GRAM, ZAKAT_TYPES } from '@/lib/zakat';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { settings } = useSettings();
  const nisabMaal = NISAB_EMAS_GRAM * settings.goldPerGram;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Logo size={76} variant="white" />
            <View style={styles.headerTexts}>
              <ThemedText style={styles.title}>Hitung Zakat</ThemedText>
              <ThemedText style={styles.tagline}>
                Kalkulator zakat lengkap: fitrah, maal, penghasilan, pertanian, hingga fidyah.
              </ThemedText>
            </View>
          </View>
          <View style={styles.nisabChip}>
            <ThemedText style={styles.nisabText}>
              Nisab maal saat ini: {formatRupiah(nisabMaal)} ({NISAB_EMAS_GRAM} g emas)
            </ThemedText>
          </View>
        </SafeAreaView>
      </View>

      <ThemedView style={styles.body}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Pilih Jenis Zakat
        </ThemedText>
        <View style={styles.grid}>
          {ZAKAT_TYPES.map((type) => (
            <Pressable
              key={type.id}
              accessibilityRole="button"
              onPress={() => router.push(`/kalkulator/${type.id}`)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.cardPressed,
              ]}>
              <ZakatIconTile name={type.icon} />
              <ThemedText type="smallBold" style={styles.cardName}>
                {type.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.cardTagline}>
                {type.tagline}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <InfoNote>
          Harga emas, perak, dan beras serta takaran fitrah dapat disesuaikan pada tab{' '}
          <ThemedText type="smallBold">Atur</ThemedText> agar hasil perhitungan sesuai kondisi daerah Anda.
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  } as never,
  headerSafe: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
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
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  tagline: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  nisabChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  nisabText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: '700',
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 20,
    padding: Spacing.two,
    gap: 2,
    maxWidth: 260,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardName: {
    marginLeft: Spacing.one,
  },
  cardTagline: {
    marginLeft: Spacing.one,
    marginBottom: Spacing.two,
  },
});
