
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Camera,
  CameraRef,
  GeolocationPosition,
  LocationManager,
  Map as MapLibreMap,
  Marker,
  UserLocation,
} from '@maplibre/maplibre-react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Complaint, CivicCategory } from '../../types';

import {
  colors,
  spacing,
  borderRadius,
} from '../../theme';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Icon, IconName } from '../../components/common/Icon';

import { useComplaints } from '../../context/ComplaintsContext';

type MapNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type Coordinate = {
  latitude: number;
  longitude: number;
};

const DEFAULT_CENTER: [number, number] = [72.5714, 23.0225];

const FILTERS: Array<'All' | CivicCategory> = [
  'All',
  'Pothole',
  'Streetlight',
  'Waste Management',
  'Water Supply',
  'Drainage',
  'Road Hazard',
  'Traffic Signal',
  'Footpath & Curb',
  'Other',
];

const CATEGORY_COLORS: Record<CivicCategory, string> = {
  Pothole: '#EF4444',
  Streetlight: '#F59E0B',
  'Waste Management': '#10B981',
  'Water Supply': '#06B6D4',
  Drainage: '#8B5CF6',
  'Road Hazard': '#F97316',
  'Traffic Signal': '#EAB308',
  'Footpath & Curb': '#EC4899',
  Other: '#8650FF',
};

const CATEGORY_ICONS: Record<CivicCategory, IconName> = {
  Pothole: 'road',
  Streetlight: 'light',
  'Waste Management': 'trash',
  'Water Supply': 'water',
  Drainage: 'filter',
  'Road Hazard': 'alert',
  'Traffic Signal': 'alert',
  'Footpath & Curb': 'location',
  Other: 'alert',
};

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
};

