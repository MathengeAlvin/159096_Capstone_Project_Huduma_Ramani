import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileService } from "../types";
import { ALL_CATEGORIES } from "../data/mockServices";
import { GlovoTheme } from "../theme";

interface SearchScreenProps {
  services: MobileService[];
  onSelectService: (service: MobileService) => void;
  initialQuery?: string;
}

export function SearchScreen({
  services,
  onSelectService,
  initialQuery = "",
}: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) : 0, 24);

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.location.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && (query.trim() === "" || matchesQuery);
  });

  return (
    <View style={[styles.safeArea, { paddingTop: topInset + 8 }]}>
      <View style={styles.container}>
        {/* Top Search Bar (Glovo Pill) */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={19} color={GlovoTheme.colors.textDark} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search clinics, schools, legal kiosks..."
              placeholderTextColor={GlovoTheme.colors.textMuted}
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={GlovoTheme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoryScrollContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={["All", ...ALL_CATEGORIES]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryChipsList}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Results Count Banner */}
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={styles.boldCount}>{filtered.length}</Text> facilities {query ? `for "${query}"` : `in ${selectedCategory}`}
          </Text>
        </View>

        {/* List of Service Cards */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectService(item)}
              activeOpacity={0.8}
            >
              {/* Left Thumbnail in Glovo Warm Tone */}
              <View style={styles.cardThumbnail}>
                <Ionicons
                  name="business"
                  size={24}
                  color={GlovoTheme.colors.primaryHover}
                />
              </View>

              {/* Right Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.categoryDistanceRow}>
                  {item.category} • {item.distanceKm} km away
                </Text>
                <View style={styles.ratingRow}>
                  <View style={styles.starBadge}>
                    <Ionicons name="star" size={11} color={GlovoTheme.colors.star} />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
                  <Text style={styles.settlementTag}>• {item.settlement}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={40} color={GlovoTheme.colors.borderYellow} />
              <Text style={styles.emptyTitle}>No facilities found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search keywords or clearing category filters.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: GlovoTheme.colors.white,
  },
  searchInputWrapper: {
    height: 48,
    borderRadius: GlovoTheme.borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: GlovoTheme.colors.background,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderYellow,
    ...GlovoTheme.shadows.soft,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: GlovoTheme.colors.textDark,
    fontWeight: "600",
    paddingVertical: 8,
  },
  categoryScrollContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
  },
  categoryChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.background,
  },
  selectedChip: {
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderColor: GlovoTheme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: GlovoTheme.colors.textSecondary,
  },
  selectedChipText: {
    color: GlovoTheme.colors.textDark,
    fontWeight: "900",
  },
  resultsCountBar: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "500",
  },
  boldCount: {
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: GlovoTheme.borderRadius.lg,
    backgroundColor: GlovoTheme.colors.white,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderLight,
    padding: 14,
    gap: 14,
    alignItems: "center",
    ...GlovoTheme.shadows.soft,
  },
  cardThumbnail: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: GlovoTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    marginBottom: 3,
  },
  categoryDistanceRow: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 6,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: GlovoTheme.borderRadius.xs,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewCount: {
    fontSize: 11,
    color: GlovoTheme.colors.textMuted,
    fontWeight: "500",
  },
  settlementTag: {
    fontSize: 11,
    color: GlovoTheme.colors.textMuted,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
  },
});
