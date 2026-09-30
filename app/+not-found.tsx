import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'பக்கம் கிடைக்கவில்லை' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={54} color={colors.textMuted} />
        <Text style={[styles.title, { color: colors.text }]}>பக்கம் கிடைக்கவில்லை</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This screen doesn't exist.
        </Text>

        <Link href="/" asChild>
          <TouchableOpacity style={[styles.linkBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.linkText}>Go to Home Screen</Text>
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
