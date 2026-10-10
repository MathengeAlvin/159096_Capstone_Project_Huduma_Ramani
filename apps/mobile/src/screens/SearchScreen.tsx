import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService, ServiceCategory } from "../types";
import { ALL_CATEGORIES } from "../data/mockServices";

interface SearchScreenProps {
  services: MobileService[];
  onSelectService: (service: MobileService) => void;
  initialQuery?: string;
}

export function SearchScreen({
  services,
  onSelectService,
  initialQuery = "Legal Aid",
}: SearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.location.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && (query.trim() === "" || matchesQuery);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Active Search Bar matching Screenshot 142351 */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#000000" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search clinics, legal aid, classes..."
              placeholderTextColor="#98A2B3"
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="#98A2B3" />
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
                  activeOpacity={0.7}
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

        {/* Subtitle count matching wireframe */}
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            Showing {filtered.length} results for &quot;{query || selectedCategory}&quot; in Kibera
          </Text>
        </View>

        {/* List of Service Cards matching Screenshot 142351 */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectService(item)}
              activeOpacity={0.75}
            >
              {/* Left Thumbnail placeholder with diagonal line */}
              <View style={styles.cardThumbnail}>
                <View style={styles.diagonalLine} />
                <Ionicons
                  name="image-outline"
                  size={16}
                  color="#98A2B3"
                  style={styles.cornerIcon}
                />
              </View>

              {/* Right Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.categoryDistanceRow}>
                  {item.category} • {item.distanceKm} km
                </Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services found matching your query.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    height: 44,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  categoryScrollContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  categoryChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  selectedChip: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475467",
  },
  selectedChipText: {
    color: "#FFFFFF",
  },
  resultsCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    padding: 10,
    gap: 12,
    alignItems: "center",
  },
  cardThumbnail: {
    width: 68,
    height: 68,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#F2F4F7",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  diagonalLine: {
    position: "absolute",
    width: "140%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "35deg" }],
  },
  cornerIcon: {
    position: "absolute",
    top: 4,
    left: 4,
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 3,
  },
  categoryDistanceRow: {
    fontSize: 11,
    color: "#667085",
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  reviewCount: {
    fontSize: 10,
    color: "#98A2B3",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#667085",
  },
});
