import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService, ResidentUser } from "../types";
import { MapViewComponent } from "../components/MapViewComponent";
import { GlovoTheme } from "../theme";

interface HomeScreenProps {
  user: ResidentUser;
  services: MobileService[];
  mapServices?: MobileService[];
  onSelectService: (service: MobileService) => void;
  onSearchPress: () => void;
  onSettlementChange?: (settlement: "Kibera" | "Mathare") => void;
  isLive?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

export function HomeScreen({
  user,
  services,
  mapServices = [],
  onSelectService,
  onSearchPress,
  onSettlementChange,
  isLive = false,
  isLoading = false,
  onRefresh,
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Glovo Yellow Top Search & Header Bar */}
        <View style={styles.headerWrapper}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingSub}>DISCOVER SERVICES IN</Text>
              <Text style={styles.greetingTitle}>{user.settlement}, Nairobi</Text>
            </View>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
            </View>
          </View>

          {/* Search Input Pill */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={onSearchPress}
            activeOpacity={0.88}
          >
            <Ionicons name="search" size={18} color={GlovoTheme.colors.textDark} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>
              Search clinics, legal aid, skills...
            </Text>
          </TouchableOpacity>

          {/* Live Recommendation Engine Status Badge */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                isLive ? styles.statusLiveBadge : styles.statusOfflineBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isLive ? styles.statusLiveDot : styles.statusOfflineDot,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  isLive ? styles.statusLiveText : styles.statusOfflineText,
                ]}
              >
                {isLive
                  ? `Hybrid ML Engine (k=2, α=0.2, β=0.4, γ=0.4)`
                  : `Offline Fixtures Mode`}
              </Text>
            </View>

            {onRefresh && (
              <TouchableOpacity
                onPress={onRefresh}
                style={styles.refreshButton}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={GlovoTheme.colors.textDark} />
                ) : (
                  <Ionicons name="refresh" size={14} color={GlovoTheme.colors.textDark} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* OpenStreetMap Interactive View (Renders All Settlement Providers) */}
        <MapViewComponent
          services={mapServices.length > 0 ? mapServices : services}
          recommendedServices={services}
          onSelectService={onSelectService}
          settlement={user.settlement}
          onSettlementChange={onSettlementChange}
        />

        {/* Recommended for You Carousel */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Text style={styles.sectionSubtitle}>
                Ranked for {user.name} • {user.interests.slice(0, 2).join(", ")}
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{services.length} Facilities</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {services.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => onSelectService(item)}
                activeOpacity={0.8}
              >
                {/* Image Placeholder with Glovo Warm Tint */}
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="business"
                    size={26}
                    color={GlovoTheme.colors.primaryHover}
                  />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1} Top Pick</Text>
                  </View>
                </View>

                {/* Card Text Content */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardCategory} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <View style={styles.ratingRow}>
                    <View style={styles.starPill}>
                      <Ionicons name="star" size={11} color={GlovoTheme.colors.star} />
                      <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.distanceBadge}>{item.distanceKm} km</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow top notch/safe area
  },
  container: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: GlovoTheme.colors.primary, // Signature Glovo Yellow
    borderBottomLeftRadius: GlovoTheme.borderRadius.lg,
    borderBottomRightRadius: GlovoTheme.borderRadius.lg,
    ...GlovoTheme.shadows.soft,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B4C00", // Warm dark amber
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.3,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GlovoTheme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5A82E",
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  searchBar: {
    height: 44,
    borderRadius: GlovoTheme.borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: GlovoTheme.colors.white,
    ...GlovoTheme.shadows.soft,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    gap: 6,
  },
  statusLiveBadge: {
    backgroundColor: GlovoTheme.colors.white,
  },
  statusOfflineBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLiveDot: {
    backgroundColor: GlovoTheme.colors.secondary, // Glovo Teal-Green
  },
  statusOfflineDot: {
    backgroundColor: GlovoTheme.colors.textMuted,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  statusLiveText: {
    color: "#065F46",
  },
  statusOfflineText: {
    color: GlovoTheme.colors.textSecondary,
  },
  refreshButton: {
    padding: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.white,
    ...GlovoTheme.shadows.soft,
  },
  carouselSection: {
    flex: 1,
    paddingTop: 14,
    backgroundColor: GlovoTheme.colors.white,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#78350F",
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: GlovoTheme.borderRadius.md,
    backgroundColor: GlovoTheme.colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    ...GlovoTheme.shadows.soft,
  },
  imagePlaceholder: {
    height: 88,
    backgroundColor: GlovoTheme.colors.primaryLight, // Warm cream yellow
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: GlovoTheme.borderRadius.pill,
    ...GlovoTheme.shadows.soft,
  },
  rankText: {
    fontSize: 9,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  cardInfo: {
    padding: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  cardCategory: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  starPill: {
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
  distanceBadge: {
    fontSize: 10,
    color: GlovoTheme.colors.secondary,
    fontWeight: "800",
  },
});
