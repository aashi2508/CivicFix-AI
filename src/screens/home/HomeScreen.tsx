
import React, { useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Icon } from '../../components/common/Icon';
import { CategoryGrid } from '../../components/home/CategoryGrid';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';

import { useComplaints } from '../../context/ComplaintsContext';
import { useAuth } from '../../context/AuthContext';

import { CivicCategory } from '../../types';

type HomeProp = NativeStackNavigationProp<RootStackParamList>;

const BRAND = {
  background: '#080D20',
  surface: '#111A32',
  surfaceLight: '#17233D',
  cyan: '#00E5D4',
  purple: '#8650FF',
  white: '#FFFFFF',
  secondary: '#A5B0C8',
  muted: '#71809F',
  border: '#263451',
  blue: '#5799FF',
  green: '#31D6A0',
  orange: '#FFB45E',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeProp>();

  const { user } = useAuth();

  const {
    complaints,
    recentComplaints,
    totalCount,
    inProgressCount,
    resolvedCount,
    upvoteComplaint,
  } = useComplaints();

  const [refreshing, setRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<CivicCategory | null>(null);

  const firstName = user?.name?.split(' ')[0] || 'Citizen';

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Category selection
  const handleCategorySelect = (category: CivicCategory) => {
    setSelectedCategory(prev =>
      prev === category ? null : category
    );
  };

  // Filter complaints
  const displayedComplaints = selectedCategory
    ? complaints
        .filter(item => item.category === selectedCategory)
        .slice(0, 3)
    : recentComplaints.slice(0, 2);

  return (
    <ScreenContainer>

      <StatusBar
        barStyle="light-content"
      />

      <View style={styles.screenWrapper}>

        {/* ================================= */}
        {/* FIXED HEADER */}
        {/* ================================= */}

        <View style={styles.header}>

          <View style={styles.headerLeft}>

            <View style={styles.brandRow}>

              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View>

                <View style={styles.brandNameRow}>

                  <Text style={styles.brandName}>
                    CivicFix
                  </Text>

                  <Text style={styles.brandAI}>
                    AI
                  </Text>

                </View>

                <Text style={styles.brandCaption}>
                  CITIZEN DASHBOARD
                </Text>

              </View>

            </View>

          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >

            <Icon
              name="bell"
              size={21}
              color={BRAND.white}
            />

            <View style={styles.notificationDot} />

          </TouchableOpacity>

        </View>

        {/* ================================= */}
        {/* SCROLLABLE CONTENT */}
        {/* ================================= */}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BRAND.cyan}
              colors={[BRAND.cyan]}
            />
          }
        >


{/* PREMIUM WELCOME SECTION */}

<View style={styles.welcomeSection}>

  <View style={styles.welcomeTopRow}>

    <View style={styles.welcomeTextContainer}>

      <Text style={styles.welcomeEyebrow}>
        CITIZEN DASHBOARD
      </Text>

      <Text style={styles.greeting}>
        {getTimeGreeting()}, {firstName}!
      </Text>

      <Text style={styles.welcomeSubtitle}>
        Together, let's build a better community.
      </Text>

    </View>

    <View style={styles.profileCircle}>
      <Icon
        name="user"
        size={25}
        color={BRAND.cyan}
      />
    </View>

  </View>

  <View style={styles.welcomeBottomRow}>

    <View style={styles.locationBadge}>

      <Icon
        name="map"
        size={13}
        color={BRAND.cyan}
      />

      <Text style={styles.locationText}>
        {user?.ward || 'Your Community'}
      </Text>

    </View>

    <View style={styles.aiStatusRow}>

      <View style={styles.liveDot} />

      <Text style={styles.aiStatusText}>
        AI Assistant Ready
      </Text>

    </View>

  </View>

</View>

          {/* REPORT ISSUE HERO */}

          <View style={styles.heroContainer}>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportIssue')}
              style={styles.heroCard}
            >

              <View style={styles.heroGlow} />

              <View style={styles.heroTopRow}>

                <View style={styles.heroIcon}>

                  <Icon
                    name="sparkles"
                    size={23}
                    color={BRAND.cyan}
                  />

                </View>

                <View style={styles.aiBadge}>

                  <Text style={styles.aiBadgeText}>
                    AI POWERED
                  </Text>

                </View>

              </View>

              <Text style={styles.heroTitle}>
                See a Civic Issue?
              </Text>

              <Text style={styles.heroSubtitle}>
                Report potholes, garbage, broken streetlights
                and other neighbourhood problems.
              </Text>

              <View style={styles.heroButton}>

                <Text style={styles.heroButtonText}>
                  Report an Issue
                </Text>

                <Icon
                  name="arrow-right"
                  size={18}
                  color={BRAND.background}
                />

              </View>

            </TouchableOpacity>

          </View>

          {/* WARD OVERVIEW */}

          <View style={styles.section}>

            <View style={styles.sectionHeader}>

              <View>

                <Text style={styles.sectionTitle}>
                  Ward Overview
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Community complaint activity
                </Text>

              </View>

              <View style={styles.liveBadge}>

                <View style={styles.liveDotSmall} />

                <Text style={styles.liveBadgeText}>
                  ACTIVITY
                </Text>

              </View>

            </View>

            <View style={styles.statsGrid}>

              {/* TOTAL REPORTS */}

              <View style={styles.statCard}>

                <View style={[
                  styles.statIcon,
                  { backgroundColor: '#5799FF18' },
                ]}>

                  <Icon
                    name="list"
                    size={19}
                    color={BRAND.blue}
                  />

                </View>

                <Text style={styles.statValue}>
                  {totalCount}
                </Text>

                <Text style={styles.statLabel}>
                  Total Reports
                </Text>

              </View>

              {/* IN PROGRESS */}

              <View style={styles.statCard}>

                <View style={[
                  styles.statIcon,
                  { backgroundColor: '#FFB45E18' },
                ]}>

                  <Icon
                    name="clock"
                    size={19}
                    color={BRAND.orange}
                  />

                </View>

                <Text style={styles.statValue}>
                  {inProgressCount}
                </Text>

                <Text style={styles.statLabel}>
                  In Progress
                </Text>

              </View>

              {/* RESOLVED */}

              <View style={styles.statCard}>

                <View style={[
                  styles.statIcon,
                  { backgroundColor: '#31D6A018' },
                ]}>

                  <Icon
                    name="check"
                    size={19}
                    color={BRAND.green}
                  />

                </View>

                <Text style={styles.statValue}>
                  {resolvedCount}
                </Text>

                <Text style={styles.statLabel}>
                  Resolved
                </Text>

              </View>

            </View>

          </View>

          {/* CATEGORIES */}

          <View style={styles.categorySection}>

            <View style={styles.sectionHeader}>

              <View>

                <Text style={styles.sectionTitle}>
                  Explore Categories
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Find and filter civic issues
                </Text>

              </View>

              {selectedCategory ? (

                <TouchableOpacity
                  onPress={() => setSelectedCategory(null)}
                >

                  <Text style={styles.resetText}>
                    Clear
                  </Text>

                </TouchableOpacity>

              ) : null}

            </View>

            <CategoryGrid
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />

          </View>

          {/* RECENT COMPLAINTS */}

          <View style={styles.recentSection}>

            <View style={styles.sectionHeader}>

              <View style={styles.recentHeading}>

                <Text style={styles.sectionTitle}>
                  {selectedCategory
                    ? `${selectedCategory} Reports`
                    : 'Recent Reports'}
                </Text>

                <View style={styles.countBadge}>

                  <Text style={styles.countText}>
                    {displayedComplaints.length}
                  </Text>

                </View>

              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  (navigation as any).navigate('MainTabs', {
                    screen: 'MyComplaints',
                  })
                }
              >

                <View style={styles.viewAllRow}>

                  <Text style={styles.viewAllText}>
                    View All
                  </Text>

                  <Icon
                    name="chevron-right"
                    size={16}
                    color={BRAND.cyan}
                  />

                </View>

              </TouchableOpacity>

            </View>

            {displayedComplaints.length === 0 ? (

              <View style={styles.emptyCard}>

                <View style={styles.emptyIcon}>

                  <Icon
                    name="shield"
                    size={26}
                    color={BRAND.cyan}
                  />

                </View>

                <Text style={styles.emptyTitle}>
                  No Reports Found
                </Text>

                <Text style={styles.emptySubtitle}>
                  No complaints are available in this category.
                  Be the first to report an issue.
                </Text>

                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('ReportIssue')}
                >

                  <Text style={styles.emptyButtonText}>
                    Report an Issue
                  </Text>

                </TouchableOpacity>

              </View>

            ) : (

              displayedComplaints.map(complaint => (

                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onPress={() =>
                    navigation.navigate('ComplaintDetails', {
                      complaintId: complaint.id,
                    })
                  }
                  onUpvote={() => upvoteComplaint(complaint.id)}
                />

              ))

            )}

          </View>

          {/* FOOTER */}

          <View style={styles.footer}>

            <Text style={styles.footerText}>
              MADE FOR BETTER COMMUNITIES
            </Text>

            <View style={styles.footerLine} />

            <Text style={styles.footerBrand}>
              CIVICFIX AI • VERSION 1.0
            </Text>

          </View>

        </ScrollView>

      </View>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  // MAIN LAYOUT

  screenWrapper: {
    flex: 1,
    backgroundColor: BRAND.background,
  },

  scrollContent: {
    flex: 1,
  },

  scrollInner: {
    paddingBottom: 30,
  },

  // FIXED HEADER

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: BRAND.background,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    zIndex: 10,
  },

  headerLeft: {
    flex: 1,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logo: {
    width: 43,
    height: 43,
  },

  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  brandName: {
    color: BRAND.white,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  brandAI: {
    color: BRAND.background,
    backgroundColor: BRAND.cyan,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },

  brandCaption: {
    color: BRAND.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 3,
  },

  notificationButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: BRAND.surface,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.cyan,
    top: 9,
    right: 10,
  },

  // WELCOME

welcomeSection: {
  paddingHorizontal: 22,
  marginTop: 20,
  marginBottom: 23,
},

welcomeTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

welcomeTextContainer: {
  flex: 1,
  paddingRight: 10,
},

welcomeEyebrow: {
  color: BRAND.cyan,
  fontSize: 10,
  fontWeight: '800',
  letterSpacing: 1.8,
  marginBottom: 7,
},

greeting: {
  color: BRAND.white,
  fontSize: 27,
  fontWeight: '900',
  letterSpacing: -0.8,
},

welcomeSubtitle: {
  color: BRAND.secondary,
  fontSize: 11,
  lineHeight: 18,
  marginTop: 6,
},

profileCircle: {
  width: 53,
  height: 53,
  borderRadius: 18,
  backgroundColor: '#00E5D415',
  borderWidth: 1,
  borderColor: '#00E5D440',
  alignItems: 'center',
  justifyContent: 'center',
},

welcomeBottomRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 17,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: BRAND.border,
},

locationBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  flex: 1,
},

locationText: {
  color: BRAND.secondary,
  fontSize: 10,
  fontWeight: '600',
},

aiStatusRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

liveDot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: BRAND.green,
},

aiStatusText: {
  color: BRAND.green,
  fontSize: 9,
  fontWeight: '700',
},

  // HERO

  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 27,
  },

  heroCard: {
    backgroundColor: '#101C35',
    borderRadius: 20,
    padding: 19,
    borderWidth: 1,
    borderColor: '#28505B',
    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#8650FF12',
    right: -65,
    top: -70,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  heroIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#00E5D418',
    borderWidth: 1,
    borderColor: '#00E5D438',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiBadge: {
    backgroundColor: '#8650FF20',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  aiBadgeText: {
    color: '#B49AFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: BRAND.white,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8,
  },

  heroSubtitle: {
    color: BRAND.secondary,
    fontSize: 11,
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 19,
  },

  heroButton: {
    backgroundColor: BRAND.cyan,
    height: 45,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  heroButtonText: {
    color: BRAND.background,
    fontSize: 12,
    fontWeight: '900',
  },

  // SECTION HEADERS

  section: {
    paddingHorizontal: 20,
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    color: BRAND.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    color: BRAND.muted,
    fontSize: 10,
    marginTop: 5,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00E5D415',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
  },

  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BRAND.cyan,
  },

  liveBadgeText: {
    color: BRAND.cyan,
    fontSize: 8,
    fontWeight: '900',
  },

  // STATS

  statsGrid: {
    flexDirection: 'row',
    gap: 9,
  },

  statCard: {
    flex: 1,
    backgroundColor: BRAND.surface,
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
    minHeight: 110,
    justifyContent: 'space-between',
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    color: BRAND.white,
    fontSize: 23,
    fontWeight: '900',
    marginTop: 10,
  },

  statLabel: {
    color: BRAND.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  // CATEGORIES

  categorySection: {
    marginBottom: 27,
    paddingHorizontal: 20,
  },

  resetText: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '700',
  },

  // RECENT COMPLAINTS

  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  recentHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  countBadge: {
    backgroundColor: BRAND.surfaceLight,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  countText: {
    color: BRAND.cyan,
    fontSize: 10,
    fontWeight: '800',
  },

  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  viewAllText: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '700',
  },

  // EMPTY STATE

  emptyCard: {
    backgroundColor: BRAND.surface,
    borderRadius: 17,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#00E5D415',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    color: BRAND.white,
    fontSize: 15,
    fontWeight: '800',
  },

  emptySubtitle: {
    color: BRAND.muted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 16,
  },

  emptyButton: {
    backgroundColor: '#00E5D418',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#00E5D440',
  },

  emptyButtonText: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '800',
  },

  // FOOTER

  footer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
  },

  footerText: {
    color: BRAND.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  footerLine: {
    width: 35,
    height: 2,
    borderRadius: 2,
    backgroundColor: BRAND.cyan,
    marginVertical: 12,
  },

  footerBrand: {
    color: '#53617F',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },


});

export default HomeScreen;
