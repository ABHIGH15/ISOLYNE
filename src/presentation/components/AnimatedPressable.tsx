import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
}

export function AnimatedPressable({ children, style, activeScale = 0.96, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    onPressIn && onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    onPressOut && onPressOut(e);
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1, width: '100%' }} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
