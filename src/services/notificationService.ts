import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KuralService } from './kuralService';

export interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0 - 23
  minute: number; // 0 - 59
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  hour: 8,
  minute: 0,
};

const NOTIFICATION_SETTINGS_KEY = '@thirukkural_notification_settings_v1';
const NOTIFICATION_CHANNEL_ID = 'daily-thirukkural';

let isHandlerConfigured = false;

function ensureNotificationHandler() {
  if (isHandlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  isHandlerConfigured = true;
}

export const NotificationService = {
  /**
   * Initializes the notification handler, creates Android notification channel,
   * and refreshes the schedule if notifications are currently enabled.
   */
  async initAsync(): Promise<void> {
    ensureNotificationHandler();

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: 'தினசரி திருக்குறள் (Daily Thirukkural)',
          description: 'Daily Thirukkural couplets in Tamil and English',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF7C0A',
        });
      } catch (e) {
        console.warn('Failed to configure Android notification channel:', e);
      }
    }

    try {
      const settings = await this.getSettings();
      if (settings.enabled) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          await this.scheduleDailyNotificationsAsync(settings.hour, settings.minute);
        }
      }
    } catch (e) {
      console.warn('Failed to initialize notification schedule:', e);
    }
  },

  /**
   * Retrieves saved notification settings from local storage.
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_NOTIFICATION_SETTINGS.enabled,
          hour: typeof parsed.hour === 'number' ? parsed.hour : DEFAULT_NOTIFICATION_SETTINGS.hour,
          minute: typeof parsed.minute === 'number' ? parsed.minute : DEFAULT_NOTIFICATION_SETTINGS.minute,
        };
      }
    } catch {
      // Fall through to default
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  },

  /**
   * Saves updated notification settings to local storage.
   */
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save notification settings:', e);
    }
  },

  /**
   * Checks current permission status or requests permission from the OS.
   */
  async requestPermissionsAsync(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedules daily notifications with a random Thirukkural in Tamil & English.
   * Schedules the next 14 upcoming days with distinct random Kurals,
   * plus a daily repeating trigger as an indefinite fallback.
   */
  async scheduleDailyNotificationsAsync(hour: number, minute: number): Promise<boolean> {
    ensureNotificationHandler();

    const hasPermission = await this.requestPermissionsAsync();
    if (!hasPermission) {
      return false;
    }

    // Cancel previously scheduled notifications
    await this.cancelNotificationsAsync();

    const now = new Date();
    const DAYS_TO_SCHEDULE = 14;

    for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);
      targetDate.setHours(hour, minute, 0, 0);

      // If target time for today has already passed, schedule starting from tomorrow
      if (targetDate.getTime() <= now.getTime()) {
        continue;
      }

      const kural = KuralService.getRandomKural();
      const title = `குறள் ${kural.number} • Thirukkural #${kural.number}`;
      const body = `${kural.line1}\n${kural.line2}\n\n${kural.translation}`;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { kuralNumber: kural.number },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
            channelId: NOTIFICATION_CHANNEL_ID,
          },
        });
      } catch (err) {
        console.warn(`Failed to schedule notification for day +${dayOffset}:`, err);
      }
    }

    // Schedule fallback daily repeating trigger for day 15 onwards
    try {
      const fallbackKural = KuralService.getRandomKural();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `குறள் ${fallbackKural.number} • Thirukkural #${fallbackKural.number}`,
          body: `${fallbackKural.line1}\n${fallbackKural.line2}\n\n${fallbackKural.translation}`,
          data: { kuralNumber: fallbackKural.number },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
    } catch (err) {
      console.warn('Failed to schedule repeating daily notification trigger:', err);
    }

    return true;
  },

  /**
   * Cancels all scheduled Thirukkural notifications.
   */
  async cancelNotificationsAsync(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('Failed to cancel notifications:', e);
    }
  },

  /**
   * Immediately delivers a test notification with a random Thirukkural in Tamil & English.
   */
  async sendTestNotificationAsync(): Promise<string> {
    ensureNotificationHandler();

    const hasPermission = await this.requestPermissionsAsync();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const kural = KuralService.getRandomKural();
    const title = `குறள் ${kural.number} (${kural.chapterNameTamil}) • Kural #${kural.number}`;
    const body = `${kural.line1}\n${kural.line2}\n\n${kural.translation}`;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { kuralNumber: kural.number },
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  },

  /**
   * Subscribes to notification interaction responses so tapping on a notification
   * opens the specific Kural.
   */
  addResponseListener(onKuralSelected: (kuralNumber: number) => void): { remove: () => void } {
    ensureNotificationHandler();

    // Check if the app was launched by tapping a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const kuralNum = response?.notification?.request?.content?.data?.kuralNumber;
      if (typeof kuralNum === 'number') {
        onKuralSelected(kuralNum);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const kuralNum = response?.notification?.request?.content?.data?.kuralNumber;
      if (typeof kuralNum === 'number') {
        onKuralSelected(kuralNum);
      }
    });

    return subscription;
  },

  /**
   * Helper to format hour & minute in 12-hour format with Tamil & English markers.
   */
  formatTime(hour: number, minute: number): { formatted: string; periodTamil: string } {
    const period = hour >= 12 ? 'PM' : 'AM';
    const periodTamil = hour < 12 ? (hour < 6 ? 'விடியற்காலை' : 'காலை') : (hour < 17 ? 'பிற்பகல்' : (hour < 20 ? 'மாலை' : 'இரவு'));
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = String(minute).padStart(2, '0');
    return {
      formatted: `${String(displayHour).padStart(2, '0')}:${displayMinute} ${period}`,
      periodTamil: `${periodTamil} ${String(displayHour).padStart(2, '0')}:${displayMinute}`,
    };
  },
};
