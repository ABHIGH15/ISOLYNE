import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '../theme/tokens';

export function RadarMotif({ status }: { status: 'clear' | 'alert' }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'clear') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      pulseAnim.setValue(0);
    } else {
      rotateAnim.stopAnimation();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status, pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const motifColor = status === 'clear' ? color.join : color.risk;
  const motifSoft = status === 'clear' ? color.joinSoft : color.riskSoft;

  return (
    <View style={s.container}>
      {/* Concentric rings */}
      <View style={[s.ring, s.ring1, { borderColor: motifSoft }]} />
      <View style={[s.ring, s.ring2, { borderColor: motifSoft }]} />
      <View style={[s.ring, s.ring3, { borderColor: motifSoft }]} />

      {status === 'clear' && (
        <Animated.View style={[s.sweepContainer, { transform: [{ rotate: spin }] }]}>
          <LinearGradient
            colors={[`${motifColor}80`, 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={s.sweepGradient}
          />
          <View style={[s.sweepLine, { backgroundColor: motifColor }]} />
        </Animated.View>
      )}

      {status === 'alert' && (
        <Animated.View style={[s.pulse, { 
          backgroundColor: motifColor, 
          transform: [{ scale: pulseScale }], 
          opacity: pulseOpacity 
        }]} />
      )}

      <View style={[s.core, { backgroundColor: motifColor }]} />
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
    borderWidth: 1,
    borderRadius: 999,
  },
  ring1: { width: 80, height: 80 },
  ring2: { width: 140, height: 140 },
  ring3: { width: 200, height: 200 },
  core: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    opacity: 0.8,
  }
});
