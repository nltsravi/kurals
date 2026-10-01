import { NotificationService, DEFAULT_NOTIFICATION_SETTINGS } from '../src/services/notificationService';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('NotificationService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  test('returns default settings when storage is empty', async () => {
    const settings = await NotificationService.getSettings();
    expect(settings).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(settings.enabled).toBe(true);
    expect(settings.hour).toBe(8);
    expect(settings.minute).toBe(0);
  });

  test('saves and retrieves updated notification settings', async () => {
    await NotificationService.saveSettings({
      enabled: false,
      hour: 19,
      minute: 30,
    });

    const settings = await NotificationService.getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.hour).toBe(19);
    expect(settings.minute).toBe(30);
  });

  test('formats hour and minute in 12-hour format with Tamil and English periods', () => {
    const morning = NotificationService.formatTime(8, 0);
    expect(morning.formatted).toBe('08:00 AM');
    expect(morning.periodTamil).toContain('காலை');

    const evening = NotificationService.formatTime(18, 30);
    expect(evening.formatted).toBe('06:30 PM');
    expect(evening.periodTamil).toContain('மாலை');

    const midnight = NotificationService.formatTime(0, 15);
    expect(midnight.formatted).toBe('12:15 AM');

    const noon = NotificationService.formatTime(12, 0);
    expect(noon.formatted).toBe('12:00 PM');

    const night = NotificationService.formatTime(21, 45);
    expect(night.formatted).toBe('09:45 PM');
    expect(night.periodTamil).toContain('இரவு');
  });

  test('schedules notifications with random Thirukkural in Tamil and English', async () => {
    const success = await NotificationService.scheduleDailyNotificationsAsync(8, 0);
    expect(success).toBe(true);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();

    // Verify calls contain Tamil couplets, English translation, and kural number
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const firstCallContent = calls[0][0].content;
    expect(firstCallContent.title).toMatch(/குறள் \d+ • Thirukkural #\d+/);
    expect(firstCallContent.body).toBeDefined();
    // Body should contain newlines separating Tamil couplet and English translation
    expect(firstCallContent.body).toContain('\n');
    expect(firstCallContent.data).toHaveProperty('kuralNumber');
    expect(typeof firstCallContent.data.kuralNumber).toBe('number');
  });

  test('sends an immediate test notification with random Kural', async () => {
    const id = await NotificationService.sendTestNotificationAsync();
    expect(id).toBe('mock-notification-id');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: null,
        content: expect.objectContaining({
          data: expect.objectContaining({
            kuralNumber: expect.any(Number),
          }),
        }),
      })
    );
  });

  test('cancels scheduled notifications when requested', async () => {
    await NotificationService.cancelNotificationsAsync();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});
