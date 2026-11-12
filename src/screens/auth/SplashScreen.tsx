
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';

type SplashNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const LOGO = require('../../assets/logo.png');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const { width } = useWindowDimensions();

  const logoSize = Math.min(width * 0.58, 230);

  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(25)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  const navigationLock = useRef(false);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => animation.stop();
  }, [
    logoScale,
    logoOpacity,
    contentOpacity,
    contentY,
    bottomOpacity,
  ]);

  const handleContinue = () => {
    if (navigationLock.current) return;

    navigationLock.current = true;
    navigation.replace('Onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <Pressable
        style={styles.container}
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to CivicFix AI onboarding"
      >
        {/* Background Decoration */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* New Official Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                width: logoSize,
                height: logoSize,
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={LOGO}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="CivicFix AI logo"
            />
          </Animated.View>

          {/* Brand Text */}
          <Animated.View
            style={[
              styles.brandContainer,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentY }],
              },
            ]}
          >
            <View style={styles.brandRow}>
              <Text
                style={styles.brandName}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                CivicFix
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI</Text>
              </View>
            </View>

            <Text style={styles.tagline}>
              AI-Powered Civic Issue
            </Text>

            <Text style={styles.tagline}>
              Intelligence & Resolution
            </Text>

            <View style={styles.divider} />

            <Text style={styles.description}>
              Smart Cities. Better Communities.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: bottomOpacity },
          ]}
        >
          <View style={styles.continueRow}>
            <Text style={styles.continueText}>
              Tap anywhere to continue
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>

          <Text style={styles.version}>
            CIVICFIX AI  •  VERSION 1.0
          </Text>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080D20',
  },

  container: {
    flex: 1,
    backgroundColor: '#080D20',
    overflow: 'hidden',
  },

  glowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7138F5',
    opacity: 0.08,
    top: -150,
    right: -120,
  },

  glowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#00E5D4',
    opacity: 0.06,
    bottom: -110,
    left: -120,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderRadius: 48,
    overflow: 'hidden',
  },

  logoImage: {
    width: '100%',
    height: '100%',
  },

  brandContainer: {
    width: '100%',
    alignItems: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.8,
  },

  aiBadge: {
    backgroundColor: '#00E5D4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 11,
    marginLeft: 10,
  },

  aiText: {
    color: '#071427',
    fontSize: 19,
    fontWeight: '900',
  },

  tagline: {
    color: '#A5B0C8',
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
  },

  divider: {
    width: 85,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#00E5D4',
    marginTop: 26,
    marginBottom: 18,
  },

  description: {
    color: '#8794B0',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },

  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  continueText: {
    color: '#B1BDD4',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  arrow: {
    color: '#00E5D4',
    fontSize: 30,
    marginLeft: 12,
  },

  version: {
    color: '#63708D',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default SplashScreen;
