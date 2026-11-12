import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { Icon, IconName } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.cyan,
          borderColor: colors.cyan,
        };
      case 'secondary':
        return {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.borderLight,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.borderCyan,
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: colors.statusRejected,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.cyan;
      case 'danger':
        return colors.statusRejected;
      case 'ghost':
        return colors.textSecondary;
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
          text: { fontSize: typography.size.sm },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },
          text: { fontSize: typography.size.lg, fontWeight: '700' },
        };
      default:
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
          text: { fontSize: typography.size.md, fontWeight: '600' },
        };
    }
  };

  const sizeStyle = getSizeStyle();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getContainerStyle(),
        sizeStyle.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.background : colors.cyan}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={size === 'sm' ? 14 : 18}
              color={textColor}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.baseText,
              sizeStyle.text,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={size === 'sm' ? 14 : 18}
              color={textColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.45,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});
