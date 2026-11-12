
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';

import {
  useRoute,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/types';
import {
  colors,
  spacing,
  typography,
} from '../../theme';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { TimelineView } from '../../components/complaints/TimelineView';
import { useComplaints } from '../../context/ComplaintsContext';

type DetailsRouteProp = RouteProp<
  RootStackParamList,
  'ComplaintDetails'
>;

export const ComplaintDetailsScreen: React.FC = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation();

  const { getComplaintById, upvoteComplaint } = useComplaints();

  const complaint = getComplaintById(route.params.complaintId);

  const [comments, setComments] = useState<
    { id: string; user: string; text: string; time: string }[]
  >([
    {
      id: 'c1',
      user: 'Ward Supervisor Sharma',
      text: 'Road crew assigned. Asphalt batch ordered from central depot.',
      time: '3 hours ago',
    },
    {
      id: 'c2',
      user: 'Priya K. (Local Citizen)',
      text: 'Thank you! Two scooters hit this yesterday. Very glad it is in progress.',
      time: '1 hour ago',
    },
  ]);

  if (!complaint) {
    return (
      <ScreenContainer>
        <Header
          title="Complaint Details"
          showBack
          onBack={() => navigation.goBack()}
        />

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Icon name="file-text" size={30} color={colors.cyan} />
          </View>

          <Text style={styles.errorTitle}>
            Complaint Not Found
          </Text>

          <Text style={styles.errorSubtitle}>
            The ticket #{route.params.complaintId} could not be located.
          </Text>

          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="md"
          />
        </View>
      </ScreenContainer>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `CivicFix AI Complaint #${complaint.id}: ${complaint.title} at ${complaint.location.address}. Track live resolution status!`,
      });
    } catch {
      // Ignore share errors
    }
  };

  const handleAddComment = () => {
    if (Alert.prompt) {
      Alert.prompt(
        'Add Citizen Comment',
        'Leave an update or feedback for the field crew:',
        text => {
          if (text?.trim()) {
            setComments(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                user: 'Alex Rivera',
                text: text.trim(),
                time: 'Just now',
              },
            ]);
          }
        },
      );
    } else {
      Alert.alert(
        'Add Note',
        'Community update logged.',
      );
    }
  };

  return (
    <ScreenContainer>
      <Header
        title={`Ticket #${complaint.id}`}
        subtitle={`${complaint.category} • ${complaint.status}`}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="share"
        onRightPress={handleShare}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* COMPLAINT IMAGE */}

        <View style={styles.imageBox}>
          <Image
            source={{ uri: complaint.imageUri }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          <View style={styles.imageOverlay}>
            <View style={styles.imageTicketBadge}>
              <Icon
                name="file-text"
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.imageTicketText}>
                TICKET #{complaint.id}
              </Text>
            </View>

            <Badge
              label={complaint.status}
              status={complaint.status}
              size="sm"
            />
          </View>
        </View>

        {/* COMPLAINT INFORMATION */}

        <View style={styles.card}>

          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Icon
                name="alert-circle"
                size={13}
                color={colors.cyan}
              />
              <Text style={styles.categoryText}>
                {complaint.category}
              </Text>
            </View>

            <Badge
              label={`Priority: ${complaint.priority}`}
              priority={complaint.priority}
              size="sm"
            />
          </View>

          <Text style={styles.title}>
            {complaint.title}
          </Text>

          <Text style={styles.description}>
            {complaint.description}
          </Text>

          {/* AI ANALYSIS */}

          <View style={styles.aiCard}>
            <View style={styles.aiIconBox}>
              <Icon
                name="sparkles"
                size={18}
                color={colors.cyan}
              />
            </View>

            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>
                AI Analysis
              </Text>
              <Text style={styles.aiSubtitle}>
                Complaint classification confidence
              </Text>
            </View>

            <Text style={styles.aiPercentage}>
              {complaint.confidence.toFixed(1)}%
            </Text>
          </View>

          {/* COMMUNITY ENGAGEMENT */}

          <View style={styles.engagementBar}>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => upvoteComplaint(complaint.id)}
              style={[
                styles.upvoteBtn,
                complaint.isUpvoted && styles.upvoteBtnActive,
              ]}
            >
              <Icon
                name="thumb-up"
                size={16}
                color={
                  complaint.isUpvoted
                    ? colors.cyan
                    : colors.textMuted
                }
              />

              <Text
                style={[
                  styles.upvoteText,
                  complaint.isUpvoted && styles.upvoteTextActive,
                ]}
              >
                {complaint.isUpvoted ? 'Upvoted' : 'Support Issue'}
              </Text>

              <Text
                style={[
                  styles.upvoteCount,
                  complaint.isUpvoted && styles.upvoteTextActive,
                ]}
              >
                {complaint.upvotes}
              </Text>
            </TouchableOpacity>

            <View style={styles.communityLabel}>
              <Icon
                name="users"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.communityText}>
                Community
              </Text>
            </View>

          </View>
        </View>

        {/* LOCATION & DEPARTMENT */}

        <View style={styles.card}>

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Icon
                name="map-pin"
                size={17}
                color={colors.cyan}
              />
            </View>

            <View>
              <Text style={styles.cardHeaderTitle}>
                Incident Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Location and civic department
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Icon
                name="map-pin"
                size={16}
                color={colors.cyan}
              />
            </View>

            <View style={styles.metaTextCol}>
              <Text style={styles.metaLabel}>
                INCIDENT LOCATION
              </Text>

              <Text style={styles.metaValue}>
                {complaint.location.address}
              </Text>

              <Text style={styles.metaSub}>
                {complaint.location.ward}
              </Text>

              <Text style={styles.coordinates}>
                {complaint.location.latitude.toFixed(4)}°N,{' '}
                {complaint.location.longitude.toFixed(4)}°E
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaIconBlue}>
              <Icon
                name="shield-check"
                size={16}
                color={colors.electricBlue}
              />
            </View>

            <View style={styles.metaTextCol}>
              <Text style={styles.metaLabel}>
                RESPONSIBLE DEPARTMENT
              </Text>

              <Text style={styles.metaValue}>
                {complaint.assignedDepartment}
              </Text>

              <Text style={styles.metaSub}>
                Estimated resolution: {complaint.estimatedResolutionTime}
              </Text>
            </View>
          </View>

        </View>

        {/* RESOLUTION TIMELINE */}

        <View style={styles.card}>

          <View style={styles.sectionHeading}>
            <View style={styles.sectionIconPurple}>
              <Icon
                name="activity"
                size={17}
                color={colors.purpleAccent}
              />
            </View>

            <View>
              <Text style={styles.cardHeaderTitle}>
                Resolution Journey
              </Text>
              <Text style={styles.sectionSubtitle}>
                Track every stage of your complaint
              </Text>
            </View>
          </View>

          <TimelineView timeline={complaint.timeline} />

        </View>

        {/* COMMUNITY COMMENTS */}

        <View style={styles.card}>

          <View style={styles.commentsHeading}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Icon
                  name="messages-square"
                  size={17}
                  color={colors.cyan}
                />
              </View>

              <View>
                <Text style={styles.cardHeaderTitle}>
                  Community Updates
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Citizen feedback and field reports
                </Text>
              </View>
            </View>

            <View style={styles.commentCountBadge}>
              <Text style={styles.commentCountText}>
                {comments.length}
              </Text>
            </View>
          </View>

          {comments.map(comment => (
            <View
              key={comment.id}
              style={styles.commentItem}
            >
              <View style={styles.commentAvatar}>
                <Icon
                  name="user-round"
                  size={15}
                  color={colors.cyan}
                />
              </View>

              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.user}
                  </Text>

                  <Text style={styles.commentTime}>
                    {comment.time}
                  </Text>
                </View>

                <Text style={styles.commentText}>
                  {comment.text}
                </Text>
              </View>
            </View>
          ))}

          {/* ADD COMMENT */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddComment}
            style={styles.addCommentBtn}
          >
            <Icon
              name="plus-circle"
              size={17}
              color={colors.cyan}
            />

            <Text style={styles.addCommentText}>
              Add Community Update
            </Text>

            <Icon
              name="chevron-right"
              size={16}
              color={colors.cyan}
            />
          </TouchableOpacity>

        </View>

        <View style={styles.footerNote}>
          <Icon
            name="shield-check"
            size={14}
            color={colors.textMuted}
          />

          <Text style={styles.footerText}>
            Powered by CivicFix AI • Building better communities
          </Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // IMAGE

  imageBox: {
    height: 210,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    marginBottom: spacing.md,
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  imageTicketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 13, 32, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  imageTicketText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  // COMMON CARD

  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    gap: 8,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 245, 212, 0.09)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  categoryText: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: 9,
  },

  description: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 17,
  },

  // AI CARD

  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 212, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 212, 0.18)',
    borderRadius: 13,
    padding: 11,
    marginBottom: 15,
  },

  aiIconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 245, 212, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  aiTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '800',
  },

  aiSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  aiPercentage: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.cyan,
  },

  // ENGAGEMENT

  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingTop: 13,
  },

  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  upvoteBtnActive: {
    backgroundColor: 'rgba(0,245,212,0.12)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },

  upvoteText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  upvoteTextActive: {
    color: colors.cyan,
  },

  upvoteCount: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '900',
  },

  communityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  communityText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // SECTION HEADINGS

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 19,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionIconPurple: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(134,80,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  // LOCATION & DEPARTMENT

  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },

  metaIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metaIconBlue: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metaTextCol: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 5,
  },

  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },

  metaSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  coordinates: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 17,
  },

  // COMMENTS

  commentsHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  commentCountBadge: {
    backgroundColor: 'rgba(0,245,212,0.12)',
    minWidth: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  commentCountText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },

  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 13,
    padding: 11,
    marginBottom: 9,
  },

  commentAvatar: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: 'rgba(0,245,212,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentContent: {
    flex: 1,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 5,
  },

  commentAuthor: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },

  commentTime: {
    fontSize: 9,
    color: colors.textMuted,
  },

  commentText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  addCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,245,212,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    marginTop: 7,
  },

  addCommentText: {
    flex: 1,
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '800',
  },

  // FOOTER

  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },

  footerText: {
    fontSize: 9,
    color: colors.textMuted,
  },

  // ERROR STATE

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  errorTitle: {
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },

  errorSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

});
