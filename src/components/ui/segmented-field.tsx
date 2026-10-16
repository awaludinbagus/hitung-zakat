import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (next: string) => void;
  help?: string;
};

/** Pemilih segmented berbentuk pil (pill). */
export function SegmentedField({ label, options, value, onChange, help }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                selected
                  ? { backgroundColor: Brand.green }
                  : { backgroundColor: 'transparent' },
              ]}>
              <ThemedText
                type="small"
                style={[styles.optionLabel, selected ? { color: Brand.white } : { color: theme.textSecondary }]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {help ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.help}>
          {help}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    marginLeft: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  option: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  optionLabel: {
    fontWeight: '700',
  },
  help: {
    marginLeft: Spacing.one,
  },
});
