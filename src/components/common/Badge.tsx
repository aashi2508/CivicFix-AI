import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { ComplaintStatus, ComplaintPriority } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'priority' | 'cyan' | 'purple' | 'neutral';
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  priority,
  size = 'sm',
  style,
}) => {
  const getColor = (): { bg: string; text: string; dot: string; border: string } => {
    if (status) {
      switch (status) {
        case 'Submitted':
          return {
            bg: 'rgba(245, 158, 11, 0.14)',
            text: colors.statusSubmitted,
            dot: colors.statusSubmitted,
            border: 'rgba(245, 158, 11, 0.3)',
          };
        case 'AI Verified':
          return {
            bg: 'rgba(0, 245, 212, 0.12)',
            text: colors.cyan,
            dot: colors.cyan,
            border: colors.borderCyan,
          };
        case 'In Progress':
          return {
            bg: 'rgba(59, 130, 246, 0.14)',
            text: colors.electricBlue,
            dot: colors.electricBlue,
            border: colors.borderBlue,
          };
        case 'Resolved':
          return {
            bg: 'rgba(16, 185, 129, 0.14)',
            text: colors.statusResolved,
            dot: colors.statusResolved,
            border: 'rgba(16, 185, 129, 0.3)',
          };
        case 'Under Review':
          return {
            bg: 'rgba(139, 92, 246, 0.14)',
            text: colors.purpleAccent,
            dot: colors.purpleAccent,
            border: colors.borderPurple,
          };
      }
    }

    if (priority) {
      switch (priority) {
        case 'Critical':
          return {
            bg: 'rgba(239, 68, 68, 0.18)',
            text: colors.priorityCritical,
            dot: colors.priorityCritical,
            border: 'rgba(239, 68, 68, 0.35)',
          };
        case 'High':
          return {
            bg: 'rgba(249, 115, 22, 0.18)',
            text: colors.priorityHigh,
            dot: colors.priorityHigh,
            border: 'rgba(249, 115, 22, 0.35)',
          };
        case 'Medium':
          return {
            bg: 'rgba(245, 158, 11, 0.14)',
            text: colors.priorityMedium,
            dot: colors.priorityMedium,
            border: 'rgba(245, 158, 11, 0.3)',
          };
        case 'Low':
          return {
            bg: 'rgba(16, 185, 129, 0.14)',
            text: colors.priorityLow,
            dot: colors.priorityLow,
            border: 'rgba(16, 185, 129, 0.3)',
          };
      }
    }

    switch (variant) {
      case 'cyan':
        return {
          bg: 'rgba(0, 245, 212, 0.12)',
          text: colors.cyan,
          dot: colors.cyan,
          border: colors.borderCyan,
        };
      case 'purple':
        return {
          bg: 'rgba(139, 92, 246, 0.14)',
          text: colors.purpleAccent,
          dot: colors.purpleAccent,
          border: colors.borderPurple,
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          text: colors.textSecondary,
          dot: colors.textMuted,
          border: colors.border,
        };
    }
  };

  const scheme = getColor();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: scheme.dot }]} />
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: scheme.text,
            fontSize: size === 'sm' ? typography.size.xs : typography.size.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
});
