
import React, { useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  RootStackParamList,
  MainTabParamList,
} from '../../navigation/types';

import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '../../theme';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useComplaints } from '../../context/ComplaintsContext';
import { ComplaintStatus } from '../../types';

type MyComplaintsRouteProp = RouteProp<
  MainTabParamList,
  'MyComplaints'
>;

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

const TABS: {
  label: string;
  status: ComplaintStatus | 'All';
}[] = [
  { label: 'All', status: 'All' },
  { label: 'In Progress', status: 'In Progress' },
  { label: 'AI Verified', status: 'AI Verified' },
  { label: 'Submitted', status: 'Submitted' },
  { label: 'Resolved', status: 'Resolved' },
];

export const MyComplaintsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<MyComplaintsRouteProp>();

  const { complaints, upvoteComplaint } = useComplaints();

  const [activeTab, setActiveTab] = useState<string>(
    route.params?.initialFilter || 'All',
  );

  const [search, setSearch] = useState('');

  // SUMMARY COUNTS

  const totalComplaints = complaints.length;

  const inProgressCount = complaints.filter(
    item => item.status === 'In Progress',
  ).length;

  const resolvedCount = complaints.filter(
    item => item.status === 'Resolved',
  ).length;

  // FILTER COUNTS

  const getTabCount = (status: ComplaintStatus | 'All') => {
    if (status === 'All') {
      return complaints.length;
    }

    return complaints.filter(
      item => item.status === status,
    ).length;
  };

  // WORKING SEARCH + STATUS FILTER

  const filteredComplaints = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();

    return complaints.filter(item => {
      const matchesTab =
        activeTab === 'All' || item.status === activeTab;

      const searchableText = [
        item.id,
        item.title,
        item.description,
        item.category,
        item.location?.address,
        item.location?.ward,
        item.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        searchQuery === '' ||
        searchableText.includes(searchQuery);

      return matchesTab && matchesSearch;
    });
  }, [complaints, activeTab, search]);

  // CLEAR FILTERS

  const clearFilters = () => {
    setSearch('');
    setActiveTab('All');
  };

  return (
    <ScreenContainer>
      <Header
        title="My Complaints"
        subtitle="Track your civic reports"
      />

      <View style={styles.container}>
        <FlatList
          data={filteredComplaints}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}

          ListHeaderComponent={
            <View>

              {/* OVERVIEW CARD */}

              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <View>
                    <Text style={styles.overviewEyebrow}>
                      CIVIC ACTIVITY
                    </Text>

                    <Text style={styles.overviewTitle}>
                      Your Impact
                    </Text>

                    <Text style={styles.overviewSubtitle}>
                      Track the progress of your reported issues.
                    </Text>
                  </View>

                  <View style={styles.overviewIcon}>
                    <Icon
                      name="file-text"
                      size={22}
                      color={colors.cyan}
                    />
                  </View>
                </View>

                <View style={styles.statsDivider} />

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {totalComplaints}
                    </Text>

                    <Text style={styles.statLabel}>
                      Total Reports
                    </Text>
                  </View>

                  <View style={styles.statSeparator} />

                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statNumber,
                        { color: colors.electricBlue },
                      ]}
                    >
                      {inProgressCount}
                    </Text>

                    <Text style={styles.statLabel}>
                      In Progress
                    </Text>
                  </View>

                  <View style={styles.statSeparator} />

                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statNumber,
                        { color: colors.statusResolved },
                      ]}
                    >
                      {resolvedCount}
                    </Text>

                    <Text style={styles.statLabel}>
                      Resolved
                    </Text>
                  </View>
                </View>
              </View>

              {/* SEARCH BAR */}

              <View style={styles.searchSection}>
                <Text style={styles.sectionHeading}>
                  FIND YOUR REPORT
                </Text>

                <Input
                  placeholder="Search ticket, street or category..."
                  value={search}
                  onChangeText={setSearch}
                  icon="search"
                  containerStyle={styles.searchBar}
                />
              </View>

              {/* FILTER HEADER */}

              <View style={styles.filterHeader}>
                <Text style={styles.sectionHeading}>
                  FILTER BY STATUS
                </Text>

                {activeTab !== 'All' && (
                  <TouchableOpacity
                    onPress={() => setActiveTab('All')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetText}>
                      Reset
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* FILTER TABS */}

              <View style={styles.tabsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabsScroll}
                  nestedScrollEnabled
                >
                  {TABS.map(tab => {
                    const isSelected =
                      activeTab === tab.status;

                    const count = getTabCount(tab.status);

                    return (
                      <TouchableOpacity
                        key={tab.label}
                        activeOpacity={0.8}
                        onPress={() => setActiveTab(tab.status)}
                        style={[
                          styles.tabItem,
                          isSelected && styles.tabItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            isSelected && styles.tabTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>

                        <View
                          style={[
                            styles.tabCountBadge,
                            isSelected &&
                              styles.tabCountBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tabCountText,
                              isSelected &&
                                styles.tabCountTextActive,
                            ]}
                          >
                            {count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* LIST HEADER */}

              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.listTitle}>
                    Recent Reports
                  </Text>

                  <Text style={styles.listSubtitle}>
                    {filteredComplaints.length} complaints found
                  </Text>
                </View>

                <View style={styles.resultBadge}>
                  <Icon
                    name="list"
                    size={13}
                    color={colors.cyan}
                  />

                  <Text style={styles.resultText}>
                    {filteredComplaints.length}
                  </Text>
                </View>
              </View>

            </View>
          }

          // COMPLAINT CARDS

          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() =>
                navigation.navigate('ComplaintDetails', {
                  complaintId: item.id,
                })
              }
              onUpvote={() => upvoteComplaint(item.id)}
            />
          )}

          // EMPTY STATE

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon
                  name="list"
                  size={30}
                  color={colors.cyan}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Complaints Found
              </Text>

              <Text style={styles.emptySubtitle}>
                {search.trim()
                  ? `No reports match "${search}". Try another keyword.`
                  : 'There are no complaints under this status yet.'}
              </Text>

              {(search.length > 0 || activeTab !== 'All') && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearFilterButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearFilterText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}

              <Button
                title="Report New Civic Issue"
                onPress={() => navigation.navigate('ReportIssue')}
                variant="primary"
                size="md"
                icon="camera"
                style={styles.emptyBtn}
              />
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

  // OVERVIEW

  overviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 16,
    marginTop: spacing.md,
    marginBottom: 20,
  },

  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overviewEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.cyan,
    marginBottom: 6,
  },

  overviewTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  overviewSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
  },

  overviewIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: 'rgba(0,245,212,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,245,212,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.cyan,
  },

  statLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 5,
    fontWeight: '600',
  },

  statSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },

  // SEARCH

  searchSection: {
    marginBottom: 16,
  },

  sectionHeading: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },

  searchBar: {
    marginTop: 9,
    marginBottom: 0,
  },

  // FILTERS

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resetText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '800',
  },

  tabsWrapper: {
    marginTop: 9,
    marginBottom: 17,
  },

  tabsScroll: {
    gap: 8,
    paddingVertical: 3,
  },

  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 7,
  },

  tabItemActive: {
    backgroundColor: 'rgba(0,245,212,0.12)',
    borderColor: colors.cyan,
  },

  tabText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  tabTextActive: {
    color: colors.cyan,
    fontWeight: '900',
  },

  tabCountBadge: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 7,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabCountBadgeActive: {
    backgroundColor: colors.cyan,
  },

  tabCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },

  tabCountTextActive: {
    color: colors.background,
  },

  // LIST HEADER

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  listTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  listSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },

  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,245,212,0.09)',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  resultText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },

  // COMPLAINT LIST

  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },

  // EMPTY STATE

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 35,
  },

  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(0,245,212,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(0,245,212,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 19,
    marginBottom: 15,
  },

  clearFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    marginBottom: 15,
  },

  clearFilterText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '800',
  },

  emptyBtn: {
    minWidth: 210,
  },
});
