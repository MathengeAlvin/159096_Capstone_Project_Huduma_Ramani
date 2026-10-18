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
            background: #e5e7eb;
          }
          .location-pin {
            background-color: #dc2626;
            color: #ffffff;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.7), 0 3px 6px rgba(0,0,0,0.35);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 4px;
            border: 1.5px solid #111827;
            padding: 2px;
          }
          .popup-title {
            font-size: 12px;
            font-weight: 900;
            color: #111827;
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
            background: rgba(255,255,255,0.85);
            font-size: 8px;
            font-weight: 700;
            color: #374151;
            padding: 1px 4px;
            border-radius: 2px;
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
            zoomControl: true,
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
            iconSize: [28, 28],
            iconAnchor: [14, 14]
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

          {/* Live OpenStreetMap Snippet */}
          <View style={styles.mapSnippetBox}>
            <View style={styles.mapSnippetHeader}>
              <View style={styles.snippetHeadingRow}>
                <Ionicons name="map" size={13} color="#000000" />
                <Text style={styles.mapSnippetText}>LOCATION ON OPENSTREETMAP</Text>
              </View>
              <Text style={styles.snippetBadge}>{service.distanceKm} km away</Text>
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
              <Text style={styles.mapSubtext}>
                📍 {service.location || service.settlement} • Lat: {service.coordinates.latitude.toFixed(4)}, Lon: {service.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
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
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    overflow: "hidden",
  },
  mapSnippetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  snippetHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapSnippetText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
  },
  snippetBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  snippetMapSurface: {
    height: 180,
    backgroundColor: "#E5E7EB",
  },
  snippetWebView: {
    flex: 1,
  },
  snippetFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  mapSubtext: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
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
