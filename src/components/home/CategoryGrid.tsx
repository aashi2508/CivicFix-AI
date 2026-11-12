import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { CivicCategory } from '../../types';
import { Icon, IconName } from '../common/Icon';

interface CategoryItem {
  name: CivicCategory;
  icon: IconName;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'Pothole', icon: 'road', color: '#EF4444' },
  { name: 'Streetlight', icon: 'light', color: '#F59E0B' },
  { name: 'Waste Management', icon: 'trash', color: '#10B981' },
  { name: 'Water Supply', icon: 'water', color: '#00D2FF' },
  { name: 'Drainage', icon: 'filter', color: '#8B5CF6' },
  { name: 'Footpath & Curb', icon: 'location', color: '#EC4899' },
];

interface CategoryGridProps {
  onSelectCategory?: (category: CivicCategory) => void;
  selectedCategory?: CivicCategory | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.name;
        return (
          <TouchableOpacity
            key={cat.name}
            activeOpacity={0.8}
            onPress={() => onSelectCategory && onSelectCategory(cat.name)}
            style={[
              styles.item,
              isSelected && {
                borderColor: cat.color,
                backgroundColor: `${cat.color}22`,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${cat.color}20` },
                isSelected && { backgroundColor: cat.color },
              ]}
            >
              <Icon
                name={cat.icon}
                size={18}
                color={isSelected ? colors.white : cat.color}
              />
            </View>
            <Text
              style={[
                styles.name,
                isSelected && { color: colors.white, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  item: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  name: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
