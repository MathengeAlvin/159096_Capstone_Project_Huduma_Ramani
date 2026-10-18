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
        {/* Top Search & System Status Bar */}
        <View style={styles.searchBarWrapper}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={onSearchPress}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color="#000000" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>
              Search clinics, legal aid, classes...
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
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Ionicons name="refresh" size={14} color="#000000" />
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
                Ranked for {user.name} ({user.settlement}) • {user.interests.join(", ")}
              </Text>
            </View>
            <Text style={styles.countBadge}>{services.length} Facilities</Text>
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
                activeOpacity={0.75}
              >
                {/* Image Placeholder with Wireframe Diagonal Line */}
                <View style={styles.imagePlaceholder}>
                  <View style={styles.diagonalLine} />
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color="#98A2B3"
                    style={styles.cornerIcon}
                  />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
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
                    <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    height: 42,
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
  searchPlaceholder: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    gap: 5,
  },
  statusLiveBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  statusOfflineBadge: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLiveDot: {
    backgroundColor: "#16A34A",
  },
  statusOfflineDot: {
    backgroundColor: "#9CA3AF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusLiveText: {
    color: "#15803D",
  },
  statusOfflineText: {
    color: "#4B5563",
  },
  refreshButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  carouselSection: {
    flex: 1,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: "#667085",
    marginTop: 2,
  },
  countBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#000000",
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 90,
    backgroundColor: "#F2F4F7",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  diagonalLine: {
    position: "absolute",
    width: "140%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "28deg" }],
  },
  cornerIcon: {
    position: "absolute",
    top: 6,
    left: 6,
  },
  rankBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#000000",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  rankText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  cardInfo: {
    padding: 8,
  },
  cardName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  cardCategory: {
    fontSize: 10,
    color: "#667085",
    marginTop: 2,
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
  },
  distanceBadge: {
    fontSize: 10,
    color: "#475467",
    fontWeight: "600",
  },
});
