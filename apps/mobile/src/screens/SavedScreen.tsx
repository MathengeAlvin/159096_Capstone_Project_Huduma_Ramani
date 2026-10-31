import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileService } from "../types";
import { GlovoTheme } from "../theme";

interface SavedScreenProps {
  savedServices: MobileService[];
  onSelectService: (service: MobileService) => void;
  onRemoveBookmark: (serviceId: string) => void;
}

export function SavedScreen({
  savedServices,
  onSelectService,
  onRemoveBookmark,
}: SavedScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) : 0, 24);

  return (
    <View style={[styles.safeArea, { paddingTop: topInset + 8 }]}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>SAVED DIRECTORY</Text>
          </View>
          <Text style={styles.title}>Bookmarked Services</Text>
          <Text style={styles.subtitle}>
            {savedServices.length} {savedServices.length === 1 ? "facility" : "facilities"} saved for offline reference
          </Text>
        </View>

        {/* List of Saved Service Cards */}
        <FlatList
          data={savedServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectService(item)}
              activeOpacity={0.8}
            >
              {/* Left Thumbnail */}
              <View style={styles.thumbnail}>
                <Ionicons
                  name="business"
                  size={24}
                  color={GlovoTheme.colors.primaryHover}
                />
              </View>

              {/* Middle Service Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.category} • {item.distanceKm} km away
                </Text>
                <View style={styles.starRow}>
                  <Ionicons name="star" size={11} color={GlovoTheme.colors.star} />
                  <Text style={styles.starText}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>

              {/* Right Ribbon / Bookmark Icon (Glovo Yellow) */}
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => onRemoveBookmark(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="bookmark" size={20} color={GlovoTheme.colors.primaryHover} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bookmark-outline" size={40} color={GlovoTheme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No saved services yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the bookmark icon on any clinic, school, or legal desk to save it here for offline reference.
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
  },
  headerBadge: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: GlovoTheme.borderRadius.pill,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#78350F",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 3,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: GlovoTheme.borderRadius.lg,
    backgroundColor: GlovoTheme.colors.white,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    padding: 14,
    gap: 12,
    alignItems: "center",
    ...GlovoTheme.shadows.soft,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: GlovoTheme.borderRadius.md,
    backgroundColor: GlovoTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  categoryName: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  starText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 380,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderYellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...GlovoTheme.shadows.glowYellow,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});
