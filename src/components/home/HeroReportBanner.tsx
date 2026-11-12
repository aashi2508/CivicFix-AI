import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { Icon } from '../common/Icon';

interface HeroReportBannerProps {
  onPressReport: () => void;
}

export const HeroReportBanner: React.FC<HeroReportBannerProps> = ({
  onPressReport,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPressReport}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.aiPill}>
          <Icon name="sparkles" size={14} color={colors.cyan} />
          <Text style={styles.aiPillText}>AI ASSISTED REPORTING</Text>
        </View>
        <View style={styles.speedBadge}>
          <Icon name="zap" size={14} color={colors.statusSubmitted} />
          <Text style={styles.speedText}>~30 sec dispatch</Text>
        </View>
      </View>

      <Text style={styles.title}>Spot a Civic Issue? Snap & Fix It.</Text>
      <Text style={styles.subtitle}>
        Our neural vision model detects severity, geofences coordinates, and alerts
        ward engineers automatically.
      </Text>

      <View style={styles.ctaRow}>
        <View style={styles.ctaButton}>
          <Icon name="camera" size={18} color={colors.background} />
          <Text style={styles.ctaText}>Report Issue Now</Text>
        </View>
        <View style={styles.radarEffect}>
          <View style={styles.radarDot} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderCyan,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 212, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    gap: 4,
    flexShrink: 1,
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.cyan,
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  speedText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 3,
    flexShrink: 1,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaButton: {
    backgroundColor: colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  ctaText: {
    color: colors.background,
    fontSize: typography.size.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  radarEffect: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 212, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cyan,
  },
});
