import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService, ResidentUser } from "../types";
import { MapViewComponent } from "../components/MapViewComponent";

interface HomeScreenProps {
  user: ResidentUser;
  services: MobileService[];
  onSelectService: (service: MobileService) => void;
  onSearchPress: () => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;

export function HomeScreen({
  user,
  services,
  onSelectService,
  onSearchPress,
}: HomeScreenProps) {
  // Sort or prioritize services based on user's selected interests (Content-Based recommendation preview)
  const recommendedServices = [...services].sort((a, b) => {
    const aMatch = user.interests.includes(a.category) ? 1 : 0;
    const bMatch = user.interests.includes(b.category) ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    return b.rating - a.rating;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Search Input Bar matching Screenshot 142340 */}
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
        </View>

        {/* Map View Component */}
        <MapViewComponent
          services={services}
          onSelectService={onSelectService}
        />

        {/* Recommended for You Carousel */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Text style={styles.sectionSubtitle}>
              Tailored for {user.settlement} residents
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {recommendedServices.map((item) => (
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
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
  searchPlaceholder: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "500",
  },
  carouselSection: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#667085",
    marginTop: 2,
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
    height: 95,
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
  cardInfo: {
    padding: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  cardCategory: {
    fontSize: 11,
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
