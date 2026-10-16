import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format';

type Props = {
  label: string;
  suffix?: string;
  help?: string;
  value: number;
  onChange: (next: number) => void;
  /** Izinkan input desimal (mis. takaran kg). Default: bilangan bulat dengan pemisah ribuan. */
  decimal?: boolean;
};

/** Input angka dengan pemisah ribuan otomatis (locale id-ID). */
export function NumberFieldInput({ label, suffix, help, value, onChange, decimal }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={decimal ? decimalText(value) : Number.isFinite(value) ? formatNumber(value, 0) : '0'}
          onChangeText={(text) => {
            if (decimal) {
              const cleaned = text.replace(/[^\d,]/g, '').replace(/(\d),(\d),/g, '$1,$2');
              const parsed = Number.parseFloat(cleaned.replace(',', '.'));
              onChange(cleaned === '' ? 0 : Number.isFinite(parsed) ? parsed : 0);
            } else {
              const cleaned = text.replace(/[^\d]/g, '');
              onChange(cleaned === '' ? 0 : Number.parseInt(cleaned, 10));
            }
          }}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          inputMode={decimal ? 'decimal' : 'numeric'}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          selectionColor={Brand.green}
        />
        {suffix ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.suffix}>
            {suffix}
          </ThemedText>
        ) : null}
      </View>
      {help ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.help}>
          {help}
        </ThemedText>
      ) : null}
    </View>
  );
}

function decimalText(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return String(value).replace('.', ',');
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
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: Spacing.one,
  },
  suffix: {
    fontWeight: '600',
  },
  help: {
    marginLeft: Spacing.one,
  },
});
