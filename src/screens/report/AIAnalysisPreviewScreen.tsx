
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
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

import { ComplaintPriority } from '../../types';

type AIAnalysisRouteProp = RouteProp<
  RootStackParamList,
  'AIAnalysisPreview'
>;

type AIAnalysisNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'AIAnalysisPreview'
>;

export const AIAnalysisPreviewScreen: React.FC = () => {
  const route = useRoute<AIAnalysisRouteProp>();
  const navigation = useNavigation<AIAnalysisNavProp>();

  const { imageUri, category, description, location } = route.params;
  const photoFile = (route.params as any)?.photoFile;

  // CATEGORY-BASED DEMO AI DIAGNOSIS

  const getAIDiagnosis = () => {
    switch (category) {
      case 'Pothole':
        return {
          title: 'Severe Asphalt Cavity & Sub-base Failure',
          confidence: 96.8,
          priority: 'High' as ComplaintPriority,
          severity: 'Severe (Depth > 8cm)',
          department: 'BBMP Major Roads & Infrastructure',
          turnaround: '24 - 48 Hours',
          tags: [
            '#PotholeDanger',
            '#HighTrafficCorridor',
            '#TwoWheelerRisk',
          ],
          aiNotes:
            'Deep fissure detected with active aggregate disintegration. High probability of causing two-wheeler loss of control at night.',
        };

      case 'Streetlight':
        return {
          title: 'Luminaire Driver & Grid Circuit Failure',
          confidence: 94.2,
          priority: 'Medium' as ComplaintPriority,
          severity: 'Moderate Dark Corridor',
          department: 'BESCOM Street Lighting Division',
          turnaround: '48 - 72 Hours',
          tags: [
            '#DarkCorridor',
            '#PedestrianSafety',
            '#LightingGrid',
          ],
          aiNotes:
            'Zero foot-candle luminescence registered across pedestrian crossing. Recommends LED ballast replacement.',
        };

      case 'Waste Management':
        return {
          title: 'Commercial Solid Waste Overflow & Biohazard',
          confidence: 98.1,
          priority: 'Critical' as ComplaintPriority,
          severity: 'Critical (> 150kg)',
          department: 'Solid Waste Management (SWM) Rapid Unit',
          turnaround: '12 - 24 Hours',
          tags: [
            '#ZeroGarbage',
            '#DrainageBlock',
            '#HealthHazard',
          ],
          aiNotes:
            'Organic rot and packaging refuse encroaching storm water culvert. Rapid bacterial propagation risk.',
        };

      case 'Water Supply':
        return {
          title: 'High Pressure Potable Mains Leak',
          confidence: 97.4,
          priority: 'Critical' as ComplaintPriority,
          severity: 'Critical Pressure Anomaly',
          department: 'BWSSB Pipeline Maintenance Wing',
          turnaround: '6 - 12 Hours',
          tags: [
            '#WaterLoss',
            '#PipelineRupture',
            '#Emergency',
          ],
          aiNotes:
            'Continuous subsurface discharge detected. Hydraulic loss estimated at ~120 LPM.',
        };

      default:
        return {
          title: `${category} Structural Anomaly`,
          confidence: 92.5,
          priority: 'Medium' as ComplaintPriority,
          severity: 'Standard Civic Defect',
          department: 'Ward Engineering Maintenance Dept',
          turnaround: '3 - 5 Days',
          tags: [
            '#CivicAction',
            '#Ward112',
            '#CommunityFix',
          ],
          aiNotes:
            'Visual inspection matches municipal grievance patterns. Scheduled for routine squad dispatch.',
        };
    }
  };

  const aiData = getAIDiagnosis();

  const [isRescanning, setIsRescanning] = useState(false);

  const handleRescan = () => {
    setIsRescanning(true);

    setTimeout(() => {
      setIsRescanning(false);
    }, 900);
  };

  const handleProceed = () => {
    navigation.navigate('ReviewSubmit', {
      analysisData: {
        imageUri,
        category,
        title: aiData.title,
        description,
        location,
        priority: aiData.priority,
        confidence: aiData.confidence,
        department: aiData.department,
        tags: aiData.tags,
        turnaround: aiData.turnaround,
        photoFile,
      } as any,
    });
  };

  return (
    <ScreenContainer>

      <Header
        title="AI Analysis"
        subtitle="Step 2 of 3 • Intelligent Assessment"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* DEMO MODEL NOTICE */}

        <View style={styles.demoBanner}>
          <View style={styles.demoIcon}>
            <Icon
              name="sparkles"
              size={15}
              color={colors.cyan}
            />
          </View>

          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>
              AI ANALYSIS PREVIEW
            </Text>

            <Text style={styles.demoSubtitle}>
              Demo data • CivicFix AI Vision Model v2.4
            </Text>
          </View>

          <View style={styles.demoStatus}>
            <View style={styles.statusDot} />

            <Text style={styles.demoStatusText}>
              READY
            </Text>
          </View>
        </View>

        {/* SCANNED IMAGE */}

        <View style={styles.imageSection}>

          <View style={styles.imageHeader}>
            <Text style={styles.sectionEyebrow}>
              DETECTED ISSUE
            </Text>

            <Text style={styles.imageCategory}>
              {category.toUpperCase()}
            </Text>
          </View>

          <View style={styles.hudContainer}>

            <Image
              source={{ uri: imageUri }}
              style={styles.scanImage}
              resizeMode="cover"
            />

            <View style={styles.hudOverlay}>

              <View style={styles.hudTop}>
                <View style={styles.scanningPill}>
                  <View style={styles.pulseDot} />

                  <Text style={styles.scanningText}>
                    SCAN COMPLETED
                  </Text>
                </View>

                <View style={styles.confidencePill}>
                  <Text style={styles.confidenceScore}>
                    {aiData.confidence.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.targetBox}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                <Text style={styles.targetLabel}>
                  {category.toUpperCase()}
                </Text>
              </View>

              <View style={styles.imageBottom}>
                <Icon
                  name="sparkles"
                  size={13}
                  color={colors.cyan}
                />

                <Text style={styles.imageBottomText}>
                  AI visual assessment
                </Text>
              </View>

            </View>
          </View>
        </View>

        {/* CONFIDENCE SCORE */}

        <View style={styles.confidenceCard}>

          <View style={styles.confidenceCardLeft}>
            <View style={styles.confidenceIcon}>
              <Icon
                name="sparkles"
                size={20}
                color={colors.cyan}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.confidenceTitle}>
                AI Confidence Score
              </Text>

              <Text style={styles.confidenceSubtitle}>
                Category matching confidence
              </Text>
            </View>
          </View>

          <Text style={styles.confidenceValue}>
            {aiData.confidence.toFixed(1)}%
          </Text>

        </View>

        {/* CLASSIFICATION RESULT */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon
                name="sparkles"
                size={18}
                color={colors.cyan}
              />
            </View>

            <View style={styles.sectionHeadingText}>
              <Text style={styles.cardTitle}>
                Classification Result
              </Text>

              <Text style={styles.cardSubtitle}>
                AI-generated issue assessment
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleRescan}
              disabled={isRescanning}
              activeOpacity={0.7}
              style={styles.rescanButton}
            >
              <Icon
                name="refresh"
                size={14}
                color={colors.cyan}
              />

              <Text style={styles.rescanText}>
                {isRescanning ? 'Scanning...' : 'Re-run'}
              </Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.issueTitle}>
            {aiData.title}
          </Text>

          <View style={styles.resultDivider} />

          {/* METRICS */}

          <View style={styles.metricsGrid}>

            <View style={styles.metricItem}>
              <View style={styles.metricIconRow}>
                <Icon
                  name="alert-circle"
                  size={13}
                  color={colors.cyan}
                />

                <Text style={styles.metricLabel}>
                  PRIORITY
                </Text>
              </View>

              <View style={styles.metricValueContainer}>
                <Badge
                  label={aiData.priority}
                  priority={aiData.priority}
                  size="md"
                />
              </View>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricIconRow}>
                <Icon
                  name="shield"
                  size={13}
                  color={colors.purpleAccent}
                />

                <Text style={styles.metricLabel}>
                  SEVERITY
                </Text>
              </View>

              <Text style={styles.metricValue}>
                {aiData.severity}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricIconRow}>
                <Icon
                  name="clock"
                  size={13}
                  color={colors.electricBlue}
                />

                <Text style={styles.metricLabel}>
                  ESTIMATED TIME
                </Text>
              </View>

              <Text style={styles.metricValue}>
                {aiData.turnaround}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricIconRow}>
                <Icon
                  name="shield"
                  size={13}
                  color={colors.cyan}
                />

                <Text style={styles.metricLabel}>
                  DEPARTMENT
                </Text>
              </View>

              <Text style={styles.departmentValue}>
                {aiData.department}
              </Text>
            </View>

          </View>

        </View>

        {/* AI ASSESSMENT */}

        <View style={styles.assessmentCard}>

          <View style={styles.assessmentHeader}>
            <View style={styles.assessmentIcon}>
              <Icon
                name="sparkles"
                size={17}
                color={colors.cyan}
              />
            </View>

            <View>
              <Text style={styles.assessmentTitle}>
                AI Automated Assessment
              </Text>

              <Text style={styles.assessmentSubtitle}>
                Diagnostic observations
              </Text>
            </View>
          </View>

          <Text style={styles.assessmentText}>
            {aiData.aiNotes}
          </Text>

        </View>

        {/* DETECTED TAGS */}

        <View style={styles.card}>

          <View style={styles.tagsHeader}>
            <Text style={styles.cardTitle}>
              Detected Indicators
            </Text>

            <Icon
              name="shield"
              size={16}
              color={colors.textMuted}
            />
          </View>

          <View style={styles.tagsRow}>
            {aiData.tags.map((tag, index) => (
              <View
                key={index}
                style={styles.tagPill}
              >
                <Text style={styles.tagText}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

        </View>

        {/* CITIZEN DESCRIPTION */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>
            <View style={styles.descriptionIcon}>
              <Icon
                name="file-text"
                size={17}
                color={colors.electricBlue}
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Your Submitted Notes
              </Text>

              <Text style={styles.cardSubtitle}>
                Description provided by you
              </Text>
            </View>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {description || 'No additional description provided.'}
            </Text>
          </View>

        </View>

        {/* ACTIONS */}

        <View style={styles.actionSection}>

          <View style={styles.actionInfo}>
            <Icon
              name="check"
              size={15}
              color={colors.statusResolved}
            />

            <Text style={styles.actionInfoText}>
              Review the analysis before submitting.
            </Text>
          </View>

          <Button
            title="Continue to Review & Submit"
            onPress={handleProceed}
            variant="primary"
            size="lg"
            icon="check"
            style={styles.actionBtn}
          />

          <Button
            title="Edit Details / Retake Photo"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
            style={styles.secondaryBtn}
          />

        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CIVICFIX AI • SMARTER CIVIC REPORTING
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

  // DEMO BANNER

  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    borderRadius: 14,
    padding: 11,
    marginBottom: 19,
    gap: 10,
  },

  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  demoTextContainer: {
    flex: 1,
  },

  demoTitle: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  demoSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },

  demoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.statusResolved,
  },

  demoStatusText: {
    fontSize: 8,
    color: colors.statusResolved,
    fontWeight: '900',
  },

  // IMAGE

  imageSection: {
    marginBottom: 15,
  },

  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  sectionEyebrow: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  imageCategory: {
    fontSize: 10,
    color: colors.cyan,
    fontWeight: '900',
  },

  hudContainer: {
    height: 225,
    borderRadius: 19,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },

  scanImage: {
    width: '100%',
    height: '100%',
  },

  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,13,32,0.38)',
    justifyContent: 'space-between',
    padding: 13,
  },

  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },

  scanningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,13,32,0.88)',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    gap: 6,
  },

  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },

  scanningText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.cyan,
    letterSpacing: 0.5,
  },

  confidencePill: {
    backgroundColor: 'rgba(8,13,32,0.88)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  confidenceScore: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.white,
  },

  targetBox: {
    alignSelf: 'center',
    width: '75%',
    height: '55%',
    borderWidth: 1,
    borderColor: 'rgba(0,245,212,0.35)',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 7,
  },

  corner: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderColor: colors.cyan,
  },

  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },

  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },

  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },

  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  targetLabel: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '900',
    backgroundColor: 'rgba(8,13,32,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },

  imageBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  imageBottomText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '700',
  },

  // CONFIDENCE

  confidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 14,
    marginBottom: spacing.md,
  },

  confidenceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  confidenceIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confidenceTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '800',
  },

  confidenceSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },

  confidenceValue: {
    fontSize: 19,
    color: colors.cyan,
    fontWeight: '900',
  },

  // COMMON CARDS

  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },

  sectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeadingText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  cardSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },

  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(0,245,212,0.09)',
  },

  rescanText: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '800',
  },

  issueTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    lineHeight: 25,
    marginBottom: 15,
  },

  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 15,
  },

  // METRICS

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  metricItem: {
    width: '47%',
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 9,
  },

  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },

  metricValueContainer: {
    alignItems: 'flex-start',
  },

  metricValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 17,
  },

  departmentValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.electricBlue,
    lineHeight: 16,
  },

  // ASSESSMENT

  assessmentCard: {
    backgroundColor: 'rgba(0,245,212,0.055)',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 15,
    marginBottom: spacing.md,
  },

  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },

  assessmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(0,245,212,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  assessmentTitle: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '900',
  },

  assessmentSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  assessmentText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // TAGS

  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tagPill: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  tagText: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '700',
  },

  // CITIZEN DESCRIPTION

  descriptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  descriptionBox: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  descriptionText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // ACTIONS

  actionSection: {
    marginTop: 5,
  },

  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },

  actionInfoText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  actionBtn: {
    marginBottom: 11,
  },

  secondaryBtn: {
    marginBottom: 12,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  footerText: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
  },

});
