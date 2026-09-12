import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { color } from '../theme/tokens';

export function RadarMotif({ status }: { status: 'clear' | 'alert' }) {
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(0.5);
  const pulseOpacity = useSharedValue(0);
  const coreScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'clear') {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      
      // Smooth reset transition
      coreScale.value = withSpring(1);
      
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1, // infinite
        false // no reverse
      );
    } else {
      cancelAnimation(rotation);
      
      // Climax transition: pop the core
      coreScale.value = withSequence(
        withTiming(1.5, { duration: 150 }),
        withSpring(1)
      );

      // Violent pulse loop
      pulseScale.value = 0.5;
      pulseOpacity.value = 0.8;
      
      pulseScale.value = withRepeat(
        withTiming(2.5, { duration: 1200, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      );
      
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      );
    }
  }, [status]);

  const animatedSweepStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value
    };
  });
  
  const animatedCoreStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: coreScale.value }]
    };
  });

  const motifColor = status === 'clear' ? color.join : color.risk;
  const motifSoft = status === 'clear' ? '#297353' : '#8A3245'; 

  return (
    <View style={[s.container, { shadowColor: motifColor, shadowRadius: 30, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 0 } }]}>
      {/* Concentric rings */}
      <View style={[s.ring, s.ring1, { borderColor: motifSoft }]} />
      <View style={[s.ring, s.ring2, { borderColor: motifSoft }]} />
      <View style={[s.ring, s.ring3, { borderColor: motifSoft }]} />

      {status === 'clear' && (
        <Animated.View style={[s.sweepContainer, animatedSweepStyle]}>
          <LinearGradient
            colors={[`${motifColor}80`, 'transparent']}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={s.sweepGradient}
          />
          <View style={[s.sweepLine, { 
            backgroundColor: motifColor, 
            shadowColor: motifColor, 
            shadowRadius: 15, 
            shadowOpacity: 1, 
            shadowOffset: { width: -5, height: 0 } 
          }]} />
        </Animated.View>
      )}

      {status === 'alert' && (
        <Animated.View style={[s.pulse, { backgroundColor: motifColor }, animatedPulseStyle]} />
      )}

      <Animated.View style={[s.core, { backgroundColor: motifColor }, animatedCoreStyle]} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 40,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
  },
  ring1: { width: 80, height: 80 },
  ring2: { width: 140, height: 140 },
  ring3: { width: 200, height: 200 },
  core: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
  },
  pulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
  },
  sweepContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweepGradient: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    borderTopLeftRadius: 100,
  },
  sweepLine: {
    position: 'absolute',
    width: 2,
    height: 100,
    top: 0,
    opacity: 0.9,
  }
});
