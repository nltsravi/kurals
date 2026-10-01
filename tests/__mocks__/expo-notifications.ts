export const setNotificationHandler = jest.fn();
export const setNotificationChannelAsync = jest.fn(async () => {});
export const getPermissionsAsync = jest.fn(async () => ({ status: 'granted' }));
export const requestPermissionsAsync = jest.fn(async () => ({ status: 'granted' }));
export const scheduleNotificationAsync = jest.fn(async () => 'mock-notification-id');
export const cancelAllScheduledNotificationsAsync = jest.fn(async () => {});
export const getAllScheduledNotificationsAsync = jest.fn(async () => []);
export const addNotificationResponseReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));
export const addNotificationReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));
export const getLastNotificationResponseAsync = jest.fn(async () => null);

export const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  MAX: 5,
};

export const SchedulableTriggerInputTypes = {
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CALENDAR: 'calendar',
};
