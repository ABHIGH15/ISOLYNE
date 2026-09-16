import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIFIED_GAPS_KEY = '@isolyne_notified_gaps';

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
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
  
    
  const permission = await requestNotificationPermissions();
  if (!permission) return;

  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_GAPS_KEY);
    const notifiedMap: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    
    // Idempotency check: key on gapId + description so a new conflict on the same topic still fires
    const dedupKey = `${gapId}::${description}`;
    
    if (notifiedMap[dedupKey]) {
      return; // Already notified for this exact conflict
    }

    // Mark as notified immediately
    notifiedMap[dedupKey] = true;
    await AsyncStorage.setItem(NOTIFIED_GAPS_KEY, JSON.stringify(notifiedMap));

    // Demo script mechanism: fire with a 3-4 second delay so user can background the app
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Isolyne: Drift Detected',
        body: description,
        data: { url: `/radar?gapId=${gapId}` },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 4, 
      },
    });
    
    console.log(`[Notification Scheduled] 4s delay for gap: ${gapId}`);
    
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
}
