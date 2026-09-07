import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { color, space, type } from '../src/presentation/theme/tokens';
import { KernelProvider } from '../src/presentation/state/KernelContext';
import { initPurchases } from '../src/services/purchases';
import { OnboardingModal } from '../src/presentation/components/OnboardingModal';

// Minimal v3 navigation wrapper
function TopNav() {
  return (
    <View style={s.nav}>
      <Pressable onPress={() => router.replace('/')}><Text style={s.navLink}>Home</Text></Pressable>
      <Pressable onPress={() => router.replace('/projects')}><Text style={s.navLink}>Projects</Text></Pressable>
      <Pressable onPress={() => router.replace('/decisions')}><Text style={s.navLink}>Decisions</Text></Pressable>
      <Pressable onPress={() => router.replace('/radar')}><Text style={s.navLink}>Radar</Text></Pressable>
      <Pressable onPress={() => router.replace('/timeline')}><Text style={s.navLink}>Timeline</Text></Pressable>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <KernelProvider>
      <View style={s.root}>
        <StatusBar style="light" />
        <TopNav />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.bg },
            animation: 'none', // Snap transitions for raw utility feel
          }}
        />
        <OnboardingModal />
      </View>
    </KernelProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  nav: { 
    flexDirection: 'row', 
    gap: space.lg, 
    paddingHorizontal: space.xl, 
    paddingTop: space.heroAir, 
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderColor: color.line
  },
  navLink: { ...type.meta, color: color.accent }
});
