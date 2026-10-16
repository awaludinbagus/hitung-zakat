import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { Brand, Spacing } from '@/constants/theme';
import type { ZakatResult } from '@/lib/zakat';

function TextWhite({
  children,
  size,
  bold,
  opacity = 1,
  color,
  style,
}: {
  children: ReactNode;
  size: number;
  bold?: boolean;
  opacity?: number;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <Text
      style={[
        { color: color ?? Brand.white, fontSize: size, opacity, fontWeight: bold ? '800' : '600' },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Kartu hasil perhitungan berlatar gradasi hijau cerah. */
export function ResultCard({ result }: { result: ZakatResult }) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, result.wajib ? styles.badgeWajib : styles.badgeBelum]}>
          <MaterialCommunityIcons
            name={result.wajib ? 'check-circle' : 'alert-circle-outline'}
            size={14}
            color={result.wajib ? Brand.greenDark : Brand.white}
          />
          <TextWhite size={12} bold color={result.wajib ? Brand.greenDark : Brand.white}>
            {result.wajib ? 'Memenuhi syarat wajib zakat' : 'Belum memenuhi syarat'}
          </TextWhite>
        </View>
      </View>

      <TextWhite size={13} opacity={0.85}>
        {result.headlineLabel}
      </TextWhite>
      <TextWhite size={30} bold style={styles.headline}>
        {result.headline}
      </TextWhite>

      {result.lines.length > 0 ? (
        <View style={styles.lines}>
          {result.lines.map((line) => (
            <View key={line.label} style={styles.line}>
              <TextWhite size={13} opacity={0.8} style={styles.lineLabel}>
                {line.label}
              </TextWhite>
              <TextWhite size={13} bold opacity={0.95} style={styles.lineValue}>
                {line.value}
              </TextWhite>
            </View>
          ))}
        </View>
      ) : null}

      {result.notes.length > 0 ? (
        <View style={styles.notes}>
          {result.notes.map((note) => (
            <View key={note} style={styles.noteRow}>
              <MaterialCommunityIcons name="star-four-points" size={12} color={Brand.goldSoft} style={styles.noteIcon} />
              <TextWhite size={12} opacity={0.85} style={styles.noteText}>
                {note}
              </TextWhite>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
    experimental_backgroundImage: Brand.gradient,
    shadowColor: Brand.greenDark,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  } as never,
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  badgeWajib: {
    backgroundColor: Brand.white,
  },
  badgeBelum: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headline: {
    lineHeight: 38,
  },
  lines: {
    marginTop: Spacing.one,
    gap: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: Spacing.two,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  lineLabel: {
    flex: 1,
  },
  lineValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  notes: {
    marginTop: Spacing.one,
    gap: 6,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  noteIcon: {
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    lineHeight: 18,
  },
});
