import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Animated, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { color, space, type, radius } from '../theme/tokens';
import { RadarMotif } from './RadarMotif';
import { useKernel } from '../state/KernelContext';

export function OnboardingModal() {
  const { saveUserAndRoster } = useKernel();
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState('Alice');
  const [teammateInput, setTeammateInput] = useState('');
  const [teammates, setTeammates] = useState<string[]>(['Bob']);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem('isolyne_onboarding_v2');
      if (!hasSeen) {
        setIsVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    };
    checkOnboarding();
  }, [fadeAnim]);

  const handleAddTeammate = () => {
    const clean = teammateInput.trim();
    if (!clean || teammates.includes(clean) || clean === name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeammates([...teammates, clean]);
    setTeammateInput('');
  };

  const handleRemoveTeammate = (tName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeammates(teammates.filter(t => t !== tName));
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await saveUserAndRoster(name, teammates);
    await AsyncStorage.setItem('isolyne_onboarding_v2', 'true');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
      <View style={s.card}>
        {step === 0 && (
          <>
            <RadarMotif status="clear" />
            <View style={s.content}>
              <Text style={s.stepBadge}>Step 1 of 3 · Philosophy</Text>
              <Text style={s.title}>Too fast to argue.</Text>
              <Text style={s.body}>
                Fast-moving teams don't argue — they just assume.
              </Text>
              <Text style={s.body}>
                Isolyne sits in the background of your workflow and catches when your teammate states the opposite of what you're building, before it turns into a 3 AM integration conflict.
              </Text>
              
              <Pressable style={s.btn} onPress={handleNextStep}>
                <Text style={s.btnText}>Continue</Text>
                <Feather name="arrow-right" size={16} color={color.textOnAccent} />
              </Pressable>
            </View>
          </>
        )}

        {step === 1 && (
          <View style={s.content}>
            <Text style={s.stepBadge}>Step 2 of 3 · Personalization</Text>
            <Text style={s.title}>What should we call you?</Text>
            <Text style={s.body}>
              Enter your name to personalize your decisions and statements in the team timeline.
            </Text>
            
            <View style={s.inputWrapper}>
              <Feather name="user" size={18} color={color.textSecondary} style={s.inputIcon} />
              <TextInput 
                style={s.textInput}
                placeholder="Your Name (e.g. Alice)"
                placeholderTextColor={color.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCorrect={false}
              />
            </View>
            
            <Pressable 
              style={[s.btn, !name.trim() && s.btnDisabled]} 
              onPress={handleNextStep}
              disabled={!name.trim()}
            >
              <Text style={s.btnText}>Next: Team Roster</Text>
              <Feather name="arrow-right" size={16} color={color.textOnAccent} />
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.stepBadge}>Step 3 of 3 · Team Setup</Text>
            <Text style={s.title}>Who's on your team?</Text>
            <Text style={s.body}>
              Add the teammates who are collaborating with you. Isolyne watches for alignment across all members.
            </Text>
            
            <View style={s.rosterList}>
              <View style={[s.rosterPill, s.rosterPillSelf]}>
                <Feather name="user-check" size={14} color={color.join} />
                <Text style={[s.rosterName, { color: color.join }]}>{name} (You)</Text>
              </View>
              {teammates.map((t, idx) => (
                <View key={idx} style={s.rosterPill}>
                  <Feather name="user" size={14} color={color.textSecondary} />
                  <Text style={s.rosterName}>{t}</Text>
                  <Pressable onPress={() => handleRemoveTeammate(t)} hitSlop={8}>
                    <Feather name="x" size={14} color={color.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={s.addTeammateRow}>
              <TextInput 
                style={s.teammateInput}
                placeholder="Teammate name (e.g. Bob)"
                placeholderTextColor={color.textMuted}
                value={teammateInput}
                onChangeText={setTeammateInput}
                onSubmitEditing={handleAddTeammate}
                autoCorrect={false}
              />
              <Pressable style={s.addBtn} onPress={handleAddTeammate}>
                <Feather name="plus" size={18} color={color.textOnAccent} />
              </Pressable>
            </View>
            
            <Pressable style={s.btn} onPress={handleFinish}>
              <Text style={s.btnText}>Launch Workspace</Text>
              <Feather name="check" size={16} color={color.textOnAccent} />
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 8, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: color.bgElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.lineStrong,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: space.xl,
  },
  content: {
    padding: space.xl,
    alignItems: 'center',
    width: '100%',
  },
  stepBadge: {
    ...type.label,
    color: color.accent,
    marginBottom: space.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    ...type.title,
    color: color.text,
    marginBottom: space.md,
    textAlign: 'center',
  },
  body: {
    ...type.body,
    color: color.textSecondary,
    textAlign: 'center',
    marginBottom: space.lg,
    fontSize: 14,
    lineHeight: 20,
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.bgQuiet,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    paddingHorizontal: space.md,
    marginBottom: space.xl,
  },
  inputIcon: {
    marginRight: space.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: space.md,
    color: color.text,
    ...type.body,
    fontSize: 16,
  },
  rosterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    width: '100%',
    marginBottom: space.lg,
    justifyContent: 'center',
  },
  rosterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.bgQuiet,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  rosterPillSelf: {
    backgroundColor: color.joinSoft,
    borderColor: color.joinLine,
  },
  rosterName: {
    ...type.meta,
    color: color.textSecondary,
  },
  addTeammateRow: {
    flexDirection: 'row',
    width: '100%',
    gap: space.sm,
    marginBottom: space.xl,
  },
  teammateInput: {
    flex: 1,
    backgroundColor: color.bgQuiet,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    color: color.text,
    ...type.body,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: color.accent,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    backgroundColor: color.accent,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    ...type.button,
    color: color.textOnAccent,
  }
});
