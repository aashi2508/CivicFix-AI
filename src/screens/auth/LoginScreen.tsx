
import React, { useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';

type LoginProp =
  NativeStackNavigationProp<RootStackParamList, 'Login'>;

const BRAND = {
  background: '#080D20',
  surface: '#111A32',
  cyan: '#00E5D4',
  purple: '#8650FF',
  white: '#FFFFFF',
  secondary: '#A5B0C8',
  muted: '#71809F',
  border: '#263451',
};

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginProp>();

  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Email validation
  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    const trimmedEmail = email.trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Normal login
  const handleLogin = async () => {
    if (isLoading || isGuestLoading) return;

    if (!validate()) return;

    try {
      const success = await login(
        email.trim().toLowerCase(),
        password,
      );

      if (success) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.',
        );
      }
    } catch (error) {
      console.error('Login error:', error);

      Alert.alert(
        'Login Failed',
        'Unable to sign in right now. Please try again.',
      );
    }
  };

  // Demo credentials
  const fillDemoCredentials = () => {
    setEmail('alex.rivera@civicfix.org');
    setPassword('civicpass123');
    setErrors({});
  };

  // Guest login
  const handleGuestLogin = async () => {
    if (isLoading || isGuestLoading) return;

    setIsGuestLoading(true);

    try {
      const success = await login(
        'guest@civicfix.org',
        'guest123',
      );

      if (success) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert(
          'Guest Access',
          'Guest login is currently unavailable. Please try the demo credentials or sign in with an account.',
        );
      }
    } catch (error) {
      console.error('Guest login error:', error);

      Alert.alert(
        'Guest Access',
        'Unable to continue as guest. Please try again.',
      );
    } finally {
      setIsGuestLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password?',
      'Password recovery is not configured yet. Please contact the CivicFix administrator for assistance.',
    );
  };

  return (
    <ScreenContainer scrollable>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* BRAND HEADER */}

          <View style={styles.header}>

            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.brandNameRow}>
              <Text style={styles.brandName}>
                CivicFix
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI</Text>
              </View>
            </View>

            <Text style={styles.brandCaption}>
              SMARTER CITIES. BETTER COMMUNITIES.
            </Text>

          </View>

          {/* WELCOME TEXT */}

          <View style={styles.welcomeSection}>

            <Text style={styles.welcomeTitle}>
              Welcome Back
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Sign in to report issues and make your
              community a better place.
            </Text>

          </View>

          {/* DEMO CREDENTIALS */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={fillDemoCredentials}
            style={styles.demoBanner}
          >
            <View style={styles.demoIcon}>
              <Icon
                name="sparkles"
                size={17}
                color={BRAND.cyan}
              />
            </View>

            <View style={styles.demoContent}>
              <Text style={styles.demoTitle}>
                Explore Demo Account
              </Text>

              <Text style={styles.demoSubtitle}>
                Auto-fill sample credentials
              </Text>
            </View>

            <Icon
              name="arrow-right"
              size={18}
              color={BRAND.cyan}
            />

          </TouchableOpacity>

          {/* LOGIN FORM */}

          <View style={styles.form}>

            <Text style={styles.inputHeading}>
              Email Address
            </Text>

            <Input
              label=""
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);

                if (errors.email) {
                  setErrors(prev => ({
                    ...prev,
                    email: undefined,
                  }));
                }
              }}
              icon="user"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <View style={styles.passwordHeading}>
              <Text style={styles.inputHeading}>
                Password
              </Text>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label=""
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);

                if (errors.password) {
                  setErrors(prev => ({
                    ...prev,
                    password: undefined,
                  }));
                }
              }}
              icon="shield"
              isPassword
              autoCapitalize="none"
              error={errors.password}
            />

            {/* SECURITY NOTE */}

            <View style={styles.securityRow}>
              <Icon
                name="shield"
                size={14}
                color={BRAND.cyan}
              />

              <Text style={styles.securityText}>
                Your account credentials are protected
              </Text>
            </View>

            {/* SIGN IN BUTTON */}

            <Button
              title="Sign In to CivicFix"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isGuestLoading}
              variant="primary"
              size="lg"
              icon="arrow-right"
              iconPosition="right"
              style={styles.loginButton}
            />

            {/* DIVIDER */}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />

              <Text style={styles.dividerText}>
                OR
              </Text>

              <View style={styles.dividerLine} />
            </View>

            {/* GUEST LOGIN */}

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
              disabled={isLoading || isGuestLoading}
              activeOpacity={0.75}
            >
              <Icon
                name="user"
                size={17}
                color={BRAND.white}
              />

              <Text style={styles.guestText}>
                {isGuestLoading
                  ? 'Please wait...'
                  : 'Continue as Guest'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* REGISTER LINK */}

          <View style={styles.registerSection}>

            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>
                Create Account
              </Text>
            </TouchableOpacity>

          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            CIVICFIX AI  •  BUILDING BETTER COMMUNITIES
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
  },

  header: {
    alignItems: 'center',
    marginBottom: 27,
  },

  logo: {
    width: 78,
    height: 78,
    marginBottom: 10,
  },

  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    color: BRAND.white,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
  },

  aiBadge: {
    backgroundColor: BRAND.cyan,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    marginLeft: 7,
  },

  aiText: {
    color: BRAND.background,
    fontSize: 12,
    fontWeight: '900',
  },

  brandCaption: {
    color: BRAND.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 7,
  },

  welcomeSection: {
    marginBottom: 22,
  },

  welcomeTitle: {
    color: BRAND.white,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 8,
  },

  welcomeSubtitle: {
    color: BRAND.secondary,
    fontSize: 13,
    lineHeight: 21,
  },

  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101D34',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#24505A',
    padding: 13,
    marginBottom: 25,
  },

  demoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#00E5D415',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  demoContent: {
    flex: 1,
  },

  demoTitle: {
    color: BRAND.white,
    fontSize: 12,
    fontWeight: '800',
  },

  demoSubtitle: {
    color: BRAND.muted,
    fontSize: 10,
    marginTop: 4,
  },

  form: {
    width: '100%',
  },

  inputHeading: {
    color: BRAND.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },

  passwordHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  forgotText: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
    marginBottom: 20,
  },

  securityText: {
    color: BRAND.muted,
    fontSize: 10,
  },

  loginButton: {
    width: '100%',
    marginBottom: 17,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 17,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND.border,
  },

  dividerText: {
    color: BRAND.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  guestButton: {
    height: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  guestText: {
    color: BRAND.white,
    fontSize: 12,
    fontWeight: '700',
  },

  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 28,
  },

  registerText: {
    color: BRAND.secondary,
    fontSize: 12,
  },

  registerLink: {
    color: BRAND.cyan,
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    color: '#53617F',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 24,
  },

});

export default LoginScreen;
