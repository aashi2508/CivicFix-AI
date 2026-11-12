
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Icon, IconName } from '../../components/common/Icon';
import { NotificationItem } from '../../types';
import { ApiService } from '../../services/api';
import { useComplaints } from '../../context/ComplaintsContext';

type NotifNavProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotifNavProp>();
  const { complaints } = useComplaints();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const live = await ApiService.getNotifications();
      if (Array.isArray(live) && live.length > 0) {
        setNotifications(live as NotificationItem[]);
        return;
      }
    } catch {
      // fallback to complaints
    }

    // Generate real-time notifications from live complaints
    const derived: NotificationItem[] = complaints.slice(0, 10).map((c, i) => {
      let type: NotificationItem['type'] = 'announcement';
      let title = `Update on ${c.title}`;
      if (c.status === 'Resolved') {
        type = 'resolved';
        title = `Resolved: ${c.title}`;
      } else if (c.status === 'In Progress') {
        type = 'team_dispatched';
        title = `Field Team Assigned: ${c.title}`;
      } else {
        type = 'ai_verified';
        title = `AI Verified: ${c.title}`;
      }

      return {
        id: `c-notif-${c.id}-${i}`,
        complaintId: c.id,
        title,
        message: `Status is currently ${c.status} in ${c.location.address}. AI Match: ${c.confidence.toFixed(1)}%.`,
        timestamp: c.createdAt || 'Just now',
        isRead: i > 2,
        type,
        category: c.category,
      };
    });

    setNotifications(derived);
  }, [complaints]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleNotificationPress = (item: NotificationItem) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === item.id ? { ...n, isRead: true } : n
      )
    );

    if (item.complaintId) {
      navigation.navigate('ComplaintDetails', {
        complaintId: item.complaintId,
      });
    }
  };

  const getNotificationIcon = (
    type: NotificationItem['type'],
  ): { icon: IconName; color: string; label: string } => {
    switch (type) {
      case 'ai_verified':
        return {
          icon: 'sparkles',
          color: colors.cyan,
          label: 'AI UPDATE',
        };

      case 'team_dispatched':
        return {
          icon: 'road',
          color: colors.electricBlue,
          label: 'TEAM UPDATE',
        };

      case 'resolved':
        return {
          icon: 'check',
          color: colors.statusResolved,
          label: 'RESOLVED',
        };

      case 'announcement':
        return {
          icon: 'shield',
          color: colors.purpleAccent,
          label: 'ANNOUNCEMENT',
        };

      default:
        return {
          icon: 'bell',
          color: colors.statusSubmitted,
          label: 'UPDATE',
        };
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const iconConfig = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconConfig.color}18` },
          ]}
        >
          <Icon
            name={iconConfig.icon}
            size={21}
            color={iconConfig.color}
          />
        </View>

        <View style={styles.notificationContent}>

          <View style={styles.notificationTopRow}>
            <View style={styles.categoryRow}>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: iconConfig.color },
                ]}
              >
                {iconConfig.label}
              </Text>

              {!item.isRead && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.timeText}>
              {item.timestamp}
            </Text>
          </View>

          <Text
            style={[
              styles.notificationTitle,
              !item.isRead && styles.unreadTitle,
            ]}
          >
            {item.title}
          </Text>

          <Text style={styles.notificationMessage}>
            {item.message}
          </Text>

          {item.complaintId && (
            <View style={styles.ticketRow}>
              <View style={styles.ticketBadge}>
                <Icon
                  name="bell"
                  size={11}
                  color={colors.cyan}
                />

                <Text style={styles.ticketText}>
                  #{item.complaintId}
                </Text>
              </View>

              <Text style={styles.viewDetailsText}>
                View details
              </Text>

              <Icon
                name="arrow-right"
                size={13}
                color={colors.cyan}
              />
            </View>
          )}

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>

      <Header
        title="Notifications"
        subtitle="Stay updated on your reports"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.container}>

        {/* UNREAD SUMMARY */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryLeft}>

            <View style={styles.summaryIcon}>
              <Icon
                name="bell"
                size={19}
                color={colors.cyan}
              />
            </View>

            <View>
              <Text style={styles.summaryTitle}>
                Your Updates
              </Text>

              <Text style={styles.summarySubtitle}>
                {unreadCount === 0
                  ? 'You are all caught up!'
                  : `You have ${unreadCount} unread ${
                      unreadCount === 1 ? 'update' : 'updates'
                    }`}
              </Text>
            </View>

          </View>

          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {unreadCount}
              </Text>
            </View>
          )}

        </View>

        {/* SECTION HEADER */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            RECENT ACTIVITY
          </Text>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markReadText}>
                Mark all as read
              </Text>
            </TouchableOpacity>
          )}

        </View>

        {/* NOTIFICATION LIST */}

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.cyan}
              colors={[colors.cyan]}
            />
          }
          ItemSeparatorComponent={() => (
            <View style={{ height: 2 }} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Icon
                  name="bell"
                  size={30}
                  color={colors.textMuted}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Notifications Yet
              </Text>

              <Text style={styles.emptySubtitle}>
                When municipal departments update your
                complaints, you will see the updates here.
              </Text>
            </View>
          }
        />

      </View>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    borderRadius: 18,
    padding: 15,
    marginTop: spacing.md,
    marginBottom: 24,
  },

  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 245, 212, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTitle: {
    fontSize: typography.size.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  summarySubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 245, 212, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  countText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
  },

  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cyan,
  },

  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },

  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 11,
    gap: 12,
  },

  unreadCard: {
    borderColor: colors.borderCyan,
    backgroundColor: 'rgba(22, 31, 56, 0.95)',
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationContent: {
    flex: 1,
  },

  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  categoryLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },

  timeText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 5,
  },

  unreadTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },

  notificationMessage: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 18,
  },

  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 11,
  },

  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 212, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  ticketText: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '800',
  },

  viewDetailsText: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 55,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

});
