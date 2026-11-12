
import React, { useState, useRef, useEffect } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

type OnboardingProp =
  NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const COLORS = {
  background: '#080D20',
  card: '#111A32',
  cyan: '#00E5D4',
  purple: '#8650FF',
  blue: '#287BFF',
  white: '#FFFFFF',
  secondary: '#A5B0C8',
  muted: '#71809F',
  border: '#263451',
};

interface Slide {
  id: string;
  label: string;
  title: string;
  accentTitle: string;
  description: string;
  icon: IconName;
  color: string;
  features: string[];
}

const SLIDES: Slide[] = [
  {
    id: '1',
    label: 'REPORT ISSUES',
    title: 'Make Your City',
    accentTitle: 'Better.',
    description:
      'Spotted a pothole or overflowing garbage? Report civic issues with a photo and location in seconds.',
    icon: 'camera',
    color: COLORS.cyan,
    features: [
      'Capture or upload photos',
      'Add your issue location',
    ],
  },
  {
    id: '2',
    label: 'SMART AI ANALYSIS',
    title: 'Powered By',
    accentTitle: 'Intelligence.',
    description:
      'AI helps identify civic issues, suggest categories and recommend priority levels for review.',
    icon: 'sparkles',
    color: COLORS.purple,
    features: [
      'AI-based issue classification',
      'Smart priority suggestions',
    ],
  },
  {
    id: '3',
    label: 'TRACK & RESOLVE',
    title: 'See The Change',
    accentTitle: 'Together.',
    description:
      'Track your complaints, receive updates and stay connected with your community.',
    icon: 'shield',
    color: COLORS.cyan,
    features: [
      'Live complaint status',
      'Community issue tracking',
    ],
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingProp>();
  const { completeOnboarding } = useAuth();

  const { height } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0.85)).current;

  const navigationLock = useRef(false);
  const animationLock = useRef(false);

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;
  const compact = height < 700;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    iconScale.setValue(0.85);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start(() => {
      animationLock.current = false;
    });
  }, [currentIndex]);

  const finishOnboarding = async () => {
    if (navigationLock.current) return;

    navigationLock.current = true;
    setIsLoading(true);

    try {
      await completeOnboarding();
      navigation.replace('Login');
    } catch (error) {
      console.error('Onboarding error:', error);
      navigationLock.current = false;
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isLoading || navigationLock.current || animationLock.current) {
      return;
    }

    if (isLast) {
      finishOnboarding();
      return;
    }

    animationLock.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentIndex(prev => prev + 1);
      } else {
        animationLock.current = false;
      }
    });
  };

  const handleBack = () => {
    if (
      currentIndex === 0 ||
      animationLock.current ||
      isLoading
    ) {
      return;
    }

    animationLock.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentIndex(prev => prev - 1);
      } else {
        animationLock.current = false;
      }
    });
  };

  const handleSkip = () => {
    if (!animationLock.current) {
      finishOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>

        {/* Background Decoration */}

        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Header */}

        <View style={styles.header}>

          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandName}>CivicFix</Text>
                <Text style={styles.brandAI}>AI</Text>
              </View>

              <Text style={styles.brandCaption}>
                BETTER COMMUNITIES
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={isLoading}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

        </View>

        {/* Main Content */}

        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >

          {/* Main Illustration */}

          <View
            style={[
              styles.illustration,
              compact && styles.illustrationCompact,
            ]}
          >

            <View
              style={[
                styles.outerCircle,
                { borderColor: currentSlide.color + '35' },
              ]}
            />

            <View
              style={[
                styles.middleCircle,
                { borderColor: currentSlide.color + '75' },
              ]}
            />

            <Animated.View
              style={[
                styles.iconBox,
                {
                  backgroundColor: currentSlide.color + '12',
                  borderColor: currentSlide.color + '70',
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Icon
                name={currentSlide.icon}
                size={compact ? 46 : 56}
                color={currentSlide.color}
              />
            </Animated.View>

            <View
              style={[
                styles.smallAccent,
                { backgroundColor: COLORS.purple },
              ]}
            />

          </View>

          {/* Step Label */}

          <View
            style={[
              styles.stepBadge,
              {
                backgroundColor: currentSlide.color + '12',
                borderColor: currentSlide.color + '40',
              },
            ]}
          >
            <View
              style={[
                styles.stepDot,
                { backgroundColor: currentSlide.color },
              ]}
            />

            <Text
              style={[
                styles.stepLabel,
                { color: currentSlide.color },
              ]}
            >
              {currentSlide.label}
            </Text>
          </View>

          {/* Heading */}

          <Text style={styles.title}>
            {currentSlide.title}
          </Text>

          <Text
            style={[
              styles.accentTitle,
              { color: currentSlide.color },
            ]}
          >
            {currentSlide.accentTitle}
          </Text>

          {/* Description */}

          <Text style={styles.description}>
            {currentSlide.description}
          </Text>

          {/* Simple Features */}

          <View style={styles.features}>
            {currentSlide.features.map((item, index) => (
              <View
                key={`${currentSlide.id}-${index}`}
                style={styles.featureRow}
              >
                <View
                  style={[
                    styles.checkIcon,
                    { backgroundColor: currentSlide.color + '18' },
                  ]}
                >
                  <Icon
                    name="check"
                    size={12}
                    color={currentSlide.color}
                  />
                </View>

                <Text style={styles.featureText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

        </Animated.View>

        {/* Bottom Navigation */}

        <View style={styles.bottomSection}>

          {/* Progress */}

          <View style={styles.progressRow}>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={styles.progressTrack}
              >
                <View
                  style={[
                    styles.progressActive,
                    {
                      width: index <= currentIndex ? '100%' : '0%',
                      backgroundColor: currentSlide.color,
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Navigation Buttons */}

          <View style={styles.buttonRow}>

            {currentIndex > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Icon
                  name="arrow-left"
                  size={19}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            )}

            <View style={styles.primaryButton}>
              <Button
                title={
                  isLoading
                    ? 'Please wait...'
                    : isLast
                      ? 'Get Started'
                      : 'Continue'
                }
                onPress={handleNext}
                variant="primary"
                size="lg"
                icon="arrow-right"
                iconPosition="right"
                disabled={isLoading}
                style={styles.actionButton}
              />
            </View>

          </View>

          <Text style={styles.footer}>
            {currentIndex + 1} OF 3
            {'  •  '}
            MAKING CITIES BETTER
          </Text>

        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.purple,
    opacity: 0.07,
    top: -150,
    right: -130,
  },

  glowBottom: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: COLORS.cyan,
    opacity: 0.05,
    bottom: -145,
    left: -130,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 39,
    height: 39,
    marginRight: 9,
  },

  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.white,
  },

  brandAI: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.cyan,
    marginLeft: 5,
  },

  brandCaption: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 2,
  },

  skipButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  skipText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },

  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  illustration: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  illustrationCompact: {
    width: 155,
    height: 155,
    marginBottom: 12,
  },

  outerCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 1,
  },

  middleCircle: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 100,
    borderWidth: 1,
  },

  iconBox: {
    width: '57%',
    height: '57%',
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    elevation: 8,
  },

  smallAccent: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: '18%',
    right: '19%',
  },

  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 17,
    gap: 8,
  },

  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  stepLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  title: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 37,
  },

  accentTitle: {
    fontSize: 31,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 39,
    marginBottom: 13,
  },

  description: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 4,
    marginBottom: 22,
    maxWidth: 340,
  },

  features: {
    width: '100%',
    gap: 14,
    paddingHorizontal: 12,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  bottomSection: {
    paddingTop: 16,
    gap: 17,
  },

  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },

  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#26314A',
    overflow: 'hidden',
  },

  progressActive: {
    height: '100%',
    borderRadius: 5,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  backButton: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    flex: 1,
  },

  actionButton: {
    width: '100%',
  },

  footer: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1.3,
    textAlign: 'center',
  },

});

export default OnboardingScreen;
