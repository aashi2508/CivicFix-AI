import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'cyan' | 'purple' | 'interactive';
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.borderLight,
        };
      case 'cyan':
        return {
          backgroundColor: 'rgba(0, 245, 212, 0.05)',
          borderColor: colors.borderCyan,
        };
      case 'purple':
        return {
          backgroundColor: 'rgba(121, 40, 202, 0.12)',
          borderColor: colors.borderPurple,
        };
      case 'interactive':
        return {
          backgroundColor: colors.glassSurface,
          borderColor: colors.borderLight,
        };
      default:
        return {
          backgroundColor: colors.glassSurface,
          borderColor: colors.border,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.card, getVariantStyle(), style]}
      >
        <View style={styles.topHighlight} />
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      <View style={styles.topHighlight} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
