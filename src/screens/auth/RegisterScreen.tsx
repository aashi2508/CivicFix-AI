
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';

type RegisterProp =
  NativeStackNavigationProp<RootStackParamList, 'Register'>;

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

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterProp>();

  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ward, setWard] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must contain at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!ward.trim()) {
      newErrors.ward = 'Please enter your residential ward';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Register account
  const handleRegister = async () => {
    if (isSubmitting || isLoading) return;

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const success = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
      );

      if (success) {
        // Direct transition to Home dashboard without requiring manual login
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert(
          'Registration Failed',
          'Unable to create your account. Please check your details and try again.',
        );
      }
    } catch (error) {
      console.error('Registration error:', error);

      Alert.alert(
        'Registration Failed',
        'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear individual validation errors
  const updateField = (
    field: string,
    value: string,
    setter: (value: string) => void,
  ) => {
    setter(value);

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    if (field === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }
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

          {/* BACK BUTTON */}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-left"
              size={18}
              color={BRAND.cyan}
            />

            <Text style={styles.backText}>
              Back to Sign In
            </Text>
          </TouchableOpacity>

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

          {/* TITLE */}

          <View style={styles.welcomeSection}>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join your community and help build a
              cleaner, safer and better city.
            </Text>

          </View>

          {/* FORM */}

          <View style={styles.form}>

            {/* FULL NAME */}

            <Text style={styles.inputHeading}>
              Full Name
            </Text>

            <Input
              label=""
              placeholder="Enter your full name"
              value={name}
              onChangeText={text =>
                updateField('name', text, setName)
              }
              icon="user"
              autoCapitalize="words"
              error={errors.name}
            />

            {/* EMAIL */}

            <Text style={styles.inputHeading}>
              Email Address
            </Text>

            <Input
              label=""
              placeholder="Enter your email address"
              value={email}
              onChangeText={text =>
                updateField('email', text, setEmail)
              }
              icon="user"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            {/* WARD */}

            <Text style={styles.inputHeading}>
              Residential Ward
            </Text>

            <Input
              label=""
              placeholder="e.g. Ward 112 - Indiranagar"
              value={ward}
              onChangeText={text =>
                updateField('ward', text, setWard)
              }
              icon="location"
              autoCapitalize="words"
              error={errors.ward}
              hint="Used for location-based civic updates"
            />

            {/* PASSWORD */}

            <Text style={styles.inputHeading}>
              Create Password
            </Text>

            <Input
              label=""
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={text =>
                updateField('password', text, setPassword)
              }
              icon="shield"
              isPassword
              autoCapitalize="none"
              error={errors.password}
            />

            {/* CONFIRM PASSWORD */}

            <Text style={styles.inputHeading}>
              Confirm Password
            </Text>

            <Input
              label=""
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={text =>
                updateField(
                  'confirmPassword',
                  text,
                  setConfirmPassword,
                )
              }
              icon="shield"
              isPassword
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            {/* PASSWORD MATCH INDICATOR */}

            {password.length > 0 &&
              confirmPassword.length > 0 &&
              password === confirmPassword && (
                <View style={styles.matchRow}>
                  <Icon
                    name="check"
                    size={15}
                    color={BRAND.cyan}
                  />

                  <Text style={styles.matchText}>
                    Passwords match
                  </Text>
                </View>
              )}

            {/* SECURITY INFO */}

            <View style={styles.securityRow}>
              <Icon
                name="shield"
                size={15}
                color={BRAND.cyan}
              />

              <Text style={styles.securityText}>
                Your account information is securely handled.
              </Text>
            </View>

            {/* CREATE ACCOUNT */}

            <Button
              title={
                isSubmitting || isLoading
                  ? 'Creating Account...'
                  : 'Create Account'
              }
              onPress={handleRegister}
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              variant="primary"
              size="lg"
              icon="arrow-right"
              iconPosition="right"
              style={styles.submitButton}
            />

          </View>

          {/* LOGIN LINK */}

          <View style={styles.footer}>

            <Text style={styles.footerText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>
                Sign In
              </Text>
            </TouchableOpacity>

          </View>

          {/* FOOTER */}

          <Text style={styles.bottomText}>
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
    paddingTop: 12,
    paddingBottom: 22,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 15,
  },

  backText: {
    color: BRAND.cyan,
    fontSize: 12,
    fontWeight: '700',
  },

  header: {
    alignItems: 'center',
    marginBottom: 23,
  },

  logo: {
    width: 65,
    height: 65,
    marginBottom: 8,
  },

  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    color: BRAND.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  aiBadge: {
    backgroundColor: BRAND.cyan,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 7,
  },

  aiText: {
    color: BRAND.background,
    fontSize: 11,
    fontWeight: '900',
  },

  brandCaption: {
    color: BRAND.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 6,
  },

  welcomeSection: {
    marginBottom: 23,
  },

  title: {
    color: BRAND.white,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginBottom: 7,
  },

  subtitle: {
    color: BRAND.secondary,
    fontSize: 12,
    lineHeight: 20,
  },

  form: {
    width: '100%',
  },

  inputHeading: {
    color: BRAND.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: -4,
    marginBottom: 12,
  },

  matchText: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '600',
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
    marginBottom: 20,
  },

  securityText: {
    color: BRAND.muted,
    fontSize: 10,
    flex: 1,
  },

  submitButton: {
    width: '100%',
    marginBottom: 18,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 12,
  },

  footerText: {
    color: BRAND.secondary,
    fontSize: 12,
  },

  loginLink: {
    color: BRAND.cyan,
    fontSize: 12,
    fontWeight: '800',
  },

  bottomText: {
    color: '#53617F',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 24,
  },

});

export default RegisterScreen;
