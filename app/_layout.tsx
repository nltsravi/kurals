import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { CollectionProvider } from '../src/context/CollectionContext';
import { StatusBar } from 'expo-status-bar';
import { NotificationService } from '../src/services/notificationService';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { colors, isDark } = useTheme();

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
            title: 'குறள் விவரம்',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="chapter/[id]"
          options={{
            title: 'அதிகாரம்',
            headerBackTitle: 'Chapters',
          }}
        />
        <Stack.Screen
          name="collections/create"
          options={{
            title: 'புதிய தொகுப்பு',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="collections/[id]"
          options={{
            title: 'தொகுப்பு',
            headerBackTitle: 'Collections',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CollectionProvider>
        <RootNavigation />
      </CollectionProvider>
    </ThemeProvider>
  );
}