const validCoordinates = (item: Complaint) => {
  const lat = Number(item.location?.latitude);
  const lng = Number(item.location?.longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
};

export const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapNavigationProp>();
  const { complaints, isLoading } = useComplaints();

  const cameraRef = useRef<CameraRef>(null);

  const [activeFilter, setActiveFilter] =
    useState<'All' | CivicCategory>('All');

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [currentLocation, setCurrentLocation] =
    useState<Coordinate | null>(null);

  const [locationPermission, setLocationPermission] =
    useState(false);

  // ALL PUBLIC COMPLAINTS

  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'All') {
      return complaints;
    }

    return complaints.filter(
      item => item.category === activeFilter,
    );
  }, [complaints, activeFilter]);

  const mapComplaints = useMemo(
    () => filteredComplaints.filter(validCoordinates),
    [filteredComplaints],
  );

  // STATISTICS

  const totalCount = complaints.length;

  const inProgressCount = complaints.filter(
    item =>
      item.status === 'In Progress' ||
      item.status === 'AI Verified',
  ).length;

  const resolvedCount = complaints.filter(
    item => item.status === 'Resolved',
  ).length;

  const pendingCount = complaints.filter(
    item =>
      item.status === 'Submitted' ||
      item.status === 'Under Review',
  ).length;

  // LOCATION

  useEffect(() => {
    let mounted = true;

    const handleLocation = (position: GeolocationPosition) => {
      if (!mounted) return;

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    LocationManager.requestPermissions()
      .then(granted => {
        if (!mounted || !granted) return;

        setLocationPermission(true);
        LocationManager.setMinDisplacement(10);
        LocationManager.addListener(handleLocation);
        LocationManager.start();

        LocationManager.getCurrentPosition()
          .then(position => {
            if (position && mounted) {
              handleLocation(position);
            }
          })
          .catch(error => {
            console.log('Location error:', error);
          });
      })
      .catch(error => {
        console.log('Location permission error:', error);
      });

    return () => {
      mounted = false;
      LocationManager.removeListener(handleLocation);
      LocationManager.stop();
    };
  }, []);

  // SELECT MARKER

  const handleMarkerPress = (item: Complaint) => {
    setSelectedComplaint(item);

    cameraRef.current?.easeTo({
      center: [
        item.location.longitude,
        item.location.latitude,
      ],
      zoom: 15,
      duration: 450,
    });
  };

  // OPEN DETAILS

  const openComplaintDetails = () => {
    if (!selectedComplaint) return;

    navigation.navigate('ComplaintDetails', {
      complaintId: selectedComplaint.id,
    });
  };

  // RECENTER

  const recenterMap = () => {
    const center: [number, number] = currentLocation
      ? [
          currentLocation.longitude,
          currentLocation.latitude,
        ]
      : DEFAULT_CENTER;

    cameraRef.current?.easeTo({
      center,
      zoom: currentLocation ? 15 : 12,
      duration: 450,
    });
  };

  // KEEP SELECTED COMPLAINT VALID

  useEffect(() => {
    if (!selectedComplaint) return;

    const updated = filteredComplaints.find(
      item => item.id === selectedComplaint.id,
    );

    if (!updated) {
      setSelectedComplaint(null);
    } else {
      setSelectedComplaint(updated);
    }
  }, [filteredComplaints]);

  return (
    <ScreenContainer>

      <Header
        title="Incident Map"
        subtitle="Explore civic issues around your city"
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >

        {/* CITY OVERVIEW */}

        <View style={styles.overviewCard}>

          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Icon
                name="map"
                size={21}
                color={colors.cyan}
              />
            </View>

            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>
                Civic Activity
              </Text>
              <Text style={styles.overviewSubtitle}>
                Community incident overview
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.statsRow}>

            <View style={styles.statItem}>
              <Text style={styles.totalNumber}>
                {totalCount}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.activeNumber}>
                {inProgressCount}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.resolvedNumber}>
                {resolvedCount}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>

          </View>

          <View style={styles.pendingRow}>
            <Icon
              name="clock"
              size={13}
              color="#F59E0B"
            />
            <Text style={styles.pendingText}>
              {pendingCount} complaints awaiting action
            </Text>
          </View>

        </View>

        {/* FILTERS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Filter incidents
          </Text>

          <Text style={styles.resultCount}>
            {filteredComplaints.length} results
          </Text>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(category => {
            const active = activeFilter === category;

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(category)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* MAP HEADER */}

        <View style={styles.mapHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Incident Locations
            </Text>
            <Text style={styles.mapSubtitle}>
              Select a marker to view its details
            </Text>
          </View>

          <TouchableOpacity
            onPress={recenterMap}
            activeOpacity={0.8}
            style={styles.recenterButton}
          >
            <Icon
              name="location"
              size={19}
              color={colors.cyan}
            />
          </TouchableOpacity>
        </View>

        {/* MAP */}

        <View style={styles.mapFrame}>

          <MapLibreMap
            style={styles.map}
            mapStyle={OSM_STYLE}
            attribution={false}
            logo={false}
            compass
            scaleBar
          >

            <Camera
              ref={cameraRef}
              initialViewState={{
                center: DEFAULT_CENTER,
                zoom: 12,
              }}
            />

            {locationPermission && (
              <UserLocation
                animated
                accuracy
              />
            )}

            {mapComplaints.map(item => (
              <Marker
                key={item.id}
                id={item.id}
                lngLat={[
                  item.location.longitude,
                  item.location.latitude,
                ]}
                onPress={() => handleMarkerPress(item)}
              >
                <View style={styles.markerContainer}>
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[item.category],
                      },
                      selectedComplaint?.id === item.id &&
                        styles.markerSelected,
                    ]}
                  >
                    <Icon
                      name={CATEGORY_ICONS[item.category]}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={[
                      styles.markerPointer,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[item.category],
                      },
                    ]}
                  />
                </View>
              </Marker>
            ))}

          </MapLibreMap>

          <View style={styles.mapTopBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.mapTopText}>
              CITY INCIDENT MAP
            </Text>
          </View>

          <View style={styles.mapBottomBadge}>
            <Icon
              name="map-pin"
              size={13}
              color={colors.cyan}
            />
            <Text style={styles.mapBottomText}>
              {mapComplaints.length} mapped incidents
            </Text>
          </View>

          {!isLoading && mapComplaints.length === 0 && (
            <View
              pointerEvents="none"
              style={styles.emptyMap}
            >
              <Icon
                name="map"
                size={29}
                color={colors.cyan}
              />

              <Text style={styles.emptyMapTitle}>
                No mapped incidents
              </Text>

              <Text style={styles.emptyMapText}>
                Complaints with valid GPS coordinates
                will appear here.
              </Text>
            </View>
          )}

        </View>

        {/* LEGEND */}

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>
            Incident categories
          </Text>

          <View style={styles.legendGrid}>
            {[
              { name: 'Pothole', color: '#EF4444' },
              { name: 'Streetlight', color: '#F59E0B' },
              { name: 'Waste', color: '#10B981' },
              { name: 'Water', color: '#06B6D4' },
              { name: 'Drainage', color: '#8B5CF6' },
              { name: 'Road Hazard', color: '#F97316' },
            ].map(item => (
              <View
                key={item.name}
                style={styles.legendItem}
              >
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={styles.legendText}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* SELECTED INCIDENT PREVIEW */}

        {selectedComplaint && (
          <View style={styles.selectedCard}>

            <View style={styles.selectedHeader}>
              <Text style={styles.selectedLabel}>
                SELECTED INCIDENT
              </Text>

              <TouchableOpacity
                onPress={() => setSelectedComplaint(null)}
              >
                <Icon
                  name="close"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openComplaintDetails}
              style={styles.selectedBody}
            >
              <View
                style={[
                  styles.selectedCategoryIcon,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[selectedComplaint.category],
                  },
                ]}
              >
                <Icon
                  name={CATEGORY_ICONS[selectedComplaint.category]}
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.selectedInfo}>
                <Text
                  numberOfLines={1}
                  style={styles.selectedTitle}
                >
                  {selectedComplaint.title}
                </Text>

                <Text style={styles.selectedCategory}>
                  {selectedComplaint.category}
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.selectedAddress}
                >
                  {selectedComplaint.location.address}
                </Text>

                <Text style={styles.viewDetails}>
                  View complaint details →
                </Text>
              </View>

              <Icon
                name="chevron-right"
                size={19}
                color={colors.cyan}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* ALL INCIDENTS */}

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Incidents
            </Text>
            <Text style={styles.mapSubtitle}>
              Reported by the community
            </Text>
          </View>

          <Text style={styles.resultCount}>
            {filteredComplaints.length} reports
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>
              Loading incidents...
            </Text>
          </View>
        ) : filteredComplaints.length === 0 ? (
          <View style={styles.emptyList}>
            <Icon
              name="file-text"
              size={27}
              color={colors.cyan}
            />
            <Text style={styles.emptyListTitle}>
              No incidents found
            </Text>
            <Text style={styles.emptyListText}>
              Try selecting another category.
            </Text>
          </View>
        ) : (
          filteredComplaints.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleMarkerPress(item)}
              style={styles.complaintRow}
            >
              <View
                style={[
                  styles.categoryIndicator,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[item.category],
                  },
                ]}
              />

              <View style={styles.complaintInfo}>
                <Text
                  numberOfLines={1}
                  style={styles.complaintTitle}
                >
                  {item.title}
                </Text>

                <Text style={styles.complaintSubtitle}>
                  {item.category} · {item.id}
                </Text>

                <Text style={styles.complaintStatus}>
                  {item.status}
                </Text>
              </View>

              <Icon
                name="chevron-right"
                size={18}
                color={colors.cyan}
              />
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpace} />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  // SCROLL

  screen: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },

  // OVERVIEW

  overviewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  overviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,245,212,0.10)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },

  overviewInfo: {
    flex: 1,
  },

  overviewTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },

  overviewSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  liveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  totalNumber: {
    color: colors.cyan,
    fontSize: 22,
    fontWeight: '900',
  },

  activeNumber: {
    color: '#F59E0B',
    fontSize: 22,
    fontWeight: '900',
  },

  resolvedNumber: {
    color: colors.statusResolved,
    fontSize: 22,
    fontWeight: '900',
  },

  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },

  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 13,
  },

  pendingText: {
    color: colors.textMuted,
    fontSize: 10,
  },

  // HEADERS

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 11,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },

  resultCount: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '800',
  },

  // FILTERS

  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingBottom: 5,
  },

  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
  },

  filterChipActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },

  filterTextActive: {
    color: colors.background,
    fontWeight: '900',
  },

  // MAP

  mapHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  mapSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  recenterButton: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },

  mapFrame: {
    height: 360,
    flexGrow: 0,
    flexShrink: 0,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    backgroundColor: colors.backgroundSecondary,
  },

  map: {
    flex: 1,
  },

  mapTopBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(8,13,32,0.95)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  mapTopText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  mapBottomBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(8,13,32,0.95)',
  },

  mapBottomText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },

  // MARKERS

  markerContainer: {
    alignItems: 'center',
  },

  marker: {
    width: 41,
    height: 41,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  markerSelected: {
    width: 49,
    height: 49,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: colors.cyan,
  },

  markerPointer: {
    width: 10,
    height: 10,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
  },

  // EMPTY MAP

  emptyMap: {
    position: 'absolute',
    top: '31%',
    alignSelf: 'center',
    width: '78%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 17,
    backgroundColor: 'rgba(8,13,32,0.96)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  emptyMapTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyMapText: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 6,
  },

  // LEGEND

  legendCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 14,
    borderRadius: 15,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  legendTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 12,
  },

  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  legendText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },

  // SELECTED COMPLAINT

  selectedCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },

  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  selectedLabel: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  selectedBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  selectedCategoryIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedInfo: {
    flex: 1,
  },

  selectedTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },

  selectedCategory: {
    color: colors.cyan,
    fontSize: 10,
    marginTop: 4,
  },

  selectedAddress: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },

  viewDetails: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 7,
  },

  // RECENT INCIDENTS

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  complaintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginHorizontal: spacing.lg,
    marginBottom: 9,
    padding: 13,
    borderRadius: 13,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  categoryIndicator: {
    width: 4,
    height: 44,
    borderRadius: 4,
  },

  complaintInfo: {
    flex: 1,
  },

  complaintTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },

  complaintSubtitle: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },

  complaintStatus: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 5,
  },

  emptyList: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    padding: 25,
    borderRadius: 15,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  emptyListTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyListText: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },

  bottomSpace: {
    height: 25,
  },

});
