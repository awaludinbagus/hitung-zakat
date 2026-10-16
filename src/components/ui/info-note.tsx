import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Kotak catatan/informasi kecil dengan ikon. */
export function InfoNote({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'gold' }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: tone === 'gold' ? theme.backgroundElement : theme.backgroundElement,
          borderColor: tone === 'gold' ? Brand.gold : theme.backgroundSelected,
        },
      ]}>
      <MaterialCommunityIcons
        name={tone === 'gold' ? 'star-four-points' : 'information-outline'}
        size={16}
        color={tone === 'gold' ? Brand.gold : Brand.green}
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
});
