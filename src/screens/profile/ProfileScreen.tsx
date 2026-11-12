
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
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
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();

  const { user, logout } = useAuth();
  const { resetToInitialMock, complaints } = useComplaints();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [anonymousByDefault, setAnonymousByDefault] = useState(false);
  const [highPrecisionGps, setHighPrecisionGps] = useState(true);

  const resolvedCount = complaints.filter(
    complaint => complaint.status === 'Resolved',
  ).length;

  const userName = user?.name || 'Alex Rivera';
  const userEmail = user?.email || 'alex.rivera@civicfix.org';
  const userTier = user?.tier || 'Civic Guardian • Level 4';
  const userWard = user?.ward || 'Community Member';

  // LOGOUT

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of CivicFix AI?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  // RESET DEMO DATA

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will reset all complaints back to the original CivicFix demo state.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset State',
          onPress: async () => {
            await resetToInitialMock();

            Alert.alert(
              'Reset Complete',
              'Demo database restored to default.',
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>

      <Header
        title="My Profile"
        subtitle="Your account & civic activity"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* PROFILE IDENTITY */}

        <View style={styles.profileCard}>

          <View style={styles.profileCardTop}>
            <Text style={styles.profileEyebrow}>
              CITIZEN ACCOUNT
            </Text>

            <View style={styles.verifiedBadge}>
              <Icon
                name="shield"
                size={12}
                color={colors.cyan}
              />

              <Text style={styles.verifiedText}>
                ACTIVE
              </Text>
            </View>
          </View>

          <View style={styles.avatarSection}>

            <View style={styles.avatarGlow}>
              <View style={styles.avatarCore}>
                <Icon
                  name="user"
                  size={34}
                  color={colors.cyan}
                />
              </View>
            </View>

            <View style={styles.onlineDot} />

          </View>

          <Text style={styles.userName}>
            {userName}
          </Text>

          <Text style={styles.userEmail}>
            {userEmail}
          </Text>

          <View style={styles.tierPill}>
            <Icon
              name="shield"
              size={13}
              color={colors.cyan}
            />

            <Text style={styles.tierText}>
              {userTier}
            </Text>
          </View>

          <View style={styles.wardContainer}>
            <Text style={styles.wardText}>
              {userWard}
            </Text>
          </View>

          <View style={styles.profileFooter}>
            <Text style={styles.profileFooterText}>
              Proudly contributing to a better community
            </Text>
          </View>

        </View>

        {/* CIVIC IMPACT */}

        <View style={styles.statsCard}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Civic Impact
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your contribution to the community
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Icon
                name="shield"
                size={18}
                color={colors.cyan}
              />
            </View>
          </View>

          <View style={styles.statsRow}>

            <View style={styles.statCol}>
              <Text style={styles.statNumber}>
                {complaints.length}
              </Text>

              <Text style={styles.statDesc}>
                Reports Filed
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text
                style={[
                  styles.statNumber,
                  { color: colors.statusResolved },
                ]}
              >
                {resolvedCount}
              </Text>

              <Text style={styles.statDesc}>
                Issues Resolved
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text
                style={[
                  styles.statNumber,
                  { color: colors.cyan },
                ]}
              >
                {user?.points || 480}
              </Text>

              <Text style={styles.statDesc}>
                Civic Points
              </Text>
            </View>

          </View>

        </View>

        {/* ACCOUNT PREFERENCES */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Preferences
              </Text>

              <Text style={styles.sectionSubtitle}>
                Customize your CivicFix experience
              </Text>
            </View>

            <View style={styles.sectionIconPurple}>
              <Icon
                name="shield"
                size={18}
                color={colors.purpleAccent}
              />
            </View>
          </View>

          {/* NOTIFICATIONS */}

          <View style={styles.preferenceRow}>

            <View style={styles.preferenceIcon}>
              <Icon
                name="bell"
                size={17}
                color={colors.cyan}
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                Push Notifications
              </Text>

              <Text style={styles.preferenceSubtitle}>
                Receive real-time complaint updates.
              </Text>
            </View>

            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.backgroundElevated,
                true: colors.cyan,
              }}
              thumbColor={colors.white}
            />

          </View>

          <View style={styles.divider} />

          {/* ANONYMOUS REPORTING */}

          <View style={styles.preferenceRow}>

            <View style={styles.preferenceIconPurple}>
              <Icon
                name="user"
                size={17}
                color={colors.purpleAccent}
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                Anonymous Reporting
              </Text>

              <Text style={styles.preferenceSubtitle}>
                Hide your identity on public complaint feeds.
              </Text>
            </View>

            <Switch
              value={anonymousByDefault}
              onValueChange={setAnonymousByDefault}
              trackColor={{
                false: colors.backgroundElevated,
                true: colors.cyan,
              }}
              thumbColor={colors.white}
            />

          </View>

          <View style={styles.divider} />

          {/* GPS */}

          <View style={styles.preferenceRow}>

            <View style={styles.preferenceIconBlue}>
              <Icon
                name="location"
                size={17}
                color={colors.electricBlue}
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                Enhanced GPS
              </Text>

              <Text style={styles.preferenceSubtitle}>
                Improve location accuracy for civic reports.
              </Text>
            </View>

            <Switch
              value={highPrecisionGps}
              onValueChange={setHighPrecisionGps}
              trackColor={{
                false: colors.backgroundElevated,
                true: colors.cyan,
              }}
              thumbColor={colors.white}
            />

          </View>

        </View>

        {/* PROJECT INFORMATION */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                About CivicFix AI
              </Text>

              <Text style={styles.sectionSubtitle}>
                Project & technology information
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Icon
                name="shield"
                size={18}
                color={colors.cyan}
              />
            </View>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specKey}>
              Competition
            </Text>

            <Text style={styles.specValue}>
              Civic Technology Prototype
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Text style={styles.specKey}>
              AI Model
            </Text>

            <Text style={styles.specValue}>
              CivicFix AI
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Text style={styles.specKey}>
              Framework
            </Text>

            <Text style={styles.specValue}>
              React Native CLI
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Text style={styles.specKey}>
              Language
            </Text>

            <Text style={styles.specValue}>
              TypeScript
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Text style={styles.specKey}>
              Platform
            </Text>

            <Text style={styles.specValue}>
              Android Native
            </Text>
          </View>

          {/* RESET BUTTON */}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
            activeOpacity={0.8}
          >
            <Icon
              name="refresh"
              size={15}
              color={colors.textSecondary}
            />

            <Text style={styles.resetButtonText}>
              Reset Demo Complaints
            </Text>
          </TouchableOpacity>

        </View>

        {/* SIGN OUT */}

        <View style={styles.logoutSection}>

          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            size="md"
            icon="log-out"
            style={styles.logoutButton}
          />

          <Text style={styles.versionText}>
            CIVICFIX AI • BUILDING BETTER COMMUNITIES
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

  // PROFILE CARD

  profileCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },

  profileCardTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  profileEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,245,212,0.10)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.cyan,
  },

  avatarSection: {
    position: 'relative',
    marginBottom: 13,
  },

  avatarGlow: {
    width: 91,
    height: 91,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,212,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarCore: {
    width: 75,
    height: 75,
    borderRadius: 26,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 3,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.statusResolved,
    borderWidth: 3,
    borderColor: colors.backgroundSecondary,
  },

  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 5,
  },

  userEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 13,
  },

  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,245,212,0.10)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    gap: 7,
  },

  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.cyan,
  },

  wardContainer: {
    marginTop: 10,
  },

  wardText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  profileFooter: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    marginTop: 18,
    paddingTop: 13,
    alignItems: 'center',
  },

  profileFooterText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  // STATS

  statsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: spacing.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionIconPurple: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(134,80,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statCol: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  statDesc: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 5,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },

  // COMMON CARD

  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: spacing.md,
  },

  // PREFERENCES

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  preferenceIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preferenceIconPurple: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(134,80,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preferenceIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preferenceContent: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  preferenceSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 15,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 15,
  },

  // PROJECT SPECIFICATIONS

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },

  specKey: {
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
  },

  specValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cyan,
    textAlign: 'right',
    flex: 1,
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 11,
    marginTop: 17,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  resetButtonText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '800',
  },

  // LOGOUT

  logoutSection: {
    marginTop: 5,
    alignItems: 'center',
  },

  logoutButton: {
    width: '100%',
    marginBottom: 17,
  },

  versionText: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

});
