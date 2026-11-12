
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  useRoute,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';

import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '../../theme';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';

import { useComplaints } from '../../context/ComplaintsContext';

import {
  CivicCategory,
  Complaint,
} from '../../types';

type ReviewRouteProp = RouteProp<RootStackParamList, 'ReviewSubmit'>;

type ReviewNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReviewSubmit'
>;

export const ReviewSubmitScreen: React.FC = () => {
  const route = useRoute<ReviewRouteProp>();

  const navigation = useNavigation<ReviewNavProp>();

  const { addComplaint } = useComplaints();

  const { analysisData } = route.params;

  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isHighHazard, setIsHighHazard] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdComplaint, setCreatedComplaint] =
    useState<Complaint | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // SUBMIT COMPLAINT

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Demo submission delay
      await new Promise<void>(resolve =>
        setTimeout(() => resolve(), 700),
      );

      const newRecord = await addComplaint({
        title: analysisData.title,
        description: analysisData.description,
        category: analysisData.category as CivicCategory,
        priority: analysisData.priority,
        confidence: analysisData.confidence,
        location: analysisData.location,
        imageUri: analysisData.imageUri,
        assignedDepartment: analysisData.department,
        isAnonymous,
        aiTags: analysisData.tags,
        citizenNotes: analysisData.description,
        estimatedResolutionTime: analysisData.turnaround,
        photoFile: (analysisData as any).photoFile,
      });

      setCreatedComplaint(newRecord);

      setShowSuccessModal(true);
    } catch (err) {
      console.warn('Submission error', err);

      Alert.alert(
        'Submission Failed',
        'We could not register your complaint. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // NAVIGATION AFTER SUCCESS

  const handleFinish = (
    target: 'details' | 'complaints' | 'home',
  ) => {
    setShowSuccessModal(false);

    if (target === 'details' && createdComplaint) {
      navigation.replace('ComplaintDetails', {
        complaintId: createdComplaint.id,
      });
    } else if (target === 'complaints') {
      (navigation as any).navigate('MainTabs', {
        screen: 'MyComplaints',
      });
    } else {
      (navigation as any).navigate('MainTabs', {
        screen: 'Home',
      });
    }
  };

  return (
    <ScreenContainer>

      <Header
        title="Final Review & Lodge"
        subtitle="Step 3 of 3 • Citizen Verification"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >

        {/* STEP INDICATOR */}

        <View style={styles.stepCard}>

          <View style={styles.stepHeader}>
            <View>
              <Text style={styles.stepEyebrow}>
                FINAL VERIFICATION
              </Text>

              <Text style={styles.stepTitle}>
                Ready to submit?
              </Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                STEP 3 / 3
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressActive} />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              Report
            </Text>

            <Text style={styles.progressLabel}>
              AI Analysis
            </Text>

            <Text style={styles.progressLabelActive}>
              Submit
            </Text>
          </View>

          <Text style={styles.stepSubtitle}>
            Review your complaint details carefully before sending
            it to the municipal team.
          </Text>

        </View>

        {/* AI VERIFICATION BANNER */}

        <View style={styles.verifiedBanner}>

          <View style={styles.verifiedIcon}>
            <Icon
              name="sparkles"
              size={18}
              color={colors.cyan}
            />
          </View>

          <View style={styles.verifiedCopy}>
            <Text style={styles.verifiedTitle}>
              AI Analysis Completed
            </Text>

            <Text style={styles.verifiedSubtitle}>
              Your complaint details are ready for citizen verification.
            </Text>
          </View>

          <View style={styles.verifiedStatus}>
            <Icon
              name="check"
              size={15}
              color={colors.statusResolved}
            />
          </View>

        </View>

        {/* COMPLAINT SUMMARY */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Complaint Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Verify the detected civic issue.
            </Text>
          </View>

          <Badge
            label="AI ANALYZED"
            variant="cyan"
            size="sm"
          />

        </View>

        <View style={styles.summaryCard}>

          {/* IMAGE AND TITLE */}

          <View style={styles.imageRow}>

            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: analysisData.imageUri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />

              <View style={styles.imageCornerBadge}>
                <Icon
                  name="check"
                  size={11}
                  color={colors.background}
                />
              </View>
            </View>

            <View style={styles.imageDetailsCol}>

              <Badge
                label={analysisData.category}
                variant="cyan"
                size="sm"
                style={styles.categoryBadge}
              />

              <Text
                style={styles.issueTitle}
                numberOfLines={2}
              >
                {analysisData.title}
              </Text>

              <View style={styles.aiMatchBadge}>
                <Icon
                  name="sparkles"
                  size={12}
                  color={colors.cyan}
                />

                <Text style={styles.aiMatchText}>
                  AI Confidence: {analysisData.confidence.toFixed(1)}%
                </Text>
              </View>

            </View>

          </View>

          <View style={styles.divider} />

          {/* LOCATION */}

          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>
              <Icon
                name="location"
                size={17}
                color={colors.cyan}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                LOCATION / WARD
              </Text>

              <Text style={styles.infoValue}>
                {analysisData.location.address}
              </Text>

              <Text style={styles.infoSubValue}>
                {analysisData.location.ward}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* DEPARTMENT */}

          <View style={styles.infoRow}>

            <View style={styles.infoIconBlue}>
              <Icon
                name="shield"
                size={17}
                color={colors.electricBlue}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                ROUTING DESTINATION
              </Text>

              <Text style={styles.infoValue}>
                {analysisData.department}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* PRIORITY */}

          <View style={styles.infoRow}>

            <View style={styles.infoIconPurple}>
              <Icon
                name="alert"
                size={17}
                color={colors.priorityHigh}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                RECOMMENDED PRIORITY
              </Text>

              <View style={styles.priorityRow}>
                <Badge
                  label={analysisData.priority}
                  priority={analysisData.priority}
                  size="sm"
                />
              </View>
            </View>

          </View>

          <View style={styles.divider} />

          {/* ESTIMATED TIME */}

          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>
              <Icon
                name="clock"
                size={17}
                color={colors.cyan}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                ESTIMATED RESOLUTION TIME
              </Text>

              <Text style={styles.infoValue}>
                {analysisData.turnaround}
              </Text>
            </View>

          </View>

        </View>

        {/* DESCRIPTION */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Your Description
            </Text>

            <Text style={styles.sectionSubtitle}>
              Details provided with your report.
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Icon
              name="file-text"
              size={17}
              color={colors.cyan}
            />
          </View>

        </View>

        <View style={styles.descCard}>

          <View style={styles.quoteMark}>
            <Icon
              name="file-text"
              size={16}
              color={colors.cyan}
            />
          </View>

          <Text style={styles.descText}>
            {analysisData.description}
          </Text>

        </View>

        {/* AI TAGS */}

        {analysisData.tags?.length > 0 && (

          <View style={styles.tagsCard}>

            <Text style={styles.tagsTitle}>
              AI DETECTED KEYWORDS
            </Text>

            <View style={styles.tagsRow}>
              {analysisData.tags.map((tag: string, index: number) => (
                <View
                  key={`${tag}-${index}`}
                  style={styles.tag}
                >
                  <Icon
                    name="check"
                    size={10}
                    color={colors.cyan}
                  />

                  <Text style={styles.tagText}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

          </View>

        )}

        {/* CITIZEN PREFERENCES */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Submission Preferences
            </Text>

            <Text style={styles.sectionSubtitle}>
              Customize how your report is submitted.
            </Text>
          </View>

          <View style={styles.sectionIconPurple}>
            <Icon
              name="shield"
              size={17}
              color={colors.purpleAccent}
            />
          </View>

        </View>

        <View style={styles.togglesCard}>

          {/* HAZARD SWITCH */}

          <View style={styles.toggleRow}>

            <View style={styles.toggleIcon}>
              <Icon
                name="alert"
                size={18}
                color={colors.priorityHigh}
              />
            </View>

            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>
                Flag as Immediate Hazard
              </Text>

              <Text style={styles.toggleSubtitle}>
                Mark this issue as an immediate safety concern.
              </Text>
            </View>

            <Switch
              value={isHighHazard}
              onValueChange={setIsHighHazard}
              trackColor={{
                false: colors.backgroundElevated,
                true: colors.cyan,
              }}
              thumbColor={colors.white}
            />

          </View>

          <View style={styles.divider} />

          {/* ANONYMOUS SWITCH */}

          <View style={styles.toggleRow}>

            <View style={styles.toggleIconPurple}>
              <Icon
                name="user"
                size={18}
                color={colors.purpleAccent}
              />
            </View>

            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>
                Submit Anonymously
              </Text>

              <Text style={styles.toggleSubtitle}>
                Hide your citizen profile name from the public feed.
              </Text>
            </View>

            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{
                false: colors.backgroundElevated,
                true: colors.cyan,
              }}
              thumbColor={colors.white}
            />

          </View>

        </View>

        {/* SUBMISSION NOTICE */}

        <View style={styles.noticeCard}>

          <Icon
            name="shield"
            size={16}
            color={colors.cyan}
          />

          <Text style={styles.noticeText}>
            By submitting, you confirm that this report represents
            a genuine civic issue.
          </Text>

        </View>

        {/* SUBMIT BUTTON */}

        <Button
          title={
            isSubmitting
              ? 'Submitting Complaint...'
              : 'Submit Civic Complaint'
          }
          onPress={handleSubmit}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          icon="check"
          style={styles.submitBtn}
        />

        <Text style={styles.footerText}>
          CIVICFIX AI • BUILDING BETTER COMMUNITIES
        </Text>

      </ScrollView>

      {/* SUCCESS MODAL */}

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => handleFinish('details')}
      >

        <View style={styles.modalBackdrop}>

          <View style={styles.modalBox}>

            {/* SUCCESS ICON */}

            <View style={styles.successIconCircle}>
              <Icon
                name="check"
                size={32}
                color={colors.background}
              />
            </View>

            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>
                SUCCESSFULLY REGISTERED
              </Text>
            </View>

            <Text style={styles.modalTitle}>
              Complaint Registered!
            </Text>

            <Text style={styles.modalSubtitle}>
              Your civic issue has been recorded and assigned
              a tracking ticket.
            </Text>

            {/* TICKET */}

            <View style={styles.ticketCard}>

              <Text style={styles.ticketLabel}>
                OFFICIAL TICKET NUMBER
              </Text>

              <Text style={styles.ticketId}>
                {createdComplaint?.id}
              </Text>

              <View style={styles.ticketDivider} />

              <View style={styles.ticketDeptRow}>
                <Icon
                  name="shield"
                  size={13}
                  color={colors.cyan}
                />

                <Text style={styles.ticketDept}>
                  {createdComplaint?.assignedDepartment}
                </Text>
              </View>

            </View>

            {/* MODAL ACTIONS */}

            <View style={styles.modalButtons}>

              <Button
                title="View Complaint Progress"
                onPress={() => handleFinish('details')}
                variant="primary"
                size="md"
                style={styles.modalBtn}
              />

              <Button
                title="View My Complaints"
                onPress={() => handleFinish('complaints')}
                variant="secondary"
                size="md"
                style={styles.modalBtn}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleFinish('home')}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>
                  Return to Home Dashboard
                </Text>

                <Icon
                  name="arrow-right"
                  size={14}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // STEP CARD

  stepCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 16,
    marginBottom: 18,
  },

  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepEyebrow: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  stepTitle: {
    fontSize: 19,
    color: colors.textPrimary,
    fontWeight: '900',
  },

  stepBadge: {
    backgroundColor: 'rgba(0,245,212,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  stepBadgeText: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '900',
  },

  progressTrack: {
    height: 4,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 5,
    marginTop: 16,
    overflow: 'hidden',
  },

  progressActive: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cyan,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  progressLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },

  progressLabelActive: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },

  stepSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 16,
  },

  // VERIFIED BANNER

  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(0,245,212,0.07)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 13,
    borderRadius: 14,
    marginBottom: 23,
  },

  verifiedIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifiedCopy: {
    flex: 1,
  },

  verifiedTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },

  verifiedSubtitle: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  verifiedStatus: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(49,214,160,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SECTION HEADERS

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
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

  // SUMMARY

  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 23,
  },

  imageRow: {
    flexDirection: 'row',
    gap: 13,
  },

  imageWrapper: {
    position: 'relative',
  },

  thumbnail: {
    width: 95,
    height: 95,
    borderRadius: 12,
  },

  imageCornerBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: colors.statusResolved,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageDetailsCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 7,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
  },

  issueTitle: {
    fontSize: typography.size.md,
    fontWeight: '900',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  aiMatchText: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 13,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(0,245,212,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoIconBlue: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoIconPurple: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(134,80,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  infoSubValue: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },

  priorityRow: {
    alignItems: 'flex-start',
  },

  // DESCRIPTION

  descCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 15,
  },

  quoteMark: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  descText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 21,
  },

  // TAGS

  tagsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 23,
  },

  tagsTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 11,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,245,212,0.08)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },

  tagText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },

  // TOGGLES

  togglesCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 17,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  toggleIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: 'rgba(255,100,100,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleIconPurple: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: 'rgba(134,80,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleTextCol: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  toggleSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 15,
  },

  // NOTICE

  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    marginBottom: 13,
  },

  noticeText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 15,
  },

  // SUBMIT

  submitBtn: {
    marginBottom: spacing.sm,
  },

  footerText: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 14,
  },

  // SUCCESS MODAL

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,13,32,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  modalBox: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 22,
    padding: 21,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderCyan,
  },

  successIconCircle: {
    width: 67,
    height: 67,
    borderRadius: 23,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  successBadge: {
    backgroundColor: 'rgba(49,214,160,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },

  successBadgeText: {
    color: colors.statusResolved,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  modalTitle: {
    fontSize: typography.size.xxl,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 19,
  },

  ticketCard: {
    backgroundColor: colors.backgroundTertiary,
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    alignItems: 'center',
    marginBottom: 20,
  },

  ticketLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.9,
  },

  ticketId: {
    fontSize: typography.size.xxl,
    fontWeight: '900',
    color: colors.cyan,
    letterSpacing: 1,
    marginVertical: 8,
  },

  ticketDivider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },

  ticketDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  ticketDept: {
    fontSize: typography.size.xs,
    color: colors.electricBlue,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalButtons: {
    width: '100%',
    gap: spacing.sm,
  },

  modalBtn: {
    width: '100%',
  },

  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },

  homeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },

});
