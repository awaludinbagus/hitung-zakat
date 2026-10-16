import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { InfoNote } from '@/components/ui/info-note';
import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ZAKAT_TYPES } from '@/lib/zakat';

const ASNAF = [
  'Fakir',
  'Miskin',
  'Amil',
  'Mualaf',
  'Riqab',
  'Gharimin',
  'Fisabilillah',
  'Ibnu Sabil',
];

const SYARAT = [
  'Beragama Islam dan merdeka.',
  'Harta dimiliki secara sempurna dan berpotensi berkembang.',
  'Mencapai nisab (batas minimal) sesuai jenis hartanya.',
  'Telah berlalu satu haul (tahun qamariah) untuk zakat maal, kecuali pertanian, rikaz, dan fitrah.',
  'Memiliki kelebihan kebutuhan pokok pada malam & hari raya (zakat fitrah).',
];

export default function PanduanScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Logo size={56} variant="white" />
            <View style={styles.headerTexts}>
              <ThemedText style={styles.title}>Panduan Zakat</ThemedText>
              <ThemedText style={styles.subtitle}>
                Pengertian, nisab, kadar, dan dalil setiap jenis zakat.
              </ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ThemedView style={styles.body}>
        <InfoNote tone="gold">
          Rincian fiqih dapat berbeda menurut madzhab dan kondisi setempat. Aplikasi ini memakai
          pendapat yang umum digunakan di Indonesia; konsultasikan kasus khusus kepada ulama atau
          amil resmi.
        </InfoNote>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Jenis-Jenis Zakat
        </ThemedText>
        <View style={styles.sections}>
          {ZAKAT_TYPES.map((type) => (
            <Collapsible key={type.id} title={type.name}>
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
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          8 Golongan Penerima Zakat
        </ThemedText>
        <View style={styles.chips}>
          {ASNAF.map((nama) => (
            <View key={nama} style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold" style={styles.chipText}>
                {nama}
              </ThemedText>
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.quote}>
          “Sesungguhnya zakat itu hanyalah untuk orang-orang fakir, orang miskin, para amil zakat,
          orang-orang yang dilunakkan hatinya (mualaf), untuk (memerdekakan) hamba sahaya, untuk
          (membebaskan) orang yang berutang, untuk jalan Allah dan untuk orang yang sedang dalam
          perjalanan…” (QS. At-Taubah: 60)
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Syarat Wajib Zakat
        </ThemedText>
        <View style={[styles.syaratBox, { backgroundColor: theme.backgroundElement }]}>
          {SYARAT.map((syarat, index) => (
            <View key={syarat} style={styles.syaratRow}>
              <View style={styles.syaratBullet}>
                <ThemedText style={styles.syaratBulletText}>{index + 1}</ThemedText>
              </View>
              <ThemedText type="small" style={styles.syaratText}>
                {syarat}
              </ThemedText>
            </View>
          ))}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  sections: {
    gap: Spacing.two,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: {
    color: Brand.greenDark,
  },
  quote: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  syaratBox: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  syaratRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  syaratBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syaratBulletText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '800',
  },
  syaratText: {
    flex: 1,
    lineHeight: 20,
  },
});
