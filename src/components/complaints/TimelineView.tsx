import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { TimelineItem } from '../../types';
import { Icon } from '../common/Icon';

interface TimelineViewProps {
  timeline: TimelineItem[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <View style={styles.container}>
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const isCompleted = item.completed;
        const isCurrent = item.current;

        return (
          <View key={item.id || index.toString()} style={styles.stepContainer}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.node,
                  isCompleted && styles.nodeCompleted,
                  isCurrent && styles.nodeCurrent,
                ]}
              >
                {isCompleted ? (
                  <Icon name="check" size={12} color={colors.background} />
                ) : isCurrent ? (
                  <View style={styles.currentDot} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted && styles.connectorLineCompleted,
                  ]}
                />
              )}
            </View>

            <View style={styles.contentCol}>
              <View style={styles.titleRow}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.title,
                    isCompleted && styles.titleCompleted,
                    isCurrent && styles.titleCurrent,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              {item.date ? <Text numberOfLines={1} ellipsizeMode="tail" style={styles.date}>{item.date}</Text> : null}
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: spacing.md,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.statusResolved,
    borderColor: colors.statusResolved,
  },
  nodeCurrent: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.cyan,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  connectorLineCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  contentCol: {
    flex: 1,
    paddingTop: 1,
  },
  titleRow: {
    width: '100%',
    marginBottom: 2,
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
    minWidth: 0,
  },
  titleCompleted: {
    color: colors.textPrimary,
  },
  titleCurrent: {
    color: colors.cyan,
    fontWeight: '700',
  },
  date: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    maxWidth: '100%',
    marginBottom: 2,
  },
  description: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
