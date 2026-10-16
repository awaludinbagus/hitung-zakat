import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import type { ComponentRef, Ref } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  type ImageSourcePropType,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const TABS = [
  { name: 'index', href: '/', label: 'Beranda', icon: require('../../assets/images/tabIcons/home.png') },
  { name: 'panduan', href: '/panduan', label: 'Panduan', icon: require('../../assets/images/tabIcons/book.png') },
  {
    name: 'pengaturan',
    href: '/pengaturan',
    label: 'Atur',
    icon: require('../../assets/images/tabIcons/sliders.png'),
  },
] as const;

type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & {
  ref?: Ref<ComponentRef<typeof View>>;
  icon: ImageSourcePropType;
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon as ImageSourcePropType}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const activeColor = scheme === 'dark' ? Brand.greenLight : Brand.green;
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          { backgroundColor: isFocused ? (scheme === 'dark' ? Brand.greenDeep : Brand.mint) : 'transparent' },
        ]}>
        <Image
          source={icon}
          style={[styles.tabIcon, { tintColor: isFocused ? activeColor : colors.textSecondary }]}
        />
        <ThemedText
          type="small"
          style={{ color: isFocused ? activeColor : colors.textSecondary, fontWeight: '700' }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: scheme === 'dark' ? colors.backgroundElement : Brand.white,
            borderColor: colors.backgroundSelected,
          },
        ]}>
        <View style={styles.brand}>
          <Image source={require('../../assets/images/logo-color.png')} style={styles.brandLogo} />
          <ThemedText type="smallBold" style={styles.brandText}>
            Hitung Zakat
          </ThemedText>
        </View>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: 'auto',
  },
  brandLogo: {
    width: 28,
    height: 28,
  },
  brandText: {
    color: Brand.greenDark,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabIcon: {
    width: 18,
    height: 18,
  },
});
