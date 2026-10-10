import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService } from "../types";

interface ServiceDetailScreenProps {
  service: MobileService;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (serviceId: string) => void;
  onRateService: (serviceId: string, rating: number) => void;
}

export function ServiceDetailScreen({
  service,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onRateService,
}: ServiceDetailScreenProps) {
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleStarPress = (rating: number) => {
    setUserRating(rating);
    setHasRated(true);
    onRateService(service.id, rating);
  };

  const handleApply = () => {
    setApplied(true);
    Alert.alert(
      "Intake Request Submitted",
      `Your request for ${service.name} has been sent to the provider. They will follow up via your registered contact.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerCategoryBadge}>{service.category}</Text>
          <TouchableOpacity
            onPress={() => onToggleBookmark(service.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color="#000000"
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title & Subtitle matching Screenshot 142402 */}
          <Text style={styles.title}>{service.name}</Text>
          <Text style={styles.subtitle}>
            {service.category.toUpperCase()} • ★ {service.rating.toFixed(1)} ({service.reviewCount} reviews)
          </Text>

          {/* Hero Image Placeholder with diagonal wireframe cross */}
          <View style={styles.heroImagePlaceholder}>
            <View style={styles.diagonalLine} />
            <Ionicons name="image-outline" size={28} color="#98A2B3" style={styles.heroCornerIcon} />
            <Text style={styles.placeholderLabel}>{service.name} Photo</Text>
          </View>

          {/* About Service Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>ABOUT SERVICE</Text>
            <Text style={styles.descriptionText}>{service.description}</Text>

            {/* Metadata Rows */}
            <View style={styles.metaInfoBox}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#000000" style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Address:</Text> {service.address}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color="#000000" style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Hours:</Text> {service.hours}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={16} color="#000000" style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Contact:</Text> {service.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Map Snippet Box matching wireframe */}
          <View style={styles.mapSnippetBox}>
            <View style={styles.mapGridPattern} />
            <View style={styles.mapPinIndicator}>
              <View style={styles.innerPin} />
            </View>
            <Text style={styles.mapSnippetText}>MAP SNIPPET</Text>
            <Text style={styles.mapSubtext}>
              {service.location} • {service.distanceKm} km away
            </Text>
          </View>

          {/* Rate This Service Panel matching Screenshot 142402 */}
          <View style={styles.ratingPanel}>
            <Text style={styles.ratingPanelTitle}>Rate this service</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= userRating;
                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={filled ? "star" : "star-outline"}
                      size={28}
                      color={filled ? "#F59E0B" : "#000000"}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {hasRated && (
              <Text style={styles.ratingConfirmation}>
                Thank you! Your rating helps the Bayesian quality engine rank trusted community providers.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions Row matching Screenshot 142402 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkedActiveButton]}
            onPress={() => onToggleBookmark(service.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isBookmarked ? "#FFFFFF" : "#000000"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.bookmarkButtonText,
                isBookmarked && styles.bookmarkedActiveText,
              ]}
            >
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, applied && styles.appliedButton]}
            onPress={handleApply}
            activeOpacity={0.8}
            disabled={applied}
          >
            <Text style={styles.applyButtonText}>
              {applied ? "Application Sent ✓" : "Apply / Contact"}
            </Text>
          </TouchableOpacity>
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
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  backButton: {
    padding: 4,
  },
  headerCategoryBadge: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#475467",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475467",
    marginTop: 4,
    marginBottom: 16,
  },
  heroImagePlaceholder: {
    height: 180,
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#F2F4F7",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  diagonalLine: {
    position: "absolute",
    width: "150%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "25deg" }],
  },
  heroCornerIcon: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  placeholderLabel: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#344054",
    marginBottom: 14,
  },
  metaInfoBox: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#344054",
  },
  metaBold: {
    fontWeight: "700",
    color: "#000000",
  },
  mapSnippetBox: {
    height: 100,
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  mapGridPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  mapPinIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  innerPin: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  mapSnippetText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475467",
    letterSpacing: 0.8,
  },
  mapSubtext: {
    fontSize: 10,
    color: "#667085",
    marginTop: 2,
  },
  ratingPanel: {
    borderWidth: 1.5,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 16,
  },
  ratingPanelTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingConfirmation: {
    fontSize: 11,
    color: "#027A48",
    fontWeight: "600",
    marginTop: 8,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  bookmarkButton: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  bookmarkedActiveButton: {
    backgroundColor: "#000000",
  },
  bookmarkButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  bookmarkedActiveText: {
    color: "#FFFFFF",
  },
  applyButton: {
    flex: 1.2,
    height: 46,
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  appliedButton: {
    backgroundColor: "#027A48",
    borderColor: "#027A48",
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
