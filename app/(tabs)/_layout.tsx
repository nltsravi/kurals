import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // On devices with on-screen navigation buttons (such as Samsung 3-button nav, e.g. Samsung M47),
  // insets.bottom accounts for the system navigation bar (typically ~48dp).
  // Dynamically calculate paddingBottom and height using safe area insets to prevent the system nav bar
  // from overlapping tab icons and labels.
  const tabBottomPadding = Platform.OS === 'ios'
    ? (insets.bottom > 0 ? insets.bottom : 8)
    : (insets.bottom > 0 ? insets.bottom + 6 : 8);

  const tabBarHeight = Platform.OS === 'ios'
    ? (insets.bottom > 0 ? 56 + insets.bottom : 64)
    : (58 + tabBottomPadding);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: {
          display: 'none',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          marginTop: 1,
          lineHeight: 14,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.text,
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          headerShown: false,
          tabBarLabel: t.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t.tabs.search,
          headerShown: false,
          tabBarLabel: t.tabs.search,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="chapters"
        options={{
          title: t.tabs.chapters,
          tabBarLabel: t.tabs.chapters,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: t.tabs.collections,
          tabBarLabel: t.tabs.collections,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarLabel: t.tabs.settings,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

