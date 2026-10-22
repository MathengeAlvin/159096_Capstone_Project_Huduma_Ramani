import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { MobileService } from "../types";
import { GlovoTheme } from "../theme";

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

  const snippetHtml = useMemo(() => {
    const lat = service.coordinates?.latitude ?? -1.3142;
    const lon = service.coordinates?.longitude ?? 36.7865;
    const safeTitle = service.name.replace(/'/g, "\\'");
    const safeLoc = (service.location || service.settlement).replace(/'/g, "\\'");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #mini-map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #fffdf5;
          }
          .location-pin {
            background-color: #ffc244;
            color: #1e1e1e;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 900;
            border: 3px solid #1e1e1e;
            box-shadow: 0 0 12px rgba(255, 194, 68, 0.8), 0 3px 6px rgba(0,0,0,0.3);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            border: 1.5px solid #ffc244;
            padding: 2px;
          }
          .popup-title {
            font-size: 12px;
            font-weight: 900;
            color: #1e1e1e;
            margin: 0;
          }
          .popup-sub {
            font-size: 10px;
            color: #4b5563;
          }
          .osm-tag {
            position: absolute;
            bottom: 3px;
            left: 3px;
            background: rgba(255,255,255,0.9);
            font-size: 8px;
            font-weight: 800;
            color: #374151;
            padding: 2px 5px;
            border-radius: 3px;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="mini-map"></div>
        <div class="osm-tag">© OpenStreetMap</div>
        <script>
          const map = L.map('mini-map', {
            center: [${lat}, ${lon}],
            zoom: 16,
            zoomControl: false,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            attributionControl: false
          });

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          const icon = L.divIcon({
            className: 'pin-box',
            html: '<div class="location-pin">📍</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([${lat}, ${lon}], { icon }).addTo(map);
          marker.bindPopup("<div class='popup-title'>${safeTitle}</div><div class='popup-sub'>${safeLoc}</div>").openPopup();
        </script>
      </body>
      </html>
    `;
  }, [service]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={GlovoTheme.colors.textDark} />
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Text style={styles.headerCategoryText}>{service.category}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleBookmark(service.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.bookmarkHeaderBtn}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? GlovoTheme.colors.primaryHover : GlovoTheme.colors.textDark}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title & Subtitle */}
          <Text style={styles.title}>{service.name}</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={13} color={GlovoTheme.colors.star} />
              <Text style={styles.starBadgeText}>{service.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCountText}>({service.reviewCount} verified reviews)</Text>
            <Text style={styles.settlementTag}>• {service.settlement}</Text>
          </View>

          {/* Hero Banner with Glovo Yellow Accents */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="business" size={36} color={GlovoTheme.colors.textDark} />
            </View>
            <Text style={styles.heroBannerLabel}>{service.name}</Text>
            <Text style={styles.heroBannerSub}>{service.location} Community Hub</Text>
          </View>

          {/* About Service Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>ABOUT THIS SERVICE</Text>
            <Text style={styles.descriptionText}>{service.description}</Text>

            {/* Metadata Rows */}
            <View style={styles.metaInfoBox}>
              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="location" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Address: </Text>{service.address}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="time" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Hours: </Text>{service.hours}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="call" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Contact: </Text>{service.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Live OpenStreetMap Snippet */}
          <View style={styles.mapSnippetBox}>
            <View style={styles.mapSnippetHeader}>
              <View style={styles.snippetHeadingRow}>
                <Ionicons name="map" size={15} color={GlovoTheme.colors.textDark} />
                <Text style={styles.mapSnippetText}>LOCATION ON OPENSTREETMAP</Text>
              </View>
              <View style={styles.snippetDistancePill}>
                <Text style={styles.snippetBadge}>{service.distanceKm} km away</Text>
              </View>
            </View>

            <View style={styles.snippetMapSurface}>
              {Platform.OS === "web" ? (
                <iframe
                  srcDoc={snippetHtml}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title="Service Location Snippet"
                />
              ) : (
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: snippetHtml }}
                  style={styles.snippetWebView}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scrollEnabled={false}
                />
              )}
            </View>

            <View style={styles.snippetFooter}>
              <Ionicons name="navigate-circle" size={14} color={GlovoTheme.colors.secondary} />
              <Text style={styles.mapSubtext}>
                {service.location || service.settlement} • Lat: {service.coordinates.latitude.toFixed(4)}, Lon: {service.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Rate This Service Panel */}
          <View style={styles.ratingPanel}>
            <Text style={styles.ratingPanelTitle}>Rate this service</Text>
            <Text style={styles.ratingPanelSub}>Your rating informs the Bayesian recommendation engine</Text>
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
                      size={32}
                      color={filled ? GlovoTheme.colors.primary : "#D1D5DB"}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {hasRated && (
              <View style={styles.ratingConfirmationBox}>
                <Ionicons name="checkmark-circle" size={16} color={GlovoTheme.colors.secondary} />
                <Text style={styles.ratingConfirmation}>
                  Thank you! Your feedback adjusts quality rankings in {service.settlement}.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions Row with Glovo Yellow Primary Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkedActiveButton]}
            onPress={() => onToggleBookmark(service.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={GlovoTheme.colors.textDark}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.bookmarkButtonText}>
              {isBookmarked ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, applied && styles.appliedButton]}
            onPress={handleApply}
            activeOpacity={0.85}
            disabled={applied}
          >
            <Text style={styles.applyButtonText}>
              {applied ? "Request Sent ✓" : "Request Service / Contact"}
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
    backgroundColor: GlovoTheme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
  },
  backButton: {
    padding: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.background,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  headerCategoryText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#78350F",
  },
  bookmarkHeaderBtn: {
    padding: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
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
  starBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: GlovoTheme.colors.textSecondary,
  },
  settlementTag: {
    fontSize: 12,
    fontWeight: "600",
    color: GlovoTheme.colors.textMuted,
  },
  heroBanner: {
    height: 140,
    borderRadius: GlovoTheme.borderRadius.lg,
    backgroundColor: GlovoTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    ...GlovoTheme.shadows.soft,
  },
  heroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GlovoTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...GlovoTheme.shadows.soft,
  },
  heroBannerLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  heroBannerSub: {
    fontSize: 11,
    color: "#78350F",
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: GlovoTheme.colors.textSecondary,
    marginBottom: 14,
  },
  metaInfoBox: {
    backgroundColor: GlovoTheme.colors.background,
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    padding: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GlovoTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metaText: {
    fontSize: 12,
    color: GlovoTheme.colors.textDark,
    flex: 1,
  },
  metaBold: {
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  mapSnippetBox: {
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    backgroundColor: GlovoTheme.colors.white,
    marginBottom: 20,
    overflow: "hidden",
    ...GlovoTheme.shadows.soft,
  },
  mapSnippetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  snippetHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapSnippetText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#78350F",
    letterSpacing: 0.5,
  },
  snippetDistancePill: {
    backgroundColor: GlovoTheme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  snippetBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  snippetMapSurface: {
    height: 180,
    backgroundColor: "#FFFDF7",
  },
  snippetWebView: {
    flex: 1,
  },
  snippetFooter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: GlovoTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapSubtext: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "600",
  },
  ratingPanel: {
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    backgroundColor: GlovoTheme.colors.background,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  ratingPanelTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  ratingPanelSub: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 10,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingConfirmationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: GlovoTheme.colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GlovoTheme.borderRadius.sm,
  },
  ratingConfirmation: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "700",
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
    gap: 12,
    ...GlovoTheme.shadows.soft,
  },
  bookmarkButton: {
    flex: 0.8,
    height: 48,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: GlovoTheme.colors.white,
  },
  bookmarkedActiveButton: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderColor: GlovoTheme.colors.primary,
  },
  bookmarkButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  applyButton: {
    flex: 1.4,
    height: 48,
    backgroundColor: GlovoTheme.colors.primary, // Signature Glovo Yellow
    borderRadius: GlovoTheme.borderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    ...GlovoTheme.shadows.glowYellow,
  },
  appliedButton: {
    backgroundColor: GlovoTheme.colors.secondary,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.2,
  },
});
