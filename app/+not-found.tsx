import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { isEnglish } = useLanguage();

  return (
    <>
      <Stack.Screen
        options={{
          title: isEnglish ? 'Page Not Found' : 'பக்கம் கிடைக்கவில்லை',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={54} color={colors.textMuted} />
        <Text style={[styles.title, { color: colors.text }]}>
          {isEnglish ? 'Page Not Found' : 'பக்கம் கிடைக்கவில்லை'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isEnglish
            ? "This screen doesn't exist."
            : 'இந்த பக்கம் பயன்பாட்டில் இல்லை.'}
        </Text>

        <Link href="/" asChild>
          <TouchableOpacity style={[styles.linkBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.linkText}>
              {isEnglish ? 'Go to Home Screen' : 'முகப்புக்குச் செல்க'}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  linkBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
