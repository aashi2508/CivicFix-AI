import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { Complaint } from '../../types';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
  onUpvote?: () => void;
  style?: ViewStyle;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onPress,
  onUpvote,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.topHeader}>
        <View style={styles.idRow}>
          <Text style={styles.idText} numberOfLines={1}>{complaint.id}</Text>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.categoryText} numberOfLines={1}>{complaint.category}</Text>
        </View>
        <Badge
          label={complaint.status}
          status={complaint.status}
          size="sm"
          style={styles.statusBadge}
        />
      </View>

      <View style={styles.bodyRow}>
        <Image
          source={{ uri: complaint.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.contentCol}>
          <Text style={styles.title} numberOfLines={2}>
            {complaint.title}
          </Text>
          <View style={styles.locationRow}>
            <Icon name="location" size={13} color={colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {complaint.location.address}
            </Text>
          </View>
          <View style={styles.priorityRow}>
            <Badge
              label={`Priority: ${complaint.priority}`}
              priority={complaint.priority}
              size="sm"
              style={styles.priorityBadge}
            />
            <View style={styles.confidenceRow}>
              <Icon name="sparkles" size={12} color={colors.cyan} />
              <Text style={styles.confidenceText}>{complaint.confidence.toFixed(0)}% AI</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>{complaint.createdAt}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onUpvote}
          style={[
            styles.upvoteBtn,
            complaint.isUpvoted && styles.upvoteBtnActive,
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon
            name="thumb-up"
            size={13}
            color={complaint.isUpvoted ? colors.cyan : colors.textMuted}
          />
          <Text
            style={[
              styles.upvoteCount,
              complaint.isUpvoted && styles.upvoteCountActive,
            ]}
          >
            {complaint.upvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: spacing.xs,
  },
  idText: {
    fontSize: typography.size.xs,
    fontWeight: '700',
    color: colors.cyan,
    letterSpacing: 0.5,
  },
  bullet: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: typography.size.xs,
  },
  categoryText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
    minWidth: 0,
  },
  statusBadge: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundTertiary,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    flex: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 2,
    gap: spacing.xs,
  },
  priorityBadge: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  confidenceText: {
    fontSize: 10,
    color: colors.textCyan,
    fontWeight: '600',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: spacing.xs + 2,
    marginTop: 2,
  },
  dateText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  upvoteBtnActive: {
    backgroundColor: 'rgba(0, 245, 212, 0.15)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },
  upvoteCount: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  upvoteCountActive: {
    color: colors.cyan,
  },
});
