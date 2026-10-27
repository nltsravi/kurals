import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext';
import { CollectionProvider } from '../src/context/CollectionContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NotificationService } from '../src/services/notificationService';

import { View } from 'react-native';
import { AppBottomTabBar } from '../src/components/AppBottomTabBar';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    NotificationService.initAsync().catch(() => {});

    const sub = NotificationService.addResponseListener((kuralNumber) => {
      if (kuralNumber) {
        router.push(`/kural/${kuralNumber}`);
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: '700',
              color: colors.text,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="kural/[id]"
            options={{
              title: t.stackHeaders.kuralDetail,
              headerBackTitle: t.common.back,
            }}
          />
          <Stack.Screen
            name="chapter/[id]"
            options={{
              title: t.stackHeaders.chapterDetail,
              headerBackTitle: t.common.chapters,
            }}
          />
          <Stack.Screen
            name="collections/create"
            options={{
              title: t.stackHeaders.newCollection,
              headerBackTitle: t.common.back,
            }}
          />
          <Stack.Screen
            name="collections/[id]"
            options={{
              title: t.stackHeaders.collectionDetail,
              headerBackTitle: t.common.collections,
            }}
          />
        </Stack>
        <AppBottomTabBar />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <LanguageProvider>
          <CollectionProvider>
            <RootNavigation />
          </CollectionProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

