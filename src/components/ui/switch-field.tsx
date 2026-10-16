import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  help?: string;
};

/** Baris sakelar (switch) dengan warna merek hijau. */
export function SwitchFieldRow({ label, value, onChange, help }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.texts}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {help ? (
          <ThemedText type="small" themeColor="textSecondary">
            {help}
          </ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.backgroundSelected, true: Brand.greenLight }}
        thumbColor={value ? Brand.greenDark : Brand.white}
        ios_backgroundColor={theme.backgroundSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
