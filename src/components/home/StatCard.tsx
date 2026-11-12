import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { Icon, IconName } from '../common/Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  accentColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accentColor = colors.cyan,
  style,
}) => {
  return (
    <View style={[styles.card, { borderColor: `${accentColor}33` }, style]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${accentColor}18` },
          ]}
        >
          <Icon name={icon} size={16} color={accentColor} />
        </View>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    width: 148,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
