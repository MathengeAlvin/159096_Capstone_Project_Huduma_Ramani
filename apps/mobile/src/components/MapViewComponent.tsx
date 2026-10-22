import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { MobileService, ServiceCategory } from "../types";
import { ALL_CATEGORIES } from "../data/mockServices";
import { GlovoTheme } from "../theme";

interface MapViewComponentProps {
  services: MobileService[];
  recommendedServices?: MobileService[];
  onSelectService: (service: MobileService) => void;
  selectedServiceId?: string;
  settlement?: "Kibera" | "Mathare";
  onSettlementChange?: (settlement: "Kibera" | "Mathare") => void;
}

const SETTLEMENT_CENTERS = {
  Kibera: { lat: -1.3142, lon: 36.7865, name: "Kibera", zoom: 15 },
  Mathare: { lat: -1.2612, lon: 36.8521, name: "Mathare", zoom: 15 },
};

export function MapViewComponent({
  services,
  recommendedServices = [],
  onSelectService,
  selectedServiceId,
  settlement = "Kibera",
  onSettlementChange,
}: MapViewComponentProps) {
  const [activeSettlement, setActiveSettlement] = useState<"Kibera" | "Mathare">(settlement);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (settlement) setActiveSettlement(settlement);
  }, [settlement]);

  const handleSettlementSwitch = (s: "Kibera" | "Mathare") => {
    setActiveSettlement(s);
    if (onSettlementChange) onSettlementChange(s);
  };

  // Listen for message from Leaflet map on Web
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "HUDUMA_SELECT_SERVICE") {
          const match = services.find((s) => s.id === event.data.serviceId);
          if (match) onSelectService(match);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [services, onSelectService]);

  const coords = SETTLEMENT_CENTERS[activeSettlement];

  const recommendedIds = useMemo(
    () => new Set(recommendedServices.map((r) => r.id)),
    [recommendedServices]
  );

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSettlement = s.settlement.toLowerCase() === activeSettlement.toLowerCase();
      const matchesCategory =
        selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSettlement && matchesCategory;
    });
  }, [services, activeSettlement, selectedCategory]);

  // Leaflet HTML styled with Glovo yellow and white theme
  const leafletHtml = useMemo(() => {
    const markersData = filteredServices.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lat: s.coordinates.latitude,
      lon: s.coordinates.longitude,
      rating: s.rating,
      reviews: s.reviewCount,
      address: s.address || `${s.settlement}, Nairobi`,
      isRecommended: recommendedIds.has(s.id),
      isSelected: s.id === selectedServiceId,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #fffdf5;
            touch-action: pan-x pan-y pinch-zoom;
          }
          /* Standard community provider pin (Glovo style) */
          .provider-pin {
            background-color: #ffffff;
            color: #1e1e1e;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 900;
            border: 2.5px solid #ffc244;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.15s ease;
          }
          .provider-pin:hover {
            transform: scale(1.25);
          }
          /* Recommended facility pin (Glovo Yellow Hero Badge) */
          .provider-pin.recommended {
            background-color: #ffc244;
            color: #1e1e1e;
            border: 2.5px solid #1e1e1e;
            box-shadow: 0 0 10px rgba(255, 194, 68, 0.7), 0 3px 6px rgba(0,0,0,0.25);
            width: 30px;
            height: 30px;
            font-size: 13px;
            z-index: 1000 !important;
          }
          .provider-pin.selected {
            background-color: #00a082 !important;
            color: #ffffff !important;
            border-color: #ffffff !important;
            transform: scale(1.35);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            border: 1px solid #ffc244;
            padding: 4px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
            background: #ffffff;
          }
          .popup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            margin-bottom: 4px;
          }
          .popup-title {
            font-size: 14px;
            font-weight: 900;
            color: #1e1e1e;
            margin: 0;
            line-height: 1.2;
          }
          .rec-badge {
            display: inline-block;
            background: #ffc244;
            color: #1e1e1e;
            font-size: 9px;
            font-weight: 900;
            padding: 3px 7px;
            border-radius: 999px;
            text-transform: uppercase;
          }
          .popup-cat {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .popup-address {
            font-size: 11px;
            color: #4b5563;
            margin: 4px 0;
          }
          .popup-rating {
            font-size: 12px;
            font-weight: 800;
            color: #d97706;
            margin-top: 4px;
          }
          .popup-btn {
            display: block;
            margin-top: 10px;
            background: #ffc244;
            color: #1e1e1e !important;
            font-size: 12px;
            font-weight: 900;
            text-align: center;
            padding: 8px 12px;
            text-decoration: none;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(255, 194, 68, 0.4);
            transition: background 0.15s;
          }
          .popup-btn:hover {
            background: #f5b42e;
          }
          .osm-attribution {
            position: absolute;
            bottom: 4px;
            left: 4px;
            background: rgba(255, 255, 255, 0.92);
            padding: 3px 8px;
            font-size: 9px;
            font-weight: 800;
            color: #374151;
            border-radius: 6px;
            border: 1px solid rgba(0,0,0,0.06);
            z-index: 1000;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="osm-attribution">© OpenStreetMap • Map Kibera & Mathare</div>

        <script>
          const map = L.map('map', {
            center: [${coords.lat}, ${coords.lon}],
            zoom: ${coords.zoom},
            minZoom: 12,
            maxZoom: 19,
            zoomControl: true,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
          });

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const markers = ${JSON.stringify(markersData)};

          markers.forEach(m => {
            if (!m.lat || !m.lon) return;

            const pinClasses = [
              'provider-pin',
              m.isRecommended ? 'recommended' : '',
              m.isSelected ? 'selected' : ''
            ].filter(Boolean).join(' ');

            const iconContent = m.isRecommended ? '★' : m.name.charAt(0);

            const icon = L.divIcon({
              className: 'pin-wrapper',
              html: '<div class="' + pinClasses + '" title="' + m.name + '">' + iconContent + '</div>',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -15]
            });

            const marker = L.marker([m.lat, m.lon], { icon }).addTo(map);

            const recHtml = m.isRecommended ? '<span class="rec-badge">Recommended</span>' : '';

            const popupContent = 
              '<div class="popup-header">' +
                '<h4 class="popup-title">' + m.name + '</h4>' +
                recHtml +
              '</div>' +
              '<div class="popup-cat">' + m.category + '</div>' +
              '<div class="popup-address">📍 ' + m.address + '</div>' +
              '<div class="popup-rating">★ ' + m.rating.toFixed(1) + ' (' + m.reviews + ' reviews)</div>' +
              '<a class="popup-btn" onclick="selectService(\\'' + m.id + '\\')">View Full Details →</a>';

            marker.bindPopup(popupContent);
          });

          function selectService(id) {
            var payload = JSON.stringify({ type: 'HUDUMA_SELECT_SERVICE', serviceId: id });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(payload);
            } else if (window.parent) {
              window.parent.postMessage({ type: 'HUDUMA_SELECT_SERVICE', serviceId: id }, '*');
            }
          }

          window.recenterMap = function(lat, lon, zoom) {
            map.flyTo([lat, lon], zoom || 15);
          };
        </script>
      </body>
      </html>
    `;
  }, [filteredServices, coords, recommendedIds, selectedServiceId]);

  return (
    <View style={[styles.container, isExpanded && styles.expandedContainer]}>
      {/* Top Map Toolbar: Settlement Switcher & Filter Count */}
      <View style={styles.topToolbar}>
        <View style={styles.settlementRow}>
          <TouchableOpacity
            style={[
              styles.settlementPill,
              activeSettlement === "Kibera" && styles.activeSettlementPill,
            ]}
            onPress={() => handleSettlementSwitch("Kibera")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.settlementPillText,
                activeSettlement === "Kibera" && styles.activeSettlementPillText,
              ]}
            >
              📍 Kibera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settlementPill,
              activeSettlement === "Mathare" && styles.activeSettlementPill,
            ]}
            onPress={() => handleSettlementSwitch("Mathare")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.settlementPillText,
                activeSettlement === "Mathare" && styles.activeSettlementPillText,
              ]}
            >
              📍 Mathare
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legend / Status Info */}
        <View style={styles.toolbarRight}>
          <View style={styles.badgeCountBox}>
            <Text style={styles.badgeCountText}>
              {filteredServices.length} Providers Plotted
            </Text>
          </View>

          {/* Expand / Minimize Map Toggle */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
            accessibilityLabel={isExpanded ? "Minimize map" : "Expand map"}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isExpanded ? "contract-outline" : "expand-outline"}
              size={16}
              color={GlovoTheme.colors.textDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Chips Horizontal Bar */}
      <View style={styles.categoryFilterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {["All", ...ALL_CATEGORIES].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.activeCategoryChipText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map Surface (Leaflet / OpenStreetMap via WebView on Mobile or iframe on Web) */}
      <View style={styles.mapSurface}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={leafletHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Interactive OpenStreetMap"
          />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: leafletHtml }}
            style={styles.webView}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "HUDUMA_SELECT_SERVICE") {
                  const match = services.find((s) => s.id === data.serviceId);
                  if (match) onSelectService(match);
                }
              } catch (e) {
                console.warn("WebView onMessage parse error", e);
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={false}
            scrollEnabled={false}
          />
        )}

        {/* Map Legend Overlay at Bottom */}
        <View style={styles.mapLegendOverlay}>
          <View style={styles.legendItem}>
            <View style={styles.legendYellowDot} />
            <Text style={styles.legendText}>Recommended</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendWhiteDot} />
            <Text style={styles.legendText}>All Providers ({services.length})</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GlovoTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.border,
    height: 310,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  expandedContainer: {
    height: 520,
    zIndex: 100,
  },
  topToolbar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: GlovoTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settlementRow: {
    flexDirection: "row",
    gap: 6,
  },
  settlementPill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.background,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
  },
  activeSettlementPill: {
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderColor: GlovoTheme.colors.primary,
  },
  settlementPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  activeSettlementPillText: {
    color: GlovoTheme.colors.textDark,
    fontWeight: "900",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeCountBox: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#78350F",
  },
  expandButton: {
    padding: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  categoryFilterBar: {
    backgroundColor: GlovoTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    paddingVertical: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    backgroundColor: GlovoTheme.colors.background,
  },
  activeCategoryChip: {
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderColor: GlovoTheme.colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: GlovoTheme.colors.textSecondary,
  },
  activeCategoryChipText: {
    color: GlovoTheme.colors.textDark,
    fontWeight: "900",
  },
  mapSurface: {
    flex: 1,
    backgroundColor: "#FFFDF7",
    position: "relative",
  },
  mapLegendOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: GlovoTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    flexDirection: "row",
    gap: 12,
    zIndex: 1000,
    pointerEvents: "none",
    ...GlovoTheme.shadows.soft,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendYellowDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: GlovoTheme.colors.primary,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.textDark,
  },
  legendWhiteDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: GlovoTheme.colors.white,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.primary,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },
});
