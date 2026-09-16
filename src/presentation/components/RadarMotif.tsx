import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { color } from '../theme/tokens';

export function RadarMotif({ status }: { status: 'clear' | 'alert' | 'resolving' }) {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(0.5);
  const pulseOpacity = useSharedValue(0);
  const coreScale = useSharedValue(1);
  const faultProgress = useSharedValue(1);
  const faultOpacity = useSharedValue(0);

  useEffect(() => {
    if (status === 'clear') {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      
      faultOpacity.value = withTiming(0, { duration: 600 });
      
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
    } else if (status === 'resolving') {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(rotation);

      pulseOpacity.value = withTiming(0, { duration: 300 });

      // Healing fault lines (reverse)
      faultProgress.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) });
      faultOpacity.value = withTiming(0, { duration: 600 });

      // Celebration bounce
      coreScale.value = withSequence(
        withTiming(1.8, { duration: 200 }),
        withSpring(1)
      );
    } else {
      cancelAnimation(rotation);
      
      // Climax transition: pop the core
      coreScale.value = withSequence(
        withTiming(1.5, { duration: 150 }),
        withSpring(1)
      );

      // Fault line rupture
      faultProgress.value = 1;
      faultOpacity.value = 1;
      faultProgress.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });

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

  const motifColor = status === 'alert' ? color.risk : color.join;
  const motifSoft = status === 'alert' ? color.riskLine : color.joinLine;

  const animatedFaultProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: faultProgress.value * 250,
      strokeOpacity: faultOpacity.value
    };
  }); 

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

      {/* Topographical Fault Line */}
      <Svg height="200" width="200" style={StyleSheet.absoluteFill}>
        <AnimatedPath
          d="M 100 100 L 125 115 L 120 145 L 155 160 L 150 185 L 195 200"
          stroke={color.risk}
          strokeWidth="3"
          fill="none"
          strokeDasharray="250"
          animatedProps={animatedFaultProps}
        />
        <AnimatedPath
          d="M 100 100 L 85 70 L 60 75 L 50 40 L 25 35 L 5 0"
          stroke={color.risk}
          strokeWidth="3"
          fill="none"
          strokeDasharray="250"
          animatedProps={animatedFaultProps}
        />
      </Svg>

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
