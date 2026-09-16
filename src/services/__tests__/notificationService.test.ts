import { vi, describe, it, expect, beforeEach } from 'vitest';
import { scheduleGapNotification } from '../notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  }
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: { alert: vi.fn() }
}));

describe('Notification Service Dedup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('schedules notification on first divergence and skips on identical repeat', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
    
    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Firebase', 'Bob');
    
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@isolyne_notified_gaps');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@isolyne_notified_gaps', 
      expect.stringContaining('"gap_1::Alice says Postgres, Bob says Firebase":true')
    );
    
    vi.runAllTimers();
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
      JSON.stringify({ "gap_1::Alice says Postgres, Bob says Firebase": true })
    );

    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Firebase', 'Alice');
    
    vi.runAllTimers();
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
      JSON.stringify({ "gap_1::Alice says Postgres, Bob says Firebase": true })
    );

    await scheduleGapNotification('gap_1', 'DB', 'Alice says Postgres, Bob says Mongo', 'Bob');
    
    vi.runAllTimers();
    expect(Alert.alert).toHaveBeenCalledTimes(2);
  });
});
