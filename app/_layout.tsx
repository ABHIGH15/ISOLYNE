import { useFonts, Orbitron_800ExtraBold } from '@expo-google-fonts/orbitron';
import { useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { color, space, type, radius } from '../src/presentation/theme/tokens';
import { KernelProvider } from '../src/presentation/state/KernelContext';
import { initPurchases } from '../src/services/purchases';
import { OnboardingModal } from '../src/presentation/components/OnboardingModal';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

function GlassNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'SYS', path: '/' },
    { name: 'RDR', path: '/radar' },
    { name: 'TML', path: '/timeline' },
    { name: 'LOG', path: '/decisions' },
    { name: 'NET', path: '/projects' },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(800).delay(200)} style={s.navContainer}>
      <BlurView intensity={90} tint="dark" style={s.navBlur}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Pressable 
              key={item.path}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace(item.path as any);
              }}
              style={[s.navItem, isActive && s.navItemActive]}
            >
              <Text style={[s.navText, isActive && s.navTextActive]}>{item.name}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Orbitron: Orbitron_800ExtraBold });

  useEffect(() => {
    initPurchases();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <KernelProvider>
      <View style={s.root}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#050505' },
            animation: 'fade', // Smooth crossfade transitions
          }}
        />
        <GlassNav />
        <OnboardingModal />
      </View>
    </KernelProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  navContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  navBlur: {
    flexDirection: 'row',
    padding: 2,
    gap: 2,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navText: {
    ...type.meta,
    color: color.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    letterSpacing: 2,
  },
  navTextActive: {
    color: color.text,
  }
});
