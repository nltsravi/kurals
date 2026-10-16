import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, usePathname, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export type TabKey = 'index' | 'search' | 'chapters' | 'collections' | 'settings';

interface TabItemConfig {
  key: TabKey;
  outlineIcon: keyof typeof Ionicons.glyphMap;
  filledIcon: keyof typeof Ionicons.glyphMap;
  targetPath: string;
}

const TAB_ITEMS: TabItemConfig[] = [
  {
    key: 'index',
    outlineIcon: 'home-outline',
    filledIcon: 'home',
    targetPath: '/',
  },
  {
    key: 'search',
    outlineIcon: 'search-outline',
    filledIcon: 'search',
    targetPath: '/search',
  },
  {
    key: 'chapters',
    outlineIcon: 'book-outline',
    filledIcon: 'book',
    targetPath: '/chapters',
  },
  {
    key: 'collections',
    outlineIcon: 'bookmark-outline',
    filledIcon: 'bookmark',
    targetPath: '/collections',
  },
  {
    key: 'settings',
    outlineIcon: 'settings-outline',
    filledIcon: 'settings',
    targetPath: '/settings',
  },
];

export function AppBottomTabBar() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const router = useRouter();

  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch {
    pathname = '';
  }

  let segments: string[] = [];
  try {
    segments = useSegments() || [];
  } catch {
    segments = [];
  }

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastTabRef = useRef<TabKey>('index');

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
      const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  // Determine active tab
  let activeTab: TabKey = 'index';
  if (pathname === '/' || pathname === '' || pathname === '/(tabs)') {
    activeTab = 'index';
    lastTabRef.current = 'index';
  } else if (pathname.startsWith('/search') || segments.includes('search')) {
    activeTab = 'search';
    lastTabRef.current = 'search';
  } else if (
    pathname.startsWith('/chapter') ||
    segments.includes('chapters') ||
    segments[0] === 'chapter'
  ) {
    activeTab = 'chapters';
    lastTabRef.current = 'chapters';
  } else if (
    pathname.startsWith('/collections') ||
    segments.includes('collections') ||
    segments[0] === 'collections'
  ) {
    activeTab = 'collections';
    lastTabRef.current = 'collections';
  } else if (pathname.startsWith('/settings') || segments.includes('settings')) {
    activeTab = 'settings';
    lastTabRef.current = 'settings';
  } else if (pathname.startsWith('/kural') || segments[0] === 'kural') {
    activeTab = lastTabRef.current;
  } else {
    activeTab = lastTabRef.current;
  }

  // Hide tab bar on Android when keyboard is active
  if (Platform.OS === 'android' && keyboardVisible) {
    return null;
  }

  const tabBottomPadding =
    Platform.OS === 'ios'
      ? insets.bottom > 0
        ? insets.bottom
        : 8
      : insets.bottom > 0
      ? insets.bottom + 6
      : 8;

  const tabBarHeight =
    Platform.OS === 'ios'
      ? insets.bottom > 0
        ? 56 + insets.bottom
        : 64
      : 58 + tabBottomPadding;

  const handlePress = (item: TabItemConfig) => {
    if (item.key === 'index') {
      router.navigate('/');
    } else {
      router.navigate(item.targetPath as any);
    }
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: tabBottomPadding,
        },
      ]}
      accessibilityRole="tablist"
    >
      {TAB_ITEMS.map((item) => {
        const isFocused = activeTab === item.key;
        const iconName = isFocused ? item.filledIcon : item.outlineIcon;
        const iconColor = isFocused ? colors.primary : colors.tabIconDefault;
        const label = t.tabs[item.key === 'index' ? 'home' : item.key];

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabItem}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
          >
            <Ionicons name={iconName} size={22} color={iconColor} />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: iconColor,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 14,
  },
});
