import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { Brand, Spacing } from '@/constants/theme';

/** Ikon glyph untuk setiap jenis zakat. */
export function ZakatGlyph({ name, size = 22, color = Brand.green }: { name: string; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name as never} size={size} color={color} />;
}

/** Ubin ikon berlatar lembut untuk kartu jenis zakat. */
export function ZakatIconTile({ name, size = 44 }: { name: string; size?: number }) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size / 3,
          backgroundColor: dark ? Brand.greenDeep : Brand.mint,
        },
      ]}>
      <ZakatGlyph name={name} size={size * 0.55} color={dark ? Brand.greenLight : Brand.greenDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.one,
  },
});
