import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const NOTIFIED_GAPS_KEY = '@isolyne_notified_gaps';

export async function requestNotificationPermissions() {
  return true; // Mocked for Expo Go compatibility
}

export async function clearNotifiedGap(gapId: string) {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_GAPS_KEY);
    if (!stored) return;
    const notifiedMap: Record<string, boolean> = JSON.parse(stored);
    
    // Remove all keys that start with this gapId
    const newMap: Record<string, boolean> = {};
    for (const key of Object.keys(notifiedMap)) {
      if (!key.startsWith(gapId)) {
        newMap[key] = true;
      }
    }
    
    await AsyncStorage.setItem(NOTIFIED_GAPS_KEY, JSON.stringify(newMap));
  } catch (e) {
    console.error('Failed to clear notified gap', e);
  }
}

export async function scheduleGapNotification(
  gapId: string, 
  topic: string, 
  description: string, 
  triggeringActor: string
) {
  if (Platform.OS === 'web') return; // Web push is out of scope
  
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_GAPS_KEY);
    const notifiedMap: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    
    const dedupKey = `${gapId}::${description}`;
    
    if (notifiedMap[dedupKey]) {
      return; 
    }

    notifiedMap[dedupKey] = true;
    await AsyncStorage.setItem(NOTIFIED_GAPS_KEY, JSON.stringify(notifiedMap));

    setTimeout(() => {
      Alert.alert(
        '⚠️ Isolyne: Drift Detected',
        description,
        [{ text: 'View on Radar' }]
      );
    }, 2000);
    
    console.log(`[Notification Scheduled] 2s delay for gap: ${gapId}`);
    
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
}
