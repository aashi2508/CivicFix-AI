
import React, { useState } from 'react';

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';

import {
  CivicCategory,
  ComplaintLocation,
} from '../../types';

import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '../../theme';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon, IconName } from '../../components/common/Icon';

type ReportProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportIssue'
>;

const categories: Array<{
  label: CivicCategory;
  icon: IconName;
}> = [
  { label: 'Pothole', icon: 'road' },
  { label: 'Streetlight', icon: 'light' },
  { label: 'Waste Management', icon: 'trash' },
  { label: 'Water Supply', icon: 'water' },
  { label: 'Drainage', icon: 'filter' },
  { label: 'Footpath & Curb', icon: 'location' },
  { label: 'Other', icon: 'alert' },
];

export const ReportIssueScreen: React.FC = () => {
  const navigation = useNavigation<ReportProp>();

  const [imageUri, setImageUri] = useState('');
  const [photoFile, setPhotoFile] = useState<any>(null);
  const [category, setCategory] =
    useState<CivicCategory>('Pothole');

  const [description, setDescription] = useState('');

  const [location] = useState<ComplaintLocation>({
    address: 'Location will be captured from your device',
    ward: 'Current ward',
    latitude: 0,
    longitude: 0,
  });

  // CAMERA AND GALLERY

  const chooseImage = async (camera: boolean) => {
    try {
      // Request Android camera permission
      if (camera && Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'CivicFix AI Camera Permission',
            message:
              'CivicFix AI needs camera access to capture civic issues.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

        if (
          permission !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access to take a photo.',
          );
          return;
        }
      }

      const result = camera
        ? await launchCamera({
            mediaType: 'photo',
            quality: 0.7,
            cameraType: 'back',
            saveToPhotos: true,
            includeBase64: true,
          })
        : await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
            selectionLimit: 1,
            includeBase64: true,
          });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Image Error',
          result.errorMessage ||
            'Unable to open camera or gallery.',
        );
        return;
      }

      const asset = result.assets?.[0];
      const uri = asset?.uri;

      if (uri) {
        setImageUri(uri);
        setPhotoFile(asset);
      } else {
        Alert.alert(
          'No Image Selected',
          'Please select a valid image.',
        );
      }
    } catch (error) {
      console.log('Image picker error:', error);

      Alert.alert(
        'Something went wrong',
        'Unable to access camera or gallery. Please try again.',
      );
    }
  };

  // CONTINUE TO AI ANALYSIS

  const continueToAnalysis = () => {
    if (!imageUri) {
      Alert.alert(
        'Add a Photo',
        'Please capture or select a photo of the issue first.',
      );
      return;
    }

    if (description.trim().length < 5) {
      Alert.alert(
        'Add Issue Details',
        'Please describe the issue in at least 5 characters.',
      );
      return;
    }

    navigation.navigate('AIAnalysisPreview', {
      imageUri,
      category,
      description: description.trim(),
      location,
      photoFile,
    } as any);
  };

  return (
    <ScreenContainer>

      {/* HEADER */}

      <Header
        title="Report an issue"
        subtitle="Help your neighborhood get it fixed"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* KEYBOARD HANDLING */}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={
            Platform.OS === 'ios'
          }
          contentContainerStyle={styles.content}
        >

          {/* STEP INDICATOR */}

          <View style={styles.stepCard}>

            <View style={styles.stepTopRow}>
              <View>
                <Text style={styles.stepEyebrow}>
                  REPORT A CIVIC ISSUE
                </Text>

                <Text style={styles.stepTitle}>
                  Let's get it fixed.
                </Text>
              </View>

              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  STEP 1 / 3
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>

            <Text style={styles.stepSubtitle}>
              Add a photo, select the issue and tell us what happened.
            </Text>

          </View>

          {/* PHOTO SECTION */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Upload Issue Photo
              </Text>

              <Text style={styles.sectionSubtitle}>
                A clear image helps identify the problem.
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Icon
                name="camera"
                size={17}
                color={colors.cyan}
              />
            </View>
          </View>

          <View style={styles.photoCard}>

            {imageUri ? (

              <View style={styles.previewContainer}>

                <Image
                  source={{ uri: imageUri }}
                  style={styles.preview}
                  resizeMode="cover"
                />

                <View style={styles.photoOverlay}>

                  <View style={styles.photoSelectedBadge}>
                    <Icon
                      name="check"
                      size={12}
                      color={colors.background}
                    />

                    <Text style={styles.photoSelectedText}>
                      PHOTO ADDED
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setImageUri('')}
                    style={styles.removePhotoButton}
                  >
                    <Icon
                      name="refresh"
                      size={14}
                      color="#FFFFFF"
                    />

                    <Text style={styles.removePhotoText}>
                      Change
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            ) : (

              <View style={styles.emptyPhoto}>

                <View style={styles.cameraCircle}>
                  <Icon
                    name="camera"
                    size={30}
                    color={colors.cyan}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Add a clear photo
                </Text>

                <Text style={styles.emptyText}>
                  A photo helps CivicFix classify the issue accurately.
                </Text>

                <Text style={styles.photoHint}>
                  Capture or choose an existing image
                </Text>

              </View>

            )}

            {/* PHOTO BUTTONS */}

            <View style={styles.photoActions}>

              <Button
                title="Take photo"
                onPress={() => chooseImage(true)}
                variant="primary"
                icon="camera"
                style={styles.photoButton}
              />

              <Button
                title="Choose image"
                onPress={() => chooseImage(false)}
                variant="outline"
                icon="image"
                style={styles.photoButton}
              />

            </View>

          </View>

          {/* CATEGORY SECTION */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                What is the issue?
              </Text>

              <Text style={styles.sectionSubtitle}>
                Select the category that best matches.
              </Text>
            </View>

            <View style={styles.sectionIconPurple}>
              <Icon
                name="filter"
                size={17}
                color={colors.purpleAccent}
              />
            </View>

          </View>

          <View style={styles.categoryContainer}>

            {categories.map(item => {
              const isSelected = category === item.label;

              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => setCategory(item.label)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                >

                  <View
                    style={[
                      styles.categoryIcon,
                      isSelected && styles.categoryIconActive,
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={17}
                      color={
                        isSelected
                          ? colors.background
                          : colors.cyan
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>

                  {isSelected && (
                    <Icon
                      name="check"
                      size={13}
                      color={colors.background}
                    />
                  )}

                </TouchableOpacity>
              );
            })}

          </View>

          {/* DESCRIPTION SECTION */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Describe the Issue
              </Text>

              <Text style={styles.sectionSubtitle}>
                Tell us what happened and where.
              </Text>
            </View>

            <View style={styles.sectionIconBlue}>
              <Icon
                name="file-text"
                size={17}
                color={colors.electricBlue}
              />
            </View>

          </View>

          <View style={styles.descriptionCard}>

            <Input
              label="Issue details"
              placeholder="Example: There is a large pothole near the main road. Vehicles are having difficulty passing through..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              icon="list"
              containerStyle={styles.descriptionInput}
            />

            <View style={styles.characterRow}>
              <Text style={styles.characterHint}>
                Minimum 5 characters
              </Text>

              <Text style={styles.characterCount}>
                {description.length} characters
              </Text>
            </View>

          </View>

          {/* LOCATION SECTION */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Issue Location
              </Text>

              <Text style={styles.sectionSubtitle}>
                Where should the civic team look?
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Icon
                name="location"
                size={17}
                color={colors.cyan}
              />
            </View>

          </View>

          <View style={styles.locationCard}>

            <View style={styles.locationIcon}>
              <Icon
                name="location"
                size={19}
                color={colors.cyan}
              />
            </View>

            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>
                Approximate Location
              </Text>

              <Text style={styles.locationText}>
                {location.address}
              </Text>

              <Text style={styles.wardText}>
                {location.ward}
              </Text>
            </View>

            <View style={styles.locationStatus}>
              <Icon
                name="check"
                size={14}
                color={colors.statusResolved}
              />
            </View>

          </View>

          {/* PRIVACY NOTE */}

          <View style={styles.privacyNote}>
            <Icon
              name="shield"
              size={15}
              color={colors.textMuted}
            />

            <Text style={styles.privacyText}>
              Your report helps municipal teams identify and prioritize local issues.
            </Text>
          </View>

          {/* CONTINUE BUTTON */}

          <Button
            title="Continue to AI Review"
            onPress={continueToAnalysis}
            size="lg"
            icon="arrow-right"
            iconPosition="right"
            style={styles.continueButton}
          />

          <Text style={styles.footerText}>
            CIVICFIX AI • BETTER COMMUNITIES START WITH YOU
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  // STEP CARD

  stepCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: 16,
    marginBottom: 23,
  },

  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepEyebrow: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  stepTitle: {
    fontSize: 19,
    color: colors.textPrimary,
    fontWeight: '900',
  },

  stepBadge: {
    backgroundColor: 'rgba(0,245,212,0.10)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  stepBadgeText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },

  progressTrack: {
    height: 4,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 5,
    marginTop: 15,
    overflow: 'hidden',
  },

  progressActive: {
    width: '33.33%',
    height: '100%',
    backgroundColor: colors.cyan,
    borderRadius: 5,
  },

  stepSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 11,
    lineHeight: 16,
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

  sectionIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(45,130,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // PHOTO CARD

  photoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 23,
  },

  previewContainer: {
    height: 205,
    position: 'relative',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  photoOverlay: {
    position: 'absolute',
    top: 11,
    left: 11,
    right: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  photoSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.statusResolved,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },

  photoSelectedText: {
    fontSize: 9,
    color: colors.background,
    fontWeight: '900',
  },

  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8,13,32,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  removePhotoText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyPhoto: {
    height: 205,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  cameraCircle: {
    width: 59,
    height: 59,
    borderRadius: 19,
    backgroundColor: 'rgba(0,245,212,0.10)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },

  photoHint: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 9,
  },

  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  photoButton: {
    flex: 1,
  },

  // CATEGORY

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 23,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
  },

  categoryChipActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },

  categoryIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: 'rgba(0,245,212,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryIconActive: {
    backgroundColor: 'rgba(8,13,32,0.12)',
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },

  categoryTextActive: {
    color: colors.background,
    fontWeight: '900',
  },

  // DESCRIPTION

  descriptionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 15,
    padding: 12,
    marginBottom: 23,
  },

  descriptionInput: {
    marginBottom: 0,
  },

  characterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 9,
  },

  characterHint: {
    fontSize: 9,
    color: colors.textMuted,
  },

  characterCount: {
    fontSize: 9,
    color: colors.cyan,
    fontWeight: '700',
  },

  // LOCATION

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    backgroundColor: 'rgba(0,245,212,0.06)',
    marginBottom: 15,
  },

  locationIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,212,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationCopy: {
    flex: 1,
  },

  locationTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },

  locationText: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  wardText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },

  locationStatus: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(49,214,160,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // PRIVACY

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 5,
    marginBottom: 6,
  },

  privacyText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 15,
  },

  // CONTINUE

  continueButton: {
    marginTop: spacing.md,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: 18,
  },

});
