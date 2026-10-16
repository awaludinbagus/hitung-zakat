import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';

type Props = {
  size?: number;
  /** 'white' untuk latar hijau/gelap, 'color' untuk latar terang, 'auto' mengikuti skema warna. */
  variant?: 'white' | 'color' | 'auto';
};

/** Logo aplikasi Hitung Zakat. */
export function Logo({ size = 64, variant = 'auto' }: Props) {
  const scheme = useColorScheme();
  const useWhite = variant === 'white' || (variant === 'auto' && scheme === 'dark');
  return (
    <Image
      source={
        useWhite
          ? require('../../assets/images/logo-white.png')
          : require('../../assets/images/logo-color.png')
      }
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel="Logo Hitung Zakat"
    />
  );
}
