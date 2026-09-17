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

interface Props {
  status: 'clear' | 'alert' | 'resolving';
  size?: number;
}

export function RadarMotif({ status, size = 200 }: Props) {
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
      coreScale.value = withSpring(1);
      
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else if (status === 'resolving') {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(rotation);

      pulseOpacity.value = withTiming(0, { duration: 300 });

      faultProgress.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) });
      faultOpacity.value = withTiming(0, { duration: 600 });

      coreScale.value = withSequence(
        withTiming(1.8, { duration: 200 }),
        withSpring(1)
      );
    } else {
      cancelAnimation(rotation);
      
      coreScale.value = withSequence(
        withTiming(1.5, { duration: 150 }),
        withSpring(1)
      );

      faultProgress.value = 1;
      faultOpacity.value = 1;
      faultProgress.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });

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
      strokeDashoffset: faultProgress.value * (size * 1.25),
      strokeOpacity: faultOpacity.value
    };
  }); 

  return (
    <View style={[s.container, { width: size, height: size, shadowColor: motifColor, shadowRadius: size * 0.15, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 0 } }]}>
      {/* Concentric rings */}
      <View style={[{ position: 'absolute', borderWidth: 1.5, borderRadius: 999, borderColor: motifSoft, width: size * 0.4, height: size * 0.4 }]} />
      <View style={[{ position: 'absolute', borderWidth: 1.5, borderRadius: 999, borderColor: motifSoft, width: size * 0.7, height: size * 0.7 }]} />
      <View style={[{ position: 'absolute', borderWidth: 1.5, borderRadius: 999, borderColor: motifSoft, width: size, height: size }]} />

      {status === 'clear' && (
        <Animated.View style={[{ position: 'absolute', width: size, height: size, justifyContent: 'center', alignItems: 'center' }, animatedSweepStyle]}>
          <LinearGradient
            colors={[`${motifColor}80`, 'transparent']}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{ position: 'absolute', width: size * 0.5, height: size * 0.5, top: 0, right: size * 0.5, borderTopLeftRadius: size * 0.5 }}
          />
          <View style={[{ position: 'absolute', width: 2, height: size * 0.5, top: 0, backgroundColor: motifColor, opacity: 0.9, shadowColor: motifColor, shadowRadius: 15, shadowOpacity: 1, shadowOffset: { width: -5, height: 0 } }]} />
        </Animated.View>
      )}

      {status === 'alert' && (
        <Animated.View style={[{ position: 'absolute', width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: motifColor }, animatedPulseStyle]} />
      )}

      <Svg height={size} width={size} style={StyleSheet.absoluteFill}>
        <AnimatedPath
          d={`M ${size/2} ${size/2} L ${size*0.625} ${size*0.575} L ${size*0.6} ${size*0.725} L ${size*0.775} ${size*0.8} L ${size*0.75} ${size*0.925} L ${size*0.975} ${size}`}
          stroke={color.risk}
          strokeWidth="3"
          fill="none"
          strokeDasharray={size * 1.25}
          animatedProps={animatedFaultProps}
        />
        <AnimatedPath
          d={`M ${size/2} ${size/2} L ${size*0.425} ${size*0.35} L ${size*0.3} ${size*0.375} L ${size*0.25} ${size*0.2} L ${size*0.125} ${size*0.175} L ${size*0.025} 0`}
          stroke={color.risk}
          strokeWidth="3"
          fill="none"
          strokeDasharray={size * 1.25}
          animatedProps={animatedFaultProps}
        />
      </Svg>

      <Animated.View style={[{ width: size * 0.07, height: size * 0.07, borderRadius: size * 0.035, position: 'absolute', backgroundColor: motifColor }, animatedCoreStyle]} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 40,
  }
});
