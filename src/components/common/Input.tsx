
import React, { useState } from 'react';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';

import {
  colors,
  borderRadius,
  spacing,
  typography,
} from '../../theme';

import { Icon, IconName } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  isPassword = false,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View style={[styles.wrapper, containerStyle]}>

      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >

        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={isFocused ? colors.cyan : colors.textMuted}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          {...props}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            isPassword && styles.inputWithToggle,
          ]}
          secureTextEntry={isPassword && hidePassword}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setHidePassword(prev => !prev)}
            activeOpacity={0.7}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Icon
              name={hidePassword ? 'eye' : 'eye-off'}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}

      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },

  label: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },

  inputFocused: {
    borderColor: colors.cyan,
    backgroundColor: colors.backgroundTertiary,
  },

  inputError: {
    borderColor: colors.statusRejected,
  },

  icon: {
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },

  inputWithToggle: {
    paddingRight: spacing.sm,
  },

  toggleBtn: {
    padding: spacing.xs,
  },

  errorText: {
    fontSize: typography.size.xs,
    color: colors.statusRejected,
    marginTop: spacing.xxs,
  },

  hintText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});

export default Input;
