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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

function GlassNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Radar', path: '/radar' },
    { name: 'Timeline', path: '/timeline' },
    { name: 'Decisions', path: '/decisions' },
    { name: 'Projects', path: '/projects' },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(800).delay(200)} style={s.navContainer}>
      <BlurView intensity={80} tint="dark" style={s.navBlur}>
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
            contentStyle: { backgroundColor: color.bg },
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
  root: { flex: 1, backgroundColor: color.bg },
  navContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  navBlur: {
    flexDirection: 'row',
    padding: 6,
    gap: 4,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  navText: {
    ...type.meta,
    color: color.textMuted,
    fontSize: 12,
  },
  navTextActive: {
    color: color.text,
    fontWeight: '700',
  }
});
