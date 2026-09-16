import { vi, describe, it, expect, beforeEach } from 'vitest';
import { scheduleGapNotification } from '../notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  }
}));

vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: vi.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'time_interval' }
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' }
}));

describe('Notification Service Dedup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('schedules notification on first divergence and skips on identical repeat', async () => {
    // 1. First call: Storage is empty
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
    
    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Firebase', 'Bob');
    
    // Should have checked storage, set storage, and scheduled
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@isolyne_notified_gaps');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@isolyne_notified_gaps', 
      expect.stringContaining('"gap_1::Alice says Postgres, Bob says Firebase":true')
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

    // 2. Second call: Storage has the exact same gap + description
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
      JSON.stringify({ "gap_1::Alice says Postgres, Bob says Firebase": true })
    );

    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Firebase', 'Alice');
    
    // Should NOT schedule again
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

    // 3. Third call: Same gap ID, but description changed (e.g. Bob now says Mongo)
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
      JSON.stringify({ "gap_1::Alice says Postgres, Bob says Firebase": true })
    );

    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Mongo', 'Bob');
    
    // Should schedule a new one because hash is different!
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });
});
